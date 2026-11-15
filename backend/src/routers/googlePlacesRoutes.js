
const express = require("express");
const router = express.Router();

const {
    buscarEstabelecimentosGoogle
} = require("../services/googlePlacesService");

router.get("/", async (req, res) => {
    try {
        const estabelecimentos =
            await buscarEstabelecimentosGoogle();

        return res.status(200).json(estabelecimentos);
    } catch (erro) {
        console.error(
            "Erro ao buscar estabelecimentos no Google Places:",
            erro
        );

        return res.status(500).json({
            mensagem: "Não foi possível buscar estabelecimentos no Google Places."
        });
    }
});

module.exports = router;
