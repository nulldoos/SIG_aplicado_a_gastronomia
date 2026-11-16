
const express = require("express");
const router = express.Router();
const autenticarUsuario = require("../middlewares/autenticarUsuario");
const autorizarAdmin = require("../middlewares/autorizarAdmin");

const {
    buscarEstabelecimentosGoogle,
    atualizarCacheGoogle
} = require("../services/googlePlacesService");

// Consulta normal: utiliza o cache do MySQL
router.get("/", async (req, res) => {
    try {
        const estabelecimentos =
            await buscarEstabelecimentosGoogle();

        return res.status(200).json(estabelecimentos);
    } catch (erro) {
        console.error(
            "Erro ao buscar estabelecimentos:",
            erro
        );

        return res.status(500).json({
            mensagem: "Não foi possível buscar estabelecimentos."
        });
    }
});

// Atualização manual do cache
router.post(
    "/atualizar",
    autenticarUsuario,
    autorizarAdmin,
    async (req, res) => {
        try {
            const estabelecimentos = await atualizarCacheGoogle();

            return res.status(200).json({
                mensagem: "Cache do Google Places atualizado com sucesso.",
                total: estabelecimentos.length,
                estabelecimentos
            });
        } catch (erro) {
            console.error("Erro ao atualizar cache do Google Places:", erro);

            return res.status(erro.statusCode || 500).json({
                mensagem: erro.message || "Não foi possível atualizar o cache do Google Places."
            });
        }
    }
);

module.exports = router;
