const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const AUTH_TOKEN_KEY = 'comemaps:auth-token'
const AUTH_USER_KEY = 'comemaps:auth-user'

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {})
  if (options.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const type = response.headers.get('content-type') || ''
  const data = type.includes('application/json') ? await response.json() : null
  if (!response.ok) {
    const error = new Error(data?.mensagem || `API respondeu com status ${response.status}`)
    error.status = response.status
    throw error
  }
  return data
}

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getStoredUser() {
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveAuthSession({ token, usuario }) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(usuario))
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
}


export async function loginUsuario(email, senha) {
  try {
    return await request('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    })
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Não foi possível conectar ao servidor.')
    }

    throw error
  }
}

export const cadastrarUsuario = (dados) => request('/usuarios/cadastro', { method: 'POST', body: JSON.stringify(dados) })
export const recuperarSenha = (email) =>
  request('/recuperacao-senha/solicitar', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
export const redefinirSenha = (token, novaSenha) =>
  request('/recuperacao-senha/redefinir', {
    method: 'POST',
    body: JSON.stringify({ token, novaSenha })
  })
export const atualizarMeuPerfil = (nome) => request('/usuarios/me', { method: 'PATCH', body: JSON.stringify({ nome }) })
export const listarUsuarios = () => request('/usuarios')
export const atualizarStatusUsuario = (id, ativo) => request(`/usuarios/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ ativo }) })
export const listarEstabelecimentos = () => request('/estabelecimentos')
export const listarEstabelecimentosGoogle = () => request('/google-places')
export const listarEstabelecimentosAdmin = () => request('/estabelecimentos/admin')
export const listarEstabelecimentosPendentes = () => request('/estabelecimentos/pendentes')
export const listarMinhasSolicitacoes = () => request('/estabelecimentos/minhas')
export const buscarEstabelecimentoPorId = (id) => request(`/estabelecimentos/${encodeURIComponent(id)}`)
export const cadastrarEstabelecimento = (dados) => request('/estabelecimentos', { method: 'POST', body: JSON.stringify(dados) })
export const atualizarStatusEstabelecimento = (id, status) => request(`/estabelecimentos/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
export const atualizarEstabelecimento = (id, dados) => request(`/estabelecimentos/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(dados) })
export const excluirEstabelecimento = (id) => request(`/estabelecimentos/${encodeURIComponent(id)}`, { method: 'DELETE' })
export const listarFavoritos = () => request('/favoritos')
export const adicionarFavorito = (estabelecimentoId) => request('/favoritos', { method: 'POST', body: JSON.stringify({ estabelecimento_id: estabelecimentoId }) })
export const removerFavorito = (estabelecimentoId) => request(`/favoritos/${encodeURIComponent(estabelecimentoId)}`, { method: 'DELETE' })
export function listarCategorias() { return request('/categorias') }

export async function buscarEnderecoPorCep(cep) {
  const cepNormalizado = cep.replace(/\D/g, '')
  const response = await fetch(`https://viacep.com.br/ws/${cepNormalizado}/json/`)
  if (!response.ok) throw new Error('Não foi possível consultar o CEP.')
  const data = await response.json()
  if (data.erro) throw new Error('CEP não encontrado.')
  return data
}

export async function verificarApi() {
  const response = await fetch(API_URL.replace(/\/api$/, ''))
  if (!response.ok) throw new Error(`API respondeu com status ${response.status}`)
  return response.json()
}
