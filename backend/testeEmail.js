
require("dotenv").config();

const emailService = require("./src/services/emailService");

async function testarEmail() {
    try {
        const linkTeste = "http://localhost:3000/redefinir-senha?token=token-de-teste";

        await emailService.enviarEmailRecuperacao(
            process.env.SMTP_USER,
            linkTeste
        );

        console.log("E-mail de teste enviado com sucesso!");
    } catch (erro) {
        console.error("Erro ao enviar e-mail:", erro.message);
    } finally {
        process.exit(0);
    }
}

testarEmail();
