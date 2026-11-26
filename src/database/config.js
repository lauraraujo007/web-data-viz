var mysql = require("mysql2");

// CONEXÃO DO BANCO MYSQL SERVER (os valores ficam no arquivo .env.dev)
var mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

// executar(instrucao, valores): manda o SQL para o MySQL e devolve uma Promise.
// Os "?" do SQL são trocados pelos itens do vetor "valores", na ordem.
function executar(instrucao, valores, silencioso) {

    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU .env.dev OU app.js\n");
        return Promise.reject("AMBIENTE NÃO CONFIGURADO EM .env");
    }

    // Mostra no terminal o SQL e os valores de cada consulta (só em desenvolvimento).
    // 3º parâmetro "silencioso" = true esconde o log (usado nas consultas do dashboard).
    var mostrarLog = process.env.AMBIENTE_PROCESSO === "desenvolvimento" && !silencioso;
    if (mostrarLog) {
        console.log("\nExecutando a instrução SQL: " + instrucao.replace(/\s+/g, " ").trim());
        console.log("Valores (?): ", valores || []);
    }

    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);
        conexao.connect();
        conexao.query(instrucao, valores || [], function (erro, resultados) {
            conexao.end();
            if (erro) {
                reject(erro);
                return;
            }
            // Mostra no terminal o que o banco devolveu (as linhas do SELECT ou o resultado do INSERT)
            if (mostrarLog) {
                console.log("Resultado do banco: ", resultados);
            }
            resolve(resultados);
        });
        conexao.on("error", function (erro) {
            console.log("ERRO NO MySQL SERVER: ", erro.sqlMessage);
        });
    });
}

module.exports = {
    executar
};