import { Request, Response } from "express";
import * as projectCategoryService from "../services/project-category.js";

export const createProjectCategoryHandler = async (req: Request, res: Response) => {
  try {
    const response = await projectCategoryService.createProjectCategory(req.body);
    return res.status(201).json({ message: response.message });
  } catch (error: any) {
    if (error.message === "Category already exists") {
      return res.status(409).json({ message: "Project Category already exists" });
    } else if (error.message === "Category is required") {
      return res.status(400).json({ message: "Category is required" });
    }
    console.error(error);
    return res.status(500).json({ message: "Project Category failed to be created" });
  }
};

export const getProjectCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const projects = await projectCategoryService.getAllProjectCategory(search as string | undefined);
    return res.status(200).json({ data: projects });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve Project Categories" });
  }
};

export const getProjectCategoryByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await projectCategoryService.getProjectCategoryById(id);
    return res.status(200).json({ data: response });
  } catch (error: any) {
    if (error.message === "Project Category not found") {
      return res.status(404).json({ message: "Project Category not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve Project Category" });
  }
};

export const updateProjectCategoryByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await projectCategoryService.updateProjectCategoryById(req.body, id);
    return res.status(200).json({ message: "Project Category updated successfully" });
  } catch (error: any) {
    if (error.message === "Project Category not found") {
      return res.status(404).json({ message: "Project Category not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to update Project Category" });
  }
};

export const deleteProjectCategoryByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await projectCategoryService.deleteProjectCategoryById(id);
    return res.status(200).json({ message: "Project Category deleted successfully" });
  } catch (error: any) {
    if (error.message === "Project Category not found") {
      return res.status(404).json({ message: "Project Category not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to delete Project Category" });
  }
};
