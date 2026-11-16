function mapsUrl(local) {
  const query = local.latitude != null && local.longitude != null ? `${local.latitude},${local.longitude}` : `${local.name}, ${local.address}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export default function Favoritos({ favoritePlaces = [], onToggleFavorite, onBack }) {
  return (
    <section className="admin-page account-page favorites-page">
      <button className="back-button" type="button" onClick={onBack}>← Voltar para explorar</button>

      <header className="admin-header">
        <div>
          <p className="eyebrow">USUÁRIO</p>
          <h1>Meus favoritos</h1>
          <p>Veja os estabelecimentos que você salvou para conhecer depois.</p>
        </div>
        <span className="admin-badge">{favoritePlaces.length} salvos</span>
      </header>

      <section className="admin-content-panel favorites-panel">
        <div className="admin-panel-heading">
          <div><p className="eyebrow">SALVOS NA CONTA</p><h2>Estabelecimentos favoritos</h2></div>
          <span className="admin-count">API conectada</span>
        </div>

        {favoritePlaces.length > 0 ? <div className="all-places-list favorites-list">
          {favoritePlaces.map((local) => <article className="all-place-card favorite-place-card" key={`${local.fonte}-${local.id}`}>
            <span className={`place-thumb ${local.tone}`} aria-hidden="true">⌖</span>
            <span className="admin-place-info"><strong>{local.name}</strong><small>{local.category} · {local.address}</small><span>{local.description}</span></span>
            <button className="favorite-save-button saved" type="button" onClick={() => onToggleFavorite(local)} aria-label={`Remover ${local.name} dos favoritos`}>♥ <span>Salvo</span></button>
            <a className="all-place-go" href={mapsUrl(local)} target="_blank" rel="noreferrer">Ir ↗</a>
          </article>)}
        </div> : <div className="admin-empty-state favorites-empty"><h3>Nenhum favorito salvo ainda</h3><p>Use o coração nos estabelecimentos para montar sua lista de lugares.</p></div>}
      </section>
    </section>
  )
}
