var database = require("../database/config");

// INSERT em ensaio: o código do estilo ('kpop'...) vira o id com o SELECT
function registrarEnsaio(idUsuario, estilo, minutos) {
    var instrucaoSql = `
        INSERT INTO ensaio (fkUsuario, fkEstilo, minutos)
        SELECT ?, idEstilo, ? FROM estilo WHERE codigo = ?;
    `;
    return database.executar(instrucaoSql, [idUsuario, minutos, estilo]);
}

// INSERT na tabela N:N usuario_video. IGNORE: a mesma dupla (usuário, vídeo) não repete.
// Se já existia, affectedRows volta 0.
function registrarAssistido(idUsuario, idVideo) {
    var instrucaoSql = `INSERT IGNORE INTO usuario_video (fkUsuario, fkVideo) VALUES (?, ?);`;
    return database.executar(instrucaoSql, [idUsuario, idVideo]);
}

module.exports = { registrarEnsaio, registrarAssistido };
