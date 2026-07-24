# cahuu-web-redesign

## Auth automation test fixture

The dependency-free Auth API used by the documentation-audit automation is in
[`dummy-auth-api/`](dummy-auth-api/). Its executable routes are in
[`src/server.js`](dummy-auth-api/src/server.js). The v1 login route delegates to
[`AuthController.login`](dummy-auth-api/src/controllers/auth.controller.js),
uses [`LoginRequestDto`](dummy-auth-api/src/dto/login-request.dto.js), and
returns the public projection of [`UserEntity`](dummy-auth-api/src/entities/user.entity.js).

The documentation comparison inputs are:

- [`dummy-auth-api/openapi.yaml`](dummy-auth-api/openapi.yaml)
- [`dummy-auth-api/README.md`](dummy-auth-api/README.md)
- [`dummy-auth-api/postman_collection_old.json`](dummy-auth-api/postman_collection_old.json)

Run the fixture tests with `cd dummy-auth-api && npm test`. All accounts,
credentials, tokens, and examples in this fixture are fictional local-test data.

