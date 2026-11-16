const conexao = require("../config/database");

async function listarTodos() {
    const [estabelecimentos] = await conexao.query(`
        SELECT
            e.id,
            e.nome,
            e.descricao,
            e.endereco,
            e.telefone,
            e.latitude,
            e.longitude,
            e.status,
            GROUP_CONCAT(c.nome) AS categorias
        FROM estabelecimentos e
        LEFT JOIN estabelecimento_categorias ec
            ON e.id = ec.estabelecimento_id
        LEFT JOIN categorias c
            ON ec.categoria_id = c.id
        GROUP BY e.id
        ORDER BY e.id DESC
    `);

    return estabelecimentos;
}

async function cadastrarEstabelecimento(dados) {
    const conexaoTransacao = await conexao.getConnection();

    try {
        await conexaoTransacao.beginTransaction();

        const {
            nome,
            descricao,
            endereco,
            telefone,
            latitude,
            longitude,
            categoria_id,
            criado_por
        } = dados;

        const [resultado] = await conexaoTransacao.query(
            `INSERT INTO estabelecimentos
            (nome, descricao, endereco, telefone,
            latitude, longitude, criado_por)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nome,
                descricao || null,
                endereco,
                telefone || null,
                latitude,
                longitude,
                criado_por
            ]
        );

        const estabelecimentoId = resultado.insertId;

        await conexaoTransacao.query(
            `INSERT INTO estabelecimento_categorias
            (estabelecimento_id, categoria_id)
            VALUES (?, ?)`,
            [estabelecimentoId, categoria_id]
        );

        await conexaoTransacao.commit();

        return estabelecimentoId;

    } catch (erro) {
        await conexaoTransacao.rollback();
        throw erro;

    } finally {
        conexaoTransacao.release();
    }
}

async function atualizarEstabelecimento(id, dados) {
    const conexaoTransacao = await conexao.getConnection();

    try {
        await conexaoTransacao.beginTransaction();

        const {
            nome,
            descricao,
            endereco,
            telefone,
            latitude,
            longitude,
            categoria_id
        } = dados;

        const [estabelecimentos] = await conexaoTransacao.query(
            "SELECT id FROM estabelecimentos WHERE id = ?",
            [id]
        );

        if (estabelecimentos.length === 0) {
            await conexaoTransacao.rollback();
            return false;
        }

        await conexaoTransacao.query(
            `UPDATE estabelecimentos
             SET nome = ?,
                 descricao = ?,
                 endereco = ?,
                 telefone = ?,
                 latitude = ?,
                 longitude = ?,
                 status = 'PENDING'
             WHERE id = ?`,
            [
                nome,
                descricao || null,
                endereco,
                telefone || null,
                latitude,
                longitude,
                id
            ]
        );

        await conexaoTransacao.query(
            `DELETE FROM estabelecimento_categorias
             WHERE estabelecimento_id = ?`,
            [id]
        );

        await conexaoTransacao.query(
            `INSERT INTO estabelecimento_categorias
             (estabelecimento_id, categoria_id)
             VALUES (?, ?)`,
            [id, categoria_id]
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

async function excluirEstabelecimento(id) {
    const conexaoTransacao = await conexao.getConnection();

    try {
        await conexaoTransacao.beginTransaction();

        const [resultado] = await conexaoTransacao.query(
            "DELETE FROM estabelecimentos WHERE id = ?",
            [id]
        );

        await conexaoTransacao.commit();

        return resultado.affectedRows > 0;

    } catch (erro) {
        await conexaoTransacao.rollback();
        throw erro;

    } finally {
        conexaoTransacao.release();
    }
}

async function listarPendentes() {
    const [estabelecimentos] = await conexao.query(`
        SELECT
            e.*,
            u.nome AS usuario_responsavel
        FROM estabelecimentos e
        INNER JOIN usuarios u
            ON e.criado_por = u.id
        WHERE e.status = 'PENDING'
        ORDER BY e.criado_em DESC
    `);

    return estabelecimentos;
}

async function atualizarStatus(id, status, aprovadoPor) {
    const [resultado] = await conexao.query(
        `UPDATE estabelecimentos
         SET status = ?, aprovado_por = ?
         WHERE id = ? AND status = 'PENDING'`,
        [status, status === 'APPROVED' ? aprovadoPor : null, id]
    );

    return resultado.affectedRows > 0;
}
async function listarAprovados(categoriaId = null) {
    let filtroCategoria = "";
    const parametros = [];

    if (categoriaId) {
        filtroCategoria = `
            AND EXISTS (
                SELECT 1
                FROM estabelecimento_categorias ec2
                WHERE ec2.estabelecimento_id = e.id
                AND ec2.categoria_id = ?
            )
        `;

        parametros.push(categoriaId);
    }

    const [estabelecimentos] = await conexao.query(`
        SELECT
            e.*,
            GROUP_CONCAT(
                DISTINCT c.nome
                ORDER BY c.nome
                SEPARATOR ', '
            ) AS categorias
        FROM estabelecimentos e
        LEFT JOIN estabelecimento_categorias ec
            ON e.id = ec.estabelecimento_id
        LEFT JOIN categorias c
            ON ec.categoria_id = c.id
        WHERE e.status = 'APPROVED'
        ${filtroCategoria}
        GROUP BY e.id
        ORDER BY e.criado_em DESC
    `, parametros);

    return estabelecimentos;
}

async function buscarEstabelecimentoPorId(id) {
    const [estabelecimentos] = await conexao.query(`
        SELECT
            e.*,
            GROUP_CONCAT(
                DISTINCT c.nome
                ORDER BY c.nome
                SEPARATOR ', '
            ) AS categorias
        FROM estabelecimentos e
        LEFT JOIN estabelecimento_categorias ec
            ON e.id = ec.estabelecimento_id
        LEFT JOIN categorias c
            ON ec.categoria_id = c.id
        WHERE e.id = ?
        AND e.status = 'APPROVED'
        GROUP BY e.id
    `, [id]);

    return estabelecimentos[0] || null;
}

async function listarPorUsuario(usuarioId) {
    const [estabelecimentos] = await conexao.query(`
        SELECT
            e.*,
            GROUP_CONCAT(
                DISTINCT c.nome
                ORDER BY c.nome
                SEPARATOR ', '
            ) AS categorias
        FROM estabelecimentos e
        LEFT JOIN estabelecimento_categorias ec
            ON e.id = ec.estabelecimento_id
        LEFT JOIN categorias c
            ON ec.categoria_id = c.id
        WHERE e.criado_por = ?
        GROUP BY e.id
        ORDER BY e.criado_em DESC
    `, [usuarioId]);

    return estabelecimentos;
}

module.exports = {
    listarTodos,
    cadastrarEstabelecimento,
    atualizarEstabelecimento,
    excluirEstabelecimento,
    listarPendentes,
    atualizarStatus,
    listarAprovados,
    buscarEstabelecimentoPorId,
    listarPorUsuario
};