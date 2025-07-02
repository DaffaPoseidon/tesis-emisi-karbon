import { Request, Response } from "express";
import * as projectService from "../services/project.js";
import path from "path";

export const countProjectHandler = async (req: Request, res: Response) => {
  try {
    const response = await projectService.countProject();
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve projects" });
  }
};

export const createProjectHandler = async (req: Request, res: Response) => {
  try {
    const project = await projectService.createProject(req.user.id, req.body);
    return res.json(project);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getAllProjectHandler = async (req: Request, res: Response) => {
  try {
    const { search, ...filter } = req.query;

    const projects = await projectService.getAllProject(search as string | undefined, filter as { [key: string]: string | undefined });

    return res.status(200).json({ data: projects });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getProjectByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await projectService.getProjectById(id);
    if (!response) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getProjectByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const { search, ...filter } = req.query;
    const response = await projectService.getProjectByUserId(req.user.id, search as string | undefined, filter as { [key: string]: string | undefined });
    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getUserHaveTokenInProjectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await projectService.getUserHaveTokenInProject(id);

    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const acceptProjectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await projectService.acceptProjectById(id);
    return res.status(200).json({ message: "Project accepted" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const rejectProjectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { keterangan } = req.body;
    await projectService.rejectProjectById(id, keterangan);
    return res.status(200).json({ message: "Project rejected" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const reviseProjectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { keterangan } = req.body;
    await projectService.reviseProjectById(id, keterangan);
    return res.status(200).json({ message: "Project revised" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getKeteranganReviseProjectByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await projectService.getKeteranganReviseProjectById(id);
    return res.status(200).json({ data });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const updateProjectHandler = async (req: Request, res: Response) => {
  try {
    const project = await projectService.updateProjectById(req.user.id, req.body);
    return res.status(201).json(project);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const approveProjectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const detail = req.body;
    await projectService.approveProjectById(id, detail);
    return res.status(200).json({ message: "Project approved" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const deleteProjectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await projectService.deleteProjectById(id);
    return res.status(200).json({ message: "Project deleted" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const publishProjectHandler = async (req: Request, res: Response) => {
  try {
    await projectService.publishProjectById(req.body);
    console.log(req.body);
    return res.status(200).json({ message: "Project published" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const checkProjectFundingOpenedHandler = async (req: Request, res: Response) => {
  try {
    const response = await projectService.checkProjectFundingOpened();
    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const completingProjectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const project = await projectService.completingProjectById(id);
    return res.status(200).json({ message: "Project completed" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const totalProfitHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const totalProfit = await projectService.totalProfit(id);
    if (!totalProfit) {
      return res.status(404).json({ message: "Total profit not found" });
    }
    return res.status(200).json({ total: totalProfit });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve total profit" });
  }
};

export const shareProfitHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const project = await projectService.shareProfit(id);
    return res.status(200).json(project);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getDokumenProspektusByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dokumenPath = await projectService.getDokumenProspektusById(id);

    if (!dokumenPath) {
      return res.status(404).json({ message: "Dokumen prospektus not found" });
    }

    const filePath = path.resolve(__dirname, "../../assets/", dokumenPath);

    return res.sendFile(filePath);
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    return res.status(statusCode).json({ message });
  }
};
