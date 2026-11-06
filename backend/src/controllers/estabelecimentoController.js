const estabelecimentoModel = require("../models/estabelecimentoModel");

function listarEstabelecimentos(req, res) {
    try {
        const estabelecimentos = estabelecimentoModel.listarTodos();

        return res.status(200).json(estabelecimentos);

    } catch (erro) {
        return res.status(500).json({
            mensagem: "Erro ao consultar estabelecimentos."
        });
    }
}

function cadastrarEstabelecimento(req, res) {
    try {
        const {nome, descricao, categoria, endereco, latitude, longitude} = req.body;

        if(!nome || !categoria || !endereco || latitude===undefined || longitude === undefined){
            return res.status(400).json({
                mensagem: "falta preencher alguns campos obrigatorios"
            });
        }

        if( !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))){
            return res.status(400).json({
                mensagem: "latitude e longitude devem ser numeros"
            });
        }

        const novoEstabelecimento = estabelecimentoModel.cadastrar({
            nome,
            descricao: descricao || "",
            categoria,
            endereco,
            latitude: Number(latitude),
            longitude: Number(longitude)
        });

        return res.status(201).json({
            mensagem: "Estabelecimento cadastrado com suceso!!",
            estabelecimento: novoEstabelecimento
        });

    }catch ( erro) {
        return res.status(500).json({
            mensagem: "Erro ao cadastrar um estabelecimento "
        });
    }
}

function atualizarEstabelecimento(req, res) {
    try {
        const { id } = req.params;

        const { nome, descricao, categoria, endereco, latitude, longitude } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido tente novamente"
            });
        }

        if (!nome || !categoria || !endereco ||
            latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                mensagem: "Add nome, categoria, endereço, latitude e longitude"
            });
        }

        if (
            !Number.isFinite(Number(latitude)) ||
            !Number.isFinite(Number(longitude))
        ) {
            return res.status(400).json({
                mensagem: "Latitude e longitude devem ser números válidos"
            });
        }

        const estabelecimentoAtualizado = estabelecimentoModel.atualizar(id, {
            nome,
            descricao: descricao || "",
            categoria,
            endereco,
            latitude: Number(latitude),
            longitude: Number(longitude)
        });

        if (!estabelecimentoAtualizado) {
            return res.status(404).json({
                mensagem: "Estabelecimento não encontrado"
            });
        }

        return res.status(200).json({
            mensagem: "Estabelecimento atualizado com sucesso!",
            estabelecimento: estabelecimentoAtualizado
        });

    } catch (erro) {
        return res.status(500).json({
            mensagem: "Erro ao atualizar estabelecimento"
        });
    }
}

function excluirEstabelecimento(req, res) {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const excluido = estabelecimentoModel.excluir(id);

        if (!excluido) {
            return res.status(404).json({
                mensagem: "Estabelecimento não encontrado."
            });
        }

        return res.status(200).json({
            mensagem: "Estabelecimento excluído com sucesso!"
        });

    } catch (erro) {
        return res.status(500).json({
            mensagem: "Erro ao excluir estabelecimento."
        });
    }
}

module.exports = {
    listarEstabelecimentos,
    cadastrarEstabelecimento,
    atualizarEstabelecimento,
    excluirEstabelecimento
};
