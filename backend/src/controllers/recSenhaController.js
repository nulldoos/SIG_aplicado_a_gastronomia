
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const usuarioModel = require("../models/usuarioModel");
const recuperacaoSenhaModel = require("../models/recSenhaModel");
const emailService = require("../services/emailService");

async function solicitarRecuperacao(req, res) {
    try {
        const { email } = req.body || {};

        if (!email || typeof email !== "string") {
            return res.status(400).json({
                mensagem: "Informe um e-mail válido."
            });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const usuario = await usuarioModel.buscarPorEmail(emailNormalizado);

        if (!usuario || !usuario.ativo) {
            return res.status(200).json({
                mensagem: "Se o e-mail estiver cadastrado, você receberá as instruções de recuperação."
            });
        }

        const token = crypto.randomBytes(32).toString("hex");

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const expiraEm = new Date(Date.now() + 30 * 60 * 1000);

        await recuperacaoSenhaModel.salvarToken(
            usuario.id,
            tokenHash,
            expiraEm
        );

        const linkRecuperacao =
            `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;

        await emailService.enviarEmailRecuperacao(
            usuario.email,
            linkRecuperacao
        );

        return res.status(200).json({
            mensagem: "Se o e-mail estiver cadastrado, você receberá as instruções de recuperação."
        });

    } catch (erro) {
        console.error("Erro ao solicitar recuperação:", erro);

        return res.status(500).json({
            mensagem: "Não foi possível processar a solicitação."
        });
    }
}

async function redefinirSenha(req, res) {
    try {
        const { token, novaSenha } = req.body || {};

        if (
            typeof token !== "string" ||
            !/^[a-f0-9]{64}$/i.test(token) ||
            typeof novaSenha !== "string"
        ) {
            return res.status(400).json({
                mensagem: "Informe um token e uma nova senha válidos."
            });
        }

        if (
            Buffer.byteLength(novaSenha, "utf8") < 8 ||
            Buffer.byteLength(novaSenha, "utf8") > 72
        ) {
            return res.status(400).json({
                mensagem: "A senha deve ter entre 8 e 72 bytes."
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const senhaHash = await bcrypt.hash(novaSenha, 10);

        const atualizado = await recuperacaoSenhaModel.redefinirSenhaComToken(
            tokenHash,
            senhaHash
        );

        if (!atualizado) {
            return res.status(400).json({
                mensagem: "Token inválido ou expirado."
            });
        }

        return res.status(200).json({
            mensagem: "Senha redefinida com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao redefinir senha:", erro);

        return res.status(500).json({
            mensagem: "Não foi possível redefinir a senha."
        });
    }
}

module.exports = {
    solicitarRecuperacao,
    redefinirSenha
};
