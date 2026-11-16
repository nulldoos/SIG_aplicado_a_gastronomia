import { useState } from 'react'

export default function Configuracoes({ onBack, darkMode, onToggleDarkMode }) {
  const [notifications, setNotifications] = useState(() => window.localStorage.getItem('comemaps:notifications') !== 'false')
  const [language, setLanguage] = useState(() => window.localStorage.getItem('comemaps:language') || 'pt-BR')

  function updatePreference(key, setter, value) {
    setter(value)
    window.localStorage.setItem(key, String(value))
  }

  return (
    <section className="admin-page account-page">
      <button className="back-button" type="button" onClick={onBack}>← Voltar para explorar</button>
      <header className="admin-header"><div><p className="eyebrow">PREFERÊNCIAS</p><h1>Configurações</h1><p>Personalize a experiência do ComêMaps neste navegador.</p></div><span className="admin-badge">Conta local</span></header>

      <section className="admin-content-panel settings-panel">
        <div className="settings-section"><div><p className="eyebrow">NOTIFICAÇÕES</p><h2>Comunicações</h2><p>Escolha quando deseja receber avisos sobre suas solicitações.</p></div><label className="settings-toggle"><input type="checkbox" checked={notifications} onChange={(event) => updatePreference('comemaps:notifications', setNotifications, event.target.checked)} /><span>{notifications ? 'Ativadas' : 'Desativadas'}</span></label></div>
        <div className="settings-section"><div><p className="eyebrow">LOCALIZAÇÃO</p><h2>Usar minha localização</h2><p>Permite que a experiência destaque lugares próximos de você.</p></div><label className="settings-toggle"><input type="checkbox" checked readOnly /><span>Ativada</span></label></div>
        <div className="settings-section"><div><p className="eyebrow">APARÊNCIA</p><h2>Modo noturno</h2><p>Use uma interface mais escura para navegar com menos brilho.</p></div><label className="settings-toggle"><input type="checkbox" checked={darkMode} onChange={(event) => onToggleDarkMode?.(event.target.checked)} /><span>{darkMode ? 'Ativado' : 'Desativado'}</span></label></div>
        <div className="settings-section settings-section-column"><div><p className="eyebrow">EXIBIÇÃO</p><h2>Idioma</h2><p>Idioma usado nos textos da aplicação.</p></div><select aria-label="Idioma" value={language} onChange={(event) => updatePreference('comemaps:language', setLanguage, event.target.value)}><option value="pt-BR">Português (Brasil)</option></select></div>
        <div className="settings-actions"><span>As preferências são aplicadas e salvas automaticamente neste navegador.</span></div>
      </section>
    </section>
  )
}
