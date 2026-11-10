function MapIcon({ name, size = 18 }) {
  const shapes = {
    pin: <><path d="M20 10.2c0 5.1-8 10.8-8 10.8S4 15.3 4 10.2a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  }

  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>
}

export default function MapPlaceholder({ selectedPlace, places = [] }) {
  return (
    <div className="map-canvas" data-place-count={places.length} aria-label="Área reservada para integração com mapa">
      <div className="map-grid" />
      <div className="map-message">
        <div className="map-placeholder-icon"><MapIcon name="pin" size={25} /></div>
        <p className="eyebrow">PRÓXIMA ETAPA</p>
        <h3>Mapa da cidade</h3>
        <p>Esta área ficará conectada ao Google Maps ou a outra solução de mapas.</p>
        <button type="button">Ver integração planejada <MapIcon name="arrow" size={15} /></button>
      </div>
      {selectedPlace && <div className="map-detail"><div className={`detail-icon ${selectedPlace.tone}`}><MapIcon name="pin" size={20} /></div><div><strong>{selectedPlace.name}</strong><span>{selectedPlace.category} · {selectedPlace.distance}</span></div><button type="button" aria-label="Abrir detalhes"><MapIcon name="arrow" size={16} /></button></div>}
    </div>
  )
}
