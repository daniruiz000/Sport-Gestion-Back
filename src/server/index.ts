import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { configureRoutes } from "../routes/index";

dotenv.config();

const FRONT_END_URL: string = process.env.FRONT_END_URL as string;

// Configuración del server
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: FRONT_END_URL,
  })
);

configureRoutes(app);
