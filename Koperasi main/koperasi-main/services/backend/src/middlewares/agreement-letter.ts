// middlewares/agreement-letter.ts

import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../assets/uploads/tanda_tangan"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize Multer with storage configuration
const upload = multer({ storage });

// Middleware to handle file upload and process the uploaded file
export const AgreementMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single("tanda_tangan")(req, res, (err) => {
    if (err) {
      console.error("Error in file upload:", err);
      return res.status(500).json({ message: "File upload failed" });
    }

    const file = req.file;

    // Check if file upload was successful
    if (!file) {
      return res.status(400).json({ message: "File upload failed" });
    }

    // Set the file path to the request body
    req.body.tanda_tangan = `/uploads/tanda_tangan/${file.filename}`;

    next();
  });
};
