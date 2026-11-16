
const conexao = require("../config/database");

const GOOGLE_PLACES_URL =
    "https://places.googleapis.com/v1/places:searchText";

const PESQUISAS = [
    "restaurantes",
    "cafeterias e cafés",
    "pizzarias",
    "bares",
    "padarias e lanchonetes"
];

const MAX_PAGINAS = Math.max(
    1,
    Math.min(
        3,
        Number(process.env.GOOGLE_PLACES_MAX_PAGES) || 1
    )
);

// Converte os tipos do Google para as categorias do ComêMaps
function normalizarCategoriaGoogle(item) {
    const tipos = [
        item.primaryType,
        ...(item.types || [])
    ].filter(Boolean);

    const categorias = {
        barbecue_restaurant: "Restaurante",
        brazilian_restaurant: "Restaurante",
        family_restaurant: "Restaurante",
        buffet_restaurant: "Restaurante",
        restaurant: "Restaurante",

        cafe: "Cafeteria",
        coffee_shop: "Cafeteria",
        coffee_roastery: "Cafeteria",

        cocktail_bar: "Bar",
        bar: "Bar",
        night_club: "Bar",

        pizza_restaurant: "Pizzaria",
        pizza_delivery: "Pizzaria",

        hamburger_restaurant: "Hamburgueria",

        snack_bar: "Lanchonete",
        bakery: "Lanchonete",
        acai_shop: "Lanchonete",

        ice_cream_shop: "Sorveteria",

        japanese_restaurant: "Comida Japonesa",

        pastry_shop: "Doceria",
        cake_shop: "Doceria"
    };

    for (const tipo of tipos) {
        if (categorias[tipo]) {
            return categorias[tipo];
        }
    }

    return null;
}

async function buscarPaginaGoogle(textQuery, pageToken = null) {
    const corpo = {
        textQuery: `${textQuery} em Corumbá e Ladário, Mato Grosso do Sul, Brasil`,
        pageSize: 20,
        languageCode: "pt-BR",
        regionCode: "BR",
        locationRestriction: {
            rectangle: {
                low: {
                    latitude: -19.10,
                    longitude: -57.75
                },
                high: {
                    latitude: -18.90,
                    longitude: -57.50
                }
            }
        }
    };

    if (pageToken) {
        corpo.pageToken = pageToken;
    }

    const resposta = await fetch(GOOGLE_PLACES_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask": [
                "places.id",
                "places.displayName",
                "places.formattedAddress",
                "places.location",
                "places.types",
                "places.primaryType",
                "nextPageToken"
            ].join(",")
        },
        body: JSON.stringify(corpo)
    });

    if (!resposta.ok) {
        const erro = await resposta.text();

        console.error("Erro retornado pelo Google:", erro);

        throw new Error(
            `Erro na Google Places API: ${resposta.status}`
        );
    }

    return resposta.json();
}

// Consulta os estabelecimentos salvos no MySQL
async function buscarCacheMySQL() {
    const [resultados] = await conexao.execute(`
        SELECT
            place_id,
            nome,
            categoria,
            endereco,
            latitude,
            longitude,
            fonte
        FROM google_places_cache
    `);

    return resultados.map((item) => ({
        id: `google-${item.place_id}`,
        nome: item.nome,
        categoria: item.categoria || "Gastronomia",
        endereco: item.endereco || "",
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        fonte: item.fonte || "Google Places"
    }));
}

// Salva ou atualiza os estabelecimentos no MySQL
async function salvarCacheMySQL(estabelecimentos) {
    for (const item of estabelecimentos) {
        const placeId = item.id.replace(/^google-/, "");

        await conexao.execute(
            `
            INSERT INTO google_places_cache (
                place_id,
                nome,
                categoria,
                endereco,
                latitude,
                longitude,
                fonte
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                nome = VALUES(nome),
                categoria = VALUES(categoria),
                endereco = VALUES(endereco),
                latitude = VALUES(latitude),
                longitude = VALUES(longitude),
                fonte = VALUES(fonte),
                atualizado_em = CURRENT_TIMESTAMP
            `,
            [
                placeId,
                item.nome,
                item.categoria,
                item.endereco,
                item.latitude,
                item.longitude,
                item.fonte
            ]
        );
    }

    console.log(
        `${estabelecimentos.length} estabelecimentos salvos no MySQL.`
    );
}

// Verifica se já passaram 24 horas desde a última atualização
async function verificarIntervaloAtualizacao() {
    const [resultado] = await conexao.execute(`
        SELECT
            ultima_atualizacao,
            TIMESTAMPDIFF(
                SECOND,
                ultima_atualizacao,
                NOW()
            ) AS segundos_desde_atualizacao
        FROM google_places_controle
        WHERE id = 1
    `);

    if (resultado.length === 0) {
        throw new Error("Registro de controle não encontrado.");
    }

    const segundos = resultado[0].segundos_desde_atualizacao;

    if (segundos === null) {
        return;
    }

    const intervaloMinimo = 24 * 60 * 60;

    if (segundos < intervaloMinimo) {
        const segundosRestantes = intervaloMinimo - segundos;

        const horasRestantes = Math.ceil(
            segundosRestantes / 3600
        );

        const erro = new Error(
            `O cache já foi atualizado. Tente novamente em aproximadamente ${horasRestantes} hora(s).`
        );

        erro.statusCode = 429;

        throw erro;
    }
}

async function registrarAtualizacao() {
    await conexao.execute(`
        UPDATE google_places_controle
        SET ultima_atualizacao = NOW()
        WHERE id = 1
    `);
}

// Busca no Google Places
async function buscarNoGoogle() {
    const estabelecimentos = new Map();

    for (const pesquisa of PESQUISAS) {
        console.log(`Pesquisando no Google: ${pesquisa}`);

        let pageToken = null;
        let pagina = 0;

        do {
            const dados = await buscarPaginaGoogle(
                pesquisa,
                pageToken
            );

            const lugares = dados.places || [];

            console.log(
                `${pesquisa} - Página ${pagina + 1}:`,
                lugares.length,
                "resultados"
            );

            lugares.forEach((item) => {
                if (!item.id || !item.location) return;

                const categoria = normalizarCategoriaGoogle(item);

                // Ignora locais que não pertencem às categorias do projeto
                if (!categoria) return;

                estabelecimentos.set(item.id, {
                    id: `google-${item.id}`,
                    nome: item.displayName?.text || "Estabelecimento sem nome",
                    categoria,
                    endereco: item.formattedAddress || "",
                    latitude: item.location.latitude,
                    longitude: item.location.longitude,
                    fonte: "Google Places"
                });
            });

            pageToken = dados.nextPageToken || null;
            pagina++;

        } while (pageToken && pagina < MAX_PAGINAS);
    }

    return Array.from(estabelecimentos.values());
}

// Função principal
async function buscarEstabelecimentosGoogle() {
    console.log("Consultando cache no MySQL...");

    const cache = await buscarCacheMySQL();

    console.log(
        `Retornando ${cache.length} estabelecimentos do MySQL.`
    );

    return cache;
}

async function atualizarCacheGoogle() {
    console.log("Atualização manual do cache solicitada.");

    await verificarIntervaloAtualizacao();

    const estabelecimentos = await buscarNoGoogle();

    if (estabelecimentos.length > 0) {
        await salvarCacheMySQL(estabelecimentos);
    }

    await registrarAtualizacao();

    console.log(
        "Cache atualizado:",
        estabelecimentos.length,
        "estabelecimentos."
    );

    return estabelecimentos;
}

module.exports = {
    buscarEstabelecimentosGoogle,
    atualizarCacheGoogle
};
