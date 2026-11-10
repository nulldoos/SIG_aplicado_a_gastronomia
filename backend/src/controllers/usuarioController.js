
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuarioModel");

// validar formato de e-mail
function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// cadastrar usuário
async function cadastrarUsuario(req, res) {
    try {
        const { nome, email, senha } = req.body || {};

        // validar campos
        if (
            typeof nome !== "string" ||
            typeof email !== "string" ||
            typeof senha !== "string" ||
            !nome.trim() ||
            !email.trim() ||
            !senha
        ) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos corretamente."
            });
        }

        const nomeFormatado = nome.trim();
        const emailFormatado = email.trim().toLowerCase();

        // validar nome
        if (nomeFormatado.length > 100) {
            return res.status(400).json({
                mensagem: "O nome deve ter no máximo 100 caracteres."
            });
        }

        // validar e-mail
        if (
            emailFormatado.length > 150 ||
            !emailValido(emailFormatado)
        ) {
            return res.status(400).json({
                mensagem: "Informe um e-mail válido."
            });
        }

        // validar senha
        if (
            senha.length < 8 ||
            Buffer.byteLength(senha, "utf8") > 72
        ) {
            return res.status(400).json({
                mensagem: "A senha deve ter pelo menos 8 caracteres e no máximo 72 bytes."
            });
        }

        // verificar e-mail duplicado
        const usuarioExistente =
            await usuarioModel.buscarPorEmail(emailFormatado);

        if (usuarioExistente) {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        // criptografar senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // cadastrar usuário
        const usuarioId = await usuarioModel.cadastrarUsuario({
            nome: nomeFormatado,
            email: emailFormatado,
            senha_hash: senhaHash
        });

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso!",
            usuario: {
                id: usuarioId,
                nome: nomeFormatado,
                email: emailFormatado,
                tipo: "USER"
            }
        });

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);

        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado."
            });
        }

        return res.status(500).json({
            mensagem: "Erro ao cadastrar usuário."
        });
    }
}

// login de usuário
async function loginUsuario(req, res) {
    try {
        const { email, senha } = req.body || {};

        // validar campos
        if (
            typeof email !== "string" ||
            typeof senha !== "string" ||
            !email.trim() ||
            !senha
        ) {
            return res.status(400).json({
                mensagem: "Informe um e-mail e uma senha válidos."
            });
        }

        const emailFormatado = email.trim().toLowerCase();

        if (
            emailFormatado.length > 150 ||
            !emailValido(emailFormatado) ||
            Buffer.byteLength(senha, "utf8") > 72
        ) {
            return res.status(400).json({
                mensagem: "Informe um e-mail e uma senha válidos."
            });
        }

        // buscar usuário pelo e-mail
        const usuario = await usuarioModel.buscarPorEmail(emailFormatado);

        if (!usuario) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        // verificar se o usuário está ativo
        if (!Boolean(usuario.ativo)) {
            return res.status(403).json({
                mensagem: "Usuário desativado."
            });
        }

        // comparar senha com o hash
        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha_hash
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        // verificar configuração do jwt
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET não configurado.");

            return res.status(500).json({
                mensagem: "Erro interno de configuração."
            });
        }

        // gerar token jwt
        const token = jwt.sign(
            {
                id: usuario.id,
                tipo: usuario.tipo
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });

    } catch (erro) {
        console.error("Erro ao realizar login:", erro);

        return res.status(500).json({
            mensagem: "Erro ao realizar login."
        });
    }
}

// listar usuários
async function listarUsuarios(req, res) {
    try {
        const usuarios = await usuarioModel.listarTodos();

        return res.status(200).json(usuarios);

    } catch (erro) {
        console.error("Erro ao listar usuários:", erro);

        return res.status(500).json({
            mensagem: "Erro ao listar usuários."
        });
    }
}

// buscar usuário por id
async function buscarUsuario(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID do usuário inválido."
            });
        }

        const usuario = await usuarioModel.buscarPorId(id);

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        return res.status(200).json(usuario);

    } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar usuário."
        });
    }
}

// ativar ou desativar usuário
async function atualizarStatusUsuario(req, res) {
    try {
        const id = Number(req.params.id);
        const { ativo } = req.body || {};

        // validar id
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID do usuário inválido."
            });
        }

        // validar status
        if (typeof ativo !== "boolean") {
            return res.status(400).json({
                mensagem: "Informe ativo como true ou false."
            });
        }

        // impedir que o administrador desative a própria conta
        if (id === req.usuario.id && ativo === false) {
            return res.status(400).json({
                mensagem: "Você não pode desativar sua própria conta."
            });
        }

        // buscar usuário
        const usuario = await usuarioModel.buscarPorId(id);

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        // impedir desativação do último administrador ativo
        if (usuario.tipo === "ADMIN" && ativo === false) {
            const usuarios = await usuarioModel.listarTodos();

            const administradoresAtivos = usuarios.filter(
                (u) => u.tipo === "ADMIN" && Boolean(u.ativo)
            );

            if (administradoresAtivos.length <= 1) {
                return res.status(400).json({
                    mensagem: "Não é possível desativar o último administrador ativo."
                });
            }
        }

        // verificar se o usuário já está nessa situação
        if (Boolean(usuario.ativo) === ativo) {
            return res.status(200).json({
                mensagem: "A conta já está nessa situação."
            });
        }

        // atualizar status
        await usuarioModel.atualizarAtivo(id, ativo);

        return res.status(200).json({
            mensagem: ativo
                ? "Usuário ativado com sucesso."
                : "Usuário desativado com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao atualizar usuário:", erro);

        return res.status(500).json({
            mensagem: "Erro ao atualizar usuário."
        });
    }
}

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    listarUsuarios,
    buscarUsuario,
    atualizarStatusUsuario
};
