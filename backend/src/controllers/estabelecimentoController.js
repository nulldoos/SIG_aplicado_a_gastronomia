const estabelecimentoModel = require("../models/estabelecimentoModel");
const categoriaModel = require("../models/categoriaModel");

async function listarEstabelecimentos(req, res) {
    try {
        const { categoria_id } = req.query;

        let categoriaId = null;

        if (categoria_id !== undefined) {
            categoriaId = Number(categoria_id);

            if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
                return res.status(400).json({
                    mensagem: "ID da categoria inválido."
                });
            }
        }

        const estabelecimentos =
            await estabelecimentoModel.listarAprovados(categoriaId);

        return res.status(200).json(estabelecimentos);

    } catch (erro) {
        console.error("Erro ao listar estabelecimentos:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar estabelecimentos."
        });
    }
}

async function cadastrarEstabelecimento(req, res) {
    try {
        if (!req.usuario || !Number.isInteger(req.usuario.id)) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado."
            });
        }

        const {
            nome,
            descricao,
            endereco,
            telefone,
            latitude,
            longitude,
            categoria_id
        } = req.body;

        if (
            typeof nome !== "string" ||
            typeof endereco !== "string" ||
            !nome.trim() ||
            !endereco.trim()
        ) {
            return res.status(400).json({
                mensagem: "Nome e endereço são obrigatórios."
            });
        }

        if (
            (descricao != null && typeof descricao !== "string") ||
            (telefone != null && typeof telefone !== "string")
        ) {
            return res.status(400).json({
                mensagem: "Descrição ou telefone em formato inválido."
            });
        }

        const nomeFormatado = nome.trim();
        const enderecoFormatado = endereco.trim();
        const descricaoFormatada = descricao?.trim() || null;
        const telefoneFormatado = telefone?.trim() || null;

        if (nomeFormatado.length > 150) {
            return res.status(400).json({
                mensagem: "O nome deve ter no máximo 150 caracteres."
            });
        }

        if (enderecoFormatado.length > 255) {
            return res.status(400).json({
                mensagem: "O endereço deve ter no máximo 255 caracteres."
            });
        }

        if (descricaoFormatada && Buffer.byteLength(descricaoFormatada, "utf8") > 65535) {
            return res.status(400).json({
                mensagem: "A descrição ultrapassa o limite permitido."
            });
        }

        if (telefoneFormatado && telefoneFormatado.length > 30) {
            return res.status(400).json({
                mensagem: "O telefone deve ter no máximo 30 caracteres."
            });
        }


        const lat = Number(latitude);
        const lng = Number(longitude);
        const categoriaId = Number(categoria_id);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            !Number.isInteger(categoriaId) ||
            lat < -90 || lat > 90 ||
            lng < -180 || lng > 180
        ) {
            return res.status(400).json({
                mensagem: "Coordenadas ou categoria inválidas."
            });
        }

        // verifica se a categoria existe e está ativa
        const categorias = await categoriaModel.listarAtivas();

        const categoriaAtiva = categorias.some(
            (categoria) => Number(categoria.id) === categoriaId
        );

        if (!categoriaAtiva) {
            return res.status(400).json({
                mensagem: "Categoria inexistente ou inativa."
            });
        }

        const estabelecimentoId =
            await estabelecimentoModel.cadastrarEstabelecimento({
                nome: nomeFormatado,
                descricao: descricaoFormatada,
                endereco: enderecoFormatado,
                telefone: telefoneFormatado,
                latitude: lat,
                longitude: lng,
                categoria_id: categoriaId,
                criado_por: req.usuario.id
            });

        return res.status(201).json({
            mensagem: "Estabelecimento cadastrado com sucesso!",
            id: estabelecimentoId
        });

    } catch (erro) {
        console.error("Erro ao cadastrar estabelecimento:", erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar estabelecimento."
        });
    }
}


