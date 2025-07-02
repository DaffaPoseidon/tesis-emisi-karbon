import { Request, Response } from "express";
import * as historyProjectWalletService from "../services/history-project-wallet.js";

export const getHistoryProjectWalletByProjectWalletIdHandler = async (req: Request, res: Response) => {
  try {
    const historyProjectWallet = await historyProjectWalletService.getHistoryProjectWalletByProjectWalletId(req.params.id);
    return res.status(200).json({ data: historyProjectWallet });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};