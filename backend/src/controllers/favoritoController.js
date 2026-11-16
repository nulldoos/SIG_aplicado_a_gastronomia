
const favoritoModel = require("../models/favoritoModel");
const estabelecimentoModel = require("../models/estabelecimentoModel");

async function listarFavoritos(req, res) {
    try {
        const usuarioId = req.usuario.id;

        const favoritos = await favoritoModel.listarPorUsuario(usuarioId);

        return res.status(200).json(favoritos);

    } catch (erro) {
        console.error("Erro ao listar favoritos:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar favoritos."
        });
    }
}

async function adicionarFavorito(req, res) {
    try {
        const usuarioId = req.usuario.id;
        const estabelecimentoId = Number(req.body.estabelecimento_id);

        if (!Number.isInteger(estabelecimentoId) || estabelecimentoId <= 0) {
            return res.status(400).json({
                mensagem: "ID do estabelecimento inválido."
            });
        }

        const estabelecimento = await estabelecimentoModel.buscarEstabelecimentoPorId(
            estabelecimentoId
        );

        if (!estabelecimento || estabelecimento.status !== "APPROVED") {
            return res.status(404).json({
                mensagem: "Estabelecimento não encontrado."
            });
        }

        const jaFavoritado = await favoritoModel.verificar(
            usuarioId,
            estabelecimentoId
        );

        if (jaFavoritado) {
            return res.status(409).json({
                mensagem: "Este estabelecimento já está nos seus favoritos."
            });
        }

        await favoritoModel.adicionar(usuarioId, estabelecimentoId);

        return res.status(201).json({
            mensagem: "Estabelecimento adicionado aos favoritos."
        });

    } catch (erro) {
        console.error("Erro ao adicionar favorito:", erro);

        return res.status(500).json({
            mensagem: "Erro ao adicionar favorito."
        });
    }
}

async function removerFavorito(req, res) {
    try {
        const usuarioId = req.usuario.id;
        const estabelecimentoId = Number(req.params.estabelecimentoId);

        if (!Number.isInteger(estabelecimentoId) || estabelecimentoId <= 0) {
            return res.status(400).json({
                mensagem: "ID do estabelecimento inválido."
            });
        }

        const removido = await favoritoModel.remover(
            usuarioId,
            estabelecimentoId
        );

        if (!removido) {
            return res.status(404).json({
                mensagem: "Favorito não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Estabelecimento removido dos favoritos."
        });

    } catch (erro) {
        console.error("Erro ao remover favorito:", erro);

        return res.status(500).json({
            mensagem: "Erro ao remover favorito."
        });
    }
}

// verificacao 
async function verificarFavorito(req, res) {
    try {
        const usuarioId = req.usuario.id;
        const estabelecimentoId = Number(req.params.estabelecimentoId);

        if (!Number.isInteger(estabelecimentoId) || estabelecimentoId <= 0) {
            return res.status(400).json({
                mensagem: "ID do estabelecimento inválido."
            });
        }

        const favoritado = await favoritoModel.verificar(
            usuarioId,
            estabelecimentoId
        );

        return res.status(200).json({ favoritado });

    } catch (erro) {
        console.error("Erro ao verificar favorito:", erro);

        return res.status(500).json({
            mensagem: "Erro ao verificar favorito."
        });
    }
}

module.exports = {
    listarFavoritos,
    adicionarFavorito,
    removerFavorito,
    verificarFavorito
};
