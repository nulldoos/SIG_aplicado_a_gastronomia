
const conexao = require("../config/database");

async function cadastrarUsuario(dados) {
    const { nome, email, senha_hash } = dados;

    const [resultado] = await conexao.query(
        `INSERT INTO usuarios (nome, email, senha_hash)
         VALUES (?, ?, ?)`,
        [nome, email, senha_hash]
    );

    return resultado.insertId;
}

async function buscarPorEmail(email) {
    const [usuarios] = await conexao.query(
        `SELECT
            id,
            nome,
            email,
            senha_hash,
            tipo,
            ativo
         FROM usuarios
         WHERE email = ?
         LIMIT 1`,
        [email]
    );

    return usuarios[0] || null;
}

async function listarTodos() {
    const [usuarios] = await conexao.query(`
        SELECT
            id,
            nome,
            email,
            tipo,
            ativo,
            criado_em
        FROM usuarios
        ORDER BY criado_em DESC
    `);

    return usuarios;
}

async function buscarPorId(id) {
    const [usuarios] = await conexao.query(
        `SELECT
            id,
            nome,
            email,
            tipo,
            ativo,
            criado_em
         FROM usuarios
         WHERE id = ?
         LIMIT 1`,
        [id]
    );

    return usuarios[0] || null;
}

async function atualizarAtivo(id, ativo) {
    const [resultado] = await conexao.query(
        `UPDATE usuarios
         SET ativo = ?
         WHERE id = ?`,
        [ativo, id]
    );

    return resultado.affectedRows > 0;
}

async function atualizarSenha(id, senhaHash) {
    const [resultado] = await conexao.query(
        `UPDATE usuarios
         SET senha_hash = ?
         WHERE id = ?`,
        [senhaHash, id]
    );

    return resultado.affectedRows > 0;
}

module.exports = {
    cadastrarUsuario,
    buscarPorEmail,
    listarTodos,
    buscarPorId,
    atualizarAtivo,
    atualizarSenha
};
