import { Request, Response } from "express";
import * as userService from "../services/user.js";

export const countUserHandler = async (req: Request, res: Response) => {
  try {
    const response = await userService.countUser();
    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getAllUserHandler = async (req: Request, res: Response) => {
  try {
    const { search, ...filter } = req.query;
    const response = await userService.getAllUser(search as string | undefined, filter as { [key: string]: string | undefined });
    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await userService.getUserById(id);
    return res.status(200).json({ data: response });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const updateUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = req.user;

    if (user.role === "ADMIN" || user.id === userId) {
      await userService.updateUserById(req.body, userId);
      return res.status(200).json({ message: "User updated successfully" });
    } else {
      return res.status(403).json({ message: "You are not authorized to update this user" });
    }
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const deleteUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userService.deleteUserById(id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const rejectUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    await userService.rejectUserById(id, message);
    return res.status(200).json({ message: "User rejected successfully" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const sendOtpHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    await userService.sendOtp(id);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const verifyOtpHandler = async (req: Request, res: Response) => {
  try {
    const id = req.user.id;
    const { otp } = req.body;
    await userService.verifyOtp(id, otp);
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};

export const getPhoneNumberAdminHandler = async (req: Request, res: Response) => {
  try {
    const response = await userService.getPhoneNumberAdmin();
    return res.status(200).json({
      data: response.no_hp,
    });
  } catch (error: any) {
    console.error("Error in getPhoneNumberAdminHandler:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      message: error.message || "Internal server error",
    });
  }
};

export const upgradeUserToPlatinumHandler = async (req: Request, res: Response) => {
  try {
    const filePath = req.body.bukti_pembayaran;

    await userService.upgradeUserToPlatinum(req.user.id, req.body.nominal, req.body, filePath);

    return res.status(201).json({ 
      message: "User upgrade request created, awaiting approval" 
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};


export const accUpgradeUserToPlatinumHandler = async (req: Request, res: Response) => {
  try {
    await userService.accUpgradeUserToPlatinum(req.body.id);
    return res.status(200).json({ message: "User upgrade request approved" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};
