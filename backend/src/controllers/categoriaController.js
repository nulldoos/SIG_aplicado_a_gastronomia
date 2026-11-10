
const categoriaModel = require("../models/categoriaModel");

// listar categorias ativas
async function listarCategorias(req, res) {
    try {
        const categorias = await categoriaModel.listarAtivas();

        return res.status(200).json(categorias);

    } catch (erro) {
        console.error("Erro ao listar categorias:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar categorias."
        });
    }
}

// cadastrar categoria
async function cadastrarCategoria(req, res) {
    try {
        const { nome, descricao } = req.body || {};

        // validar nome
        if (typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({
                mensagem: "O nome da categoria é obrigatório."
            });
        }

        // validar descrição
        if (descricao != null && typeof descricao !== "string") {
            return res.status(400).json({
                mensagem: "A descrição deve ser um texto."
            });
        }

        const nomeFormatado = nome.trim();
        const descricaoFormatada = descricao?.trim() || null;

        // validar limites
        if (nomeFormatado.length > 100) {
            return res.status(400).json({
                mensagem: "O nome deve ter no máximo 100 caracteres."
            });
        }

        if (
            descricaoFormatada &&
            Buffer.byteLength(descricaoFormatada, "utf8") > 65535
        ) {
            return res.status(400).json({
                mensagem: "A descrição ultrapassa o limite permitido."
            });
        }

        const id = await categoriaModel.cadastrarCategoria({
            nome: nomeFormatado,
            descricao: descricaoFormatada
        });

        return res.status(201).json({
            mensagem: "Categoria cadastrada com sucesso.",
            id
        });

    } catch (erro) {
        console.error("Erro ao cadastrar categoria:", erro);

        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Essa categoria já existe."
            });
        }

        return res.status(500).json({
            mensagem: "Erro ao cadastrar categoria."
        });
    }
}

// atualizar categoria
async function atualizarCategoria(req, res) {
    try {
        const id = Number(req.params.id);
        const { nome, descricao } = req.body || {};

        // validar id
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        // validar nome
        if (typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({
                mensagem: "O nome da categoria é obrigatório."
            });
        }

        // validar descrição
        if (descricao != null && typeof descricao !== "string") {
            return res.status(400).json({
                mensagem: "A descrição deve ser um texto."
            });
        }

        const nomeFormatado = nome.trim();
        const descricaoFormatada = descricao?.trim() || null;

        // validar limites
        if (nomeFormatado.length > 100) {
            return res.status(400).json({
                mensagem: "O nome deve ter no máximo 100 caracteres."
            });
        }

        if (
            descricaoFormatada &&
            Buffer.byteLength(descricaoFormatada, "utf8") > 65535
        ) {
            return res.status(400).json({
                mensagem: "A descrição ultrapassa o limite permitido."
            });
        }

        const atualizado = await categoriaModel.atualizarCategoria(id, {
            nome: nomeFormatado,
            descricao: descricaoFormatada
        });

        if (!atualizado) {
            return res.status(404).json({
                mensagem: "Categoria não encontrada."
            });
        }

        return res.status(200).json({
            mensagem: "Categoria atualizada com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao atualizar categoria:", erro);

        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Já existe uma categoria com esse nome."
            });
        }

        return res.status(500).json({
            mensagem: "Erro ao atualizar categoria."
        });
    }
}

// desativar categoria
async function desativarCategoria(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const desativada = await categoriaModel.desativarCategoria(id);

        if (!desativada) {
            return res.status(404).json({
                mensagem: "Categoria não encontrada ou já desativada."
            });
        }

        return res.status(200).json({
            mensagem: "Categoria desativada com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao desativar categoria:", erro);

        return res.status(500).json({
            mensagem: "Erro ao desativar categoria."
        });
    }
}

module.exports = {
    listarCategorias,
    cadastrarCategoria,
    atualizarCategoria,
    desativarCategoria
};
