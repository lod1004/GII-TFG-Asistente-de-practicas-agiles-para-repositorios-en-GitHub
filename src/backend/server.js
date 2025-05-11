const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const openurl = require("openurl");
const repoRoutes = require("./routes/repoRoutes");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err.message);
    process.exit(1);
  });


app.use("/api", repoRoutes);

const staticPath = path.join(process.cwd(), 'frontend/dist/frontend/browser');
app.use(express.static(staticPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'), (err) => {
    if (err) {
      console.error("Error al enviar index.html:", err.message);
      res.status(500).send("Error interno del servidor");
    }
  });
});

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "Ruta API no encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Error en el servidor:", err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  openurl.open(`http://localhost:${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Excepción no controlada:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Promesa no manejada:", err);
});
