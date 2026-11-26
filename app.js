// Define se a aplicação roda em "desenvolvimento" (.env.dev) ou "producao" (.env)
var ambiente_processo = "desenvolvimento";

var caminho_env = ambiente_processo === "producao" ? ".env" : ".env.dev";

var fs = require("fs");
if (!fs.existsSync(caminho_env)) {
    console.log("\nFALTOU O ARQUIVO " + caminho_env + " NESTA PASTA.");
    console.log("Copie o arquivo .env.exemplo para " + caminho_env + " e preencha com os dados do MySQL DESTE computador.\n");
    process.exit(1);
}
require("dotenv").config({ path: caminho_env });

var express = require("express");
var cors = require("cors");
var path = require("path");

var PORTA_APP = process.env.APP_PORT || 3333;
var HOST_APP = process.env.APP_HOST || "localhost";

var app = express();

var usuariosRouter = require("./src/routes/usuarios");
var dashboardRouter = require("./src/routes/dashboard");
var atividadesRouter = require("./src/routes/atividades");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/usuarios", usuariosRouter);
app.use("/dashboard", dashboardRouter);
app.use("/", atividadesRouter);

app.listen(PORTA_APP, function () {
    console.log(`
    Chumseon Space rodando!  Acesse: http://${HOST_APP}:${PORTA_APP}

    Ambiente: ${caminho_env}  |  Banco: ${process.env.DB_DATABASE} em ${process.env.DB_HOST}:${process.env.DB_PORT}
    `);
});
