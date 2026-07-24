"use strict";

const { LoginRequestDto } = require("../dto/login-request.dto");

/** Auth resource controller for the v1 test API. */
class AuthController {
  constructor(dependencies) {
    this.state = dependencies.state;
    this.emailPattern = dependencies.emailPattern;
    this.httpError = dependencies.httpError;
    this.readJson = dependencies.readJson;
    this.checkLoginRateLimit = dependencies.checkLoginRateLimit;
    this.hashPassword = dependencies.hashPassword;
    this.publicUser = dependencies.publicUser;
    this.issueTokens = dependencies.issueTokens;
    this.writeJson = dependencies.writeJson;
  }

  /** POST /api/v1/auth/login â€” public, five attempts/source/60 seconds. */
  async login(req, res) {
    this.checkLoginRateLimit(this.state, req);
    const body = await this.readJson(req);
    const dto = LoginRequestDto.from(body, {
      emailPattern: this.emailPattern,
      httpError: this.httpError,
    });
    const email = dto.email.trim().toLowerCase();
    const user = this.state.usersByEmail.get(email);
    if (!user || user.passwordHash !== this.hashPassword(dto.password)) {
      throw this.httpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }
    this.writeJson(res, 200, {
      user: this.publicUser(user),
      session: this.issueTokens(this.state, user.id),
    });
  }
}

module.exports = { AuthController };

