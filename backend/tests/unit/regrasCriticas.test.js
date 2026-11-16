const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const conexao = require("../../src/config/database");
const estabelecimentoModel = require("../../src/models/estabelecimentoModel");
const recSenhaModel = require("../../src/models/recSenhaModel");
const categoriaModel = require("../../src/models/categoriaModel");
const usuarioModel = require("../../src/models/usuarioModel");
const emailService = require("../../src/services/emailService");

const usuarioController = require("../../src/controllers/usuarioController");
const recSenhaController = require("../../src/controllers/recSenhaController");
const estabelecimentoController = require("../../src/controllers/estabelecimentoController");

jest.mock("../../src/config/database", () => ({
    query: jest.fn(),
    getConnection: jest.fn()
}));

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../src/services/emailService");

function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("Testes Unitários — Transações Críticas (Models)", () => {
    let mockTransacao;

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransacao = {
            beginTransaction: jest.fn(),
            query: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn()
        };
        conexao.getConnection.mockResolvedValue(mockTransacao);
    });

    test("estabelecimentoModel.cadastrarEstabelecimento deve dar rollback se falhar ao vincular categoria", async () => {
        mockTransacao.query
            .mockResolvedValueOnce([{ insertId: 10 }])
            .mockRejectedValueOnce(new Error("Erro de FK na categoria"));

        await expect(
            estabelecimentoModel.cadastrarEstabelecimento({
                nome: "Restaurante Teste",
                endereco: "Rua Frei Mariano, 100",
                latitude: -19.008,
                longitude: -57.651,
                categoria_id: 99,
                criado_por: 1
            })
        ).rejects.toThrow("Erro de FK na categoria");

        expect(mockTransacao.beginTransaction).toHaveBeenCalledTimes(1);
        expect(mockTransacao.rollback).toHaveBeenCalledTimes(1);
        expect(mockTransacao.commit).not.toHaveBeenCalled();
        expect(mockTransacao.release).toHaveBeenCalledTimes(1);
    });

    test("estabelecimentoModel.atualizarEstabelecimento deve dar rollback e retornar false se ID não existir", async () => {
        mockTransacao.query.mockResolvedValueOnce([[]]);

        const resultado = await estabelecimentoModel.atualizarEstabelecimento(999, {
            nome: "Novo Nome",
            endereco: "Rua Principal, 200",
            latitude: -19.01,
            longitude: -57.65,
            categoria_id: 1
        });

        expect(resultado).toBe(false);
        expect(mockTransacao.rollback).toHaveBeenCalledTimes(1);
        expect(mockTransacao.release).toHaveBeenCalledTimes(1);
    });

    test("recSenhaModel.redefinirSenhaComToken deve atualizar senha, invalidar token e dar commit", async () => {
        mockTransacao.query
            .mockResolvedValueOnce([[{ id: 5, usuario_id: 12 }]]) // SELECT ... FOR UPDATE
            .mockResolvedValueOnce([{ affectedRows: 1 }])         // UPDATE usuarios
            .mockResolvedValueOnce([{ affectedRows: 1 }]);        // DELETE recuperacao_senhas

        const sucesso = await recSenhaModel.redefinirSenhaComToken("hash_valido", "nova_senha_hash");

        expect(sucesso).toBe(true);
        expect(mockTransacao.commit).toHaveBeenCalledTimes(1);
        expect(mockTransacao.release).toHaveBeenCalledTimes(1);
    });

    test("recSenhaModel.redefinirSenhaComToken deve dar rollback se token estiver expirado", async () => {
        mockTransacao.query.mockResolvedValueOnce([[]]);

        const sucesso = await recSenhaModel.redefinirSenhaComToken("hash_expirado", "nova_senha_hash");

        expect(sucesso).toBe(false);
        expect(mockTransacao.rollback).toHaveBeenCalledTimes(1);
        expect(mockTransacao.release).toHaveBeenCalledTimes(1);
    });
});

