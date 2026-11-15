
const conexao = require("../config/database");

async function adicionar(usuarioId, estabelecimentoId) {
    const [resultado] = await conexao.query(
        `INSERT INTO favoritos (usuario_id, estabelecimento_id)
         VALUES (?, ?)`,
        [usuarioId, estabelecimentoId]
    );

    return resultado.affectedRows > 0;
}

async function remover(usuarioId, estabelecimentoId) {
    const [resultado] = await conexao.query(
        `DELETE FROM favoritos
         WHERE usuario_id = ? AND estabelecimento_id = ?`,
        [usuarioId, estabelecimentoId]
    );

    return resultado.affectedRows > 0;
}

async function listarPorUsuario(usuarioId) {
    const [favoritos] = await conexao.query(
        `SELECT
            e.id,
            e.nome,
            e.descricao,
            e.endereco,
            e.telefone,
            e.latitude,
            e.longitude,
            f.criado_em AS favoritado_em
         FROM favoritos f
         INNER JOIN estabelecimentos e
            ON e.id = f.estabelecimento_id
         WHERE f.usuario_id = ?
           AND e.status = 'APPROVED'
         ORDER BY f.criado_em DESC`,
        [usuarioId]
    );

    return favoritos;
}

// verficacao !!
async function verificar(usuarioId, estabelecimentoId) {
    const [resultado] = await conexao.query(
        `SELECT 1
         FROM favoritos
         WHERE usuario_id = ?
           AND estabelecimento_id = ?
         LIMIT 1`,
        [usuarioId, estabelecimentoId]
    );

    return resultado.length > 0;
}

module.exports = {
    adicionar,
    remover,
    listarPorUsuario,
    verificar
};
