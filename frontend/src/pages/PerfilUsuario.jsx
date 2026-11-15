import { useState } from 'react'

export default function PerfilUsuario({ user, onBack, onNavigate, onNameChange }) {
  const initial = user?.nome?.trim().charAt(0).toUpperCase() || 'U'
  const isAdmin = user?.tipo === 'ADMIN'
  const [name, setName] = useState(user?.nome || '')
  const [editingName, setEditingName] = useState(false)
  const [message, setMessage] = useState('')

  async function saveName(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    try {
      await onNameChange?.(trimmedName)
    } catch (error) {
      setMessage(error.message || 'Não foi possível atualizar o nome.')
      return
    }
    setEditingName(false)
    setMessage('Nome atualizado.')
  }

  return (
    <section className="admin-page account-page">
      <button className="back-button" type="button" onClick={onBack}>← Voltar para explorar</button>
      <header className="admin-header"><div><p className="eyebrow">MINHA CONTA</p><h1>Meu perfil</h1><p>Confira seus dados e os recursos disponíveis na sua conta.</p></div><span className="admin-badge">{isAdmin ? 'Administrador' : 'Usuário'}</span></header>

      <section className="admin-content-panel profile-panel">
        {message && <p className="profile-inline-message" role="status">{message}</p>}
        <div className="profile-summary"><span className="profile-large-avatar">{initial}</span><div><p className="eyebrow">CONTA COMÊMAPS</p>{editingName ? <form className="profile-name-form" onSubmit={saveName}><label htmlFor="profile-name">Nome</label><input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} autoFocus required /><div><button type="button" onClick={() => { setName(user?.nome || ''); setEditingName(false) }}>Cancelar</button><button className="profile-save-name" type="submit">Salvar</button></div></form> : <><h2>{user?.nome || 'Usuário'}</h2><p>{user?.email || 'E-mail não informado'}</p><button className="profile-edit-name" type="button" onClick={() => setEditingName(true)}>Editar nome</button></>}</div><span className="profile-active-status">Ativo</span></div>
        <div className={`profile-data-grid ${isAdmin ? '' : 'profile-data-grid-user'}`}><div><span>Nome</span><strong>{user?.nome || 'Não informado'}</strong></div><div><span>E-mail</span><strong>{user?.email || 'Não informado'}</strong></div>{isAdmin && <><div><span>Perfil de acesso</span><strong>Administrador</strong></div><div><span>Origem</span><strong>Conta local de teste</strong></div></>}</div>
        <div className="profile-actions"><button className="profile-edit-action" type="button" onClick={() => setEditingName(true)}>Editar nome</button><button type="button" onClick={() => onNavigate?.('configuracoes')}>Abrir configurações</button><button type="button" onClick={() => onNavigate?.('solicitacoes')}>Minhas solicitações</button></div>
      </section>
    </section>
  )
}
