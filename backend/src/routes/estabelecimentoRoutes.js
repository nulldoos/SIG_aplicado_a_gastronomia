const express = require("express");
const router = express.Router();

const estabelecimentoController = require("../controllers/estabelecimentoController");

router.get("/", estabelecimentoController.listarEstabelecimentos);
router.post("/", estabelecimentoController.cadastrarEstabelecimento);
router.put("/:id", estabelecimentoController.atualizarEstabelecimento);
router.delete("/:id", estabelecimentoController.excluirEstabelecimento);

module.exports = router;