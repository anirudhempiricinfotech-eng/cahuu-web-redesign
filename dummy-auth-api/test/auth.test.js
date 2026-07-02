"use strict";

const { before, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/server");

let server;
let baseUrl;

before(async () => {
  ({ server } = createApp());
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = "http://127.0.0.1:" + server.address().port;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.json !== undefined) headers["content-type"] = "application/json";
  const response = await fetch(baseUrl + path, {
    method: options.method || "GET",
    headers,
    body: options.json === undefined ? undefined : JSON.stringify(options.json),
  });
  const text = await response.text();
  return {
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : undefined,
  };
}

test("dummy Auth API end-to-end behaviour", async (t) => {
  await t.test("health check succeeds", async () => {
    const result = await request("/health");
    assert.equal(result.status, 200);
    assert.equal(result.body.status, "ok");
    assert.equal(result.body.apiVersion, "v1");
  });

  await t.test("signup rejects a weak password", async () => {
    const result = await request("/api/v1/auth/signup", {
      method: "POST",
      json: {
        name: "Maya Shah",
        email: "maya.shah@example.test",
        password: "weak",
        acceptTerms: true,
      },
    });
    assert.equal(result.status, 400);
    assert.equal(result.body.error.code, "VALIDATION_ERROR");
    assert.ok(result.body.error.details.some((item) => item.field === "password"));
  });

  let newUserAccessToken;
  let newUserRefreshToken;

  await t.test("signup creates a user and session", async () => {
    const result = await request("/api/v1/auth/signup", {
      method: "POST",
      json: {
        name: "Maya Shah",
        email: "maya.shah@example.test",
        password: "RiverStone8",
        acceptTerms: true,
      },
    });
    assert.equal(result.status, 201);
    assert.equal(result.body.user.name, "Maya Shah");
    assert.equal(result.body.user.email, "maya.shah@example.test");
    assert.match(result.body.user.id, /^[0-9a-f-]{36}$/);
    assert.equal(result.body.session.tokenType, "Bearer");
    assert.ok(result.body.session.accessToken.startsWith("dummy_access_"));
    assert.ok(result.body.session.refreshToken.startsWith("dummy_refresh_"));
    newUserAccessToken = result.body.session.accessToken;
    newUserRefreshToken = result.body.session.refreshToken;
  });

  await t.test("signup rejects a duplicate email", async () => {
    const result = await request("/api/v1/auth/signup", {
      method: "POST",
      json: {
        name: "Maya Shah",
        email: "MAYA.SHAH@example.test",
        password: "RiverStone8",
        acceptTerms: true,
      },
    });
    assert.equal(result.status, 409);
    assert.equal(result.body.error.code, "EMAIL_IN_USE");
  });

  await t.test("login rejects incorrect credentials", async () => {
    const result = await request("/api/v1/auth/login", {
      method: "POST",
      json: {
        email: "maya.shah@example.test",
        password: "WrongPass9",
      },
    });
    assert.equal(result.status, 401);
    assert.equal(result.body.error.code, "INVALID_CREDENTIALS");
  });

  await t.test("login succeeds with valid credentials", async () => {
    const result = await request("/api/v1/auth/login", {
      method: "POST",
      json: {
        email: "maya.shah@example.test",
        password: "RiverStone8",
      },
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.user.id.length, 36);
    newUserAccessToken = result.body.session.accessToken;
    newUserRefreshToken = result.body.session.refreshToken;
  });

  await t.test("session requires a Bearer token", async () => {
    const result = await request("/api/v1/auth/session");
    assert.equal(result.status, 401);
    assert.equal(result.body.error.code, "AUTHORIZATION_REQUIRED");
  });

  await t.test("session returns the authenticated user", async () => {
    const result = await request("/api/v1/auth/session", {
      headers: { authorization: "Bearer " + newUserAccessToken },
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.user.email, "maya.shah@example.test");
    assert.match(result.body.session.expiresAt, /^\d{4}-\d{2}-\d{2}T/);
  });

  await t.test("refresh rotates the refresh token", async () => {
    const result = await request("/api/v1/auth/refresh", {
      method: "POST",
      json: { refreshToken: newUserRefreshToken },
    });
    assert.equal(result.status, 200);
    assert.ok(result.body.session.accessToken.startsWith("dummy_access_"));
    assert.notEqual(result.body.session.refreshToken, newUserRefreshToken);

    const replay = await request("/api/v1/auth/refresh", {
      method: "POST",
      json: { refreshToken: newUserRefreshToken },
    });
    assert.equal(replay.status, 401);
    assert.equal(replay.body.error.code, "INVALID_REFRESH_TOKEN");
  });

  await t.test("forgot-password does not disclose user existence", async () => {
    const existing = await request("/api/v1/auth/forgot-password", {
      method: "POST",
      json: { email: "aarav.mehta@example.test" },
    });
    const missing = await request("/api/v1/auth/forgot-password", {
      method: "POST",
      json: { email: "nobody@example.test" },
    });
    assert.equal(existing.status, 202);
    assert.equal(missing.status, 202);
    assert.equal(existing.body.message, missing.body.message);
  });

  await t.test("seeded dummy reset token changes the seeded password", async () => {
    const result = await request("/api/v1/auth/reset-password", {
      method: "POST",
      json: {
        resetToken: "dummy-reset-token-aarav-2026",
        newPassword: "NewCahuuPass7",
      },
    });
    assert.equal(result.status, 200);

    const login = await request("/api/v1/auth/login", {
      method: "POST",
      json: {
        email: "aarav.mehta@example.test",
        password: "NewCahuuPass7",
      },
    });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.name, "Aarav Mehta");
  });

  await t.test("logout revokes the access token", async () => {
    const logout = await request("/api/v1/auth/session", {
      method: "DELETE",
      headers: { authorization: "Bearer " + newUserAccessToken },
    });
    assert.equal(logout.status, 204);

    const session = await request("/api/v1/auth/session", {
      headers: { authorization: "Bearer " + newUserAccessToken },
    });
    assert.equal(session.status, 401);
    assert.equal(session.body.error.code, "INVALID_ACCESS_TOKEN");
  });

  await t.test("unknown routes return a structured 404", async () => {
    const result = await request("/api/v1/auth/missing");
    assert.equal(result.status, 404);
    assert.equal(result.body.error.code, "ROUTE_NOT_FOUND");
  });
});
