import * as projectTokenService from "../services/project-token.js";
import { Request, Response } from "express";

export const getTokenByIdProjectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await projectTokenService.getTokenByIdProject(id);
    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Tokens not found for the given project ID" });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error in getTokenByIdProjectHandler:", error);
    return res.status(500).json({ message: "Internal server error while retrieving tokens" });
  }
};

export const getTokenProjectByUserHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const id_user = req.user.id;
    const response = await projectTokenService.getTokenProjectByUser(id_user, id);
    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Tokens not found for the user and project" });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error in getTokenProjectByUserHandler:", error);
    return res.status(500).json({ message: "Internal server error while retrieving tokens for the user and project" });
  }
};

export const getTotalTokenUsageByIdProjectHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await projectTokenService.getTotalTokenTerbeliByIdProject(id);
    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Tokens not found for the user and project" });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error in getTokenProjectByUserHandler:", error);
    return res.status(500).json({ message: "Internal server error while retrieving tokens for the user and project" });
  }
};

export const buyTokenProjectHandler = async (req: Request, res: Response) => {
  try {
    const id_user = req.user.id;
    const { id_projek, jumlah_token } = req.body;
    const buyToken = await projectTokenService.buyTokenProject(id_user, id_projek, jumlah_token);
    return res.status(201).json({ message: "Token purchased successfully", data: buyToken });
  } catch (error: any) {
    if (error.message.includes("Available tokens not found")) {
      return res.status(404).json({ message: "No available tokens found for this project" });
    } else if (error.message.includes("User not found")) {
      return res.status(404).json({ message: "User not found" });
    } else if (error.message.includes("Project not found")) {
      return res.status(404).json({ message: "Project not found" });
    } else if (error.message.includes("Insufficient tokens available for purchase")) {
      return res.status(400).json({ message: "Insufficient tokens available for purchase" });
    } else if (error.message.includes("Insufficient balance")) {
      return res.status(400).json({ message: "Insufficient balance in user's wallet" });
    }
    console.error("Error in buyTokenProjectHandler:", error);
    return res.status(500).json({ message: "Internal server error during token purchase" });
  }
};

export const getAllTokenHandler = async (req: Request, res: Response) => {
  try {
    const { search, ...filter } = req.query;
    const response = await projectTokenService.getAllToken();
    if (!response || response.length === 0) {
      return res.status(404).json({ message: "No tokens found" });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error in getAllTokenHandler:", error);
    return res.status(500).json({ message: "Internal server error while retrieving all tokens" });
  }
};

export const getTotalTokenHandler = async (req: Request, res: Response) => {
  try {
    const response = await projectTokenService.getTotalToken();
    if (!response || response === "0") {
      return res.status(404).json({ message: "Total token not found" });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error in getTotalTokenHandler:", error);
    return res.status(500).json({ message: "Internal server error while retrieving total tokens" });
  }
};

export const tokenUsageDetailsByIdUserHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const { search, ...filter } = req.query;
    const response = await projectTokenService.tokenUsageDetailsByIdUser(id);
    if (!response || response.length === 0) {
      return res.status(404).json({ message: "No token usage details found for the user" });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error in tokenUsageDetailsByIdUserHandler:", error);
    return res.status(500).json({ message: "Internal server error while retrieving token usage details" });
  }
};

export const getTotalTokenRupiahByUserHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const response = await projectTokenService.getTotalTokenRupiahByUser(id);
    if (!response) {
      return res.status(404).json({ message: "Total token rupiah not found" });
    }
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error in getTotalTokenRupiahByUserHandler:", error);
    return res.status(500).json({ message: "Internal server error while retrieving total token rupiah" });
  }
}