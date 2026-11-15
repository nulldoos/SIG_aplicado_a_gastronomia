
const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuarioModel");

async function autenticarUsuario(req, res, next) {
    try {
        const cabecalho = req.headers.authorization;

        if (!cabecalho || !cabecalho.startsWith("Bearer ")) {
            return res.status(401).json({
                mensagem: "Token não enviado."
            });
        }

        const token = cabecalho.split(" ")[1];

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET não configurado.");

            return res.status(500).json({
                mensagem: "Erro interno de configuração."
            });
        }

        const dadosUsuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (
            !dadosUsuario ||
            !Number.isInteger(dadosUsuario.id) ||
            dadosUsuario.id <= 0
        ) {
            return res.status(401).json({
                mensagem: "Token inválido."
            });
        }

        // consulta o usuário atualizado no banco
        const usuario = await usuarioModel.buscarPorId(
            dadosUsuario.id
        );

        if (!usuario || !Boolean(usuario.ativo)) {
            return res.status(401).json({
                mensagem: "Usuário inexistente ou desativado."
            });
        }

        // Uutiliza os dados atuais do banco, não os do token
        req.usuario = {
            id: usuario.id,
            tipo: usuario.tipo
        };

        next();

    } catch (erro) {
        if (erro.name === "JsonWebTokenError" ||
            erro.name === "TokenExpiredError") {
            return res.status(401).json({
                mensagem: "Token inválido ou expirado."
            });
        }

        console.error("Erro na autenticação:", erro);

        return res.status(500).json({
            mensagem: "Erro interno ao autenticar usuário."
        });
    }
}

module.exports = autenticarUsuario;
