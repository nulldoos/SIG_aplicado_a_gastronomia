const express = require("express");
const router = express.Router();

const autenticarUsuario = require("../middlewares/autenticarUsuario");
const autorizarAdmin = require("../middlewares/autorizarAdmin");

const categoriaController = require("../controllers/categoriaController");

// listar categorias (público)
router.get("/", categoriaController.listarCategorias);

// cadastrar categoria (ADMIN)
router.post(
    "/",
    autenticarUsuario,
    autorizarAdmin,
    categoriaController.cadastrarCategoria
);

// editar categoria (ADMIN)
router.put(
    "/:id",
    autenticarUsuario,
    autorizarAdmin,
    categoriaController.atualizarCategoria
);

// desativar categoria (ADMIN)
router.patch(
    "/:id/desativar",
    autenticarUsuario,
    autorizarAdmin,
    categoriaController.desativarCategoria
);

module.exports = router;