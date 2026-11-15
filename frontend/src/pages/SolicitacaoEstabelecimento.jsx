import MapPlaceholder from '../components/MapPlaceholder'

export default function SolicitacaoEstabelecimento({ estabelecimento, onBack, onApprove, onReject }) {
  const mapPlace = {
    name: estabelecimento.nome,
    category: estabelecimento.categoria,
    distance: 'local enviado',
    tone: 'coral',
  }

  return (
    <section className="admin-page request-detail-page">
      <button className="back-button" type="button" onClick={onBack}>← Voltar para aprovações</button>

      <header className="admin-header">
        <div>
          <p className="eyebrow">SOLICITAÇÃO DE ESTABELECIMENTO</p>
          <h1>{estabelecimento.nome}</h1>
          <p>Confira os dados enviados pelo usuário e a localização indicada antes de decidir sobre a aprovação.</p>
        </div>
        <span className="admin-place-status pendente">Pendente</span>
      </header>

      <div className="request-detail-grid">
        <section className="admin-content-panel request-info-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">DADOS ENVIADOS</p><h2>Informações do local</h2></div></div>
          <dl className="request-data-grid">
            <div><dt>Categoria</dt><dd>{estabelecimento.categoria || 'Não informado'}</dd></div>
            <div><dt>Telefone</dt><dd>{estabelecimento.telefone || 'Não informado'}</dd></div>
            <div className="request-data-wide"><dt>Descrição</dt><dd>{estabelecimento.descricao || 'Não informado'}</dd></div>
            <div className="request-data-wide"><dt>Endereço</dt><dd>{estabelecimento.endereco || 'Não informado'}</dd></div>
            <div><dt>CEP</dt><dd>{estabelecimento.cep || 'Não informado'}</dd></div>
            <div><dt>Latitude</dt><dd>{estabelecimento.latitude || 'Não informado'}</dd></div>
            <div><dt>Longitude</dt><dd>{estabelecimento.longitude || 'Não informado'}</dd></div>
          </dl>
          <div className="request-actions"><button className="request-reject-button" type="button" onClick={onReject}>Recusar</button><button className="request-approve-button" type="button" onClick={onApprove}>Aprovar estabelecimento</button></div>
        </section>

        <section className="request-map-panel"><div className="request-map-heading"><p className="eyebrow">LOCALIZAÇÃO</p><h2>Visualizar no mapa</h2></div><MapPlaceholder selectedPlace={mapPlace} places={[mapPlace]} /></section>
      </div>
    </section>
  )
}
