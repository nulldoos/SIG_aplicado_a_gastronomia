import { useState } from 'react'
import { cadastrarUsuario } from '../api'

function CadastroPinIcon() {
  return (
    <svg className="login-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10.2c0 5.1-8 10.8-8 10.8S4 15.3 4 10.2a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function EyeIcon({ hidden = false }) {
  return (
    <svg className="password-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {hidden ? <><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.3A10.7 10.7 0 0 1 12 4c5.2 0 9 5 9 8s-3.8 8-9 8a9.7 9.7 0 0 1-5.4-1.7" /></> : <><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.4" /></>}
    </svg>
  )
}

export default function CadastroUsuario({ onBack, onNavigate, onRegister }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationTouched, setConfirmationTouched] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordRules = [
    { label: 'Pelo menos 8 caracteres', valid: password.length >= 8 },
    { label: 'Uma letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'Um número', valid: /[0-9]/.test(password) },
    { label: 'Um símbolo', valid: /[^A-Za-z0-9\s]/.test(password) },
  ]

  const passwordIsValid = passwordRules.every((rule) => rule.valid)
  const passwordsMatch = password === passwordConfirmation
  const showPasswordMatchFeedback = confirmationTouched && passwordConfirmation.length > 0

  async function handleSubmit(event) {
    event.preventDefault()
    if (!passwordIsValid) {
      setMessage('A senha ainda não atende a todos os requisitos.')
      return
    }
    if (password !== passwordConfirmation) {
      setMessage('As senhas precisam ser iguais.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const result = await cadastrarUsuario({ nome: name, email, senha: password })
      onRegister?.(result.usuario)
    } catch (error) {
      setMessage(error.message || 'Não foi possível criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-page register-page">
      <button className="back-button login-back-button" type="button" onClick={() => onNavigate ? onNavigate('login') : onBack?.()}>← Voltar para entrar</button>

      <div className="login-layout">
        <div className="login-intro">
          <div className="login-brand"><span className="login-brand-mark"><CadastroPinIcon /></span><strong>Comê<span>Maps</span></strong></div>
          <p className="eyebrow">FAÇA PARTE DA COMUNIDADE</p>
          <h1>Descubra sabores<br /><em>do seu jeito.</em></h1>
          <p className="login-intro-text">Crie sua conta para salvar lugares, acompanhar suas solicitações e encontrar novos favoritos pela cidade.</p>
        </div>

        <div className="login-card-panel">
          <p className="eyebrow">NOVO USUÁRIO</p>
          <h2>Criar sua conta</h2>
          <p className="login-card-description">Preencha seus dados para começar a explorar.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Nome</label>
            <input id="register-name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos chamar você?" autoComplete="name" required />

            <label htmlFor="register-email">E-mail</label>
            <input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={(event) => event.currentTarget.reportValidity()} placeholder="voce@exemplo.com" autoComplete="email" required />

            <label htmlFor="register-password">Senha</label>
            <div className="password-field">
              <input id="register-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Crie uma senha" autoComplete="new-password" minLength="8" required />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}><EyeIcon hidden={showPassword} /></button>
            </div>
            <ul className="password-rules" aria-label="Regras da senha">
              {passwordRules.map((rule) => <li key={rule.label} className={rule.valid ? 'valid' : ''}><span aria-hidden="true">{rule.valid ? '✓' : '○'}</span>{rule.label}</li>)}
            </ul>

            <label htmlFor="register-password-confirmation">Confirmar senha</label>
            <div className="password-field">
              <input id="register-password-confirmation" type={showConfirmation ? 'text' : 'password'} value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} onBlur={() => setConfirmationTouched(true)} aria-invalid={showPasswordMatchFeedback && !passwordsMatch} aria-describedby={showPasswordMatchFeedback && !passwordsMatch ? 'password-match-feedback' : undefined} placeholder="Digite a senha novamente" autoComplete="new-password" minLength="8" required />
              <button className="password-toggle" type="button" onClick={() => setShowConfirmation((visible) => !visible)} aria-label={showConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}><EyeIcon hidden={showConfirmation} /></button>
            </div>
            {showPasswordMatchFeedback && !passwordsMatch && <p id="password-match-feedback" className="password-match-feedback error" role="status">As senhas precisam ser iguais.</p>}

            <button className="login-submit" type="submit" disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</button>
          </form>

          {message && <p className={`login-feedback ${message.includes('iguais') ? 'login-feedback-error' : ''}`} role="status">{message}</p>}
          <p className="login-register">Já tem uma conta? <button type="button" onClick={() => onNavigate?.('login')}>Entrar</button></p>
        </div>
      </div>
    </section>
  )
}
