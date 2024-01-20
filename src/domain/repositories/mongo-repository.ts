// Cargamos variables de entorno
// Importamos librerías
import mongoose, { Mongoose, connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const DB_CONNECTION: string = process.env.DB_URL as string;
const DB_NAME: string = process.env.DB_NAME as string;

// Configuración de la conexión a Mongo
const config = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  dbName: DB_NAME,
};

export const mongoConnect = async (): Promise<Mongoose | null> => {
  try {
    const database: Mongoose = await connect(DB_CONNECTION, config);
    const { name, host } = database.connection;
    console.log(`Conectado a la base de datos ${name} en el host ${host}`);

    return database;
  } catch (error) {
    console.error(error);
    console.log("Error en la conexión, intentando conectar en 5s...");
    setTimeout(mongoConnect, 5000);

    return null;
  }
};

export const mongoDisconnect = async (): Promise<void> => {
  try {
    await mongoose.disconnect()
    console.log("Desconectado de la base de datos");
  } catch (error) {
    console.error(error);
    console.log("Error en la desconexión, intentando desconectar en 5s...");
    setTimeout(mongoDisconnect, 5000);
  }
}
