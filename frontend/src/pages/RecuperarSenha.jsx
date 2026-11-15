import { useState } from 'react'

function RecoveryPinIcon() {
  return (
    <svg className="login-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10.2c0 5.1-8 10.8-8 10.8S4 15.3 4 10.2a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export default function RecuperarSenha({ onBack, onNavigate }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (onNavigate) {
      onNavigate('login', 'Recuperação enviada para o e-mail informado.')
      return
    }
    setMessage('Recuperação enviada para o e-mail informado.')
  }

  return (
    <section className="login-page recovery-page">
      <button className="back-button login-back-button" type="button" onClick={() => onNavigate ? onNavigate('login') : onBack?.()}>← Voltar para entrar</button>

      <div className="login-layout">
        <div className="login-intro">
          <div className="login-brand"><span className="login-brand-mark"><RecoveryPinIcon /></span><strong>Comê<span>Maps</span></strong></div>
          <p className="eyebrow">RECUPERE SEU ACESSO</p>
          <h1>Volte a descobrir<br /><em>seus lugares favoritos.</em></h1>
          <p className="login-intro-text">Informe o e-mail da sua conta e enviaremos as instruções para criar uma nova senha.</p>
        </div>

        <div className="login-card-panel">
          <p className="eyebrow">ESQUECI MINHA SENHA</p>
          <h2>Recuperar senha</h2>
          <p className="login-card-description">Digite seu e-mail para receber as instruções de recuperação.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="recovery-email">E-mail</label>
            <input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={(event) => event.currentTarget.reportValidity()} placeholder="voce@exemplo.com" autoComplete="email" required />
            <button className="login-submit" type="submit">Enviar instruções</button>
          </form>

          {message && <p className="login-feedback" role="status">{message}</p>}
          <p className="login-register">Lembrou sua senha? <button type="button" onClick={() => onNavigate?.('login')}>Voltar para o login</button></p>
        </div>
      </div>
    </section>
  )
}
