
const { rateLimit } = require("express-rate-limit");

const limitarRecuperacao = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 5, // Máximo de 5 requisições por IP
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        mensagem: "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente."
    }
});

module.exports = limitarRecuperacao;
