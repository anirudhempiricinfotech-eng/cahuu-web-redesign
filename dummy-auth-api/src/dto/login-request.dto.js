"use strict";

/**
 * Declarative validation metadata is kept beside the DTO so an API audit can
 * trace each request field without a framework or decorator dependency.
 */
class LoginRequestDto {
  static validation = Object.freeze({
    email: { required: true, type: "string", format: "email" },
    password: { required: true, type: "string", minLength: 1 },
  });

  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }

  static from(body, { emailPattern, httpError }) {
    const details = [];
    if (typeof body.email !== "string" || !emailPattern.test(body.email)) {
      details.push({ field: "email", rule: "required valid email" });
    }
    if (typeof body.password !== "string" || body.password.length === 0) {
      details.push({ field: "password", rule: "required non-empty string" });
    }
    if (details.length) {
      throw httpError(400, "VALIDATION_ERROR", "One or more fields are invalid.", details);
    }
    return new LoginRequestDto(body);
  }
}

module.exports = { LoginRequestDto };

