import assert from "node:assert/strict";
import { createAppToken, verifyAppToken } from "../utils/jwt";
import { validatePassword } from "../utils/password-validator";

const validPassword = "Brickeando9!";

assert.equal(validatePassword(validPassword).isValid, true);
assert.equal(validatePassword("Br1!").isValid, false);
assert.ok(
  validatePassword("brickeando9!").errors.some((error) =>
    error.includes("maiúscula"),
  ),
);
assert.ok(
  validatePassword("BRICKEANDO9!").errors.some((error) =>
    error.includes("minúscula"),
  ),
);
assert.ok(
  validatePassword("Brickeando!").errors.some((error) =>
    error.includes("número"),
  ),
);
assert.ok(
  validatePassword("Brickeando9").errors.some((error) =>
    error.includes("especial"),
  ),
);

const token = createAppToken("user-123", "user@example.com", "Usuário");
const payload = verifyAppToken(token);

assert.equal(payload.sub, "user-123");
assert.equal(payload.email, "user@example.com");
assert.equal(payload.name, "Usuário");
assert.ok(payload.exp);

console.log("Auth tests passed.");
