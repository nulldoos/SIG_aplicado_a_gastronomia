import { useEffect, useState } from 'react'
import { buscarEnderecoPorCep, cadastrarEstabelecimento, listarCategorias } from '../api'

function formatTelefone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  const area = digits.slice(0, 2)
  const number = digits.slice(2)
  if (digits.length <= 10) return `(${area}) ${number.slice(0, 4)}${number.length > 4 ? `-${number.slice(4)}` : ''}`
  return `(${area}) ${number.slice(0, 5)}${number.length > 5 ? `-${number.slice(5)}` : ''}`
}

function formatCoordinate(value, maxLength) {
  const normalized = value.replace(',', '.').replace(/[^\d.-]/g, '')
  const negative = normalized.startsWith('-')
  const unsigned = normalized.replace(/-/g, '')
  const separatorIndex = unsigned.indexOf('.')
  if (separatorIndex < 0) {
    const integer = unsigned.slice(0, 2)
    const decimal = unsigned.slice(2, 8)
    return `${negative ? '-' : ''}${integer}${decimal ? `.${decimal}` : ''}`.slice(0, maxLength)
  }
  const integer = unsigned.slice(0, separatorIndex).slice(0, 3)
  const decimal = separatorIndex >= 0 ? unsigned.slice(separatorIndex + 1).replace(/\./g, '').slice(0, 6) : ''
  const coordinate = `${negative ? '-' : ''}${integer}${separatorIndex >= 0 ? `.${decimal}` : ''}`
  return coordinate.slice(0, maxLength)
}

export default function CadastroEstabelecimento({ onBack }) {
  const [form, setForm] = useState({ nome: '', categoria_id: '', descricao: '', cep: '', endereco: '', telefone: '', latitude: '', longitude: '' })
  const [categorias, setCategorias] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepStatus, setCepStatus] = useState('idle')

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    if (!successMessage) return undefined
    const timeout = window.setTimeout(() => setSuccessMessage(''), 4000)
    return () => window.clearTimeout(timeout)
  }, [successMessage])

  function updateField(event) {
    const { name, value } = event.target
    const nextValue = name === 'cep' ? value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2') : name === 'telefone' ? formatTelefone(value) : name === 'latitude' ? formatCoordinate(value, 12) : name === 'longitude' ? formatCoordinate(value, 13) : value
    setForm((current) => ({ ...current, [name]: nextValue }))
    setSuccessMessage('')
  }

  async function handleCepBlur() {
    const cep = form.cep.replace(/\D/g, '')
    if (!cep) {
      setCepStatus('idle')
      return
    }
    if (cep.length !== 8) {
      setCepStatus('error')
      return
    }

    setCepLoading(true)
    setCepStatus('loading')
    try {
      const endereco = await buscarEnderecoPorCep(cep)
      const enderecoCompleto = [endereco.logradouro, endereco.bairro, endereco.localidade && `${endereco.localidade} - ${endereco.uf}`].filter(Boolean).join(', ')
      setForm((current) => ({ ...current, endereco: enderecoCompleto }))
      setCepStatus('success')
    } catch {
      setCepStatus('error')
    } finally {
      setCepLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      const response = await cadastrarEstabelecimento({ ...form, categoria_id: Number(form.categoria_id), cep: undefined })
      setSuccessMessage(response?.mensagem || 'Solicitação enviada para aprovação.')
    } catch (error) {
      setSuccessMessage(error.message || 'Não foi possível enviar a solicitação.')
      return
    }
    setForm({ nome: '', categoria_id: '', descricao: '', cep: '', endereco: '', telefone: '', latitude: '', longitude: '' })
    setCepStatus('idle')
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  return (
    <section className="establishment-page">
      {successMessage && <div className="login-toast" role="status"><span className="login-toast-icon" aria-hidden="true">✓</span><span>{successMessage}</span></div>}
      <button className="back-button" type="button" onClick={onBack}>← Voltar para explorar</button>

      <div className="establishment-header">
        <div>
          <p className="eyebrow">NOVA SOLICITAÇÃO</p>
          <h1>Cadastre um novo lugar</h1>
          <p>Compartilhe um estabelecimento gastronômico para ele ser analisado pela nossa equipe.</p>
        </div>
        <span className="establishment-status">Aprovação necessária</span>
      </div>

      <form className="establishment-card establishment-form" onSubmit={handleSubmit}>
        <div className="establishment-section-title"><h2>Informações do estabelecimento</h2><span>Campos com * são obrigatórios</span></div>

        <div className="establishment-grid">
          <div className="form-field form-field-wide"><label htmlFor="establishment-name">Nome do estabelecimento *</label><input id="establishment-name" name="nome" value={form.nome} onChange={updateField} placeholder="Ex.: Sabor da Vila" required /></div>
          <div className="form-field form-field-wide"><label htmlFor="establishment-category">Categoria *</label><select id="establishment-category" name="categoria_id" value={form.categoria_id} onChange={updateField} required><option value="">Selecione uma categoria</option>{categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}</select></div>
          <div className="form-field form-field-wide"><label htmlFor="establishment-description">Descrição</label><textarea id="establishment-description" name="descricao" value={form.descricao} onChange={updateField} placeholder="Conte um pouco sobre o local, seus pratos e sua proposta." rows="4" /></div>
          <div className="form-field"><label htmlFor="establishment-cep">CEP</label><input id="establishment-cep" name="cep" value={form.cep} onChange={updateField} onBlur={handleCepBlur} placeholder="00000-000" inputMode="numeric" maxLength="9" aria-describedby="cep-feedback" /><small id="cep-feedback" className={`cep-feedback ${cepStatus}`} aria-live="polite">{cepLoading ? 'Consultando CEP...' : cepStatus === 'success' ? 'Endereço preenchido automaticamente.' : cepStatus === 'error' ? 'CEP não encontrado ou incompleto.' : 'Preencha para completar o endereço.'}</small></div>
          <div className="form-field"><label htmlFor="establishment-phone">Telefone</label><input id="establishment-phone" name="telefone" value={form.telefone} onChange={updateField} placeholder="(00) 00000-0000" inputMode="tel" maxLength="15" /></div>
          <div className="form-field form-field-wide"><label htmlFor="establishment-address">Endereço *</label><input id="establishment-address" name="endereco" value={form.endereco} onChange={updateField} placeholder="Rua, número, bairro e cidade" required /></div>
        </div>

        <div className="establishment-location"><div><h2>Localização no mapa</h2><p>Esses campos serão preenchidos pelo mapa quando a integração estiver pronta.</p></div><div className="coordinates-grid"><div className="form-field"><label htmlFor="establishment-latitude">Latitude *</label><input id="establishment-latitude" name="latitude" value={form.latitude} onChange={updateField} placeholder="Ex.: -20.4697" inputMode="decimal" maxLength="12" pattern="-?[0-9]+([.,][0-9]+)?" required /></div><div className="form-field"><label htmlFor="establishment-longitude">Longitude *</label><input id="establishment-longitude" name="longitude" value={form.longitude} onChange={updateField} placeholder="Ex.: -54.6201" inputMode="decimal" maxLength="13" pattern="-?[0-9]+([.,][0-9]+)?" required /></div></div></div>

        <div className="establishment-actions"><p>Após o envio, a solicitação ficará pendente de aprovação.</p><button className="login-submit" type="submit">Enviar para aprovação</button></div>
      </form>
    </section>
  )
}
