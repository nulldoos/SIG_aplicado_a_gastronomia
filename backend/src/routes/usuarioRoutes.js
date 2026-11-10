const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");

const autenticarUsuario = require("../middlewares/autenticarUsuario");
const autorizarAdmin = require("../middlewares/autorizarAdmin");

// Cadastro e login (públicos)
router.post("/cadastro", usuarioController.cadastrarUsuario);
router.post("/login", usuarioController.loginUsuario);

// Listar usuários (ADMIN)
router.get(
    "/",
    autenticarUsuario,
    autorizarAdmin,
    usuarioController.listarUsuarios
);

// Buscar usuário por ID (ADMIN)
router.get(
    "/:id",
    autenticarUsuario,
    autorizarAdmin,
    usuarioController.buscarUsuario
);

// Ativar ou desativar usuário (ADMIN)
router.patch(
    "/:id/status",
    autenticarUsuario,
    autorizarAdmin,
    usuarioController.atualizarStatusUsuario
);

module.exports = router;