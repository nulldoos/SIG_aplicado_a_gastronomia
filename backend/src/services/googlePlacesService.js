
const GOOGLE_PLACES_URL =
    "https://places.googleapis.com/v1/places:searchText";

// Tipos de estabelecimentos que queremos encontrar
const PESQUISAS = [
    "restaurantes",
    "cafeterias e cafés",
    "pizzarias",
    "bares",
    "padarias e lanchonetes"
];

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

async function buscarEstabelecimentosGoogle() {
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

                estabelecimentos.set(item.id, {
                    id: `google-${item.id}`,
                    nome: item.displayName?.text || "Estabelecimento sem nome",
                    categoria: item.primaryType || item.types?.[0] || "outro",
                    endereco: item.formattedAddress || "",
                    latitude: item.location.latitude,
                    longitude: item.location.longitude,
                    fonte: "Google Places"
                });
            });

            pageToken = dados.nextPageToken || null;
            pagina++;

        } while (pageToken && pagina < 3);
    }

    const resultado = Array.from(estabelecimentos.values());

    console.log(
        "Total de estabelecimentos encontrados:",
        resultado.length
    );

    return resultado;
}

module.exports = { buscarEstabelecimentosGoogle };
