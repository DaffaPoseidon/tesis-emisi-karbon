import { Request, Response } from "express";
import * as projectReportService from "../services/project-report.js";

export const createProjectReportHandler = async (req: Request, res: Response) => {
  try {
    const response = await projectReportService.createProjectReport(req.body);
    return res.status(201).json({ message: response.message });
  } catch (error: any) {
    if (error.message === "Project not found") {
      return res.status(404).json({ message: "Project not found" });
    } else if (error.message.includes("You can upload the report after")) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Project report failed to be created" });
  }
};

export const getAllProjectReportHandler = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const response = await projectReportService.getAllProjectReport(search as string | undefined);

    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Project report not found" });
    }

    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error retrieving project reports:", error);
    return res.status(500).json({ message: "Failed to retrieve project reports" });
  }
};

export const getProjectReportHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await projectReportService.getProjectReportById(id);
    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Project report not found" });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve project report" });
  }
};

export const getProjectReportByProjectIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { jenis } = req.query;

    const response = await projectReportService.getProjectReportByProjectId(id, jenis as string | undefined);
    if (!response.projectReport || response.projectReport.length === 0) {
      return res.status(404).json({ message: "Project report not found" });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve project report" });
  }
};
