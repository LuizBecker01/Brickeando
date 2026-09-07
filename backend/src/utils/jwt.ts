import jwt, { JwtPayload } from "jsonwebtoken";

const getJwtSecret = () => process.env.JWT_SECRET ?? "brickeando-dev-secret";

export interface AppTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  name: string;
}

export function createAppToken(
  userId: string,
  email: string,
  name: string,
): string {
  return jwt.sign({ sub: userId, email, name }, getJwtSecret(), {
    expiresIn: "1d",
  });
}

export function verifyAppToken(token: string): AppTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AppTokenPayload;
}
