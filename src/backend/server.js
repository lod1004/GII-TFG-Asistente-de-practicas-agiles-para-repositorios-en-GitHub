const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const repoRoutes = require("./routes/repoRoutes");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

app.use("/api", repoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

process.on("uncaughtException", (err) => {
  console.error("Excepción no controlada:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Promesa no manejada:", err);
});