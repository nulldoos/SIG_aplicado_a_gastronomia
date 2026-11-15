import { useEffect, useMemo, useState } from 'react'
import { buscarEstabelecimentoPorId, listarCategorias, listarEstabelecimentos, verificarApi } from './api'
import MapPlaceholder from './components/MapPlaceholder'
import LoginUsuario from './pages/LoginUsuario'
import CadastroUsuario from './pages/CadastroUsuario'
import CadastroEstabelecimento from './pages/CadastroEstabelecimento'
import Aprovacao from './pages/Aprovacao'
import Solicitacoes from './pages/Solicitacoes'
import Usuarios from './pages/Usuarios'
import './App.css'
import './App.override.css'

const places = [
  { id: 1, name: 'Sabor da Vila', category: 'Brasileira', description: 'Comida caseira e receitas afetivas', address: 'Rua das Palmeiras, 248', distance: '450 m', rating: '4,8', reviews: 126, tone: 'coral', open: true },
  { id: 2, name: 'Café Aurora', category: 'Cafeteria', description: 'Café especial, bolos e brunch', address: 'Av. Central, 91', distance: '800 m', rating: '4,6', reviews: 89, tone: 'yellow', open: true },
  { id: 3, name: 'Brasa Urbana', category: 'Hambúrguer', description: 'Hambúrguer artesanal e cervejas', address: 'Rua do Mercado, 17', distance: '1,2 km', rating: '4,7', reviews: 204, tone: 'blue', open: false },
  { id: 4, name: 'Verde na Mesa', category: 'Saudável', description: 'Pratos leves, frescos e naturais', address: 'Alameda das Flores, 33', distance: '1,8 km', rating: '4,5', reviews: 67, tone: 'green', open: true },
]

const categories = ['Todos', 'Brasileira', 'Cafeteria', 'Hambúrguer', 'Saudável']

function normalizePlace(place, index = 0) {
  const category = place.categorias?.split(',')[0]?.trim() || place.categoria?.nome || place.category || 'Gastronomia'
  return {
    id: Number(place.id),
    name: place.nome || place.name || 'Estabelecimento sem nome',
    category,
    description: place.descricao || place.description || 'Lugar para conhecer na cidade',
    address: place.endereco || place.address || 'Endereço não informado',
    latitude: place.latitude != null ? Number(place.latitude) : null,
    longitude: place.longitude != null ? Number(place.longitude) : null,
    distance: place.distance || 'perto de você',
    rating: place.rating || '—',
    reviews: place.reviews || 0,
    tone: place.tone || ['coral', 'yellow', 'blue', 'green'][index % 4],
    open: place.open ?? true,
  }
}

function Icon({ name, size = 18 }) {
  const icons = {
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
    back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  }

  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>
}

