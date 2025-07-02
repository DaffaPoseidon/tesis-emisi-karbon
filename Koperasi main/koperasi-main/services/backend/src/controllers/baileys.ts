import { Request, Response } from "express";
import { qrCode, isConnected } from "../services/baileys.js";

export const getQRCodeHandler = async (req: Request, res: Response) => {
  try {
    if (isConnected) {
      return res.status(200).json({ status: "SUCCESS", message: "WA terhubung" });
    } else if (qrCode) {
      return res.status(200).json({ status: "NOTCONNECTED", qr: qrCode });
    } else {
      return res.status(404).json({
        status: "ERROR",
        message: "QR code not available, please try again later.",
      });
    }
  } catch (error) {
    console.error("Error in getQRCodeHandler:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Internal server error, please try again later.",
    });
  }
};
