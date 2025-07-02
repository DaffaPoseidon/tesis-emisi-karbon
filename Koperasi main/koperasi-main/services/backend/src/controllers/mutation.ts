import { Request, Response } from "express";
import * as mutationService from "../services/mutation.js";
export const createMutationHandler = async (req: Request, res: Response) => {
  try {
    const mutation = await mutationService.createMutation(req.body);
    return res.status(201).json({ message: "Mutation created successfully", data: mutation });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getAllMutationHandler = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const mutation = await mutationService.getAllMutation(search as string | undefined);
    return res.status(200).json({ data: mutation });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getMutationByIdHandler = async (req: Request, res: Response) => {
  try {
    const mutation = await mutationService.getMutationById(req.params.id);
    return res.status(200).json({ data: mutation });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getMutationByProjectIdHandler = async (req: Request, res: Response) => {
  try {
    const mutation = await mutationService.getMutationByProjectId(req.params.id);
    return res.status(200).json({ data: mutation });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ canUploadReport: error.canUploadReport, message: error.message });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
