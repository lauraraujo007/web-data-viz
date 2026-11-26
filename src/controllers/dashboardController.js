var dashboardModel = require("../models/dashboardModel");

// GET /dashboard/comunidade  (dados de todo mundo, para os KPIs e gráficos da comunidade)
function comunidade(req, res) {
    var dados = {};

    dashboardModel.totalUsuarios()
        .then(function (r) {
            dados.totalUsuarios = r[0].total;
            return dashboardModel.estiloTopSemana();
        })
        .then(function (r) {
            if (r.length > 0) {
                dados.estiloTop = r[0].estilo;
                return;
            }
            // ninguém se cadastrou na semana: usa o estilo mais votado de todos
            return dashboardModel.estiloTopGeral().then(function (g) {
                dados.estiloTop = g.length > 0 ? g[0].estilo : null;
            });
        })
        .then(function () {
            return dashboardModel.percentualRetomar();
        })
        .then(function (r) {
            dados.percentualRetomar = r[0].pct == null ? 0 : Number(r[0].pct);
            return dashboardModel.porEstilo();
        })
        .then(function (r) {
            dados.porEstilo = r;
            return dashboardModel.porSentido();
        })
        .then(function (r) {
            dados.porSentido = r;
            return dashboardModel.porTempoEstilo();
        })
        .then(function (r) {
            dados.porTempoEstilo = r;
            res.json(dados);
        })
        .catch(function (erro) {
            console.log("\nErro no dashboard da comunidade: ", erro);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

// GET /dashboard/pessoal/:idUsuario/:periodo  (periodo = 7 ou 30 dias)
function pessoal(req, res) {
    var idUsuario = Number(req.params.idUsuario);
    var periodo = Number(req.params.periodo);

    if (!Number.isInteger(idUsuario) || idUsuario < 1) {
        res.status(400).send("idUsuario inválido!");
        return;
    }
    if (periodo != 7 && periodo != 30) {
        res.status(400).send("O período deve ser 7 ou 30 dias!");
        return;
    }

    var dados = {};

    dashboardModel.minutosPeriodo(idUsuario, periodo)
        .then(function (r) {
            dados.minutos = Number(r[0].minutos);
            return dashboardModel.videosPeriodo(idUsuario, periodo);
        })
        .then(function (r) {
            dados.videos = r[0].videos;
            return dashboardModel.metaSemana(idUsuario);
        })
        .then(function (r) {
            if (r.length > 0) {
                dados.minutosSemana = Number(r[0].minutosSemana);
                dados.meta = r[0].meta;
            } else {
                dados.minutosSemana = 0;
                dados.meta = 180;
            }
            return dashboardModel.minutosPorDia(idUsuario, periodo);
        })
        .then(function (r) {
            dados.minutosPorDia = r;
            return dashboardModel.videosPorEstilo(idUsuario, periodo);
        })
        .then(function (r) {
            dados.videosPorEstilo = r;
            res.json(dados);
        })
        .catch(function (erro) {
            console.log("\nErro no dashboard pessoal: ", erro);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

module.exports = { comunidade, pessoal };
