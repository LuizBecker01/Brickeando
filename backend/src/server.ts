import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { configureSocket } from "./config/socket";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware";
import { productRoutes } from "./routes/product.routes";
import { userRoutes } from "./routes/user.routes";
import { chatRoutes } from "./routes/chat.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "API do marketplace funcionando. 🚀" });
});

app.use("/api", productRoutes);
app.use("/api", userRoutes);
app.use("/api", chatRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `Rota não encontrada: ${req.originalUrl}`,
  });
});

app.use(errorHandlerMiddleware);

const PORT = Number(process.env.PORT ?? 3333);
const server = configureSocket(app);

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
