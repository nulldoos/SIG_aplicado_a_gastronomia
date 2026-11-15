
const express = require("express");
const router = express.Router();

const limitarRecuperacao = require("../middlewares/limitarRecuperacao");
const recuperacaoSenhaController = require("../controllers/recSenhaController");

// Solicitar recuperação de senha
router.post(
    "/solicitar",
    limitarRecuperacao,
    recuperacaoSenhaController.solicitarRecuperacao
);

// Redefinir senha usando o token recebido por e-mail
router.post(
    "/redefinir",
    limitarRecuperacao,
    recuperacaoSenhaController.redefinirSenha
);

module.exports = router;
