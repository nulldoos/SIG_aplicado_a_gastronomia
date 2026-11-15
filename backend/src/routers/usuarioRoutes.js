const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController");

const autenticarUsuario = require("../middlewares/autenticarUsuario");
const autorizarAdmin = require("../middlewares/autorizarAdmin");

// cadastro e login (públicos)
router.post("/cadastro", usuarioController.cadastrarUsuario);
router.post("/login", usuarioController.loginUsuario);

// listar usuários 
router.get(
    "/",
    autenticarUsuario,
    autorizarAdmin,
    usuarioController.listarUsuarios
);

// buscar usuário por ID 
router.get(
    "/:id",
    autenticarUsuario,
    autorizarAdmin,
    usuarioController.buscarUsuario
);

// ativar ou desativar usuário 
router.patch(
    "/:id/status",
    autenticarUsuario,
    autorizarAdmin,
    usuarioController.atualizarStatusUsuario
);

// atualizar dados do usuário
router.put(
    "/:id",
    autenticarUsuario,
    usuarioController.atualizarUsuario
);

module.exports = router;