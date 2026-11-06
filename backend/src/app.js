const express = require("express");
const cors = require("cors");


const estabelecimentoRoutes = require("./routes/estabelecimentoRoutes");

const app = express();

app.use(cors());    
app.use(express.json());

// rota principal
app.get("/", (req, res) => {
    res.json({ mensagem: "API funcionando!!" });
});

// rotas da app

app.use("/api/estabelecimentos", estabelecimentoRoutes);

module.exports = app;