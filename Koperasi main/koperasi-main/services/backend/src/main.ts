import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import projectCategoryRouter from "./routes/project-category.js";
import projectRouter from "./routes/project.js";
import wilayahRouter from "./routes/wilayah.js";
import projectReportRouter from "./routes/project-report.js";
import topupRouter from "./routes/topup.js";
import projectTokenRouter from "./routes/project-token.js";
import mutationRouter from "./routes/mutation.js";
import chartProjectRouter from "./routes/chart-project.js";
import chartTokenRouter from "./routes/chart-token.js";
import historyTokenRouter from "./routes/history-token.js";
import historyProjectRouter from "./routes/history-project.js";
import whatsappRouter from "./routes/baileys.js";
import projectWalletRouter from "./routes/project-wallet.js";
import historyProjectWalletRouter from "./routes/history-project-wallet.js";
import transactionRouter from "./routes/transaction.js";
import swaggerUi from "swagger-ui-express";
import { ethers } from "ethers";
import path from "path";
import fs from "fs";
import { configureAxiosInterceptor } from "./middlewares/api-key.js";

if (!process.env.API_URL) {
  throw new Error("Api Url is not defined in the environment variables.");
}
if (!process.env.PRIVATE_KEY) {
  throw new Error("Private key is not defined in the environment variables.");
}
if (!process.env.CONTRACT_ADDRESS) {
  throw new Error("Contract address is not defined in the environment variables.");
}
export const walletServiceUrl: string = process.env.WALLET_URL || "http://localhost:3001";
export const walletServiceApiKey: any = process.env.API_KEY;
const apiUrl: string = process.env.API_URL;
const privateKey: string = process.env.PRIVATE_KEY;
const contractAddress: string = process.env.CONTRACT_ADDRESS;

const abiPath = path.join(__dirname, "../contractABI.json");
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const provider = new ethers.JsonRpcProvider(apiUrl);

async function setupContract() {
  try {
    // Create a wallet instance from the private key
    const signer = new ethers.Wallet(privateKey, provider);
    console.log("\x1b[36m%s\x1b[0m", "Signer 👲 :", await signer.getAddress());

    // Create the contract instance with the signer
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("\x1b[36m%s\x1b[0m", "Contract instance 🚀");

    // Check if the contract instance is valid
    if (!contract || typeof contract !== "object") {
      throw new Error("Contract instance is not valid");
    }

    return contract;
  } catch (error) {
    console.error("Error in setupContract:", error);
    throw error;
  }
}

export const getContract = setupContract;

const app = express();
const port = process.env.PORT || 3000;

configureAxiosInterceptor(walletServiceUrl, walletServiceApiKey);

app.use(express.json());
app.use(cors());

app.use(express.static(__dirname + "/../assets"));

app.get("/formatan-dokumen-proyeksi", (req: Request, res: Response) => {
  const file = `statis/formatan-dokumen-proyeksi.docx`;
  res.json({ data: file });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Koperasi Service!");
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/project", projectRouter);
app.use("/project-category", projectCategoryRouter);
app.use("/project-report", projectReportRouter);
app.use("/wilayah", wilayahRouter);
app.use("/topup", topupRouter);
app.use("/token", projectTokenRouter);
app.use("/mutation", mutationRouter);
app.use("/chart-project", chartProjectRouter);
app.use("/chart-token", chartTokenRouter);
app.use("/history-token", historyTokenRouter);
app.use("/whatsapp", whatsappRouter);
app.use("/project-wallet", projectWalletRouter);
app.use("/history-project-wallet", historyProjectWalletRouter);
app.use("/history-project", historyProjectRouter);
app.use("/transaction", transactionRouter);

const swaggerDocument = require("../../../api-docs/swagger-output.json");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Add this error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
