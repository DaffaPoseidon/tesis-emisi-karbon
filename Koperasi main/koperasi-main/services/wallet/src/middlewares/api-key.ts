import { Request, Response, NextFunction } from "express";

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.API_KEY;

  if (apiKey === validApiKey) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Invalid API key" });
  }
};
