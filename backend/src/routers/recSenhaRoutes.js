
const express = require("express");
const router = express.Router();

const limitarRecuperacao = require("../middlewares/limitarRecuperacao");
const recuperacaoSenhaController = require("../controllers/recSenhaController");

router.post(
    "/solicitar",
    limitarRecuperacao,
    recuperacaoSenhaController.solicitarRecuperacao
);

router.post(
    "/redefinir",
    limitarRecuperacao,
    recuperacaoSenhaController.redefinirSenha
);

module.exports = router;
