import { Request, Response } from "express";
import * as chartTokenService from "../services/chart-token.js";

export const getLastChartTokenByUserIdandProjectIdHandler = async (req: Request, res: Response) => {
  try {
    const chartToken = await chartTokenService.getLastChartTokenByUserIdandProjectId(req.user.id, req.params.id);

    if (!chartToken) {
      return res.status(404).json({ message: "Chart Token not found" });
    }

    return res.status(200).json({ data: chartToken });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getChartTokenByUserIdandProjectIdHandler = async (req: Request, res: Response) => {
  try {
    const chartToken = await chartTokenService.getChartTokenByUserIdandProjectId(req.user.id, req.params.id);

    if (!chartToken || chartToken.length === 0) {
      return res.status(404).json({ message: "Chart Token not found" });
    }

    return res.status(200).json({ data: chartToken });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getAllChartTokenByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const chartToken = await chartTokenService.getAllChartTokenByUserId(req.user.id);

    if (!chartToken || chartToken.length === 0) {
      return res.status(404).json({ message: "Chart Token not found" });
    }

    return res.status(200).json({ data: chartToken });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};