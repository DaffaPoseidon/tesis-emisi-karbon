import { Request, Response } from "express";
import * as walletService from "../services/wallet.js";

export const getWalletByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await walletService.getWalletById(id);
    if (!response) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getWalletSaldoByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await walletService.getWalletSaldoByUserId(id);
    if (!response) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};
export const getTotalWalletSaldoByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await walletService.getTotalWalletSaldoByUserId(id);
    if (!response || !response.saldo) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.status(200).json({
      message: "Total topup saldo found",
      total: response.saldo,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const createWalletHandler = async (req: Request, res: Response) => {
  try {
    const wallet = req.body;
    const response = await walletService.createWallet(wallet);
    return res.status(201).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const updateWalletByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const wallet = req.body;
    await walletService.updateWalletById(wallet, id);
    return res.status(200).json({ message: "Wallet updated" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const deleteWalletByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await walletService.deleteWalletById(id);
    return res.status(200).json({ message: "Wallet deleted" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};
