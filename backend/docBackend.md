
# Documentação do Backend — ComêMaps

## 1. Visão geral

O backend do **ComêMaps** é responsável por disponibilizar os dados e as funcionalidades que o frontend utiliza. Ele recebe as requisições feitas pela aplicação, valida as informações, aplica as regras do sistema, consulta ou altera o banco de dados e devolve uma resposta ao frontend.

### Tecnologias utilizadas

- **Node.js:** ambiente de execução do JavaScript no servidor.
- **Express.js:** framework utilizado para criar a API e organizar as rotas HTTP.
- **MySQL:** banco de dados relacional utilizado para armazenar usuários, estabelecimentos, categorias e favoritos.
- **JWT (JSON Web Token):** mecanismo utilizado para autenticar usuários nas rotas protegidas.
- **Google Places API:** fonte externa de dados de estabelecimentos, integrada ao backend e armazenada em cache no MySQL.

A API é executada localmente na porta `3001`.

O frontend utiliza como endereço-base:

```env
VITE_API_URL=http://localhost:3001/api
```

## 2. Comunicação entre frontend e backend

O frontend não acessa diretamente o banco de dados. Toda comunicação acontece por meio da API.

O fluxo básico é:

1. O usuário realiza uma ação na interface.
2. O frontend envia uma requisição HTTP para uma rota da API.
3. O backend recebe a requisição e verifica os dados enviados.
4. Quando necessário, verifica a autenticação e a permissão do usuário.
5. O controller executa a operação solicitada utilizando os models.
6. O model consulta ou modifica os dados no MySQL.
7. O backend retorna uma resposta HTTP em JSON.
8. O frontend utiliza a resposta para atualizar a interface.

### Fluxo de comunicação

```text
Frontend
   |
   | Requisição HTTP
   v
Rota do Express
   |
   | Middleware de autenticação
   v
Controller
   |
   | Chamada da função
   v
Model
   |
   | Consulta SQL
   v
Banco de dados MySQL
   |
   | Resultado
   v
Controller
   |
   | Resposta JSON
   v
Frontend
```

## 3. Organização da aplicação

O backend utiliza uma organização em camadas. Cada parte possui uma responsabilidade.

### Config

Contém configurações utilizadas pela aplicação, como a conexão com o banco de dados.

O arquivo `config/database.js` é utilizado pelos models para executar consultas SQL no MySQL.

### Routes

As rotas definem os endereços da API, os métodos HTTP e qual controller deve atender cada requisição.

| Método | Finalidade |
|---|---|
| GET | Consultar ou listar dados |
| POST | Criar ou enviar dados |
| PUT | Atualizar um recurso |
| PATCH | Atualizar parcialmente um recurso |
| DELETE | Excluir um recurso |

### Controllers

Os controllers recebem as requisições, acessam os parâmetros, validam os dados de entrada, chamam os models e montam as respostas HTTP.

Por exemplo, o controller de estabelecimentos valida os campos enviados no cadastro e na edição antes de chamar as funções do model.

### Models

Os models concentram as operações de acesso ao banco de dados. É nessa camada que ficam as consultas SQL para cadastrar, listar, atualizar e excluir informações.

Exemplo: `estabelecimentoModel.js` contém funções para listar estabelecimentos, cadastrar, editar, excluir, consultar aprovados e atualizar o status.

### Middlewares

Os middlewares são funções executadas durante o processamento de uma requisição. No projeto, são utilizados para verificar a autenticação e restringir o acesso a determinadas rotas.

## 4. Banco de dados

O projeto utiliza o MySQL como banco de dados relacional.

Entre as tabelas utilizadas pelo sistema estão:

| Tabela | Responsabilidade |
|---|---|
| `usuarios` | Armazenar os dados das contas dos usuários |
| `estabelecimentos` | Armazenar os estabelecimentos cadastrados no ComêMaps |
| `categorias` | Armazenar as categorias disponíveis |
| `estabelecimento_categorias` | Relacionar estabelecimentos às categorias |
| `favoritos` | Relacionar usuários aos estabelecimentos favoritados |
| `google_places_cache` | Armazenar os dados em cache dos locais obtidos pelo Google Places |

A tabela `estabelecimento_categorias` representa o relacionamento entre estabelecimentos e categorias.

A tabela `favoritos` permite armazenar favoritos de duas origens:

- Estabelecimentos cadastrados diretamente no ComêMaps, identificados por `estabelecimento_id`.
- Estabelecimentos encontrados pelo Google Places, identificados por `google_place_id`.

Cada favorito deve corresponder a uma dessas duas origens.

## 5. Autenticação e autorização

O sistema utiliza JWT para identificar os usuários autenticados.

### Como funciona o login

1. O usuário envia suas credenciais para `POST /usuarios/login`.
2. O backend verifica os dados da conta.
3. Quando as credenciais são válidas, o backend retorna um token JWT e os dados do usuário.
4. O frontend armazena o token.
5. Nas próximas requisições protegidas, o frontend envia o token no cabeçalho `Authorization`.

