"use strict";

const http = require("node:http");
const crypto = require("node:crypto");

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
const JSON_LIMIT_BYTES = 1024 * 1024;
const LOGIN_RATE_LIMIT = { max: 5, windowMs: 60 * 1000 };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

function createState() {
  const state = {
    usersByEmail: new Map(),
    usersById: new Map(),
    accessTokens: new Map(),
    refreshTokens: new Map(),
    resetTokens: new Map(),
    loginAttempts: new Map(),
  };

  const seededUser = {
    id: "7b301d54-a817-4604-9c9c-43248f81226f",
    name: "Aarav Mehta",
    email: "aarav.mehta@example.test",
    passwordHash: hashPassword("CahuuDemo9"),
    roles: ["user"],
    createdAt: "2026-07-02T09:00:00.000Z",
  };
  state.usersByEmail.set(seededUser.email, seededUser);
  state.usersById.set(seededUser.id, seededUser);
  state.resetTokens.set("dummy-reset-token-aarav-2026", {
    userId: seededUser.id,
    expiresAt: Date.now() + PASSWORD_RESET_TTL_MS,
  });
  return state;
}

function hashPassword(password) {
  return crypto.createHash("sha256").update("dummy-auth-api:" + password).digest("hex");
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    createdAt: user.createdAt,
  };
}

function tokenValue(prefix) {
  return prefix + "_" + crypto.randomBytes(24).toString("base64url");
}

function issueTokens(state, userId) {
  const accessToken = tokenValue("dummy_access");
  const refreshToken = tokenValue("dummy_refresh");
  const now = Date.now();

  state.accessTokens.set(accessToken, { userId, expiresAt: now + ACCESS_TOKEN_TTL_MS });
  state.refreshTokens.set(refreshToken, { userId, expiresAt: now + REFRESH_TOKEN_TTL_MS });

  return {
    tokenType: "Bearer",
    accessToken,
    accessTokenExpiresIn: 900,
    refreshToken,
    refreshTokenExpiresIn: 604800,
  };
}

function writeJson(res, statusCode, body, extraHeaders = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body, null, 2);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...extraHeaders,
  });
  res.end(payload);
}

function error(res, statusCode, code, message, details) {
  const body = {
    error: {
      status: statusCode,
      code,
      message,
      timestamp: new Date().toISOString(),
    },
  };
  if (details) body.error.details = details;
  writeJson(res, statusCode, body);
}

function httpError(statusCode, code, message, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  err.details = details;
  return err;
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > JSON_LIMIT_BYTES) {
      throw httpError(413, "PAYLOAD_TOO_LARGE", "JSON request body may not exceed 1 MiB.");
    }
    chunks.push(chunk);
  }
  if (!chunks.length) {
    throw httpError(400, "BODY_REQUIRED", "A JSON request body is required.");
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || Array.isArray(value) || typeof value !== "object") {
      throw new Error("Expected a JSON object.");
    }
    return value;
  } catch {
    throw httpError(400, "INVALID_JSON", "Request body must be a valid JSON object.");
  }
}

function validateSignup(body) {
  const details = [];
  if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 80) {
    details.push({ field: "name", rule: "required string; 2-80 characters" });
  }
  if (typeof body.email !== "string" || !emailPattern.test(body.email) || body.email.length > 254) {
    details.push({ field: "email", rule: "required valid email; max 254 characters" });
  }
  if (typeof body.password !== "string" || !passwordPattern.test(body.password)) {
    details.push({ field: "password", rule: "required; 8-72 characters with uppercase, lowercase and digit" });
  }
  if (body.acceptTerms !== true) {
    details.push({ field: "acceptTerms", rule: "required boolean true" });
  }
  if (details.length) throw httpError(400, "VALIDATION_ERROR", "One or more fields are invalid.", details);
}

function validateLogin(body) {
  const details = [];
  if (typeof body.email !== "string" || !emailPattern.test(body.email)) {
    details.push({ field: "email", rule: "required valid email" });
  }
  if (typeof body.password !== "string" || body.password.length === 0) {
    details.push({ field: "password", rule: "required non-empty string" });
  }
  if (details.length) throw httpError(400, "VALIDATION_ERROR", "One or more fields are invalid.", details);
}

function authenticate(state, req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw httpError(401, "AUTHORIZATION_REQUIRED", "Send a Bearer access token in the Authorization header.");
  }
  const token = header.slice(7).trim();
  const session = state.accessTokens.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) state.accessTokens.delete(token);
    throw httpError(401, "INVALID_ACCESS_TOKEN", "The access token is invalid or expired.");
  }
  const user = state.usersById.get(session.userId);
  if (!user) throw httpError(401, "INVALID_ACCESS_TOKEN", "The access token is invalid.");
  return { token, user, session };
}

function checkLoginRateLimit(state, req) {
  const forwarded = req.headers["x-forwarded-for"];
  const key = (typeof forwarded === "string" && forwarded.split(",")[0].trim()) || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  let record = state.loginAttempts.get(key);
  if (!record || record.resetAt <= now) record = { count: 0, resetAt: now + LOGIN_RATE_LIMIT.windowMs };
  record.count += 1;
  state.loginAttempts.set(key, record);
  if (record.count > LOGIN_RATE_LIMIT.max) {
    const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    const err = httpError(429, "RATE_LIMITED", "Too many login attempts. Try again later.");
    err.extraHeaders = { "retry-after": String(retryAfter) };
    throw err;
  }
}

