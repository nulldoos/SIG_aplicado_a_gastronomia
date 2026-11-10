
const conexao = require("../config/database");

async function listarAtivas() {
    const [categorias] = await conexao.query(`
        SELECT
            id,
            nome,
            descricao
        FROM categorias
        WHERE ativa = TRUE
        ORDER BY nome ASC
    `);

    return categorias;
}

async function cadastrarCategoria(dados) {
    const [resultado] = await conexao.query(
        `INSERT INTO categorias (nome, descricao)
         VALUES (?, ?)`,
        [
            dados.nome,
            dados.descricao ?? null
        ]
    );

    return resultado.insertId;
}

async function atualizarCategoria(id, dados) {
    const [resultado] = await conexao.query(
        `UPDATE categorias
         SET nome = ?, descricao = ?
         WHERE id = ?`,
        [
            dados.nome,
            dados.descricao ?? null,
            id
        ]
    );

    if (resultado.affectedRows > 0) {
        return true;
    }

    const [categorias] = await conexao.query(
        `SELECT id
         FROM categorias
         WHERE id = ?
         LIMIT 1`,
        [id]
    );

    return categorias.length > 0;
}

async function desativarCategoria(id) {
    const [resultado] = await conexao.query(
        `UPDATE categorias
         SET ativa = FALSE
         WHERE id = ? AND ativa = TRUE`,
        [id]
    );

    return resultado.affectedRows > 0;
}

module.exports = {
    listarAtivas,
    cadastrarCategoria,
    atualizarCategoria,
    desativarCategoria
};
