import { useMemo, useState } from 'react'
import './App.css'

const places = [
  { id: 1, name: 'Sabor da Vila', category: 'Brasileira', description: 'Comida caseira e receitas afetivas', address: 'Rua das Palmeiras, 248', distance: '450 m', rating: '4,8', reviews: 126, tone: 'coral', open: true, position: { left: '60%', top: '37%' } },
  { id: 2, name: 'Café Aurora', category: 'Cafeteria', description: 'Café especial, bolos e brunch', address: 'Av. Central, 91', distance: '800 m', rating: '4,6', reviews: 89, tone: 'yellow', open: true, position: { left: '34%', top: '57%' } },
  { id: 3, name: 'Brasa Urbana', category: 'Hambúrguer', description: 'Hambúrguer artesanal e cervejas', address: 'Rua do Mercado, 17', distance: '1,2 km', rating: '4,7', reviews: 204, tone: 'blue', open: false, position: { left: '78%', top: '68%' } },
  { id: 4, name: 'Verde na Mesa', category: 'Saudável', description: 'Pratos leves, frescos e naturais', address: 'Alameda das Flores, 33', distance: '1,8 km', rating: '4,5', reviews: 67, tone: 'green', open: true, position: { left: '22%', top: '26%' } },
]

const categories = ['Todos', 'Brasileira', 'Cafeteria', 'Hambúrguer', 'Saudável']

function Icon({ name, size = 18 }) {
  const icons = {
    home: <><path d="m3 9 9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" /></>,
    heart: <path d="M20.8 8.9c0 5.5-8.8 10.2-8.8 10.2S3.2 14.4 3.2 8.9A4.3 4.3 0 0 1 12 6.6a4.3 4.3 0 0 1 8.8 2.3Z" />,
    bookmark: <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" />,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6.7v-2.4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    pin: <><path d="M20 10.2c0 5.1-8 10.8-8 10.8S4 15.3 4 10.2a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  }

  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}

function App() {
  const [activeNav, setActiveNav] = useState('explorar')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [selectedPlace, setSelectedPlace] = useState(places[0])

  const filteredPlaces = useMemo(() => {
    const search = query.toLowerCase().trim()
    return places.filter((place) => {
      const matchesCategory = category === 'Todos' || place.category === category
      const matchesSearch = !search || [place.name, place.category, place.description].some((value) => value.toLowerCase().includes(search))
      return matchesCategory && matchesSearch
    })
  }, [category, query])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand"><div className="brand-mark"><Icon name="pin" size={24} /></div><div><strong>Comê<span>Maps</span></strong><small>comida perto de você</small></div></div>
          <div className="sidebar-label">NAVEGAÇÃO</div>
          <nav className="nav-list" aria-label="Navegação principal">
            {[
              ['explorar', 'Explorar', 'compass'],
              ['favoritos', 'Favoritos', 'heart'],
              ['sugerir', 'Sugerir lugar', 'bookmark'],
            ].map(([id, label, icon]) => <button key={id} className={`nav-item ${activeNav === id ? 'active' : ''}`} onClick={() => setActiveNav(id)} type="button"><Icon name={icon} /><span>{label}</span></button>)}
          </nav>
        </div>
        <div className="sidebar-footer">
          <button className="profile-card" type="button"><span className="avatar">N</span><span><strong>Nayara</strong><small>Minha conta</small></span><Icon name="arrow" size={15} /></button>
          <button className="settings-link" type="button"><Icon name="settings" size={16} /> Configurações</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header"><div><p className="eyebrow">SUA CIDADE, SEU SABOR</p><h1>Encontre o próximo lugar<br /><em>que vai virar favorito.</em></h1></div><button className="header-action" type="button"><Icon name="bookmark" size={17} /> Salvar busca</button></header>

        <section className="search-card" aria-label="Busca de lugares">
          <div className="search-row"><div className="search-field"><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por nome, categoria ou tipo de comida" aria-label="Buscar lugares" />{query && <button className="clear-search" type="button" onClick={() => setQuery('')}>Limpar</button>}</div><button className="filter-button" type="button"><Icon name="filter" size={17} /> Filtros</button></div>
          <div className="category-row"><span className="category-label">Explorar por:</span>{categories.map((item) => <button key={item} className={`category-chip ${category === item ? 'selected' : ''}`} onClick={() => setCategory(item)} type="button">{item}</button>)}</div>
        </section>

        <section className="content-grid">
          <div className="results-column">
            <div className="section-heading"><div><p className="eyebrow">PERTO DE VOCÊ</p><h2>{filteredPlaces.length} lugares para conhecer</h2></div><button className="sort-button" type="button">Mais relevantes <span>⌄</span></button></div>
            <div className="place-list">
              {filteredPlaces.length > 0 ? filteredPlaces.map((place) => <button key={place.id} className={`place-card ${selectedPlace.id === place.id ? 'selected' : ''}`} onClick={() => setSelectedPlace(place)} type="button"><span className={`place-thumb ${place.tone}`}><Icon name="pin" size={22} /></span><span className="place-info"><span className="place-topline"><strong>{place.name}</strong><span className={`status ${place.open ? 'open' : ''}`}>{place.open ? 'Aberto agora' : 'Fechado'}</span></span><span className="place-description">{place.description}</span><span className="place-meta"><span className="rating"><Icon name="star" size={13} /> {place.rating}</span><span>{place.reviews} avaliações</span><span>•</span><span>{place.distance}</span></span></span><Icon name="arrow" size={17} /></button>) : <div className="empty-state">Nenhum lugar encontrado. Tente outra busca.</div>}
            </div>
            <button className="outline-button" type="button">Ver todos os lugares <Icon name="arrow" size={16} /></button>
          </div>

          <div className="map-column">
            <div className="map-header"><div><p className="eyebrow">VISÃO GERAL</p><h2>Mapa da região</h2></div><button className="map-control" type="button"><Icon name="compass" size={16} /> Minha localização</button></div>
            <div className="map-canvas" aria-label="Área reservada para integração com mapa">
              <div className="map-grid" />
              <div className="map-message"><div className="map-placeholder-icon"><Icon name="pin" size={25} /></div><p className="eyebrow">PRÓXIMA ETAPA</p><h3>Mapa da cidade</h3><p>Esta área ficará conectada ao Google Maps ou a outra solução de mapas.</p><button type="button">Ver integração planejada <Icon name="arrow" size={15} /></button></div>
              <div className="map-detail"><div className={`detail-icon ${selectedPlace.tone}`}><Icon name="pin" size={20} /></div><div><strong>{selectedPlace.name}</strong><span>{selectedPlace.category} · {selectedPlace.distance}</span></div><button type="button" aria-label="Abrir detalhes"><Icon name="arrow" size={16} /></button></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
