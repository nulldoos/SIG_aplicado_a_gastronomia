const estabelecimentos = [
    {
        id: 1,
        nome: "Pizzaria Fiorella",
        descricao: "Pizzaria do ComêMaps",
        categoria: "Pizza",
        endereco: "Centro, Corumbá - MS",
        latitude: -19.0089,
        longitude: -57.6533
    },
    {
        id: 2,
        nome: "DI BURGUER LADARIO",
        descricao: "DiBurguer no ComêMaps",
        categoria: "Hambúrguer",
        endereco: "Centro, Ladário - MS",
        latitude: -19.0050,
        longitude: -57.6500
    }
];

function listarTodos() {
    return estabelecimentos;
}

function cadastrar(dados){
    const novoEstabelecimento = {
        id: estabelecimentos.length > 0 ? Math.max(...estabelecimentos.map(item => item.id)) + 1 : 1,
        ...dados
    };
    estabelecimentos.push(novoEstabelecimento);
    
    return novoEstabelecimento;
}

function atualizar(id, dados) {
    const indice = estabelecimentos.findIndex(
        item => item.id === Number(id)
    );

    if (indice === -1) {
        return null;
    }

    estabelecimentos[indice] = {
        ...estabelecimentos[indice],
        ...dados,
        id: Number(id)
    };

    return estabelecimentos[indice];
}

function excluir(id) {
    const indice = estabelecimentos.findIndex(
        item => item.id === Number(id)
    );

    if (indice === -1) {
        return false;
    }

    estabelecimentos.splice(indice, 1);

    return true;
}

module.exports = {
    listarTodos,
    cadastrar,
    atualizar,
    excluir
};