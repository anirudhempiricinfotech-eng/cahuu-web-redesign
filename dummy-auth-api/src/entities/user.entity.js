"use strict";

class UserEntity {
  constructor({ id, name, email, passwordHash, roles, createdAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.roles = roles;
    this.createdAt = createdAt;
  }

  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      roles: this.roles,
      createdAt: this.createdAt,
    };
  }
}

module.exports = { UserEntity };

