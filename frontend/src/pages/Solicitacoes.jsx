import { useEffect, useState } from 'react'
import { atualizarEstabelecimento, excluirEstabelecimento, listarMinhasSolicitacoes } from '../api'
import EditarEstabelecimento from './EditarEstabelecimento'

const statusConfig = {
  PENDENTE: { label: 'Pendente', className: 'pending' },
  APROVADO: { label: 'Aprovado', className: 'approved' },
  RECUSADO: { label: 'Recusado', className: 'rejected' },
}

export default function Solicitacoes({ onBack, user }) {
  const [expandedId, setExpandedId] = useState(null)
  const [editingRequest, setEditingRequest] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [solicitacoes, setSolicitacoes] = useState([])
  const isAdmin = user?.tipo === 'ADMIN'

  useEffect(() => {
    listarMinhasSolicitacoes()
      .then((items) => setSolicitacoes(items.map((item) => ({
        ...item,
        status: item.status === 'APPROVED' ? 'APROVADO' : item.status === 'REJECTED' ? 'RECUSADO' : 'PENDENTE',
        categoria: item.categoria?.nome || item.categoria || item.categorias?.split(',')[0]?.trim() || 'Gastronomia',
      }))))
      .catch(() => setSolicitacoes([]))
  }, [user?.id])

  useEffect(() => {
    if (!feedback) return undefined
    const timeout = window.setTimeout(() => setFeedback(''), 4000)
    return () => window.clearTimeout(timeout)
  }, [feedback])

  function beginEdit(solicitacao) {
    if (!isAdmin) return
    setEditingRequest(solicitacao)
    setFeedback('')
  }

  async function saveEdit(changes) {
    const solicitacaoAtual = editingRequest
    await atualizarEstabelecimento(solicitacaoAtual.id, changes)
    const precisaNovaAprovacao = solicitacaoAtual?.status !== 'PENDENTE'
    setSolicitacoes((current) => current.map((item) => item.id === solicitacaoAtual.id ? { ...item, ...changes, status: precisaNovaAprovacao ? 'PENDENTE' : item.status } : item))
    setEditingRequest(null)
    setFeedback(precisaNovaAprovacao ? 'Alterações salvas. A solicitação voltou para aprovação.' : 'Solicitação atualizada.')
  }

  async function deleteRequest() {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?')) return
    await excluirEstabelecimento(editingRequest.id)
    setSolicitacoes((current) => current.filter((item) => item.id !== editingRequest.id))
    setEditingRequest(null)
    setFeedback('Solicitação excluída.')
  }

if (isAdmin && editingRequest) return <EditarEstabelecimento estabelecimento={editingRequest} onBack={() => setEditingRequest(null)} onSave={saveEdit} onDelete={editingRequest.status === 'RECUSADO' ? deleteRequest : undefined} deleteLabel="Excluir solicitação" />
  return (
    <section className="requests-page">
      {feedback && <div className="login-toast" role="status"><span className="login-toast-icon" aria-hidden="true">✓</span><span>{feedback}</span></div>}
      <button className="back-button" type="button" onClick={onBack}>← Voltar para explorar</button>

      <header className="requests-header">
        <div>
          <p className="eyebrow">USUÁRIO</p>
          <h1>Minhas solicitações</h1>
          <p>Acompanhe os estabelecimentos que você enviou para análise.</p>
        </div>
        <span className="requests-count">{solicitacoes.length} {solicitacoes.length === 1 ? 'solicitação' : 'solicitações'}</span>
      </header>

      <section className="requests-panel">
        <div className="requests-panel-heading">
          <div><p className="eyebrow">ACOMPANHAMENTO</p><h2>Locais enviados</h2></div>
          <span className="requests-local-badge">API conectada</span>
        </div>

        {solicitacoes.length === 0 ? (
          <div className="requests-empty">
            <span aria-hidden="true">⌖</span>
            <h3>Nenhuma solicitação por enquanto</h3>
            <p>Quando você sugerir um novo local, ele aparecerá aqui para acompanhamento.</p>
          </div>
        ) : (
          <div className="requests-list">
            {solicitacoes.map((solicitacao) => {
              const status = statusConfig[solicitacao.status] || statusConfig.PENDENTE
              const expanded = expandedId === solicitacao.id
              return (
                <article className="request-user-card" key={solicitacao.id}>
                  <span className="request-user-thumb" aria-hidden="true">⌖</span>
                  <div className="request-user-info">
                    <strong>{solicitacao.nome}</strong>
                    <span>{solicitacao.categoria || 'Gastronomia'} · {solicitacao.endereco || 'Endereço não informado'}</span>
                    <small>{solicitacao.descricao || 'Sem descrição informada.'}</small>
                  </div>
                  <span className={`request-user-status ${status.className}`}>{status.label}</span>
                  <div className="request-user-actions">
                    <button className="request-user-details" type="button" onClick={() => setExpandedId(expanded ? null : solicitacao.id)}>{expanded ? 'Ocultar' : 'Ver detalhes'}</button>
                    {isAdmin && (
                      <button className="request-user-details" type="button" onClick={() => beginEdit(solicitacao)}>Editar</button>
                    )}
                  </div>
                  {expanded && <div className="request-user-detail-panel">
                    <dl className="request-user-detail-grid">
                      <div><dt>CEP</dt><dd>{solicitacao.cep || 'Não informado'}</dd></div>
                      <div><dt>Telefone</dt><dd>{solicitacao.telefone || 'Não informado'}</dd></div>
                      <div><dt>Localização</dt><dd>{solicitacao.latitude || '—'}, {solicitacao.longitude || '—'}</dd></div>
                    </dl>
                  </div>}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <p className="requests-note">As solicitações são carregadas pela API e ficam vinculadas à conta autenticada.</p>
    </section>
  )
}
