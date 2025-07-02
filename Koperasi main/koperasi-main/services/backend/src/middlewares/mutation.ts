import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../assets/uploads/laporan_mutasi"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const uploadMutationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    upload.single("laporan")(req, res, (err) => {
    if (err) {
      console.error("Error in file upload:", err);
      return res.status(500).json({ message: "File upload failed" });
    }

    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "File upload failed" });
    }
    
    req.body.laporan = `/uploads/laporan_mutasi/${file.filename}`;

    next();
  });
};
