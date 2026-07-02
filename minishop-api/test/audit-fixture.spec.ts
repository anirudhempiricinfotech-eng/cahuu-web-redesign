import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('MiniShop audit fixture integrity', () => {
  const root=join(__dirname,'..');
  test('defines examples for every unique source operation', () => {
    const examples=JSON.parse(readFileSync(join(root,'docs/api-examples.json'),'utf8'));
    expect(examples.meta.operationCount).toBe(35);
    expect(examples.operations).toHaveLength(35);
    expect(new Set(examples.operations.map((x:any)=>`${x.method} ${x.path.split('?')[0]}`)).size).toBe(35);
  });
  test('keeps documentation deliberately incomplete', () => {
    const manifest=JSON.parse(readFileSync(join(root,'docs/audit-fixture-manifest.json'),'utf8'));
    expect(manifest.openApiDocumentedOperations/manifest.implementedUniqueOperations).toBeCloseTo(0.8,2);
    expect(manifest.issueMatrix.map((x:any)=>x.type)).toEqual(expect.arrayContaining(['Documentation Gap','Schema Mismatch','Deprecated Endpoint','REST Design Violation','Duplicate Route','Missing Pagination','Missing Filtering','Missing Role Documentation','Missing Middleware Documentation']));
  });
  test('retains the isolated invalid fragment for partial failure testing', () => {
    expect(readFileSync(join(root,'docs/unparseable-fragment.yaml'),'utf8')).toContain('mismatched: [string, {nested: true');
  });
});
