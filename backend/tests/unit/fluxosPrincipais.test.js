process.env.JWT_SECRET = 'ja_fui_fa_da_marvel';

const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = require("../../src/app");
const conexao = require("../../src/config/database");

jest.mock("../../src/config/database", () => ({
    query: jest.fn(),
    getConnection: jest.fn()
}));

describe("Testes de Integração — Fluxos Principais da API ComêMaps", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("Fluxo 1: Cadastro -> Login (JWT) -> Acesso a rota autenticada (/api/favoritos)", async () => {
        // 1. Registo de utilizador (POST /api/usuarios/cadastro)
        conexao.query
            .mockResolvedValueOnce([[]])               // usuarioModel.buscarPorEmail (e-mail disponível)
            .mockResolvedValueOnce([{ insertId: 15 }]); // usuarioModel.cadastrarUsuario

        const resCadastro = await request(app)
            .post("/api/usuarios/cadastro")
            .send({
                nome: "Usuário Teste",
                email: "teste@comemaps.com",
                senha: "SenhaForte@2026"
            });

        expect(resCadastro.status).toBe(201);
        expect(resCadastro.body.usuario.id).toBe(15);

        // 2. Login e emissão de JWT (POST /api/usuarios/login)
        const senhaHash = await bcrypt.hash("SenhaForte@2026", 10);
        conexao.query.mockResolvedValueOnce([
            [
                {
                    id: 15,
                    nome: "Usuário Teste",
                    email: "teste@comemaps.com",
                    senha_hash: senhaHash,
                    tipo: "USER",
                    ativo: 1
                }
            ]
        ]);

        const resLogin = await request(app)
            .post("/api/usuarios/login")
            .send({
                email: "teste@comemaps.com",
                senha: "SenhaForte@2026"
            });

        expect(resLogin.status).toBe(200);
        expect(resLogin.body.token).toBeDefined();

        conexao.query
            // Primeira chamada: middleware autenticarUsuario -> usuarioModel.buscarPorId(15)
            .mockResolvedValueOnce([
                [
                    {
                        id: 15,
                        nome: "Usuário Teste",
                        email: "teste@comemaps.com",
                        tipo: "USER",
                        ativo: 1
                    }
                ]
            ])
            .mockResolvedValueOnce([
                [{ id: 7, nome: "Peixaria do Porto", status: "APPROVED" }]
            ]);

        const resFavoritos = await request(app)
            .get("/api/favoritos")
            .set("Authorization", `Bearer ${resLogin.body.token}`);

        expect(resFavoritos.status).toBe(200);
        expect(resFavoritos.body).toHaveLength(1);
    });

    test("Fluxo 2: Moderação de estabelecimento (Cadastro -> Aprovação ADMIN -> Listagem pública)", async () => {
        const tokenUser = jwt.sign({ id: 10, tipo: "USER" }, process.env.JWT_SECRET);
        const tokenAdmin = jwt.sign({ id: 1, tipo: "ADMIN" }, process.env.JWT_SECRET);

        const mockTransacao = {
            beginTransaction: jest.fn(),
            query: jest.fn()
                .mockResolvedValueOnce([{ insertId: 30 }])    // INSERT estabelecimentos
                .mockResolvedValueOnce([{ affectedRows: 1 }]), // INSERT estabelecimento_categorias
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn()
        };
        conexao.getConnection.mockResolvedValueOnce(mockTransacao);

        conexao.query
            // Middleware autenticarUsuario -> usuarioModel.buscarPorId(10)
            .mockResolvedValueOnce([
                [{ id: 10, nome: "Utilizador Comum", email: "user@comemaps.com", tipo: "USER", ativo: 1 }]
            ])
            // Controller -> categoriaModel.listarAtivas()
            .mockResolvedValueOnce([[{ id: 2, nome: "Regionais" }]]);

        const resCadastro = await request(app)
            .post("/api/estabelecimentos")
            .set("Authorization", `Bearer ${tokenUser}`)
            .send({
                nome: "Casa do Pacu",
                endereco: "Rua Cabral, 320",
                latitude: -19.009,
                longitude: -57.653,
                categoria_id: 2
            });

        expect(resCadastro.status).toBe(201);
        expect(resCadastro.body.id).toBe(30);

        // adm aprova estabelecimento
        conexao.query
            .mockResolvedValueOnce([
                [{ id: 1, nome: "Administrador", email: "admin@comemaps.com", tipo: "ADMIN", ativo: 1 }]
            ])
            .mockResolvedValueOnce([{ affectedRows: 1 }]);

        const resAprovacao = await request(app)
            .patch("/api/estabelecimentos/30/status")
            .set("Authorization", `Bearer ${tokenAdmin}`)
            .send({ status: "APPROVED" });

        expect(resAprovacao.status).toBe(200);

        // listagem pública retorna o estabelecimento aprovado (GET /api/estabelecimentos)
        conexao.query.mockResolvedValueOnce([
            [{ id: 30, nome: "Casa do Pacu", status: "APPROVED", categorias: "Regionais" }]
        ]);

        const resPublica = await request(app).get("/api/estabelecimentos");

        expect(resPublica.status).toBe(200);
        expect(resPublica.body[0].nome).toBe("Casa do Pacu");
    });

    test("Fluxo 3: Middlewares globais do app.js (404 para rota inexistente e 500 para erro interno)", async () => {
        const res404 = await request(app).get("/api/endpoint-inexistente");
        expect(res404.status).toBe(404);
        expect(res404.body).toEqual({ mensagem: "Rota não encontrada." });

        conexao.query.mockRejectedValueOnce(new Error("Falha inesperada de conexão"));
        const res500 = await request(app).get("/api/categorias");
        expect(res500.status).toBe(500);
        expect(res500.body).toEqual({ mensagem: "Erro ao listar categorias." });
    });
});