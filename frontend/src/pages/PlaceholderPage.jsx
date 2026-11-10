export default function PlaceholderPage({ eyebrow, title, description, role, onBack }) {
  return (
    <section className="planned-page">
      <button className="back-button" type="button" onClick={onBack}>← Voltar</button>
      <div className="planned-page-card">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <span className="planned-role">Acesso previsto: {role}</span>
      </div>
    </section>
  )
}
