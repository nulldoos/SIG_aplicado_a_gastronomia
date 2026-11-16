
const express = require("express");
const router = express.Router();

const autenticarUsuario = require("../middlewares/autenticarUsuario");
const favoritoController = require("../controllers/favoritoController");

router.use(autenticarUsuario);

router.get("/", favoritoController.listarFavoritos);

router.post("/", favoritoController.adicionarFavorito);

router.delete("/:estabelecimentoId", favoritoController.removerFavorito);

router.get("/verificar/:estabelecimentoId", favoritoController.verificarFavorito);

router.delete("/google/:googlePlaceId", favoritoController.removerFavoritoGoogle);

router.get("/verificar/google/:googlePlaceId", favoritoController.verificarFavoritoGoogle);

module.exports = router;
