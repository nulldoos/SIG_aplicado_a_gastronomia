
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "ComêMaps API",
            version: "1.0.0",
            description: "Documentação da API do sistema ComêMaps.",
        },

        servers: [
            {
                url: "http://localhost:3001/api",
                description: "Servidor local",
            },
        ],

        tags: [
            { name: "Usuários", description: "Operações relacionadas aos usuários" },
            { name: "Autenticação", description: "Login e autenticação" },
            { name: "Recuperação de senha", description: "Recuperação e redefinição de senha" },
            { name: "Estabelecimentos", description: "Gerenciamento de estabelecimentos" },
            { name: "Categorias", description: "Consulta de categorias gastronômicas" },
            { name: "Favoritos", description: "Gerenciamento de favoritos" },
            { name: "Google Places", description: "Busca de estabelecimentos externos" },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },

    apis: [
        path.join(__dirname, "../routers/**/*.js"),
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
