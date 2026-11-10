const express = require("express");
const router = express.Router();

const autenticarUsuario = require("../middlewares/autenticarUsuario");
const autorizarAdmin = require("../middlewares/autorizarAdmin");
const estabelecimentoController = require("../controllers/estabelecimentoController");

// listagem geral de estabelecimentos (rota publica)
router.get("/", estabelecimentoController.listarEstabelecimentos);

// listagens de solicitacoes pendentes 
router.get(
    "/pendentes",
    autenticarUsuario,
    autorizarAdmin,
    estabelecimentoController.listarEstabelecimentosPendentes
);

// detalhes do estabelecimento
router.get("/:id", estabelecimentoController.buscarEstabelecimento);

// cadastrar estabelecimento
router.post(
    "/",
    autenticarUsuario,
    estabelecimentoController.cadastrarEstabelecimento
);

// aprovar estabelecimento
router.patch(
    "/:id/status",
    autenticarUsuario,
    autorizarAdmin,
    estabelecimentoController.atualizarStatusEstabelecimento
);

// editar estabelecimento 
router.put(
    "/:id",
    autenticarUsuario,
    autorizarAdmin,
    estabelecimentoController.atualizarEstabelecimento
);

// excluir estabelecimento 
router.delete(
    "/:id",
    autenticarUsuario,
    autorizarAdmin,
    estabelecimentoController.excluirEstabelecimento
);

module.exports = router;