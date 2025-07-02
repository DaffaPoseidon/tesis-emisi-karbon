import { Request, Response } from "express";
import * as topupService from "../services/topup.js";

export const getTopupByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await topupService.getTopupById(id);
    if (!response) {
      return res.status(404).json({ message: "Topup not found" });
    }
    return res.status(200).json({message:"Topup found", data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getAllTopUpHandler = async (req: Request, res: Response) => {
  try {
    const response = await topupService.getAllTopUp();
    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getWithdrawSaldoHandler = async (req: Request, res: Response) => {
  try {
    const response = await topupService.getWithdrawSaldo();
    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const createTopupHandler = async (req: Request, res: Response) => {
  try {
    const topup = req.body;
    console.log(topup);
    const response = await topupService.createTopUp(topup);
    return res.status(201).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

// export const updateTopupByIdHandler = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const topup = req.body;
//     await topupService.updateTopUpById(topup, id);
//     return res.status(200).json({ message: "Topup updated" });
//   } catch (error: any) {
//     const statusCode = error.statusCode || 500;
//     const message = error.message || "Internal Server Error";
//     res.status(statusCode).json({ message });
//   }
// }

export const deleteTopupByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await topupService.deleteTopUpById(id);
    return res.status(200).json({ message: "Topup deleted" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const accTopupHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await topupService.accTopUp(id);
    return res.status(200).json({ message: "Topup accepted" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const rejectTopupHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await topupService.rejectTopUp(id);
    return res.status(200).json({ message: "Topup rejected" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const withdrawSaldoHandler = async (req: Request, res: Response) => {
  try {
    const topup = req.body;
    await topupService.withdrawSaldo(topup);
    return res.status(200).json({ message: "Withdraw saldo success" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const accWithdrawSaldoHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await topupService.accWithdrawSaldo(id, req.body);
    return res.status(200).json({ message: "Withdraw accepted" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getTopupByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const topups = await topupService.getTopupByUserId(id);

    if (topups.length === 0) {
      return res.status(404).json({ message: "No topups found for this user" });
    }

    return res.status(200).json({ message: "Topups found", data: topups });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "An error occurred while fetching topups";
    res.status(statusCode).json({ message });
  }
};
