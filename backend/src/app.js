
const express = require("express");
const cors = require("cors");

const estabelecimentoRoutes = require("./routes/estabelecimentoRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");

const app = express();

// config do CORS
const origensPermitidas = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map(origem => origem.trim())
    : true;

app.use(cors({
    origin: origensPermitidas
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensagem: "API do ComêMaps funcionando!"
    });
});

app.use("/api/estabelecimentos", estabelecimentoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/categorias", categoriaRoutes);

app.use((req, res) => {
    res.status(404).json({
        mensagem: "Rota não encontrada."
    });
});

app.use((erro, req, res, next) => {
    console.error("Erro na API:", erro);

    if (res.headersSent) {
        return next(erro);
    }

    res.status(500).json({
        mensagem: "Erro interno no servidor."
    });
});

module.exports = app;
