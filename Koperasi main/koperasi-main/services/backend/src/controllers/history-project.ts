import { Request, Response } from "express";
import * as historyProjectService from "../services/history-project.js";

export const getHistoryProjectByProjectIdHandler = async (req: Request, res: Response) => {
  try {
    const historyProject = await historyProjectService.getHistoryProjectByProjectId(req.params.id);
    return res.status(200).json({ data: historyProject });
  } catch (error: any) {
    const statusCode = error.statusCode || 500; 
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};