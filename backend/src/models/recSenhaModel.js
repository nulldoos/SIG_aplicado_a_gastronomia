
const conexao = require("../config/database");

async function salvarToken(usuarioId, tokenHash, expiraEm) {
    await conexao.query(
        `INSERT INTO recuperacao_senhas
            (usuario_id, token_hash, expira_em)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
            token_hash = VALUES(token_hash),
            expira_em = VALUES(expira_em),
            criado_em = CURRENT_TIMESTAMP`,
        [usuarioId, tokenHash, expiraEm]
    );
}

async function buscarPorToken(tokenHash) {
    const [resultado] = await conexao.query(
        `SELECT id, usuario_id, token_hash, expira_em
         FROM recuperacao_senhas
         WHERE token_hash = ?
           AND expira_em > NOW()
         LIMIT 1`,
        [tokenHash]
    );

    return resultado[0] || null;
}

async function excluirPorUsuario(usuarioId) {
    const [resultado] = await conexao.query(
        `DELETE FROM recuperacao_senhas
         WHERE usuario_id = ?`,
        [usuarioId]
    );

    return resultado.affectedRows > 0;
}


async function redefinirSenhaComToken(tokenHash, senhaHash) {
    const conexaoTransacao = await conexao.getConnection();

    try {
        await conexaoTransacao.beginTransaction();

        // Buscar e bloquear o token durante a transação
        const [recuperacoes] = await conexaoTransacao.query(
            `SELECT id, usuario_id
             FROM recuperacao_senhas
             WHERE token_hash = ?
               AND expira_em > NOW()
             LIMIT 1
             FOR UPDATE`,
            [tokenHash]
        );

        if (recuperacoes.length === 0) {
            await conexaoTransacao.rollback();
            return false;
        }

        const recuperacao = recuperacoes[0];

        // Atualizar a senha
        const [resultado] = await conexaoTransacao.query(
            `UPDATE usuarios
             SET senha_hash = ?
             WHERE id = ?`,
            [senhaHash, recuperacao.usuario_id]
        );

        if (resultado.affectedRows === 0) {
            await conexaoTransacao.rollback();
            return false;
        }

        // Invalidar o token
        await conexaoTransacao.query(
            `DELETE FROM recuperacao_senhas
             WHERE id = ?`,
            [recuperacao.id]
        );

        await conexaoTransacao.commit();

        return true;

    } catch (erro) {
        await conexaoTransacao.rollback();
        throw erro;

    } finally {
        conexaoTransacao.release();
    }
}

module.exports = {
    salvarToken,
    buscarPorToken,
    excluirPorUsuario,
    redefinirSenhaComToken
};