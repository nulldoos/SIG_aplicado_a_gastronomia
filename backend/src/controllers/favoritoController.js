
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
        const { estabelecimento_id, google_place_id } = req.body;

        // Favorito do Google Places
        if (google_place_id) {
            if (typeof google_place_id !== "string" || !google_place_id.trim()) {
                return res.status(400).json({
                    mensagem: "ID do Google Places inválido."
                });
            }

            const existe = await favoritoModel.googlePlaceExiste(google_place_id);

            if (!existe) {
                return res.status(404).json({
                    mensagem: "Local do Google Places não encontrado."
                });
            }

            const jaFavoritado = await favoritoModel.verificar(
                usuarioId,
                null,
                google_place_id
            );

            if (jaFavoritado) {
                return res.status(409).json({
                    mensagem: "Este local já está nos seus favoritos."
                });
            }

            await favoritoModel.adicionar(usuarioId, null, google_place_id);

            return res.status(201).json({
                mensagem: "Local adicionado aos favoritos."
            });
        }

        // Favorito do ComêMaps
        const estabelecimentoId = Number(estabelecimento_id);

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
            estabelecimentoId,
            null
        );

        if (jaFavoritado) {
            return res.status(409).json({
                mensagem: "Este estabelecimento já está nos seus favoritos."
            });
        }

        await favoritoModel.adicionar(usuarioId, estabelecimentoId, null);

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

async function googlePlaceExiste(googlePlaceId) {
    const [resultado] = await conexao.query(
        `SELECT 1
         FROM google_places_cache
         WHERE place_id = ?
         LIMIT 1`,
        [googlePlaceId]
    );

    return resultado.length > 0;
}

async function removerFavoritoGoogle(req, res) {
    try {
        const usuarioId = req.usuario.id;
        const googlePlaceId = req.params.googlePlaceId;

        const removido = await favoritoModel.remover(
            usuarioId,
            null,
            googlePlaceId
        );

        if (!removido) {
            return res.status(404).json({
                mensagem: "Favorito não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Local removido dos favoritos."
        });

    } catch (erro) {
        console.error("Erro ao remover favorito do Google:", erro);

        return res.status(500).json({
            mensagem: "Erro ao remover favorito."
        });
    }
}

async function verificarFavoritoGoogle(req, res) {
    try {
        const usuarioId = req.usuario.id;
        const googlePlaceId = req.params.googlePlaceId;

        const favoritado = await favoritoModel.verificar(
            usuarioId,
            null,
            googlePlaceId
        );

        return res.status(200).json({ favoritado });

    } catch (erro) {
        console.error("Erro ao verificar favorito do Google:", erro);

        return res.status(500).json({
            mensagem: "Erro ao verificar favorito."
        });
    }
}

module.exports = {
    listarFavoritos,
    adicionarFavorito,
    removerFavorito,
    verificarFavorito,
    googlePlaceExiste,
    removerFavoritoGoogle,
    verificarFavoritoGoogle
};
