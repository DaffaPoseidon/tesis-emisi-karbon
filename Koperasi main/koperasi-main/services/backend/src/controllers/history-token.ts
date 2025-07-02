import { Request, Response } from "express";
import * as historyTokenService from "../services/history-token.js";

export const getHistoryTokenByUserIdandProjectIdHandler = async (req: Request, res: Response) => {
  try {
    const historyToken = await historyTokenService.getHistoryTokenByUserIdAndProjectId(req.user.id, req.params.id);

    if (!historyToken || historyToken.length === 0) {
      return res.status(404).json({ message: "History Token not found" });
    }

    return res.status(200).json({ data: historyToken });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};