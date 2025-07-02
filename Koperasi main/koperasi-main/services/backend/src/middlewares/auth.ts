import multer from "multer";
import path from "path";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { tokenBlacklist } from "../services/jwt.js";
import { db } from "../drizzle/db.js";
import { UserTable } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

// Configure disk storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    switch (file.fieldname) {
      case "foto_diri":
        cb(null, path.join(__dirname, "../../assets/uploads/foto_diri"));
        break;
      case "foto_ktp":
        cb(null, path.join(__dirname, "../../assets/uploads/foto_ktp"));
        break;
      case "foto_profile":
        cb(null, path.join(__dirname, "../../assets/uploads/foto_profile"));
        break;
      case "signature":
        cb(null, path.join(__dirname, "../../assets/uploads/tanda_tangan_admin"));
        break;
      default:
        cb(new Error("Invalid field name"), "");
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const parseFormData = upload.fields([
  { name: "foto_diri", maxCount: 1 },
  { name: "foto_ktp", maxCount: 1 },
  { name: "foto_profile", maxCount: 1 },
  { name: "signature", maxCount: 1 },
]);

export const formDataParserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Initialize paths as null or uploaded file values
    const fotoDiriPath = files?.["foto_diri"]?.[0] ? `/uploads/foto_diri/${files["foto_diri"][0].filename}` : null;

    const fotoKTPPath = files?.["foto_ktp"]?.[0] ? `/uploads/foto_ktp/${files["foto_ktp"][0].filename}` : null;

    const fotoProfilePath = files?.["foto_profile"]?.[0] ? `/uploads/foto_profile/${files["foto_profile"][0].filename}` : null;

    const signaturePath = files?.["signature"]?.[0] ? `/uploads/tanda_tangan_admin/${files["signature"][0].filename}` : null;

    // Set paths in req.body
    if (fotoDiriPath) req.body.foto_diri = fotoDiriPath;
    if (fotoKTPPath) req.body.foto_ktp = fotoKTPPath;
    if (fotoProfilePath) req.body.foto_profile = fotoProfilePath;
    if (signaturePath) req.body.signature = signaturePath;

    next();
  } catch (err) {
    console.error("Error parsing form-data: ", err);
    res.status(500).json({ message: "Error parsing form-data" });
  }
};

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "JWT Token not found" });
    }

    if (tokenBlacklist[token]) {
      return res.status(401).json({ error: "JWT Token has been invalidated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await db.select().from(UserTable).where(eq(UserTable.id, req.user.id)).limit(1).execute();
    if (!user[0] || user[0].role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const platinumOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user.role !== "PLATINUM" && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
