var database = require("../database/config");

function totalUsuarios() {
    var instrucaoSql = `SELECT COUNT(*) AS total FROM usuario;`;
    return database.executar(instrucaoSql, [], true);
}

function estiloTopSemana() {
    var instrucaoSql = `
        SELECT e.codigo AS estilo, COUNT(*) AS votos
        FROM usuario u
        JOIN estilo e ON e.idEstilo = u.fkEstilo
        WHERE u.dtCadastro >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY e.codigo
        ORDER BY votos DESC
        LIMIT 1;
    `;
    return database.executar(instrucaoSql, [], true);
}

function estiloTopGeral() {
    var instrucaoSql = `
        SELECT e.codigo AS estilo, COUNT(*) AS votos
        FROM usuario u
        JOIN estilo e ON e.idEstilo = u.fkEstilo
        GROUP BY e.codigo
        ORDER BY votos DESC
        LIMIT 1;
    `;
    return database.executar(instrucaoSql, [], true);
}

function percentualRetomar() {
    var instrucaoSql = `
        SELECT ROUND(SUM(CASE WHEN t.codigo = 'infancia' THEN 1 ELSE 0 END) / COUNT(*) * 100) AS pct
        FROM usuario u
        JOIN tempo_pratica t ON t.idTempo = u.fkTempo;
    `;
    return database.executar(instrucaoSql, [], true);
}

function porEstilo() {
    var instrucaoSql = `
        SELECT e.codigo AS estilo, COUNT(u.idUsuario) AS total
        FROM estilo e
        LEFT JOIN usuario u ON u.fkEstilo = e.idEstilo
        GROUP BY e.idEstilo, e.codigo
        ORDER BY e.idEstilo;
    `;
    return database.executar(instrucaoSql, [], true);
}

function porSentido() {
    var instrucaoSql = `
        SELECT s.codigo AS sentido, COUNT(u.idUsuario) AS total
        FROM sentido s
        LEFT JOIN usuario u ON u.fkSentido = s.idSentido
        GROUP BY s.idSentido, s.codigo
        ORDER BY s.idSentido;
    `;
    return database.executar(instrucaoSql, [], true);
}

function porTempoEstilo() {
    var instrucaoSql = `
        SELECT t.codigo AS tempo, e.codigo AS estilo, COUNT(*) AS total
        FROM usuario u
        JOIN tempo_pratica t ON t.idTempo = u.fkTempo
        JOIN estilo e ON e.idEstilo = u.fkEstilo
        GROUP BY t.codigo, e.codigo;
    `;
    return database.executar(instrucaoSql, [], true);
}

function minutosPeriodo(idUsuario, periodo) {
    var instrucaoSql = `
        SELECT IFNULL(SUM(minutos), 0) AS minutos
        FROM ensaio
        WHERE fkUsuario = ? AND dtEnsaio >= DATE_SUB(NOW(), INTERVAL ? DAY);
    `;
    return database.executar(instrucaoSql, [idUsuario, periodo], true);
}

function videosPeriodo(idUsuario, periodo) {
    var instrucaoSql = `
        SELECT COUNT(*) AS videos
        FROM usuario_video
        WHERE fkUsuario = ? AND dtAssistido >= DATE_SUB(NOW(), INTERVAL ? DAY);
    `;
    return database.executar(instrucaoSql, [idUsuario, periodo], true);
}

function metaSemana(idUsuario) {
    var instrucaoSql = `
        SELECT IFNULL(SUM(en.minutos), 0) AS minutosSemana, p.metaSemanalMin AS meta
        FROM perfil_usuario p
        LEFT JOIN ensaio en ON en.fkUsuario = p.idUsuario
                           AND en.dtEnsaio >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        WHERE p.idUsuario = ?
        GROUP BY p.metaSemanalMin;
    `;
    return database.executar(instrucaoSql, [idUsuario], true);
}

function minutosPorDia(idUsuario, periodo) {
    var instrucaoSql = `
        SELECT DATE_FORMAT(dtEnsaio, '%Y-%m-%d') AS dia, SUM(minutos) AS minutos
        FROM ensaio
        WHERE fkUsuario = ? AND dtEnsaio >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE_FORMAT(dtEnsaio, '%Y-%m-%d')
        ORDER BY dia;
    `;
    return database.executar(instrucaoSql, [idUsuario, periodo], true);
}

function videosPorEstilo(idUsuario, periodo) {
    var instrucaoSql = `
        SELECT e.codigo AS estilo, COUNT(*) AS videos
        FROM usuario_video uv
        JOIN video v ON v.idVideo = uv.fkVideo
        JOIN estilo e ON e.idEstilo = v.fkEstilo
        WHERE uv.fkUsuario = ? AND uv.dtAssistido >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY e.codigo;
    `;
    return database.executar(instrucaoSql, [idUsuario, periodo], true);
}

module.exports = {
    totalUsuarios, estiloTopSemana, estiloTopGeral, percentualRetomar,
    porEstilo, porSentido, porTempoEstilo,
    minutosPeriodo, videosPeriodo, metaSemana,
    minutosPorDia, videosPorEstilo
};