describe("Testes Unitários — Segurança, Permissões e Validações (Controllers)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "segredo_teste_comemaps";
        process.env.FRONTEND_URL = "http://localhost:5173";
    });

    test("loginUsuario deve bloquear conta desativada com status 403", async () => {
        jest.spyOn(usuarioModel, "buscarPorEmail").mockResolvedValueOnce({
            id: 2,
            email: "bloqueado@teste.com",
            senha_hash: "hash",
            ativo: 0
        });

        const req = { body: { email: "bloqueado@teste.com", senha: "SenhaValida123" } };
        const res = mockResponse();

        await usuarioController.loginUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ mensagem: "Usuário desativado." });
    });

    test("atualizarStatusUsuario deve impedir que o admin desative a própria conta", async () => {
        const req = {
            params: { id: "1" },
            body: { ativo: false },
            usuario: { id: 1, tipo: "ADMIN" }
        };
        const res = mockResponse();

        await usuarioController.atualizarStatusUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            mensagem: "Você não pode desativar sua própria conta."
        });
    });

    test("atualizarStatusUsuario deve impedir desativação do último administrador ativo", async () => {
        jest.spyOn(usuarioModel, "buscarPorId").mockResolvedValueOnce({
            id: 2,
            tipo: "ADMIN",
            ativo: 1
        });
        jest.spyOn(usuarioModel, "listarTodos").mockResolvedValueOnce([
            { id: 2, tipo: "ADMIN", ativo: 1 },
            { id: 3, tipo: "USER", ativo: 1 }
        ]);

        const req = {
            params: { id: "2" },
            body: { ativo: false },
            usuario: { id: 1, tipo: "ADMIN" }
        };
        const res = mockResponse();

        await usuarioController.atualizarStatusUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            mensagem: "Não é possível desativar o último administrador ativo."
        });
    });

    test("solicitarRecuperacao deve retornar 200 sem disparar e-mail quando conta não existir", async () => {
        jest.spyOn(usuarioModel, "buscarPorEmail").mockResolvedValueOnce(null);
        const spySalvarToken = jest.spyOn(recSenhaModel, "salvarToken");

        const req = { body: { email: "inexistente@teste.com" } };
        const res = mockResponse();

        await recSenhaController.solicitarRecuperacao(req, res);

        expect(spySalvarToken).not.toHaveBeenCalled();
        expect(emailService.enviarEmailRecuperacao).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test("redefinirSenha deve rejeitar senha que ultrapasse 72 bytes (limite do bcrypt)", async () => {
        const req = {
            body: {
                token: "a".repeat(64),
                novaSenha: "S".repeat(73)
            }
        };
        const res = mockResponse();

        await recSenhaController.redefinirSenha(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            mensagem: "A senha deve ter entre 8 e 72 bytes."
        });
    });

    test("cadastrarEstabelecimento deve rejeitar coordenadas fora da faixa geográfica ou categoria inativa", async () => {
        const resCoord = mockResponse();
        await estabelecimentoController.cadastrarEstabelecimento(
            {
                usuario: { id: 1 },
                body: {
                    nome: "Local Inválido",
                    endereco: "Rua A, 1",
                    latitude: -91,
                    longitude: -57.6,
                    categoria_id: 1
                }
            },
            resCoord
        );
        expect(resCoord.status).toHaveBeenCalledWith(400);

        jest.spyOn(categoriaModel, "listarAtivas").mockResolvedValueOnce([{ id: 1, nome: "Lanches" }]);
        const resCat = mockResponse();
        await estabelecimentoController.cadastrarEstabelecimento(
            {
                usuario: { id: 1 },
                body: {
                    nome: "Local Categoria Inativa",
                    endereco: "Rua A, 1",
                    latitude: -19.01,
                    longitude: -57.65,
                    categoria_id: 99
                }
            },
            resCat
        );
        expect(resCat.status).toHaveBeenCalledWith(400);
        expect(resCat.json).toHaveBeenCalledWith({
            mensagem: "Categoria inexistente ou inativa."
        });
    });
});