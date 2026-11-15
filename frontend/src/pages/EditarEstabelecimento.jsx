import { useEffect, useState } from 'react'
import MapPlaceholder from '../components/MapPlaceholder'
import { listarCategorias } from '../api'

function formatTelefone(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  const area = digits.slice(0, 2)
  const number = digits.slice(2)
  if (digits.length <= 10) return `(${area}) ${number.slice(0, 4)}${number.length > 4 ? `-${number.slice(4)}` : ''}`
  return `(${area}) ${number.slice(0, 5)}${number.length > 5 ? `-${number.slice(5)}` : ''}`
}

function formatCep(value) {
  return String(value).replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')
}

function formatCoordinate(value, maxLength) {
  const normalized = String(value).replace(',', '.').replace(/[^\d.-]/g, '')
  const negative = normalized.startsWith('-')
  const unsigned = normalized.replace(/-/g, '')
  const separatorIndex = unsigned.indexOf('.')
  if (separatorIndex < 0) {
    const integer = unsigned.slice(0, 3)
    const decimal = unsigned.slice(3, 9)
    return `${negative ? '-' : ''}${integer}${decimal ? `.${decimal}` : ''}`.slice(0, maxLength)
  }
  const integer = unsigned.slice(0, separatorIndex).slice(0, 3)
  const decimal = unsigned.slice(separatorIndex + 1).replace(/\./g, '').slice(0, 6)
  return `${negative ? '-' : ''}${integer}.${decimal}`.slice(0, maxLength)
}

export default function EditarEstabelecimento({ estabelecimento, onBack, onSave, onDelete, deleteLabel = 'Excluir estabelecimento' }) {
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState({ nome: estabelecimento.nome || '', categoria: estabelecimento.categoria?.nome || estabelecimento.categoria || estabelecimento.categorias?.split(',')[0]?.trim() || '', categoria_id: estabelecimento.categoria_id || '', descricao: estabelecimento.descricao || '', endereco: estabelecimento.endereco || '', telefone: formatTelefone(estabelecimento.telefone || ''), cep: formatCep(estabelecimento.cep || ''), latitude: formatCoordinate(estabelecimento.latitude || '', 12), longitude: formatCoordinate(estabelecimento.longitude || '', 13) })
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    listarCategorias().then((items) => {
      if (!mounted) return
      const options = Array.isArray(items) ? items : []
      setCategorias(options)
      if (!form.categoria_id && form.categoria) {
        const current = options.find((item) => item.nome?.toLowerCase() === form.categoria.toLowerCase())
        if (current) setForm((value) => ({ ...value, categoria_id: current.id }))
      }
    }).catch(() => setCategorias([]))
    return () => { mounted = false }
  }, [estabelecimento.id, form.categoria, form.categoria_id])

  function updateField(event) {
    const { name, value } = event.target
    const nextValue = name === 'telefone' ? formatTelefone(value) : name === 'cep' ? formatCep(value) : name === 'latitude' ? formatCoordinate(value, 12) : name === 'longitude' ? formatCoordinate(value, 13) : value
    if (name === 'categoria_id') {
      const selectedCategory = categorias.find((categoria) => String(categoria.id) === value)
      setForm((current) => ({ ...current, categoria_id: value, categoria: selectedCategory?.nome || current.categoria }))
    } else {
      setForm((current) => ({ ...current, [name]: nextValue }))
    }
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const latitude = Number(form.latitude.replace(',', '.'))
    const longitude = Number(form.longitude.replace(',', '.'))
    if (form.latitude && (Number.isNaN(latitude) || latitude < -90 || latitude > 90)) {
      setMessage('Informe uma latitude entre -90 e 90.')
      return
    }
    if (form.longitude && (Number.isNaN(longitude) || longitude < -180 || longitude > 180)) {
      setMessage('Informe uma longitude entre -180 e 180.')
      return
    }
    try {
      await onSave({ ...form, categoria_id: Number(form.categoria_id), latitude: form.latitude ? latitude : '', longitude: form.longitude ? longitude : '' })
    } catch (error) {
      setMessage(error.message || 'Não foi possível salvar as alterações.')
    }
  }

  const mapPlace = { name: form.nome, category: form.categoria, distance: 'local editado', tone: 'coral' }

  return (
    <section className="admin-page edit-establishment-page">
      <button className="back-button" type="button" onClick={onBack}>← Voltar para aprovação</button>
      <header className="admin-header"><div><p className="eyebrow">ADMINISTRAÇÃO</p><h1>Editar estabelecimento</h1><p>Atualize os dados de {estabelecimento.nome}.</p></div><span className="admin-badge">Aprovado</span></header>
      {message && <p className="login-feedback login-feedback-error" role="alert">{message}</p>}
      <form className="admin-content-panel edit-establishment-form" onSubmit={handleSubmit}>
        <div className="form-field"><label htmlFor="edit-place-name">Nome</label><input id="edit-place-name" name="nome" value={form.nome} onChange={updateField} required /></div>
        <div className="form-field"><label htmlFor="edit-place-category">Categoria</label><select id="edit-place-category" name="categoria_id" value={form.categoria_id} onChange={updateField} required><option value="">Selecione uma categoria</option>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}</select></div>
        <div className="form-field edit-field-wide"><label htmlFor="edit-place-description">Descrição</label><textarea id="edit-place-description" name="descricao" value={form.descricao} onChange={updateField} rows="4" /></div>
        <div className="form-field edit-field-wide"><label htmlFor="edit-place-address">Endereço</label><input id="edit-place-address" name="endereco" value={form.endereco} onChange={updateField} required /></div>
        <div className="form-field"><label htmlFor="edit-place-phone">Telefone</label><input id="edit-place-phone" name="telefone" value={form.telefone} onChange={updateField} placeholder="(00) 00000-0000" inputMode="tel" maxLength="15" /></div>
        <div className="form-field"><label htmlFor="edit-place-cep">CEP</label><input id="edit-place-cep" name="cep" value={form.cep} onChange={updateField} placeholder="00000-000" inputMode="numeric" maxLength="9" /></div>
        <div className="form-field"><label htmlFor="edit-place-latitude">Latitude</label><input id="edit-place-latitude" name="latitude" value={form.latitude} onChange={updateField} inputMode="decimal" maxLength="12" pattern="-?[0-9]+([.,][0-9]+)?" placeholder="Ex.: -20.4697" /></div>
        <div className="form-field"><label htmlFor="edit-place-longitude">Longitude</label><input id="edit-place-longitude" name="longitude" value={form.longitude} onChange={updateField} inputMode="decimal" maxLength="13" pattern="-?[0-9]+([.,][0-9]+)?" placeholder="Ex.: -54.6201" /></div>
        <div className="edit-map-panel edit-field-wide"><div className="request-map-heading"><p className="eyebrow">LOCALIZAÇÃO</p><h2>Visualizar no mapa</h2></div><MapPlaceholder selectedPlace={mapPlace} places={[mapPlace]} /></div>
        <div className="edit-form-actions">{onDelete && <button className="edit-delete-button" type="button" onClick={onDelete}>{deleteLabel}</button>}<span /><button className="back-button" type="button" onClick={onBack}>Cancelar</button><button className="login-submit" type="submit">Salvar alterações</button></div>
      </form>
    </section>
  )
}
