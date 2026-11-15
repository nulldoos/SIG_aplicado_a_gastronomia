import { useEffect, useState } from 'react'
import { listarEstabelecimentos } from '../api'
import { listarEstabelecimentosMock } from '../mockAuth'

function normalizePlace(place, index) {
  return {
    id: place.id,
    nome: place.nome || place.name || 'Estabelecimento sem nome',
    categoria: place.categoria?.nome || place.categoria || place.category || 'Gastronomia',
    descricao: place.descricao || place.description || 'Lugar para conhecer na cidade.',
    endereco: place.endereco || place.address || 'Endereço não informado',
    tone: ['coral', 'yellow', 'blue', 'green'][index % 4],
  }
}

export default function ListaEstabelecimentos({ onBack }) {
  const [locais, setLocais] = useState(() => listarEstabelecimentosMock().filter((local) => local.status === 'APROVADO').map(normalizePlace))
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(true)

  useEffect(() => {
    let mounted = true
    listarEstabelecimentos().then((estabelecimentos) => {
      if (!mounted || !Array.isArray(estabelecimentos) || estabelecimentos.length === 0) return
      setLocais(estabelecimentos.map(normalizePlace))
      setUsingMock(false)
    }).catch(() => {}).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  return (
    <section className="admin-page all-places-page">
      <button className="back-button" type="button" onClick={onBack}>← Voltar para explorar</button>

      <header className="admin-header">
        <div>
          <p className="eyebrow">EXPLORAÇÃO</p>
          <h1>Todos os locais</h1>
          <p>Veja os estabelecimentos aprovados disponíveis para conhecer na cidade.</p>
        </div>
        <span className="admin-badge">{locais.length} locais</span>
      </header>

      <section className="admin-content-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">LOCAIS APROVADOS</p><h2>Estabelecimentos disponíveis</h2></div><span className="admin-count">{loading ? 'Carregando...' : usingMock ? 'Modo demonstração' : 'API conectada'}</span></div>
        <div className="all-places-list">
          {locais.map((local) => <article className="all-place-card" key={local.id}><span className={`place-thumb ${local.tone}`} aria-hidden="true">⌖</span><span className="admin-place-info"><strong>{local.nome}</strong><small>{local.categoria} · {local.endereco}</small><span>{local.descricao}</span></span></article>)}
        </div>
        {!loading && locais.length === 0 && <div className="empty-state">Nenhum estabelecimento aprovado encontrado.</div>}
        <p className="admin-local-note">Locais pendentes continuam disponíveis apenas na área administrativa até serem aprovados.</p>
      </section>
    </section>
  )
}
