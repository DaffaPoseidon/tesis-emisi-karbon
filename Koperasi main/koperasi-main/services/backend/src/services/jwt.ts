import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const tokenBlacklist: { [key: string]: number } = {};

export function generateToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7 days" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
