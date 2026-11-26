var usuarioModel = require("../models/usuarioModel");

// Traduz o erro do MySQL numa frase que dá para entender (aparece embaixo do formulário)
function mensagemDeErro(erro) {
    var codigo = erro && erro.code;
    if (codigo == "ECONNREFUSED" || codigo == "ETIMEDOUT" || codigo == "ENOTFOUND") {
        return "O servidor não conseguiu conectar no MySQL. Confira DB_HOST e DB_PORT no .env.dev e se o MySQL está ligado.";
    }
    if (codigo == "ER_ACCESS_DENIED_ERROR") {
        return "Usuário ou senha do MySQL incorretos. Confira DB_USER e DB_PASSWORD no .env.dev.";
    }
    if (codigo == "ER_BAD_DB_ERROR" || codigo == "ER_NO_SUCH_TABLE") {
        return "O banco chumseon_space não está criado neste MySQL. Rode o arquivo src/database/chumseon_space.sql.";
    }
    return "Erro no servidor: " + ((erro && (erro.sqlMessage || erro.message)) || erro);
}

// Valores aceitos pelos radios do cadastro (são os "codigo" das tabelas de domínio do banco)
var ESTILOS = ["ballet", "hiphop", "contemporaneo", "kpop", "outro"];
var TEMPOS = ["curioso", "infancia", "pratica"];
var SENTIDOS = ["emocao", "saude", "estresse", "arte"];

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined || email == "") {
        res.status(400).send("Seu e-mail está undefined!");
        return;
    }
    if (senha == undefined || senha == "") {
        res.status(400).send("Sua senha está indefinida!");
        return;
    }

    usuarioModel.autenticar(email, senha)
        .then(function (resultado) {
            if (resultado.length == 1) {
                res.json(resultado[0]);
            } else if (resultado.length == 0) {
                res.status(403).send("E-mail e/ou senha inválido(s)");
            } else {
                res.status(403).send("Mais de um usuário com o mesmo login e senha!");
            }
        })
        .catch(function (erro) {
            console.log("\nHouve um erro ao realizar o login! Erro: ", erro);
            res.status(500).send(mensagemDeErro(erro));
        });
}

function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var estilo = req.body.estiloServer;
    var tempo = req.body.tempoServer;
    var sentido = req.body.sentidoServer;

    if (nome == undefined || nome.length < 2) {
        res.status(400).send("Seu nome está undefined ou muito curto!");
        return;
    }
    if (email == undefined || email.indexOf("@") == -1) {
        res.status(400).send("Seu e-mail está undefined ou inválido!");
        return;
    }
    if (senha == undefined || senha.length < 6) {
        res.status(400).send("Sua senha está undefined ou menor que 6 caracteres!");
        return;
    }
    if (ESTILOS.indexOf(estilo) == -1) {
        res.status(400).send("Estilo inválido!");
        return;
    }
    if (TEMPOS.indexOf(tempo) == -1) {
        res.status(400).send("Tempo de prática inválido!");
        return;
    }
    if (SENTIDOS.indexOf(sentido) == -1) {
        res.status(400).send("Sentido inválido!");
        return;
    }

    // 1) vê se o e-mail já existe  2) insere o usuário  3) cria o perfil 1:1
    usuarioModel.buscarPorEmail(email)
        .then(function (existentes) {
            if (existentes.length > 0) {
                res.status(409).send("Este e-mail já está cadastrado.");
                return;
            }
            return usuarioModel.cadastrar(nome, email, senha, estilo, tempo, sentido)
                .then(function (resultado) {
                    return usuarioModel.criarPerfil(resultado.insertId);
                })
                .then(function () {
                    res.status(201).json({ mensagem: "Cadastro realizado!" });
                });
        })
        .catch(function (erro) {
            console.log("\nHouve um erro ao realizar o cadastro! Erro: ", erro);
            res.status(500).send(mensagemDeErro(erro));
        });
}

module.exports = { autenticar, cadastrar };
