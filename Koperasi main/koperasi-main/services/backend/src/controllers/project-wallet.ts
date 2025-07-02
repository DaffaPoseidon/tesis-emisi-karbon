import { Request, Response } from "express";
import * as projectWalletService from "../services/project-wallet.js";

export const getProjectWalletHandler = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const wallet = await projectWalletService.getAllProjectWallet(search as string);
    return res.status(200).json({ data: wallet });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getProjectWalletByProjectIdHandler = async (req: Request, res: Response) => {
  try {
    const wallet = await projectWalletService.getProjectWalletByProjectId(req.params.id);
    return res.status(200).json({ data: wallet });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

export const transferSaldoProjectHandler = async (req: Request, res: Response) => {
  try {
    await projectWalletService.transferSaldoProject(req.body);
    return res.status(201).json({ message: "Balance transferred successfully" });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