async function atualizarEstabelecimento(req, res) {
    try {
        const id = Number(req.params.id);

        const {
            nome,
            descricao,
            endereco,
            telefone,
            latitude,
            longitude,
            categoria_id
        } = req.body;

        // validar id e campos obrigatórios
        if (
            !Number.isInteger(id) ||
            id <= 0 ||
            typeof nome !== "string" ||
            typeof endereco !== "string" ||
            !nome.trim() ||
            !endereco.trim() ||
            latitude === undefined ||
            longitude === undefined ||
            categoria_id === undefined
        ) {
            return res.status(400).json({
                mensagem: "Preencha os campos obrigatórios."
            });
        }

        // validar tipos dos campos opcionais
        if (
            (descricao != null && typeof descricao !== "string") ||
            (telefone != null && typeof telefone !== "string")
        ) {
            return res.status(400).json({
                mensagem: "Descrição ou telefone em formato inválido."
            });
        }

        const nomeFormatado = nome.trim();
        const enderecoFormatado = endereco.trim();
        const descricaoFormatada = descricao?.trim() || null;
        const telefoneFormatado = telefone?.trim() || null;

        // validar limites dos campos
        if (nomeFormatado.length > 150) {
            return res.status(400).json({
                mensagem: "O nome deve ter no máximo 150 caracteres."
            });
        }

        if (enderecoFormatado.length > 255) {
            return res.status(400).json({
                mensagem: "O endereço deve ter no máximo 255 caracteres."
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

        if (telefoneFormatado && telefoneFormatado.length > 30) {
            return res.status(400).json({
                mensagem: "O telefone deve ter no máximo 30 caracteres."
            });
        }

        // validar coordenadas e categoria
        const lat = Number(latitude);
        const lng = Number(longitude);
        const categoriaId = Number(categoria_id);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            !Number.isInteger(categoriaId) ||
            categoriaId <= 0 ||
            lat < -90 || lat > 90 ||
            lng < -180 || lng > 180
        ) {
            return res.status(400).json({
                mensagem: "Coordenadas ou categoria inválidas."
            });
        }

        // verificar se a categoria existe e está ativa
        const categorias = await categoriaModel.listarAtivas();

        const categoriaAtiva = categorias.some(
            (categoria) => Number(categoria.id) === categoriaId
        );

        if (!categoriaAtiva) {
            return res.status(400).json({
                mensagem: "Categoria inexistente ou inativa."
            });
        }

        // atualizar estabelecimento
        const atualizado = await estabelecimentoModel.atualizarEstabelecimento(id, {
            nome: nomeFormatado,
            descricao: descricaoFormatada,
            endereco: enderecoFormatado,
            telefone: telefoneFormatado,
            latitude: lat,
            longitude: lng,
            categoria_id: categoriaId
        });

        if (!atualizado) {
            return res.status(404).json({
                mensagem: "Estabelecimento não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Estabelecimento atualizado com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao atualizar estabelecimento:", erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar estabelecimento."
        });
    }
}


async function excluirEstabelecimento(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const excluido = await estabelecimentoModel.excluirEstabelecimento(id);

        if (!excluido) {
            return res.status(404).json({
                mensagem: "Estabelecimento não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Estabelecimento excluído com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao excluir estabelecimento:", erro);

        return res.status(500).json({
            mensagem: "Erro ao excluir estabelecimento."
        });
    }
}

async function listarEstabelecimentosPendentes(req, res) {
    try {
        const estabelecimentos =
            await estabelecimentoModel.listarPendentes();

        return res.status(200).json(estabelecimentos);

    } catch (erro) {
        console.error("Erro ao listar pendentes:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar estabelecimentos pendentes."
        });
    }
}

async function atualizarStatusEstabelecimento(req, res) {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                mensagem: "Status inválido. Utilize APPROVED ou REJECTED."
            });
        }

        const atualizado = await estabelecimentoModel.atualizarStatus(
            id,
            status,
            req.usuario.id
        );

        if (!atualizado) {
            return res.status(404).json({
                mensagem: "Estabelecimento não encontrado ou já analisado."
            });
        }

        return res.status(200).json({
            mensagem: status === "APPROVED"
                ? "Estabelecimento aprovado com sucesso!"
                : "Estabelecimento rejeitado com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar status do estabelecimento."
        });
    }
}

async function buscarEstabelecimento(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID do estabelecimento inválido."
            });
        }

        const estabelecimento =
            await estabelecimentoModel.buscarEstabelecimentoPorId(id);

        if (!estabelecimento) {
            return res.status(404).json({
                mensagem: "Estabelecimento não encontrado."
            });
        }

        return res.status(200).json(estabelecimento);

    } catch (erro) {
        console.error("Erro ao buscar estabelecimento:", erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar estabelecimento."
        });
    }
}

module.exports = {
    listarEstabelecimentos,
    cadastrarEstabelecimento,
    atualizarEstabelecimento,
    excluirEstabelecimento,
    listarEstabelecimentosPendentes,
    atualizarStatusEstabelecimento,
    buscarEstabelecimento
};
