import { Request, Response } from "express";
import * as chartProjectService from "../services/chart-project.js";

export const getChartProjectByIdHandler = async (req: Request, res: Response) => {
  try {
    const chartProject = await chartProjectService.getChartProjectById(req.params.id);

    if (!chartProject || chartProject.length === 0) {
      return res.status(404).json({ message: "Chart Project not found" });
    }

    return res.status(200).json({ data: chartProject });
  } catch (error) {
    console.error("Error fetching chart project by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllChartProjectByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const chartProject = await chartProjectService.getAllChartProjectByUserId(req.user.id);

    if (!chartProject || chartProject.length === 0) {
      return res.status(404).json({ message: "No Chart Projects found for this user" });
    }

    return res.status(200).json({ data: chartProject });
  } catch (error) {
    console.error("Error fetching all chart projects by user ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
