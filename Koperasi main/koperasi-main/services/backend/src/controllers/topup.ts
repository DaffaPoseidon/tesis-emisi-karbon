import {
  accSimpananWajib,
  accTopup,
  accWithdrawSaldo,
  getAllTopUp,
  getWithdrawSaldo,
  payMember,
  paySimpananWajib,
  payTopup,
  withdrawSaldo,
  getTopupById,
  getBagianPemilikPelaksana,
  payBagianPemilikPelaksana,
  getTotalWalletSimpananPokokByUserId,
  getTotalWalletSimpananWajibByUserId,
  getKasKoperasi,
  formatGetTopupByUserId,
  formatGetAllTopup,
} from "../services/topup.js";
import { Request, Response } from "express";
import axios from "axios";
import { walletServiceUrl } from "../main.js";
import { getWalletSaldoByUserId, updateWalletById } from "../services/wallet.js";

export const getAllTopupHandler = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const topups = await formatGetAllTopup(search as string | undefined);
    return res.status(200).json({ message: "Topups found", data: topups });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to retrieve topups";
    res.status(statusCode).json({ message });
  }
};

export const getTopupByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topup = await getTopupById(id);
    return res.status(200).json({ message: "Topup found", data: topup });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to retrieve topup";
    res.status(statusCode).json({ message });
  }
};

export const getTopupByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const data = await formatGetTopupByUserId(userId);

    return res.status(200).json({
      message: "Topups found",
      data,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "An error occurred while fetching topups";
    return res.status(statusCode).json({ message });
  }
};

export const getTotalWalletSimpananPokokByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const total = await getTotalWalletSimpananPokokByUserId(userId);

    if (total === 0) {
      return res.status(404).json({ message: "No Wallet simpanan pokok found for the user" });
    }
    return res.status(200).json({ message: "Total wallet simpanan pokok found", total });
  } catch (error: any) {
    console.error("Error calculating total Wallet simpanan pokok:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "An error occurred while calculating total simpanan pokok";
    res.status(statusCode).json({ message });
  }
};

export const getTotalWalletSimpananWajibByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const total = await getTotalWalletSimpananWajibByUserId(userId);

    if (total === 0) {
      return res.status(404).json({ message: "No Wallet simpanan wajib found for the user" });
    }

    return res.status(200).json({ message: "Total Wallet simpanan wajib found", total });
  } catch (error: any) {
    console.error("Error calculating total Wallet simpanan wajib:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "An error occurred while calculating total simpanan wajib";
    res.status(statusCode).json({ message });
  }
};

export const getTotalWalletSaldoByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${walletServiceUrl}/wallet/total/${req.user.id}`);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error calculating total Wallet saldo:", error);

    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Wallet saldo not found" });
    }

    const statusCode = error.response?.status || 500;
    const message = error.message || "An error occurred while calculating total Wallet saldo";
    return res.status(statusCode).json({ message });
  }
};

export const getWalletSaldoByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const response = await getWalletSaldoByUserId(req.params.id);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error get Wallet saldo:", error);

    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Wallet saldo not found" });
    }

    const statusCode = error.response?.status || 500;
    const message = error.message || "An error occurred while calculating Wallet saldo";
    return res.status(statusCode).json({ message });
  }
};

export const getKasKoperasiHandler = async (req: Request, res: Response) => {
  try {
    const total = await getKasKoperasi();
    if (total === 0) {
      return res.status(404).json({ message: "No Wallet saldo found for the user" });
    }

    return res.status(200).json({ message: "Kas Koperasi found", total });
  } catch (error: any) {
    console.error("Error calculating total Wallet saldo:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "An error occurred while calculating total Wallet saldo";
    res.status(statusCode).json({ message });
  }
};

export const getWithdrawSaldoHandler = async (req: Request, res: Response) => {
  try {
    const topup = await getWithdrawSaldo();
    return res.status(200).json({ message: "Withdraws found", data: topup });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to retrieve withdraws";
    res.status(statusCode).json({ message });
  }
};

export const payMemberHandler = async (req: Request, res: Response) => {
  try {
    await payMember(req.user.id, req.body);
    return res.status(201).json({ message: "Topup created, awaiting payment confirmation" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to create topup";
    res.status(statusCode).json({ message });
  }
};

export const payTopupHandler = async (req: Request, res: Response) => {
  try {
    await payTopup(req.user.id, req.body);
    return res.status(201).json({ message: "Topup created, awaiting payment confirmation" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to create topup";
    res.status(statusCode).json({ message });
  }
};

export const accTopupHandler = async (req: Request, res: Response) => {
  try {
    await accTopup(req.body.id);
    return res.status(200).json({ message: "Topup has been approved" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to approve topup";
    res.status(statusCode).json({ message });
  }
};

export const withdrawSaldoHandler = async (req: Request, res: Response) => {
  try {
    await withdrawSaldo(req.user.id, req.body);
    return res.status(201).json({ message: "Withdraw request created, awaiting approval" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to create withdraw request";
    res.status(statusCode).json({ message });
  }
};

export const accWithdrawSaldoHandler = async (req: Request, res: Response) => {
  try {
    await accWithdrawSaldo(req.body.id, req.body);
    return res.status(200).json({ message: "Withdraw request has been approved" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to approve withdraw request";
    res.status(statusCode).json({ message });
  }
};

export const paySimpananWajibHandler = async (req: Request, res: Response) => {
  try {
    await paySimpananWajib(req.user.id, req.body);
    return res.status(201).json({ message: "Simpanan Wajib created, awaiting payment confirmation" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to create simpanan wajib";
    res.status(statusCode).json({ message });
  }
};

export const accSimpananWajibHandler = async (req: Request, res: Response) => {
  try {
    await accSimpananWajib(req.body.id);
    return res.status(200).json({ message: "Simpanan Wajib has been approved" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to approve simpanan wajib";
    res.status(statusCode).json({ message });
  }
};

export const getBagianPemilikPelaksanaHandler = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const topup = await getBagianPemilikPelaksana(search as string | undefined);
    return res.status(200).json({ message: "Topups found", data: topup });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to retrieve topups";
    res.status(statusCode).json({ message });
  }
};

export const payBagianPemilikPelaksanaHandler = async (req: Request, res: Response) => {
  try {
    await payBagianPemilikPelaksana(req.body);
    return res.status(201).json({ message: "Pembayaran pemilik / pelaksana telah dikonfirmasi" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to confirm payment";
    res.status(statusCode).json({ message });
  }
};
export const updateWalletByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const wallet = req.body;
    await updateWalletById(wallet, id);
    return res.status(200).json({ message: "Wallet updated" });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(statusCode).json({ message });
  }
};