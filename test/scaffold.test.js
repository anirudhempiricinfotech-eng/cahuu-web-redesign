const { readFile } = require("node:fs/promises");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

test("the placeholder page has a title and main heading", async () => {
  const pagePath = path.join(__dirname, "..", "index.html");
  const page = await readFile(pagePath, "utf8");

  assert.match(page, /<title>Cahuu Web Redesign<\/title>/);
  assert.match(page, /<h1>Cahuu Web Redesign<\/h1>/);
});
