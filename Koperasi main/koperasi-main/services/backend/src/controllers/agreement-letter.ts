import { Request, Response } from "express";
import * as agreementLetterService from "../services/agreement-letter.js";

export const createAgreementLetterHandler = async (req: Request, res: Response) => {
  try {
    await agreementLetterService.createAgreementLetter(req.body);
    return res.status(201).json({ message: "Agreement letter created successfully" });
  } catch (error: any) {
    if (error.message.includes("Project not found")) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (error.message.includes("User associated with the project not found")) {
      return res.status(404).json({ message: "User associated with the project not found" });
    }
    if (error.message.includes("Admin user not found")) {
      return res.status(404).json({ message: "Admin user not found" });
    }
    if (error.message.includes("Admin signature not found")) {
      return res.status(404).json({ message: "Admin signature not found" });
    }

    console.error("Error creating agreement letter:", error);
    return res.status(500).json({ message: "Failed to create agreement letter" });
  }
};

export const getAllAgreementLetterHandler = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const response = await agreementLetterService.getAllAgreementLetter(search as string | undefined);

    return res.status(200).json({ data: response });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return res.status(404).json({ message: error.message });
    }

    console.error("Error fetching all agreements:", error);
    return res.status(500).json({ message: "Failed to fetch agreement letters" });
  }
};

export const getAgreementLetterByProjectIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await agreementLetterService.getAgreementByProjectId(id);
    return res.status(200).json({ data: response });
  } catch (error: any) {
    if (error.message.includes("No agreements found for this project ID")) {
      return res.status(404).json({ message: "No agreements found for this project ID" });
    }

    console.error("Error fetching agreement by project ID:", error);
    return res.status(500).json({ message: "Failed to fetch agreement letter by project ID" });
  }
};
