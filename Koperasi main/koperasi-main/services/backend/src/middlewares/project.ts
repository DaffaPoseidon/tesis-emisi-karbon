import multer from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";

// Definisikan tipe untuk file yang diizinkan
type AllowedFileTypes = {
  [key: string]: string[];
};

// Tipe file yang diizinkan
const allowedFileTypes: AllowedFileTypes = {
  brosur_produk: ["image/jpg", "image/jpeg", "image/png", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  dokumen_proyeksi: ["image/jpg", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  dokumen: ["image/jpg", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  dokumen_prospektus: ["image/jpg", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

// Maksimum ukuran file dalam bytes (2MB)
const maxSize = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../assets/uploads");
    const folderName = file.fieldname === "dokumen" ? "dokumen_pendukung" : file.fieldname;
    cb(null, path.join(uploadPath, folderName));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Validasi tipe dan ukuran file
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileTypes = allowedFileTypes[file.fieldname];
  if (fileTypes && fileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed for ${file.fieldname}.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
}).fields([
  { name: "brosur_produk", maxCount: 1 },
  { name: "dokumen_proyeksi", maxCount: 1 },
  { name: "dokumen", maxCount: 5 },
  { name: "dokumen_prospektus", maxCount: 1 },
]);

// Helper function to process uploaded files
const processUploadedFiles = (req: Request, files: Express.Multer.File[] | undefined, fieldName: string): string | string[] | null => {
  if (!files || files.length === 0) return null;
  
  const basePath = `uploads/${fieldName === "dokumen" ? "dokumen_pendukung" : fieldName}`;
  
  return fieldName === "dokumen"
    ? files.map(file => `${basePath}/${file.filename}`)
    : `${basePath}/${files[0].filename}`;
};

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (!files) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    console.log("Files yang tertangkap:", files);

    const fieldNames = ["brosur_produk", "dokumen_proyeksi", "dokumen", "dokumen_prospektus"];

    fieldNames.forEach(fieldName => {
      const processedFiles = processUploadedFiles(req, files[fieldName], fieldName);
      if (processedFiles) {
        req.body[fieldName] = processedFiles;
      }
    });

    if (!req.body.dokumen_proyeksi) {
      return res.status(400).json({ error: "File dokumen_proyeksi is required." });
    }

    next();
  });
};

export const uploadUpdateProjectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (!files) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    console.log("Files yang tertangkap:", files);

    const fieldNames = ["brosur_produk", "dokumen_proyeksi", "dokumen"];

    fieldNames.forEach(fieldName => {
      const processedFiles = processUploadedFiles(req, files[fieldName], fieldName);
      if (processedFiles) {
        req.body[fieldName] = processedFiles;
      }
    });

    next();
  });
};

export const uploadDokumenProspektusMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    if (!files) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const processedFiles = processUploadedFiles(req, files.dokumen_prospektus, "dokumen_prospektus");
    
    if (processedFiles) {
      req.body.dokumen_prospektus = processedFiles;
    } else {
      return res.status(400).json({ error: "File dokumen_prospektus is required." });
    }

    next();
  });
};