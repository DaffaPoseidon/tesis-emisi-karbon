import { Request, Response } from "express";
import * as transactionService from "../services/transaction.js";

export async function getAllTransactionHandler(req: Request, res: Response) {
  try {
    const { search } = req.query;

    const transactions = await transactionService.getAllTransaction(search as string);

    if (!transactions.length) {
      return res.status(404).json({
        message: "No transactions found",
      });
    }

    return res.status(200).json({
      data: transactions,
    });
  } catch (error) {
    console.error("Error in getAllTransactionHandler:", error);
    return res.status(500).json({ message: "Failed to retrieve transactions" });
  }
}

export const getTransactionByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const transaction = await transactionService.getTransactionByUserId(req.user.id);

    if (!transaction.length) {
      return res.status(404).json({ message: "No transactions found for this user" });
    }

    return res.status(200).json({ data: transaction });
  } catch (error: any) {
    console.error("Error in getTransactionByUserIdHandler:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to retrieve transactions";
    return res.status(statusCode).json({ message });
  }
};

export const getTransactionByProjectIdHandler = async (req: Request, res: Response) => {
  try {
    const transaction = await transactionService.getTransactionByProjectId(req.params.id);

    if (!transaction.length) {
      return res.status(404).json({ message: "No transactions found for this project" });
    }

    return res.status(200).json({ data: transaction });
  } catch (error: any) {
    console.error("Error in getTransactionByProjectIdHandler:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to retrieve transactions";
    return res.status(statusCode).json({ message });
  }
};