function App() {
  const [activeNav, setActiveNav] = useState('explorar')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState('home')
  const [screenMessage, setScreenMessage] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(places[0])
  const [placesData, setPlacesData] = useState(places)
  const [basePlaces, setBasePlaces] = useState(places)
  const [categoryOptions, setCategoryOptions] = useState(categories)
  const [searchMessage, setSearchMessage] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all([listarEstabelecimentos(), listarCategorias()]).then(([estabelecimentos, categorias]) => {
      if (!mounted) return
      const normalizedPlaces = Array.isArray(estabelecimentos) ? estabelecimentos.map(normalizePlace) : []
      const normalizedCategories = Array.isArray(categorias) ? categorias.map((item) => item.nome).filter(Boolean) : []
      setPlacesData(normalizedPlaces)
      setBasePlaces(normalizedPlaces)
      setSelectedPlace(normalizedPlaces[0] || null)
      if (normalizedCategories.length > 0) setCategoryOptions(['Todos', ...normalizedCategories])
    }).catch(() => {
      if (mounted) setSearchMessage('')
    })
    return () => { mounted = false }
  }, [])

  async function handleSearch() {
    const id = query.trim()
    if (!id) {
      setPlacesData(basePlaces.length ? basePlaces : places)
      setSelectedPlace(basePlaces[0] || places[0])
      setSearchMessage('')
      return
    }
    if (!/^\d+$/.test(id)) {
      setPlacesData([])
      setSelectedPlace(null)
      setSearchMessage('Digite um ID numérico para pesquisar.')
      return
    }
    try {
      const result = normalizePlace(await buscarEstabelecimentoPorId(id))
      setPlacesData([result])
      setSelectedPlace(result)
      setSearchMessage('')
    } catch {
      const demoResult = places.find((place) => String(place.id) === id)
      setPlacesData(demoResult ? [demoResult] : [])
      setSelectedPlace(demoResult || null)
      setSearchMessage(demoResult ? 'Exemplo visual enquanto o banco não está conectado.' : 'Nenhum estabelecimento aprovado foi encontrado para esse ID.')
    }
  }

  function clearSearch() {
    setQuery('')
    setPlacesData(basePlaces.length ? basePlaces : places)
    setSelectedPlace(basePlaces[0] || places[0])
    setSearchMessage('')
  }

  const filteredPlaces = useMemo(() => placesData.filter((place) => {
    const matchesCategory = category === 'Todos' || place.category === category
    const matchesOpenStatus = !onlyOpen || place.open
    return matchesCategory && matchesOpenStatus
  }), [category, onlyOpen, placesData])

  function clearFilters() {
    setCategory('Todos')
    setOnlyOpen(false)
  }

  function openView(view) {
    setCurrentView(view)
    setScreenMessage('')
  }

  async function testApi() {
    setScreenMessage('Consultando a API...')
    try {
      const response = await verificarApi()
      setScreenMessage(response.mensagem || 'API funcionando corretamente.')
    } catch {
      setScreenMessage('A API não respondeu. Confira se o backend está rodando na porta 3001.')
    }
  }

  const plannedPages = {
    login: LoginUsuario,
    cadastroUsuario: CadastroUsuario,
    cadastroEstabelecimento: CadastroEstabelecimento,
    aprovacao: Aprovacao,
    solicitacoes: Solicitacoes,
    usuarios: Usuarios,
  }

  const PlannedPage = plannedPages[currentView]

  if (PlannedPage) {
    return <div className="app-shell"><main className="main-content"><PlannedPage onBack={() => openView('home')} onNavigate={openView} /></main></div>
  }

  if (currentView === 'places') {
    const isLoginView = currentView === 'login'
    return (
      <div className="app-shell">
        <main className="main-content auxiliary-view">
          <button className="back-button" type="button" onClick={() => openView('home')}><Icon name="back" size={17} /> Voltar</button>
          <section className="auxiliary-card">
            <p className="eyebrow">{isLoginView ? 'ACESSO' : 'EXPLORAÇÃO'}</p>
            <h1>{isLoginView ? 'Entrar no ComêMaps' : 'Locais aprovados'}</h1>
            <p>{isLoginView ? 'A tela de login será criada na próxima etapa.' : 'A listagem completa dos locais públicos será exibida aqui.'}</p>
            <button className="api-test-button" type="button" onClick={testApi}>Testar API</button>
            {screenMessage && <p className="api-feedback">{screenMessage}</p>}
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className={`app-shell ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <aside className="sidebar">
        <div>
          <div className="brand"><div className="brand-mark"><Icon name="pin" size={24} /></div><div><strong>Comê<span>Maps</span></strong><small>comida perto de você</small></div></div>
          <div className="sidebar-label">NAVEGAÇÃO</div>
          <nav className="nav-list" aria-label="Navegação principal">
            <button className={`nav-item ${activeNav === 'explorar' ? 'active' : ''}`} onClick={() => setActiveNav('explorar')} type="button"><Icon name="compass" /><span>Explorar</span></button>
            {isAuthenticated && <><button className={`nav-item ${activeNav === 'favoritos' ? 'active' : ''}`} onClick={() => setActiveNav('favoritos')} type="button"><Icon name="heart" /><span>Favoritos</span></button><button className={`nav-item ${activeNav === 'sugerir' ? 'active' : ''}`} onClick={() => setActiveNav('sugerir')} type="button"><Icon name="bookmark" /><span>Sugerir lugar</span></button></>}
          </nav>
        </div>
        <div className="sidebar-footer">
          {isAuthenticated ? <button className="profile-card" type="button"><span className="avatar">N</span><span><strong>Nayara</strong><small>Minha conta</small></span><Icon name="arrow" size={15} /></button> : <button className="login-card" type="button" onClick={() => openView('login')}><Icon name="user" size={17} /><span><strong>Entrar</strong><small>Acesse sua conta</small></span><Icon name="arrow" size={15} /></button>}
          {isAuthenticated && <button className="settings-link" type="button"><Icon name="settings" size={16} /> Configurações</button>}
        </div>
      </aside>

      <main className="main-content">
        <button className="sidebar-toggle" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? 'Recolher menu' : 'Abrir menu'} title={sidebarOpen ? 'Recolher menu' : 'Abrir menu'}><Icon name="menu" size={19} /></button>
        <header className="page-header"><div><p className="eyebrow">SUA CIDADE, SEU SABOR</p><h1>Encontre o próximo lugar<br /><em>que vai virar favorito.</em></h1></div>{isAuthenticated ? <button className="header-action" type="button"><Icon name="bookmark" size={17} /> Salvar busca</button> : <button className="header-action login-action" type="button" onClick={() => openView('login')}><Icon name="user" size={17} /> Entrar para salvar</button>}</header>

        <section className="search-card" aria-label="Busca pública de lugares">
          <div className="search-row"><div className="search-field"><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleSearch() }} placeholder="Pesquisar estabelecimento" aria-label="Pesquisar estabelecimento" />{query && <button className="clear-search" type="button" onClick={clearSearch}>Limpar</button>}</div><button className="search-submit" type="button" onClick={handleSearch}>Pesquisar</button><button className="filter-button" type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><Icon name="filter" size={17} /> Filtros</button></div>
          <div className="category-row"><span className="category-label">Explorar por:</span>{categoryOptions.map((item) => <button key={item} className={`category-chip ${category === item ? 'selected' : ''}`} onClick={() => setCategory(item)} type="button">{item}</button>)}</div>
          {filtersOpen && <div className="filter-panel"><label><input type="checkbox" checked={onlyOpen} onChange={(event) => setOnlyOpen(event.target.checked)} /> Apenas abertos agora</label><button type="button" onClick={clearFilters}>Limpar filtros</button></div>}
          {searchMessage && <p className="search-message">{searchMessage}</p>}
        </section>

        <section className="content-grid">
          <div className="results-column">
            <div className="section-heading"><div><p className="eyebrow">PERTO DE VOCÊ</p><h2>{filteredPlaces.length} lugares para conhecer</h2></div><button className="sort-button" type="button">Mais relevantes <span>⌄</span></button></div>
            <div className="place-list">{filteredPlaces.length > 0 ? filteredPlaces.map((place) => <button key={place.id} className={`place-card ${selectedPlace?.id === place.id ? 'selected' : ''}`} onClick={() => setSelectedPlace(place)} type="button"><span className={`place-thumb ${place.tone}`}><Icon name="pin" size={22} /></span><span className="place-info"><span className="place-topline"><strong>{place.name}</strong><span className={`status ${place.open ? 'open' : ''}`}>{place.open ? 'Aberto agora' : 'Fechado'}</span></span><span className="place-description">{place.description}</span><span className="place-meta"><span className="rating"><Icon name="star" size={13} /> {place.rating}</span><span>{place.reviews} avaliações</span><span>•</span><span>{place.distance}</span></span></span><Icon name="arrow" size={17} /></button>) : <div className="empty-state">Nenhum estabelecimento aprovado encontrado.</div>}</div>
            <button className="outline-button" type="button" onClick={() => openView('places')}>Ver todos os lugares <Icon name="arrow" size={16} /></button>
          </div>

          <div className="map-column">
            <div className="map-header"><div><p className="eyebrow">VISÃO GERAL</p><h2>Mapa da região</h2></div><button className="map-control" type="button"><Icon name="compass" size={16} /> Minha localização</button></div>
            <MapPlaceholder selectedPlace={selectedPlace} places={filteredPlaces} />
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
