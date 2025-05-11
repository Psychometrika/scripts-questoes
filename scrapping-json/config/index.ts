import mongoose from "mongoose";
import { env } from "../env";

export async function connectToMongoDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Conectado ao MongoDB");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
  }
}
