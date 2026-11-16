import { useEffect, useState } from 'react'
import { atualizarEstabelecimento, atualizarStatusEstabelecimento, excluirEstabelecimento, listarEstabelecimentosAdmin } from '../api'
import EditarEstabelecimento from './EditarEstabelecimento'
import SolicitacaoEstabelecimento from './SolicitacaoEstabelecimento'

function statusLabel(status) {
  if (status === 'APROVADO') return 'Aprovado'
  if (status === 'RECUSADO') return 'Recusado'
  return 'Pendente'
}

function normalizeStatus(status) {
  if (status === 'APPROVED') return 'APROVADO'
  if (status === 'REJECTED') return 'RECUSADO'
  return 'PENDENTE'
}

function normalizeEstabelecimento(estabelecimento) {
  return {
    ...estabelecimento,
    latitude: estabelecimento.latitude != null
      ? Number(estabelecimento.latitude)
      : null,
    longitude: estabelecimento.longitude != null
      ? Number(estabelecimento.longitude)
      : null,
    status: normalizeStatus(estabelecimento.status),
    categoria:
      estabelecimento.categoria?.nome ||
      estabelecimento.categoria ||
      estabelecimento.categorias?.split(',')[0]?.trim() ||
      'Gastronomia',
  }
}

export default function Aprovacao({ onBack }) {
  const [estabelecimentos, setEstabelecimentos] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [editingPlace, setEditingPlace] = useState(null)
  const [statusFilter, setStatusFilter] = useState('TODOS')
  useEffect(() => { listarEstabelecimentosAdmin().then((items) => setEstabelecimentos(items.map(normalizeEstabelecimento))).catch(() => {}) }, [])
  const pendentes = estabelecimentos.filter((estabelecimento) => estabelecimento.status === 'PENDENTE')

  const statusOrder = { PENDENTE: 0, RECUSADO: 1, APROVADO: 2 }
  const filteredEstabelecimentos = estabelecimentos
    .filter((estabelecimento) => statusFilter === 'TODOS' || estabelecimento.status === statusFilter)
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

  async function atualizarStatus(id, status) {
    await atualizarStatusEstabelecimento(id, status === 'APROVADO' ? 'APPROVED' : 'REJECTED')
    setEstabelecimentos((atuais) => atuais.map((estabelecimento) => estabelecimento.id === id ? { ...estabelecimento, status } : estabelecimento))
    setSelectedRequest(null)
  }

  async function salvarEdicao(changes) {
    await atualizarEstabelecimento(editingPlace.id, changes)

    setEstabelecimentos((atuais) =>
      atuais.map((estabelecimento) =>
        estabelecimento.id === editingPlace.id
          ? { ...estabelecimento, ...changes, status: 'PENDENTE' }
          : estabelecimento
      )
    )

    setEditingPlace(null)
  }

  async function excluirLocal(id) {
    if (!window.confirm('Tem certeza que deseja excluir este estabelecimento?')) return
    await excluirEstabelecimento(id)
    setEstabelecimentos((atuais) => atuais.filter((estabelecimento) => estabelecimento.id !== id))
    setEditingPlace(null)
  }

  if (selectedRequest) return <SolicitacaoEstabelecimento estabelecimento={selectedRequest} onBack={() => setSelectedRequest(null)} onApprove={() => atualizarStatus(selectedRequest.id, 'APROVADO')} onReject={() => atualizarStatus(selectedRequest.id, 'RECUSADO')} />
  if (editingPlace) return <EditarEstabelecimento estabelecimento={editingPlace} onBack={() => setEditingPlace(null)} onSave={salvarEdicao} onDelete={() => excluirLocal(editingPlace.id)} />

  return (
    <section className="admin-page admin-approval-page">
      <button className="back-button" type="button" onClick={onBack}>← Voltar para explorar</button>

      <header className="admin-header">
        <div>
          <p className="eyebrow">ADMINISTRAÇÃO</p>
          <h1>Aprovação de estabelecimentos</h1>
          <p>Analise os locais sugeridos pelos usuários antes que eles apareçam na área pública do ComêMaps.</p>
        </div>
        <span className="admin-badge">{pendentes.length} pendentes</span>
      </header>

      <section className="admin-content-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">LOCAIS CADASTRADOS</p><h2>Estabelecimentos</h2></div><div className="admin-panel-controls"><label htmlFor="establishment-status-filter">Filtrar por</label><select id="establishment-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="TODOS">Todos os locais</option><option value="PENDENTE">Pendentes</option><option value="APROVADO">Aprovados</option><option value="RECUSADO">Recusados</option></select><span className="admin-count">{estabelecimentos.length} cadastrados</span></div></div>
        <div className="admin-place-list">
          {filteredEstabelecimentos.map((estabelecimento) => {
            return <div className="admin-place-entry" key={estabelecimento.id}>
              <article className="admin-place-row">
                <span className="place-thumb coral" aria-hidden="true">⌖</span>
                <span className="admin-place-info"><strong>{estabelecimento.nome}</strong><small>{estabelecimento.categoria} · {estabelecimento.endereco || 'Endereço não informado'}</small><span>{estabelecimento.descricao || 'Sem descrição informada.'}</span></span>
                <span className={`admin-place-status ${estabelecimento.status.toLowerCase()}`}>{statusLabel(estabelecimento.status)}</span>
                {estabelecimento.status === 'PENDENTE' && <span className="admin-place-actions"><button className="admin-request-button" type="button" onClick={() => setSelectedRequest(estabelecimento)}>Ver solicitação</button><button type="button" onClick={() => atualizarStatus(estabelecimento.id, 'APROVADO')}>Aprovar</button><button type="button" onClick={() => atualizarStatus(estabelecimento.id, 'RECUSADO')}>Recusar</button></span>}
                {estabelecimento.status === 'APROVADO' && <span className="admin-place-actions"><button className="admin-request-button" type="button" onClick={() => setEditingPlace(estabelecimento)}>Editar</button><button className="admin-delete-button" type="button" onClick={() => excluirLocal(estabelecimento.id)}>Excluir</button></span>}
              </article>
            </div>
          })}
        </div>
        <p className="admin-local-note">Dados e ações conectados às rotas administrativas da API.</p>
      </section>
    </section>
  )
}
