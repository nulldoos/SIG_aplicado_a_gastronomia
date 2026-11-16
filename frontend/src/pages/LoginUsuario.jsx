import { useEffect, useState } from 'react'
import { loginUsuario } from '../api'

function LoginPinIcon() {
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

export default function LoginUsuario({ onBack, onNavigate, notice, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!message) return undefined
    const timeout = window.setTimeout(() => setMessage(''), 4000)
    return () => window.clearTimeout(timeout)
  }, [message])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const result = await loginUsuario(email, password)
      onLogin?.(result)
    } catch (error) {
      setMessage(error.message || 'Não foi possível realizar o login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-page">
      {notice && <div className="login-toast" role="status"><span className="login-toast-icon" aria-hidden="true">✓</span><span>{notice}</span></div>}
      {message && <div className="login-toast login-toast-error" role="alert"><span className="login-toast-icon" aria-hidden="true">!</span><span>{message}</span></div>}
      <button className="back-button login-back-button" type="button" onClick={onBack}>← Voltar para explorar</button>

      <div className="login-layout">
        <div className="login-intro">
          <div className="login-brand"><span className="login-brand-mark"><LoginPinIcon /></span><strong>Comê<span>Maps</span></strong></div>
          <p className="eyebrow">SUA CIDADE, SEU SABOR</p>
          <h1>Encontre lugares<br /><em>para chamar de favoritos.</em></h1>
          <p className="login-intro-text">Entre para salvar estabelecimentos, organizar seus favoritos e continuar descobrindo sabores perto de você.</p>
        </div>

        <div className="login-card-panel">
          <p className="eyebrow">ACESSO DO USUÁRIO</p>
          <h2>Entrar na sua conta</h2>
          <p className="login-card-description">Use seus dados para continuar no ComêMaps.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">E-mail</label>
            <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={(event) => event.currentTarget.reportValidity()} placeholder="voce@exemplo.com" autoComplete="email" required />

            <div className="login-label-row"><label htmlFor="login-password">Senha</label><button type="button" onClick={() => onNavigate?.('recuperarSenha')}>Esqueci minha senha</button></div>
            <div className="password-field">
              <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" autoComplete="current-password" required />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}><EyeIcon hidden={showPassword} /></button>
            </div>

            <label className="remember-option"><input type="checkbox" /> <span>Lembrar de mim</span></label>
            <button className="login-submit" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </form>

          <p className="login-register">Ainda não tem uma conta? <button type="button" onClick={() => onNavigate?.('cadastroUsuario')}>Criar cadastro</button></p>
        </div>
      </div>
    </section>
  )
}