Formato do cabeçalho:

```http
Authorization: Bearer <jwt>
```

### Middleware de autenticação

O middleware de autenticação verifica se o cabeçalho foi enviado, valida o token e disponibiliza os dados do usuário autenticado para os controllers.

Se o token estiver ausente ou inválido, a requisição não deve acessar a rota protegida.

### Perfis e permissões

O sistema diferencia usuários comuns e administradores.

- **Usuário autenticado:** pode utilizar funcionalidades que exigem uma conta, como cadastrar estabelecimentos e gerenciar seus favoritos.
- **Administrador:** pode acessar funcionalidades administrativas, como consultar os estabelecimentos cadastrados e analisar solicitações.

Autenticação significa confirmar quem está fazendo a requisição.

Autorização significa verificar se essa pessoa tem permissão para executar a ação.

## 6. Funcionalidades e rotas da API

### 6.1 Usuários

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/usuarios/cadastro` | Público | Cadastrar uma conta |
| POST | `/usuarios/login` | Público | Autenticar um usuário |
| GET | `/usuarios` | Administrador | Listar usuários |
| GET | `/usuarios/:id` | Administrador | Consultar um usuário pelo ID |
| PATCH | `/usuarios/:id/status` | Administrador | Alterar o status de um usuário |
| PATCH | `/usuarios/me` | Autenticado | Atualizar os dados do próprio usuário |

O cadastro cria uma conta. O login verifica as credenciais e retorna o token de autenticação.

A rota `/usuarios/me` permite atualizar os dados do usuário autenticado sem que o frontend precise informar o ID de outra conta.

### 6.2 Estabelecimentos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/estabelecimentos` | Público | Listar estabelecimentos aprovados |
| GET | `/estabelecimentos/:id` | Público | Consultar um estabelecimento aprovado |
| GET | `/estabelecimentos/pendentes` | Administrador | Listar solicitações pendentes |
| GET | `/estabelecimentos/admin` | Administrador | Listar estabelecimentos para a área administrativa |
| GET | `/estabelecimentos/minhas` | Autenticado | Listar solicitações do usuário |
| POST | `/estabelecimentos` | Autenticado | Cadastrar um estabelecimento |
| PUT | `/estabelecimentos/:id` | Conforme regra da rota | Editar um estabelecimento |
| PATCH | `/estabelecimentos/:id/status` | Administrador | Aprovar ou rejeitar um estabelecimento |
| DELETE | `/estabelecimentos/:id` | Conforme regra da rota | Excluir um estabelecimento |

#### Cadastro de estabelecimento

O cadastro recebe informações como:

- Nome;
- Categoria;
- Descrição;
- CEP;
- Endereço;
- Telefone;
- Latitude;
- Longitude.

O controller valida os campos obrigatórios, os limites de tamanho, as coordenadas geográficas e a existência de uma categoria ativa. Depois, chama o model para salvar os dados.

O cadastro é realizado com uma transação no banco de dados: primeiro é inserido o estabelecimento e depois seu relacionamento com a categoria.

Se ocorrer um erro durante a operação, a transação pode ser desfeita para evitar que apenas parte dos dados seja gravada.

#### Status dos estabelecimentos

O fluxo de aprovação utiliza os seguintes estados:

| Status no banco | Significado |
|---|---|
| `PENDING` | Aguardando análise |
| `APPROVED` | Aprovado |
| `REJECTED` | Rejeitado |

Um estabelecimento enviado por um usuário precisa passar pela análise administrativa antes de aparecer na listagem pública.

Quando um estabelecimento aprovado é editado, sua implementação atualizada retorna o status para `PENDING` e limpa o campo `aprovado_por`.

Dessa forma, as alterações passam por uma nova análise antes de o local voltar a aparecer como aprovado.

### 6.3 Categorias

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/categorias` | Público | Listar categorias disponíveis |

As categorias são utilizadas no cadastro, na edição e na filtragem dos estabelecimentos.

### 6.4 Favoritos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/favoritos` | Autenticado | Listar favoritos do usuário |
| POST | `/favoritos` | Autenticado | Adicionar um favorito |
| DELETE | `/favoritos/:estabelecimentoId` | Autenticado | Remover favorito do ComêMaps |
| DELETE | `/favoritos/google/:googlePlaceId` | Autenticado | Remover favorito do Google Places |

O backend permite favoritar estabelecimentos de duas origens: os cadastrados no próprio ComêMaps e os obtidos pelo Google Places.

Para um estabelecimento do ComêMaps, o frontend envia `estabelecimento_id`.

Para um local do Google, envia `google_place_id`.

O model utiliza consultas diferentes para relacionar cada tipo de favorito aos seus dados:

- ComêMaps: informações obtidas da tabela `estabelecimentos`.
- Google Places: informações obtidas da tabela `google_places_cache`.

