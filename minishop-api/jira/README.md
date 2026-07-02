# Dummy Jira project fixture

This directory models the Jira side of the MiniShop API documentation-audit workflow. All people, account IDs, URLs, and issue keys are synthetic and deliberately use the non-routable `.invalid` domain.

## Files

- `project.json`: project, field, issue-type, status, priority, component, and synthetic-user metadata.
- `baseline-issues.json`: eight Jira REST-shaped issues present before an audit run.
- `baseline-issues-import.csv`: the same issue set in a flat import/mocking format.
- `search-and-deduplication-fixtures.json`: JQL-shaped queries and expected results for open-ticket updates, resolved-ticket handling, duplicates, and no-match paths.
- `expected-audit-mutations.json`: exact tickets that should receive comments, must remain unchanged, or should be created by a successful audit run.

## Required scenarios

| Ticket | Initial state | Purpose |
|---|---|---|
| API-102 | To Do / High | Shared unresolved legacy-route and duplicate-route issue |
| API-145 | In Progress / Highest | Shared unresolved authentication-schema and payment-security issue |
| API-221 | Done / Fixed | Historical schema issue that must not be automatically reopened |
| API-317 | In Progress / Highest | Shared order and checkout schema-drift issue |
| API-181 | Selected for Development / Medium | Existing list-query standards issue |
| API-256 | Done / Fixed | Historical deprecated-collection cleanup ticket |
| API-289 | Blocked / High | Existing role/permission documentation ticket |
| API-304 | To Do / Medium | Existing validation-constraint ticket |

The expected mutation file also defines two intentionally absent high-priority tickets: an administrator-only payment-refund documentation gap and the missing refresh-token contract. These should be created by the workflow and written back to the blank tracker Jira fields.

A mock/test adapter should load `baseline-issues.json`, match the fixture JQL scenarios, persist update comments, allocate deterministic issue keys to create calls, and compare the resulting state to `expected-audit-mutations.json`.
