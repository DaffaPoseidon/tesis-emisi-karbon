import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import walletRouter from "./routes/wallet.js";
import topupRouter from "./routes/topup.js";
import swaggerUi from "swagger-ui-express";
import { validateApiKey } from "./middlewares/api-key.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.use(express.static(__dirname + "/../assets"));
app.use(validateApiKey);
app.use((req, res, next) => {
  console.log("Received x-api-key:", req.headers["x-api-key"]);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Wallet Service!");
});

app.use("/wallet", walletRouter);
app.use("/topup", topupRouter);

// Add this error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
