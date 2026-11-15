
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

async function enviarEmailRecuperacao(destinatario, linkRecuperacao) {
    await transporter.sendMail({
        from: `"ComêMaps" <${process.env.SMTP_USER}>`,
        to: destinatario,
        subject: "Recuperação de senha - ComêMaps",

        html: `
            <h2>Recuperação de senha</h2>

            <p>Recebemos uma solicitação para redefinir sua senha no ComêMaps.</p>

            <p>Clique no botão abaixo para cadastrar uma nova senha:</p>

            <a href="${linkRecuperacao}"
               style="
                   display: inline-block;
                   padding: 12px 20px;
                   background-color: #2563eb;
                   color: white;
                   text-decoration: none;
                   border-radius: 5px;
               ">
                Redefinir senha
            </a>

            <p>Este link possui validade de 30 minutos.</p>

            <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
        `
    });
}

async function verificarConexaoEmail() {
    try {
        await transporter.verify();

        console.log("Conexão SMTP estabelecida com sucesso!");
        return true;

    } catch (erro) {
        console.error("Erro na conexão SMTP:", erro.message);
        return false;
    }
}


module.exports = {
    enviarEmailRecuperacao,
    verificarConexaoEmail
};
