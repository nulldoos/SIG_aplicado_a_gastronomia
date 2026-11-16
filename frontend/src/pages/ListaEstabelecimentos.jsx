import { useEffect, useState } from "react";
import { listarEstabelecimentos, listarEstabelecimentosGoogle } from "../api";

function normalizePlace(place, index) {
  return {
    id: place.id,
    nome: place.nome || place.name || "Estabelecimento sem nome",
    categoria:
      place.categoria?.nome ||
      place.categoria ||
      place.category ||
      place.categorias?.split(",")[0]?.trim() ||
      "Gastronomia",
    descricao:
      place.descricao || place.description || "Lugar para conhecer na cidade.",
    endereco: place.endereco || place.address || "Endereço não informado",
    latitude: place.latitude ?? null,
    longitude: place.longitude ?? null,
    tone: ["coral", "yellow", "blue", "green"][index % 4],
  };
}

function mapsUrl(local) {
  const query =
    local.latitude != null && local.longitude != null
      ? `${local.latitude},${local.longitude}`
      : `${local.nome}, ${local.endereco}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function ListaEstabelecimentos({
  onBack,
  isAuthenticated,
  isFavorite,
  onToggleFavorite,
}) {
  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function carregarEstabelecimentos() {
      try {
        const [estabelecimentos, estabelecimentosGoogle] = await Promise.all([
          listarEstabelecimentos(),
          listarEstabelecimentosGoogle(),
        ]);

        if (!mounted) return;

        const locaisCom = Array.isArray(estabelecimentos)
          ? estabelecimentos.map((place, index) => normalizePlace(place, index))
          : [];

        const locaisGoogle = Array.isArray(estabelecimentosGoogle)
          ? estabelecimentosGoogle.map((place, index) =>
              normalizePlace(
                {
                  ...place,
                  descricao: "Estabelecimento encontrado pelo Google Places",
                },
                index,
              ),
            )
          : [];

        setLocais([
          ...locaisCom.map((local) => ({
            ...local,
            fonte: "ComêMaps",
          })),
          ...locaisGoogle.map((local) => ({
            ...local,
            fonte: "Google Places",
          })),
        ]);
      } catch (error) {
        console.error("Erro ao carregar estabelecimentos:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    carregarEstabelecimentos();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="admin-page all-places-page">
      <button className="back-button" type="button" onClick={onBack}>
        ← Voltar para explorar
      </button>

      <header className="admin-header">
        <div>
          <p className="eyebrow">EXPLORAÇÃO</p>
          <h1>Estabelecimentos de Corumbá - MS</h1>
          <p>
            Veja os estabelecimentos aprovados disponíveis para conhecer em
            Corumbá.
          </p>
        </div>
        <span className="admin-badge">{locais.length} locais</span>
      </header>

      <section className="admin-content-panel">
        <div className="admin-panel-heading">
          <div>
            <p className="eyebrow">LOCAIS APROVADOS</p>
            <h2>Estabelecimentos disponíveis em Corumbá - MS</h2>
          </div>
          <span className="admin-count">
            {loading ? "Carregando..." : "API conectada"}
          </span>
        </div>
        <div className="all-places-list">
          {locais.map((local) => (
            <article className="all-place-card" key={local.id}>
              <span className={`place-thumb ${local.tone}`} aria-hidden="true">
                ⌖
              </span>
              <span className="admin-place-info">
                <strong>{local.nome}</strong>
                <small>
                  {local.categoria} · {local.endereco}
                </small>
                <span>{local.descricao}</span>
              </span>
              {isAuthenticated && local.fonte === 'ComêMaps' && (
                <button
                  className={`favorite-save-button ${isFavorite?.(local.id) ? 'saved' : ''}`}
                  type="button"
                  onClick={() => onToggleFavorite?.(local)}
                >
                  {isFavorite?.(local.id) ? '♥' : '♡'}
                  <span>{isFavorite?.(local.id) ? 'Salvo' : 'Salvar'}</span>
                </button>
              )}
              <a
                className="all-place-go"
                href={mapsUrl(local)}
                target="_blank"
                rel="noreferrer"
              >
                Ir ↗
              </a>
            </article>
          ))}
        </div>
        {!loading && locais.length === 0 && (
          <div className="empty-state">
            Nenhum estabelecimento aprovado encontrado.
          </div>
        )}
        <p className="admin-local-note">
          Locais pendentes continuam disponíveis apenas na área administrativa
          até serem aprovados.
        </p>
      </section>
    </section>
  );
}
