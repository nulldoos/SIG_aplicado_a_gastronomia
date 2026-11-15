import { useState } from 'react'
import { atualizarStatusEstabelecimentoMock, listarEstabelecimentosMock } from '../mockAuth'
import SolicitacaoEstabelecimento from './SolicitacaoEstabelecimento'

function statusLabel(status) {
  if (status === 'APROVADO') return 'Aprovado'
  if (status === 'RECUSADO') return 'Recusado'
  return 'Pendente'
}

export default function Aprovacao({ onBack }) {
  const [estabelecimentos, setEstabelecimentos] = useState(() => listarEstabelecimentosMock())
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const pendentes = estabelecimentos.filter((estabelecimento) => estabelecimento.status === 'PENDENTE')

  const statusOrder = { PENDENTE: 0, RECUSADO: 1, APROVADO: 2 }
  const filteredEstabelecimentos = estabelecimentos
    .filter((estabelecimento) => statusFilter === 'TODOS' || estabelecimento.status === statusFilter)
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

  function atualizarStatus(id, status) {
    const atualizado = atualizarStatusEstabelecimentoMock(id, status)
    if (atualizado) {
      setEstabelecimentos((atuais) => atuais.map((estabelecimento) => estabelecimento.id === id ? atualizado : estabelecimento))
      setSelectedRequest(null)
    }
  }

  if (selectedRequest) return <SolicitacaoEstabelecimento estabelecimento={selectedRequest} onBack={() => setSelectedRequest(null)} onApprove={() => atualizarStatus(selectedRequest.id, 'APROVADO')} onReject={() => atualizarStatus(selectedRequest.id, 'RECUSADO')} />

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
        <div className="admin-panel-heading"><div><p className="eyebrow">LOCAIS CADASTRADOS</p><h2>Estabelecimentos</h2></div><div className="admin-panel-controls"><label htmlFor="establishment-status-filter">Filtrar por</label><select id="establishment-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="TODOS">Todos os locais</option><option value="PENDENTE">Pendentes</option><option value="APROVADO">Aprovados</option><option value="RECUSADO">Recusados</option></select><span className="admin-count">{estabelecimentos.length} no mock</span></div></div>
        <div className="admin-place-list">
          {filteredEstabelecimentos.map((estabelecimento) => {
            return <div className="admin-place-entry" key={estabelecimento.id}>
              <article className="admin-place-row">
                <span className="place-thumb coral" aria-hidden="true">⌖</span>
                <span className="admin-place-info"><strong>{estabelecimento.nome}</strong><small>{estabelecimento.categoria} · {estabelecimento.endereco || 'Endereço não informado'}</small><span>{estabelecimento.descricao || 'Sem descrição informada.'}</span></span>
                <span className={`admin-place-status ${estabelecimento.status.toLowerCase()}`}>{statusLabel(estabelecimento.status)}</span>
                {estabelecimento.status === 'PENDENTE' && <span className="admin-place-actions"><button className="admin-request-button" type="button" onClick={() => setSelectedRequest(estabelecimento)}>Ver solicitação</button><button type="button" onClick={() => atualizarStatus(estabelecimento.id, 'APROVADO')}>Aprovar</button><button type="button" onClick={() => atualizarStatus(estabelecimento.id, 'RECUSADO')}>Recusar</button></span>}
              </article>
            </div>
          })}
        </div>
        <p className="admin-local-note">Os locais desta tela estão vindo do mock local. As ações serão conectadas às rotas administrativas do backend posteriormente.</p>
      </section>
    </section>
  )
}