### 6.5 Recuperação de senha

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/recuperacao-senha/solicitar` | Público | Solicitar recuperação de senha |
| POST | `/recuperacao-senha/redefinir` | Público, com token de recuperação | Redefinir a senha |

A primeira rota inicia o processo de recuperação. A segunda recebe o token de recuperação e a nova senha.

Formato esperado para redefinir a senha:

```json
{
  "token": "token-do-email",
  "novaSenha": "NovaSenha123!"
}
```

O token utilizado nessa operação é o token específico de recuperação enviado ao usuário, não o token JWT usado para autenticação normal.

## 7. Integração com Google Places

Além dos estabelecimentos cadastrados pelos usuários, o ComêMaps apresenta locais encontrados pelo Google Places.

O backend é responsável por consultar a API externa e armazenar os resultados em uma tabela de cache chamada `google_places_cache`.

### O que é cache?

Cache é uma forma de armazenar temporariamente dados que vieram de outra fonte.

Assim, o sistema pode reutilizar informações já consultadas sem precisar fazer uma nova chamada externa a cada acesso.

No projeto, os dados armazenados incluem:

- ID original do local no Google;
- Nome;
- Categoria;
- Endereço;
- Latitude;
- Longitude;
- Fonte dos dados;
- Data de atualização.

O backend disponibiliza a listagem dos locais armazenados em cache para o frontend.

Também existe uma operação administrativa para atualizar os dados consultando novamente o Google Places, respeitando o intervalo de atualização configurado no projeto.

A identificação dos locais do Google utiliza o prefixo `google-` em alguns pontos da aplicação para diferenciá-los dos IDs numéricos dos estabelecimentos do ComêMaps.

Ao salvar favoritos, deve ser utilizado o ID original do Google, correspondente ao campo `place_id` da tabela de cache.

## 8. Validação e tratamento de erros

O backend valida os dados recebidos antes de realizar operações no banco.

Exemplos de validações utilizadas:

- Verificação de campos obrigatórios;
- Verificação do tipo dos dados;
- Limite de caracteres;
- Validação de IDs numéricos;
- Validação de latitude e longitude;
- Verificação da existência e da situação da categoria;
- Verificação de autenticação e permissão.

As respostas da API utilizam códigos HTTP para indicar o resultado da operação.

| Código | Significado |
|---|---|
| `200` | Requisição realizada com sucesso |
| `201` | Recurso criado com sucesso |
| `400` | Dados enviados inválidos |
| `401` | Usuário não autenticado |
| `403` | Acesso não permitido |
| `404` | Recurso não encontrado |
| `409` | Conflito, como um favorito já existente |
| `500` | Erro interno do servidor |

As mensagens de erro são normalmente retornadas em JSON, por exemplo:

```json
{
  "mensagem": "Descrição do erro."
}
```

## 9. Transações no banco de dados

Algumas operações utilizam transações SQL, especialmente quando envolvem alterações em mais de uma tabela.

Uma transação agrupa várias operações para que sejam confirmadas em conjunto.

No cadastro de um estabelecimento, por exemplo:

1. Inicia-se a transação.
2. O estabelecimento é inserido na tabela `estabelecimentos`.
3. A categoria é associada na tabela `estabelecimento_categorias`.
4. Se tudo ocorrer corretamente, a transação é confirmada com `COMMIT`.
5. Se ocorrer um erro, a transação é desfeita com `ROLLBACK`.

Isso evita que o banco fique com dados incompletos quando uma etapa da operação falha.

## 10. Como executar o backend localmente

1. Abra o terminal na pasta do backend.
2. Instale as dependências, caso ainda não estejam instaladas:

```bash
npm install
```

3. Configure as variáveis de ambiente utilizadas pelo projeto, incluindo os dados de conexão com o MySQL e as credenciais necessárias para integrações externas.
4. Certifique-se de que o MySQL esteja em execução e que o banco `comemaps` esteja configurado.
5. Inicie o servidor utilizando o script definido no `package.json`.

O backend deve ficar disponível em:

```text
http://localhost:3001
```

A API utilizada pelo frontend fica em:

```text
http://localhost:3001/api
```

## 11. Resumo

O backend do ComêMaps funciona como a camada responsável pelas regras e pelo gerenciamento dos dados da aplicação.

Suas principais responsabilidades são:

- Gerenciar cadastro, login e autenticação dos usuários;
- Controlar permissões de usuários e administradores;
- Cadastrar, consultar, editar, aprovar, rejeitar e excluir estabelecimentos;
- Gerenciar categorias;
- Armazenar e consultar favoritos do ComêMaps e do Google Places;
- Integrar os dados externos do Google Places;
- Realizar recuperação de senha;
- Validar informações e proteger as operações do banco de dados.

Com essa separação, o frontend fica responsável pela interface e pela interação com o usuário, enquanto o backend concentra o acesso aos dados, as validações e as regras de funcionamento do ComêMaps.

---

**Observação:** esta documentação descreve a arquitetura e as funcionalidades conhecidas da implementação do projeto. Para conferir nomes exatos de scripts, variáveis de ambiente, middlewares e todas as rotas registradas, consulte os arquivos atuais do backend.
