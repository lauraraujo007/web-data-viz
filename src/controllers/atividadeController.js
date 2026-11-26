var atividadeModel = require("../models/atividadeModel");

var ESTILOS = ["ballet", "hiphop", "contemporaneo", "kpop", "outro"];

// POST /ensaios/registrar
function registrarEnsaio(req, res) {
    var idUsuario = Number(req.body.idUsuarioServer);
    var estilo = req.body.estiloServer;
    var minutos = Number(req.body.minutosServer);

    if (!Number.isInteger(idUsuario) || idUsuario < 1) {
        res.status(400).send("idUsuario inválido!");
        return;
    }
    if (ESTILOS.indexOf(estilo) == -1) {
        res.status(400).send("Estilo inválido!");
        return;
    }
    if (!Number.isInteger(minutos) || minutos < 1 || minutos > 600) {
        res.status(400).send("Minutos inválidos!");
        return;
    }

    atividadeModel.registrarEnsaio(idUsuario, estilo, minutos)
        .then(function () {
            res.status(201).json({ mensagem: "Ensaio registrado!" });
        })
        .catch(function (erro) {
            console.log("\nErro ao registrar ensaio: ", erro);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

// POST /videos/assistir
function registrarAssistido(req, res) {
    var idUsuario = Number(req.body.idUsuarioServer);
    var idVideo = Number(req.body.idVideoServer);

    if (!Number.isInteger(idUsuario) || idUsuario < 1) {
        res.status(400).send("idUsuario inválido!");
        return;
    }
    if (!Number.isInteger(idVideo) || idVideo < 1) {
        res.status(400).send("idVideo inválido!");
        return;
    }

    atividadeModel.registrarAssistido(idUsuario, idVideo)
        .then(function (resultado) {
            // affectedRows 0 = a pessoa já tinha assistido esse vídeo
            res.status(201).json({ novo: resultado.affectedRows == 1 });
        })
        .catch(function (erro) {
            console.log("\nErro ao registrar vídeo assistido: ", erro);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

module.exports = { registrarEnsaio, registrarAssistido };
