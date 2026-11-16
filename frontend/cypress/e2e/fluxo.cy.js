describe("E2E ComêMaps — Cadastro de Perfil, Login, Mapa (2 Locais) e Sugestão de Lugar", () => {
  const doisEstabelecimentos = [
    {
      id: 1,
      nome: "Restaurante Porto Geral",
      categorias: "Peixaria",
      descricao: "Peixes típicos do Pantanal",
      endereco: "Rua Manoel Cavassa, 120",
      latitude: -19.0012,
      longitude: -57.6515,
    },
    {
      id: 2,
      nome: "Churrascaria Pantanal",
      categorias: "Churrascaria",
      descricao: "Carnes nobres na brasa",
      endereco: "Rua Frei Mariano, 450",
      latitude: -19.0085,
      longitude: -57.6520,
    },
  ];

  beforeEach(() => {
    cy.intercept("GET", "**/api/categorias*", {
      statusCode: 200,
      body: [
        { id: 1, nome: "Peixaria" },
        { id: 2, nome: "Churrascaria" },
      ],
    }).as("getCategorias");

    cy.intercept("GET", "**/api/estabelecimentos*", {
      statusCode: 200,
      body: doisEstabelecimentos,
    }).as("getEstabelecimentos");

    // Intercepta Google Places retornando vazio para isolar os 2 locais do banco
    cy.intercept("GET", "**/api/google-places*", {
      statusCode: 200,
      body: [],
    }).as("getGooglePlaces");

    cy.intercept("GET", "**/api/favoritos*", {
      statusCode: 200,
      body: [],
    }).as("getFavoritos");

    cy.visit("/");
  });

  it("1. Deve exibir os 2 estabelecimentos na lista e no mapa Leaflet sem exibir 'Sugerir lugar' antes do login", () => {
    cy.wait(["@getEstabelecimentos", "@getCategorias"]);

    // "Sugerir lugar" não deve estar disponível na sidebar se não tiver autenticado
    cy.contains(".nav-item", "Sugerir lugar").should("not.exist");

    cy.contains("h2", "2 lugares para conhecer").should("be.visible");
    cy.get(".place-list .place-card").should("have.length", 2);
    cy.get(".map-canvas .leaflet-container").should("be.visible");
    cy.get(".leaflet-interactive").should("have.length", 2);

    cy.get(".leaflet-interactive").first().click({ force: true });
    cy.get(".leaflet-popup-content")
      .should("be.visible")
      .and("contain", "Restaurante Porto Geral")
      .and("contain", "Peixaria");
  });

  it("2. Deve validar regras de senha no cadastro de usuário e criar nova conta", () => {
    cy.intercept("POST", "**/api/usuarios/cadastro", {
      statusCode: 201,
      body: {
        mensagem: "Usuário cadastrado com sucesso!",
        usuario: { id: 10, nome: "Leone", email: "leone@comemaps.com", tipo: "USER" },
      },
    }).as("postCadastroUsuario");

    // Home -> Entrar -> Criar cadastro
    cy.get(".login-card").click();
    cy.contains("button", "Criar cadastro").click();

    cy.get("#register-name").type("Leone");
    cy.get("#register-email").type("leone@comemaps.com");

    // Digita senha forte atendendo às 4 regras (8+ chars, maiúscula, número, símbolo)
    cy.get("#register-password").type("SenhaForte@2026");
    cy.get(".password-rules li.valid").should("have.length", 4);

    // Testa feedback de divergência e depois confirma corretamente
    cy.get("#register-password-confirmation").type("SenhaErrada@2026").blur();
    cy.get("#password-match-feedback").should("contain", "As senhas precisam ser iguais.");

    cy.get("#register-password-confirmation").clear().type("SenhaForte@2026");
    cy.get("form.login-form").submit();

    cy.wait("@postCadastroUsuario").its("request.body").should("deep.equal", {
      nome: "Leone",
      email: "leone@comemaps.com",
      senha: "SenhaForte@2026",
    });

    cy.get(".login-toast").should("contain", "Cadastro criado neste navegador. Agora faça login.");
  });

  it("3. Deve fazer login com o perfil e cadastrar um novo estabelecimento via 'Sugerir lugar'", () => {
    cy.intercept("POST", "**/api/usuarios/login", {
      statusCode: 200,
      body: {
        mensagem: "Login realizado com sucesso!",
        token: "jwt_usuario_e2e_2026",
        usuario: { id: 10, nome: "Leone", email: "leone@comemaps.com", tipo: "USER" },
      },
    }).as("postLogin");

    cy.intercept("GET", "https://viacep.com.br/ws/79300001/json/", {
      statusCode: 200,
      body: {
        logradouro: "Rua Cabral",
        bairro: "Centro",
        localidade: "Corumbá",
        uf: "MS",
      },
    }).as("buscarCep");

    cy.intercept("POST", "**/api/estabelecimentos", {
      statusCode: 201,
      body: {
        mensagem: "Estabelecimento cadastrado com sucesso!",
        id: 3,
      },
    }).as("postEstabelecimento");

    cy.get(".login-card").click();
    cy.get("#login-email").type("leone@comemaps.com");
    cy.get("#login-password").type("SenhaForte@2026");
    cy.get("form.login-form").submit();
    cy.wait("@postLogin");

    cy.get(".profile-card").should("contain", "Leone");
    cy.contains(".nav-item", "Sugerir lugar").click();
    cy.wait("@getCategorias");

    cy.get("#establishment-name").type("Casa do Pacu");
    cy.get("#establishment-category").select("1");
    cy.get("#establishment-description").type("Pratos típicos da região.");
    cy.get("#establishment-phone").type("67999887766").should("have.value", "(67) 99988-7766");

    cy.get("#establishment-cep").type("79300001").should("have.value", "79300-001").blur();
    cy.wait("@buscarCep");
    cy.get("#establishment-address").should("have.value", "Rua Cabral, Centro, Corumbá - MS");

    cy.get("#establishment-latitude").type("-19,0095").should("have.value", "-19.0095");
    cy.get("#establishment-longitude").type("-57,6530").should("have.value", "-57.6530");

    cy.get("form.establishment-form").submit();

    cy.wait("@postEstabelecimento").then((interception) => {
      expect(interception.request.headers.authorization).to.include("Bearer jwt_usuario_e2e_2026");
      expect(interception.request.body).to.deep.include({
        nome: "Casa do Pacu",
        categoria_id: 1,
        endereco: "Rua Cabral, Centro, Corumbá - MS",
        telefone: "(67) 99988-7766",
        latitude: "-19.0095",
        longitude: "-57.6530",
      });
    });

    cy.get(".login-toast")
      .should("be.visible")
      .and("contain", "Estabelecimento cadastrado com sucesso!");
  });
});