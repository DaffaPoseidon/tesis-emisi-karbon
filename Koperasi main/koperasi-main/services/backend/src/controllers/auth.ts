import { Request, Response, NextFunction } from "express";
import * as auth from "../services/auth.js";
import { generateToken, tokenBlacklist } from "../services/jwt.js";
import jwt from "jsonwebtoken";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.body;
    const response = await auth.register(user);

    if (response.success) {
      res.status(201).json({ message: response.message });
    } else {
      res.status(response.statusCode).json({ message: response.message });
    }
  } catch (error) {
    console.error(`Error while creating user`);
    res.status(500).json({ message: "Internal Server Error" });
    next(error);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { no_hp, password } = req.body;
    const user = await auth.login(no_hp, password);

    if (user) {
      const token = generateToken({ id: user.id, role: user.role, status: user.status });
      res.status(200).json({ token });
    }
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export function logout(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.decode(token) as jwt.JwtPayload;

    if (!decoded || !decoded.exp) {
      return res.status(400).json({ message: "Invalid token structure" });
    }

    tokenBlacklist[token] = decoded.exp * 1000;

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong during logout" });
  }
}
