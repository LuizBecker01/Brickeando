import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { productRoutes } from "./routes/product.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "API do Marketplace no ar 🚀" });
});

app.use("/api", productRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
