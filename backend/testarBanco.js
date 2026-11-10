require("dotenv").config();

const conexao = require("./src/config/database");

async function testarConexao() {
    try {
        const [resultado] = await conexao.query(
            "SELECT DATABASE() AS banco"
        );

        console.log("Conexão realizada com sucesso!");
        console.log("Banco conectado:", resultado[0].banco);

    } catch (erro) {
        console.error("Erro ao conectar com MySQL:", erro.message);

    } finally {
        await conexao.end();
    }
}

testarConexao();