function allowCors(req, res) {
  res.setHeader("access-control-allow-origin", req.headers.origin || "*");
  res.setHeader("access-control-allow-methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("access-control-allow-headers", "authorization, content-type");
  res.setHeader("vary", "Origin");
}

function createApp(initialState) {
  const state = initialState || createState();

  const server = http.createServer(async (req, res) => {
    allowCors(req, res);
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, "http://localhost");
    try {
      if (req.method === "GET" && url.pathname === "/health") {
        writeJson(res, 200, {
          status: "ok",
          service: "cahuu-dummy-auth-api",
          apiVersion: "v1",
          now: new Date().toISOString(),
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/v1/auth/signup") {
        const body = await readJson(req);
        validateSignup(body);
        const email = body.email.trim().toLowerCase();
        if (state.usersByEmail.has(email)) {
          throw httpError(409, "EMAIL_IN_USE", "An account already exists for this email.");
        }
        const user = {
          id: crypto.randomUUID(),
          name: body.name.trim(),
          email,
          passwordHash: hashPassword(body.password),
          roles: ["user"],
          createdAt: new Date().toISOString(),
        };
        state.usersByEmail.set(email, user);
        state.usersById.set(user.id, user);
        writeJson(res, 201, {
          user: publicUser(user),
          session: issueTokens(state, user.id),
        }, { location: "/api/v1/auth/session" });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/v1/auth/login") {
        checkLoginRateLimit(state, req);
        const body = await readJson(req);
        validateLogin(body);
        const email = body.email.trim().toLowerCase();
        const user = state.usersByEmail.get(email);
        if (!user || user.passwordHash !== hashPassword(body.password)) {
          throw httpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
        }
        writeJson(res, 200, {
          user: publicUser(user),
          session: issueTokens(state, user.id),
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/v1/auth/refresh") {
        const body = await readJson(req);
        if (typeof body.refreshToken !== "string" || body.refreshToken.length === 0) {
          throw httpError(400, "VALIDATION_ERROR", "refreshToken is required.", [
            { field: "refreshToken", rule: "required non-empty string" },
          ]);
        }
        const session = state.refreshTokens.get(body.refreshToken);
        if (!session || session.expiresAt <= Date.now()) {
          if (session) state.refreshTokens.delete(body.refreshToken);
          throw httpError(401, "INVALID_REFRESH_TOKEN", "The refresh token is invalid or expired.");
        }
        state.refreshTokens.delete(body.refreshToken);
        writeJson(res, 200, { session: issueTokens(state, session.userId) });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/v1/auth/forgot-password") {
        const body = await readJson(req);
        if (typeof body.email !== "string" || !emailPattern.test(body.email)) {
          throw httpError(400, "VALIDATION_ERROR", "email must be valid.", [
            { field: "email", rule: "required valid email" },
          ]);
        }
        const user = state.usersByEmail.get(body.email.trim().toLowerCase());
        if (user) {
          const token = tokenValue("dummy_reset");
          state.resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + PASSWORD_RESET_TTL_MS });
        }
        writeJson(res, 202, {
          message: "If that account exists, password-reset instructions have been queued.",
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/v1/auth/reset-password") {
        const body = await readJson(req);
        const details = [];
        if (typeof body.resetToken !== "string" || body.resetToken.length === 0) {
          details.push({ field: "resetToken", rule: "required non-empty string" });
        }
        if (typeof body.newPassword !== "string" || !passwordPattern.test(body.newPassword)) {
          details.push({ field: "newPassword", rule: "required; 8-72 characters with uppercase, lowercase and digit" });
        }
        if (details.length) throw httpError(400, "VALIDATION_ERROR", "One or more fields are invalid.", details);
        const reset = state.resetTokens.get(body.resetToken);
        if (!reset || reset.expiresAt <= Date.now()) {
          if (reset) state.resetTokens.delete(body.resetToken);
          throw httpError(401, "INVALID_RESET_TOKEN", "The password-reset token is invalid or expired.");
        }
        const user = state.usersById.get(reset.userId);
        user.passwordHash = hashPassword(body.newPassword);
        state.resetTokens.delete(body.resetToken);
        for (const [token, session] of state.accessTokens.entries()) {
          if (session.userId === user.id) state.accessTokens.delete(token);
        }
        for (const [token, session] of state.refreshTokens.entries()) {
          if (session.userId === user.id) state.refreshTokens.delete(token);
        }
        writeJson(res, 200, { message: "Password updated. Sign in again with the new password." });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/v1/auth/session") {
        const auth = authenticate(state, req);
        writeJson(res, 200, {
          user: publicUser(auth.user),
          session: {
            expiresAt: new Date(auth.session.expiresAt).toISOString(),
          },
        });
        return;
      }

      if (req.method === "DELETE" && url.pathname === "/api/v1/auth/session") {
        const auth = authenticate(state, req);
        state.accessTokens.delete(auth.token);
        res.writeHead(204, {
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
        });
        res.end();
        return;
      }

      error(res, 404, "ROUTE_NOT_FOUND", "No route matches " + req.method + " " + url.pathname + ".");
    } catch (err) {
      if (err && Number.isInteger(err.statusCode)) {
        const headers = err.extraHeaders || {};
        const body = {
          error: {
            status: err.statusCode,
            code: err.code || "REQUEST_ERROR",
            message: err.message,
            timestamp: new Date().toISOString(),
          },
        };
        if (err.details) body.error.details = err.details;
        writeJson(res, err.statusCode, body, headers);
        return;
      }
      console.error(err);
      error(res, 500, "INTERNAL_ERROR", "The dummy API encountered an unexpected error.");
    }
  });

  return { server, state };
}

if (require.main === module) {
  const port = Number.parseInt(process.env.PORT || "3000", 10);
  const { server } = createApp();
  server.listen(port, "127.0.0.1", () => {
    console.log("Cahuu dummy Auth API listening at http://127.0.0.1:" + port);
  });
}

module.exports = {
  createApp,
  createState,
  hashPassword,
};
