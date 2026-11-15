const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function request(path) {
  const response = await fetch(`${API_URL}${path}`)
  if (!response.ok) {
    throw new Error(`API respondeu com status ${response.status}`)
  }
  return response.json()
}

export function listarEstabelecimentos() {
  return request('/estabelecimentos')
}

export function buscarEstabelecimentoPorId(id) {
  return request(`/estabelecimentos/${encodeURIComponent(id)}`)
}

export function listarCategorias() {
  return request('/categorias')
}

export async function buscarEnderecoPorCep(cep) {
  const cepNormalizado = cep.replace(/\D/g, '')
  const response = await fetch(`https://viacep.com.br/ws/${cepNormalizado}/json/`)

  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP.')
  }

  const data = await response.json()
  if (data.erro) {
    throw new Error('CEP não encontrado.')
  }

  return data
}

export async function verificarApi() {
  const response = await fetch(API_URL.replace(/\/api$/, ''))
  if (!response.ok) {
    throw new Error(`API respondeu com status ${response.status}`)
  }
  return response.json()
}
