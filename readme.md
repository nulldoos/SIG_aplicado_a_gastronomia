# 🍽️ ComêMaps

O **ComêMaps** é uma aplicação web desenvolvida com o objetivo de facilitar a descoberta de estabelecimentos gastronômicos. A plataforma permite que os usuários explorem restaurantes e outros locais para alimentação por meio de um mapa interativo, pesquisem estabelecimentos, filtrem opções e salvem seus lugares favoritos.

O sistema também permite o cadastro de novos estabelecimentos pelos usuários, que passam por uma análise administrativa antes de serem disponibilizados no mapa.

## 📌 Objetivo do projeto

Desenvolver uma plataforma que reúna informações sobre estabelecimentos gastronômicos em um único ambiente, facilitando a busca por lugares para comer e incentivando o compartilhamento de informações entre os usuários.

## ✨ Funcionalidades

### Para usuários
- Cadastro e login na plataforma.
- Recuperação de senha.
- Visualização de estabelecimentos em um mapa interativo.
- Pesquisa de estabelecimentos por nome.
- Filtro por categorias gastronômicas.
- Visualização de informações dos estabelecimentos.
- Cadastro de novos estabelecimentos.
- Edição das próprias solicitações, conforme as regras do sistema.
- Adição e remoção de estabelecimentos dos favoritos.
- Visualização dos estabelecimentos favoritos.
- Gerenciamento das informações da própria conta.

### Para administradores
- Visualização dos estabelecimentos cadastrados.
- Análise de estabelecimentos pendentes.
- Aprovação ou rejeição de solicitações.
- Edição e exclusão de estabelecimentos.
- Gerenciamento dos usuários.
- Controle das informações disponibilizadas na plataforma.

## 🗺️ Integração com mapas

O ComêMaps utiliza tecnologias de mapas para apresentar os estabelecimentos geograficamente.

- **Leaflet:** biblioteca JavaScript utilizada para construir e controlar o mapa interativo.
- **OpenStreetMap:** fonte de dados cartográficos utilizada na exibição do mapa.
- **Google Places API:** utilizada para buscar estabelecimentos externos e complementar as informações disponíveis na plataforma.

Os estabelecimentos encontrados pelo Google Places são identificados separadamente dos estabelecimentos cadastrados diretamente no ComêMaps.

## 🛠️ Tecnologias utilizadas

### Frontend
- React
- JavaScript
- Vite
- Leaflet
- React Leaflet
- CSS

### Backend
- Node.js
- Express.js
- JavaScript
- JSON Web Token (JWT)
- bcryptjs

### Banco de dados
- MySQL

### APIs e serviços externos
- Google Places API
- OpenStreetMap

### Ferramentas de desenvolvimento
- Visual Studio Code
- Git e GitHub
- Insomnia

## 🏗️ Arquitetura do projeto

O projeto utiliza uma arquitetura separada entre frontend e backend.

- **Frontend:** responsável pela interface, navegação e interação com o usuário.
- **Backend:** responsável pelas regras de negócio, autenticação, validações e comunicação com o banco de dados.
- **Banco de dados:** responsável pelo armazenamento das informações dos usuários, estabelecimentos, categorias e favoritos.

O frontend realiza requisições HTTP para a API do backend, que processa as solicitações e retorna os dados em formato JSON.

## 📂 Estrutura do projeto

A estrutura pode variar conforme a organização atual dos arquivos, mas o projeto é dividido em duas partes principais:

```text
comemaps/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   └── ...
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── ...
│   ├── app.js
│   └── package.json
│
└── README.md
```

## ⚙️ Como executar o projeto

### 1. Pré-requisitos

Antes de iniciar, é necessário ter instalado:

- Node.js
- npm
- MySQL
- Git

### 2. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Acesse a pasta do projeto:

```bash
cd comemaps
```

### 3. Configurar o banco de dados

Crie o banco de dados MySQL com o nome:

```sql
CREATE DATABASE comemaps;
```

Execute os scripts SQL do projeto para criar as tabelas e configurar a estrutura do banco de dados.

### 4. Configurar o backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente no arquivo `.env`:

```env
PORT=3001

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=comemaps
DB_PORT=3306

JWT_SECRET=sua_chave_secreta
```

Também configure as demais variáveis exigidas pelas integrações externas, como a chave da Google Places API, caso necessário.

Inicie o servidor utilizando o script configurado no `package.json`:

```bash
npm start
```

### 5. Configurar o frontend

Abra outro terminal e acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

Inicie a aplicação:

```bash
npm run dev
```

Após iniciar, acesse o endereço disponibilizado pelo Vite no terminal, geralmente:

```text
http://localhost:5173
```

## 🔐 Autenticação e segurança

O sistema utiliza autenticação baseada em JWT (JSON Web Token).

Após realizar o login, o usuário recebe um token que é utilizado nas requisições que exigem autenticação.

As senhas são armazenadas de forma protegida por meio de hash, utilizando bcryptjs.

O sistema também possui controle de acesso por perfil, diferenciando usuários comuns e administradores.

## 🗄️ Banco de dados

O banco de dados MySQL armazena as principais informações utilizadas pela aplicação, incluindo:

- **usuarios:** informações e dados de acesso dos usuários.
- **estabelecimentos:** estabelecimentos cadastrados na plataforma.
- **categorias:** categorias gastronômicas.
- **estabelecimento_categorias:** relacionamento entre estabelecimentos e categorias.
- **favoritos:** estabelecimentos salvos pelos usuários.
- **google_places_cache:** informações de estabelecimentos obtidas por meio do Google Places.

## 👩‍💻 Desenvolvimento

O projeto está sendo desenvolvido como parte de um trabalho acadêmico da graduação em Sistemas de Informação da Universidade Federal de Mato Grosso do Sul (UFMS).

A proposta é integrar desenvolvimento web, banco de dados, APIs e tecnologias de geolocalização para construir uma solução que facilite a descoberta de estabelecimentos gastronômicos.

---

**ComêMaps — Descubra novos lugares, encontre sabores e explore a gastronomia!**