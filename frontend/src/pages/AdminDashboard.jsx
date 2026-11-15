import { useState } from 'react'
import { listarEstabelecimentosMock, listarUsuariosMock } from '../mockAuth'

const tabs = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'approval', label: 'Aprovação de locais' },
  { id: 'users', label: 'Usuários' },
]

function AdminIcon({ type }) {
  if (type === 'approval') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4.5h14v15H5z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>
  }
  if (type === 'users') {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 5.5a3 3 0 0 1 0 5.8M16.5 14.5a5.5 5.5 0 0 1 4 5.5" /></svg>
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>
}

function SummaryCard({ icon, label, value, description }) {
  return (
    <article className="admin-summary-card">
      <span className="admin-summary-icon"><AdminIcon type={icon} /></span>
      <span className="admin-summary-label">{label}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </article>
  )
}

export default function AdminDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('overview')
  const usuarios = listarUsuariosMock()
  const estabelecimentos = listarEstabelecimentosMock()
  const pendentes = estabelecimentos.filter((estabelecimento) => estabelecimento.status === 'PENDENTE')
  const aprovados = estabelecimentos.filter((estabelecimento) => estabelecimento.status === 'APROVADO')

  return (
    <section className="admin-page">
      <button className="back-button" type="button" onClick={onBack}>← Voltar para explorar</button>

      <header className="admin-header">
        <div>
          <p className="eyebrow">PAINEL ADMINISTRATIVO</p>
          <h1>Central de administração</h1>
          <p>Acompanhe os locais enviados, aprove novos estabelecimentos e consulte os usuários do ComêMaps.</p>
        </div>
        <span className="admin-badge">Administrador</span>
      </header>

      <nav className="admin-tabs" aria-label="Abas da administração">
        {tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} type="button" onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
      </nav>

      {activeTab === 'overview' && <>
        <div className="admin-summary-grid">
          <SummaryCard icon="approval" label="Aguardando aprovação" value={pendentes.length} description="novos locais pendentes" />
          <SummaryCard icon="users" label="Usuários cadastrados" value={usuarios.length} description="contas no mock local" />
          <SummaryCard icon="overview" label="Locais publicados" value={aprovados.length} description="estabelecimentos aprovados" />
        </div>
        <section className="admin-empty-panel">
          <span className="admin-panel-icon"><AdminIcon type="overview" /></span>
          <div><h2>Dados do ambiente de teste</h2><p>Os indicadores acima estão sendo atualizados com os usuários e estabelecimentos salvos no mock local.</p></div>
        </section>
      </>}

      {activeTab === 'approval' && <section className="admin-content-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">MODERAÇÃO</p><h2>Estabelecimentos para analisar</h2></div><span className="admin-count">{pendentes.length} pendentes</span></div>
        <div className="admin-empty-state"><span className="admin-panel-icon"><AdminIcon type="approval" /></span><h3>{pendentes.length ? `${pendentes.length} solicitação(ões) aguardando` : 'Nenhuma solicitação pendente'}</h3><p>{pendentes.length ? 'Abra a aba de aprovação para consultar os detalhes e decidir sobre cada local.' : 'Quando um usuário sugerir um novo local, ele aparecerá nesta aba.'}</p></div>
      </section>}

      {activeTab === 'users' && <section className="admin-content-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">CONTAS</p><h2>Usuários cadastrados</h2></div><span className="admin-count">{usuarios.length} no mock</span></div>
        <div className="admin-empty-state"><span className="admin-panel-icon"><AdminIcon type="users" /></span><h3>{usuarios.length} usuário(s) disponível(is)</h3><p>Abra a aba de usuários para aplicar filtros por status e perfil.</p></div>
      </section>}
    </section>
  )
}
