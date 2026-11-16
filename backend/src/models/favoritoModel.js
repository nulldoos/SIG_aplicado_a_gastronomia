
const conexao = require("../config/database");

async function adicionar(usuarioId, estabelecimentoId = null, googlePlaceId = null) {
    const [resultado] = await conexao.query(
        `INSERT INTO favoritos (usuario_id, estabelecimento_id, google_place_id)
         VALUES (?, ?, ?)`,
        [usuarioId, estabelecimentoId, googlePlaceId]
    );

    return resultado.affectedRows > 0;
}

async function remover(usuarioId, estabelecimentoId = null, googlePlaceId = null) {
    const [resultado] = await conexao.query(
        `DELETE FROM favoritos
         WHERE usuario_id = ?
           AND estabelecimento_id <=> ?
           AND google_place_id <=> ?`,
        [usuarioId, estabelecimentoId, googlePlaceId]
    );

    return resultado.affectedRows > 0;
}

async function listarPorUsuario(usuarioId) {
    const [favoritos] = await conexao.query(
        `SELECT
            f.estabelecimento_id,
            f.google_place_id,
            COALESCE(e.id, CONCAT('google-', g.place_id)) AS id,
            COALESCE(e.nome, g.nome) AS nome,
            COALESCE(e.endereco, g.endereco) AS endereco,
            COALESCE(e.latitude, g.latitude) AS latitude,
            COALESCE(e.longitude, g.longitude) AS longitude,
            COALESCE(g.categoria, 'Gastronomia') AS categoria,
            CASE
                WHEN f.google_place_id IS NOT NULL THEN 'Google Places'
                ELSE 'ComêMaps'
            END AS fonte,
            f.criado_em AS favoritado_em
         FROM favoritos f
         LEFT JOIN estabelecimentos e
            ON e.id = f.estabelecimento_id
         LEFT JOIN google_places_cache g
            ON g.place_id = f.google_place_id
         WHERE f.usuario_id = ?
           AND (
                f.google_place_id IS NOT NULL
                OR e.status = 'APPROVED'
           )
         ORDER BY f.criado_em DESC`,
        [usuarioId]
    );

    return favoritos;
}

async function verificar(usuarioId, estabelecimentoId = null, googlePlaceId = null) {
    const [resultado] = await conexao.query(
        `SELECT 1
         FROM favoritos
         WHERE usuario_id = ?
           AND estabelecimento_id <=> ?
           AND google_place_id <=> ?
         LIMIT 1`,
        [usuarioId, estabelecimentoId, googlePlaceId]
    );

    return resultado.length > 0;
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

module.exports = {
    adicionar,
    remover,
    listarPorUsuario,
    verificar,
    googlePlaceExiste
};
