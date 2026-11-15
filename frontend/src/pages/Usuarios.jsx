import { useState } from 'react'
import { listarUsuariosMock } from '../mockAuth'

export default function Usuarios({ onBack }) {
  const [usuarios] = useState(() => listarUsuariosMock())
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [roleFilter, setRoleFilter] = useState('TODOS')
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchesStatus = statusFilter === 'TODOS' || (statusFilter === 'ATIVOS' ? usuario.ativo : !usuario.ativo)
    const matchesRole = roleFilter === 'TODOS' || usuario.tipo === roleFilter
    return matchesStatus && matchesRole
  })

  return (
    <section className="admin-page admin-users-page">
      <button className="back-button" type="button" onClick={onBack}>← Voltar para explorar</button>

      <header className="admin-header">
        <div>
          <p className="eyebrow">ADMINISTRAÇÃO</p>
          <h1>Listagem de usuários</h1>
          <p>Consulte as contas cadastradas no ComêMaps e acompanhe o perfil de acesso de cada usuário.</p>
        </div>
        <span className="admin-badge">{usuariosFiltrados.length} de {usuarios.length} usuários</span>
      </header>

      <section className="admin-content-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">CONTAS LOCAIS</p><h2>Usuários cadastrados</h2></div><div className="admin-panel-controls"><label htmlFor="user-status-filter">Status</label><select id="user-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="TODOS">Todos</option><option value="ATIVOS">Ativos</option><option value="INATIVOS">Inativos</option></select><label htmlFor="user-role-filter">Perfil</label><select id="user-role-filter" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="TODOS">Todos</option><option value="ADMIN">Admins</option><option value="USER">Usuários</option></select></div></div>
        <div className="admin-users-list">
          {usuariosFiltrados.length > 0 ? usuariosFiltrados.map((usuario) => <article className="admin-user-row" key={usuario.id}><span className="avatar">{usuario.nome?.trim().charAt(0).toUpperCase() || 'U'}</span><span className="admin-user-info"><strong>{usuario.nome}</strong><small>{usuario.email}</small></span><span className={`admin-role ${usuario.tipo === 'ADMIN' ? 'admin' : ''}`}>{usuario.tipo === 'ADMIN' ? 'Administrador' : 'Usuário'}</span><span className={`admin-user-status ${usuario.ativo ? 'active' : 'inactive'}`}>{usuario.ativo ? 'Ativo' : 'Inativo'}</span></article>) : <div className="empty-state">Nenhum usuário encontrado para esses filtros.</div>}
        </div>
        <p className="admin-local-note">Esses dados estão vindo do mock local para testes. A conexão com a rota protegida do backend será feita quando o login real estiver integrado.</p>
      </section>
    </section>
  )
}
