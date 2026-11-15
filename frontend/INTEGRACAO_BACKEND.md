# Contrato de integração do frontend

O frontend usa `VITE_API_URL` como base da API. Sem essa variável, assume `http://localhost:3001/api`.

Todas as rotas autenticadas recebem:

```http
Authorization: Bearer <jwt>
```

O token retornado no login é salvo pelo cliente em `localStorage` e enviado automaticamente por `frontend/src/api.js`.

## Rotas já existentes no backend atual

### Usuários

| Método | Rota | Acesso |
| --- | --- | --- |
| `POST` | `/usuarios/login` | público |
| `POST` | `/usuarios/cadastro` | público |
| `GET` | `/usuarios` | administrador |
| `GET` | `/usuarios/:id` | administrador |
| `PATCH` | `/usuarios/:id/status` | administrador |

O login deve retornar `{ token, usuario }`. O cadastro deve retornar `{ usuario }`.

### Estabelecimentos

| Método | Rota | Acesso |
| --- | --- | --- |
| `GET` | `/estabelecimentos` | público; somente aprovados |
| `GET` | `/estabelecimentos/:id` | público |
| `GET` | `/estabelecimentos/pendentes` | administrador |
| `POST` | `/estabelecimentos` | usuário autenticado |
| `PATCH` | `/estabelecimentos/:id/status` | administrador |
| `PUT` | `/estabelecimentos/:id` | conforme regra do backend |
| `DELETE` | `/estabelecimentos/:id` | conforme regra do backend |

O cadastro e a edição usam `nome`, `categoria_id`, `descricao`, `cep`, `endereco`, `telefone`, `latitude` e `longitude`. A edição de uma solicitação do usuário deve devolver o registro para `PENDING` quando necessário.

### Categorias

| Método | Rota | Acesso |
| --- | --- | --- |
| `GET` | `/categorias` | público |

## Rotas que a colega precisa implementar/conectar

Estas funções já estão centralizadas em `frontend/src/api.js`, mas ainda não existem no backend atual:

| Método | Rota | Função da tela |
| --- | --- | --- |
| `POST` | `/usuarios/recuperar-senha` | enviar recuperação de senha |
| `PATCH` | `/usuarios/me` | editar nome do usuário logado |
| `GET` | `/estabelecimentos/admin` | listar todos os locais para a aprovação |
| `GET` | `/estabelecimentos/minhas` | listar solicitações do usuário logado |
| `GET` | `/favoritos` | listar favoritos do usuário logado |
| `POST` | `/favoritos` | adicionar favorito; body `{ estabelecimento_id }` |
| `DELETE` | `/favoritos/:estabelecimentoId` | remover favorito |

As respostas de listagem devem ser arrays. Erros devem preferencialmente seguir o formato:

```json
{ "mensagem": "Descrição do erro" }
```

## Configuração local

Crie `frontend/.env.local` quando a API estiver em outra origem:

```env
VITE_API_URL=http://localhost:3001/api
```

Depois, execute o frontend normalmente com `npm run dev`.
