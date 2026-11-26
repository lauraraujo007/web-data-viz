
DROP DATABASE IF EXISTS chumseon_space;
CREATE DATABASE chumseon_space CHARACTER SET utf8mb4;
USE chumseon_space;

-- ------------------------- TABELAS DE APOIO -------------------------
CREATE TABLE estilo (
  idEstilo INT          NOT NULL AUTO_INCREMENT,
  codigo   VARCHAR(20)  NOT NULL,
  nome     VARCHAR(40)  NOT NULL,
  cor      CHAR(7)      NOT NULL,
  PRIMARY KEY (idEstilo),
  UNIQUE KEY uq_estilo_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE tempo_pratica (
  idTempo   INT          NOT NULL AUTO_INCREMENT,
  codigo    VARCHAR(20)  NOT NULL,
  descricao VARCHAR(40)  NOT NULL,
  PRIMARY KEY (idTempo),
  UNIQUE KEY uq_tempo_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE sentido (
  idSentido INT          NOT NULL AUTO_INCREMENT,
  codigo    VARCHAR(20)  NOT NULL,
  descricao VARCHAR(40)  NOT NULL,
  PRIMARY KEY (idSentido),
  UNIQUE KEY uq_sentido_codigo (codigo)
) ENGINE=InnoDB;

-- --------------------------- USUÁRIO (1:N) ---------------------------
CREATE TABLE usuario (
  idUsuario  INT          NOT NULL AUTO_INCREMENT,
  nome       VARCHAR(60)  NOT NULL,
  email      VARCHAR(80)  NOT NULL,
  senha      VARCHAR(60)  NOT NULL,
  dtCadastro DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fkEstilo   INT          NOT NULL,
  fkTempo    INT          NOT NULL,
  fkSentido  INT          NOT NULL,
  PRIMARY KEY (idUsuario),
  UNIQUE KEY uq_usuario_email (email),
  CONSTRAINT fk_usuario_estilo  FOREIGN KEY (fkEstilo)  REFERENCES estilo (idEstilo),
  CONSTRAINT fk_usuario_tempo   FOREIGN KEY (fkTempo)   REFERENCES tempo_pratica (idTempo),
  CONSTRAINT fk_usuario_sentido FOREIGN KEY (fkSentido) REFERENCES sentido (idSentido)
) ENGINE=InnoDB;

-- 1:1 com usuario: a PK da tabela é também a FK
CREATE TABLE perfil_usuario (
  idUsuario      INT NOT NULL,
  metaSemanalMin INT NOT NULL DEFAULT 180,
  PRIMARY KEY (idUsuario),
  CONSTRAINT metaEPositiva CHECK (metaSemanalMin > 0),
  CONSTRAINT fk_perfil_usuario FOREIGN KEY (idUsuario)
    REFERENCES usuario (idUsuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------- VÍDEOS (1:N) ----------------------------
CREATE TABLE video (
  idVideo   INT          NOT NULL AUTO_INCREMENT,
  titulo    VARCHAR(80)  NOT NULL,
  nivel     VARCHAR(20)  NOT NULL,
  youtubeId VARCHAR(20)  NULL,           -- NULL = "vídeo em breve"
  fkEstilo  INT          NOT NULL,
  PRIMARY KEY (idVideo),
  CONSTRAINT fk_video_estilo FOREIGN KEY (fkEstilo) REFERENCES estilo (idEstilo)
) ENGINE=InnoDB;

-- N:N usuario x video: tabela associativa com atributo do relacionamento (dtAssistido)
CREATE TABLE usuario_video (
  fkUsuario   INT      NOT NULL,
  fkVideo     INT      NOT NULL,
  dtAssistido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (fkUsuario, fkVideo),
  CONSTRAINT fk_uv_usuario FOREIGN KEY (fkUsuario) REFERENCES usuario (idUsuario) ON DELETE CASCADE,
  CONSTRAINT fk_uv_video   FOREIGN KEY (fkVideo)   REFERENCES video (idVideo)     ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------- ATIVIDADES DO USUÁRIO (1:N) -------------------
CREATE TABLE ensaio (
  idEnsaio  INT      NOT NULL AUTO_INCREMENT,
  fkUsuario INT      NOT NULL,
  fkEstilo  INT      NOT NULL,
  minutos   INT      NOT NULL,
  dtEnsaio  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idEnsaio),
  CONSTRAINT minutosPositivos CHECK (minutos > 0),
  CONSTRAINT fk_ensaio_usuario FOREIGN KEY (fkUsuario) REFERENCES usuario (idUsuario) ON DELETE CASCADE,
  CONSTRAINT fk_ensaio_estilo  FOREIGN KEY (fkEstilo)  REFERENCES estilo (idEstilo)
) ENGINE=InnoDB;


-- ============================ DADOS ============================
-- Os ids são gerados em ordem (1, 2, 3...), por isso os números abaixo funcionam.
INSERT INTO estilo (codigo, nome, cor) VALUES
('ballet',        'Ballet clássico',    '#8b7bff'),   -- 1
('hiphop',        'Hip-hop e urbanas',  '#ff6a4d'),   -- 2
('contemporaneo', 'Contemporâneo',      '#3fd6c0'),   -- 3
('kpop',          'K-pop',              '#ff5fa2'),   -- 4
('outro',         'Outro',              '#9aa3a9');   -- 5

INSERT INTO tempo_pratica (codigo, descricao) VALUES
('curioso',  'Iniciante curioso'),            -- 1
('infancia', 'Já pratiquei na infância'),     -- 2
('pratica',  'Pratico atualmente');           -- 3

INSERT INTO sentido (codigo, descricao) VALUES
('emocao',   'Expressão emocional'),          -- 1
('saude',    'Saúde e disciplina'),           -- 2
('estresse', 'Desconexão do estresse'),       -- 3
('arte',     'Arte e estética');              -- 4

-- 12 usuários (fkEstilo, fkTempo, fkSentido). O usuário 1 é a conta de teste.
INSERT INTO usuario (nome, email, senha, dtCadastro, fkEstilo, fkTempo, fkSentido) VALUES
('Conta demo',     'demo@chumseon.space', '123456', NOW(),                         3, 2, 1),
('Ana Lima',       'ana@exemplo.com',     '123456', DATE_SUB(NOW(), INTERVAL 1 DAY),  1, 3, 4),
('Bruno Souza',    'bruno@exemplo.com',   '123456', DATE_SUB(NOW(), INTERVAL 2 DAY),  2, 3, 3),
('Carla Dias',     'carla@exemplo.com',   '123456', DATE_SUB(NOW(), INTERVAL 3 DAY),  3, 1, 1),
('Diego Alves',    'diego@exemplo.com',   '123456', DATE_SUB(NOW(), INTERVAL 4 DAY),  4, 2, 3),
('Eduarda Reis',   'edu@exemplo.com',     '123456', DATE_SUB(NOW(), INTERVAL 5 DAY),  2, 3, 2),
('Felipe Costa',   'felipe@exemplo.com',  '123456', DATE_SUB(NOW(), INTERVAL 6 DAY),  3, 2, 1),
('Gabi Nunes',     'gabi@exemplo.com',    '123456', DATE_SUB(NOW(), INTERVAL 8 DAY),  4, 1, 4),
('Helena Prado',   'helena@exemplo.com',  '123456', DATE_SUB(NOW(), INTERVAL 9 DAY),  1, 2, 4),
('Igor Martins',   'igor@exemplo.com',    '123456', DATE_SUB(NOW(), INTERVAL 10 DAY), 2, 1, 2),
('Julia Faria',    'julia@exemplo.com',   '123456', DATE_SUB(NOW(), INTERVAL 11 DAY), 5, 3, 3),
('Kaique Torres',  'kaique@exemplo.com',  '123456', DATE_SUB(NOW(), INTERVAL 12 DAY), 3, 3, 1);

-- 1:1 -> um perfil para cada usuário (mesmo id)
INSERT INTO perfil_usuario (idUsuario, metaSemanalMin) VALUES
(1, 180), (2, 150), (3, 200), (4, 120), (5, 180), (6, 240),
(7, 180), (8, 90), (9, 150), (10, 180), (11, 120), (12, 200);

-- 15 vídeos, 3 por estilo (youtubeId NULL = vídeo em breve)
INSERT INTO video (titulo, nivel, youtubeId, fkEstilo) VALUES
('Postura e alinhamento em 5 minutos',  'Iniciante',       NULL, 1),   -- 1
('Primeiros passos na barra',           'Iniciante',       NULL, 1),   -- 2
('Port de bras para iniciantes',        'Básico',          NULL, 1),   -- 3
('Fundamentos: bounce e rock',          'Iniciante',       NULL, 2),   -- 4
('Isolações de peito e quadril',        'Básico',          NULL, 2),   -- 5
('Freestyle sem medo',                  'Todos os níveis', NULL, 2),   -- 6
('Respiração e peso',                   'Iniciante',       NULL, 3),   -- 7
('Trabalho de chão básico',             'Básico',          NULL, 3),   -- 8
('Fluxo e improviso',                   'Todos os níveis', NULL, 3),   -- 9
('Aquecimento para coreografias',       'Iniciante',       NULL, 4),   -- 10
('Contagem e precisão',                 'Básico',          NULL, 4),   -- 11
('Aprenda uma coreografia em 4 passos', 'Todos os níveis', NULL, 4),   -- 12
('Aquecimento geral para dançar',       'Iniciante',       NULL, 5),   -- 13
('Consciência corporal',                'Básico',          NULL, 5),   -- 14
('Criando seus primeiros movimentos',   'Todos os níveis', NULL, 5);   -- 15

-- N:N -> quem assistiu o quê (a mesma dupla usuário/vídeo não repete: PK composta)
INSERT INTO usuario_video (fkUsuario, fkVideo, dtAssistido) VALUES
(1, 7,  DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 8,  DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 9,  DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 1,  DATE_SUB(NOW(), INTERVAL 9 DAY)),
(1, 4,  DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 1,  DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 2,  DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 4,  DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 5,  DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 7,  DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 10, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(6, 6,  DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ensaios: a conta demo (1) tem vários dias; os outros têm poucos; os usuários 8 a 12 nunca ensaiaram
INSERT INTO ensaio (fkUsuario, fkEstilo, minutos, dtEnsaio) VALUES
(1, 3, 45, NOW()),
(1, 3, 30, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 1, 25, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 3, 55, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 4, 35, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 3, 15, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(1, 2, 45, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(1, 3, 25, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(2, 1, 60, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 1, 40, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 2, 50, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 2, 35, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 3, 20, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5, 4, 30, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(6, 2, 90, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 3, 45, DATE_SUB(NOW(), INTERVAL 2 DAY));


-- ============================ VIEWS ============================
-- View = SELECT salvo, que a gente usa como se fosse uma tabela.

-- Resumo de cada usuário: subquery na coluna (cada coluna é um SELECT pequeno)
CREATE VIEW vw_resumo_usuario AS
SELECT u.idUsuario,
       u.nome,
       e.nome AS estilo,
       (SELECT IFNULL(SUM(en.minutos), 0)
          FROM ensaio en WHERE en.fkUsuario = u.idUsuario) AS minutos_total,
       (SELECT COUNT(*)
          FROM usuario_video uv WHERE uv.fkUsuario = u.idUsuario) AS videos_assistidos
FROM usuario u
JOIN estilo e ON e.idEstilo = u.fkEstilo;

-- Quantos dançarinos escolheram cada estilo (alimenta o gráfico radar)
CREATE VIEW vw_estilos_comunidade AS
SELECT e.nome AS estilo,
       COUNT(u.idUsuario) AS total
FROM estilo e
LEFT JOIN usuario u ON u.fkEstilo = e.idEstilo
GROUP BY e.nome;

SELECT * FROM vw_resumo_usuario;
SELECT * FROM vw_estilos_comunidade;


-- ==================== SELECTs DO DASHBOARD ====================
-- Cada KPI e cada gráfico do dashboard.html vem de um SELECT.
-- Os números combinam com os comentários "SELECT n" do js/dashboard.js.
-- Nos SELECTs pessoais, o usuário 1 (conta demo) é o usuário logado.

-- ----- COMUNIDADE -----
-- SELECT 1 (KPI): dançarinos cadastrados
SELECT COUNT(*) AS dancarinos_cadastrados FROM usuario;

-- SELECT 2 (KPI): estilo mais votado da semana
SELECT e.nome AS estilo, COUNT(*) AS votos
FROM usuario u
JOIN estilo e ON e.idEstilo = u.fkEstilo
WHERE u.dtCadastro >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY e.nome
ORDER BY votos DESC
LIMIT 1;

-- SELECT 3 (KPI): % de quem já praticou na infância ("querem retomar a dança")
SELECT ROUND(SUM(CASE WHEN t.codigo = 'infancia' THEN 1 ELSE 0 END) / COUNT(*) * 100) AS pct_querem_retomar
FROM usuario u
JOIN tempo_pratica t ON t.idTempo = u.fkTempo;

-- SELECT 8 (gráfico radar): estilos favoritos da comunidade
SELECT estilo, total FROM vw_estilos_comunidade;

-- SELECT 9 (gráfico de barras): o que a dança representa
SELECT s.descricao AS sentido, COUNT(u.idUsuario) AS total
FROM sentido s
LEFT JOIN usuario u ON u.fkSentido = s.idSentido
GROUP BY s.descricao
ORDER BY total DESC;

-- SELECT 10 (colunas empilhadas): nível de experiência por estilo
SELECT t.descricao AS contato_com_a_danca, e.nome AS estilo, COUNT(*) AS total
FROM usuario u
JOIN tempo_pratica t ON t.idTempo = u.fkTempo
JOIN estilo e        ON e.idEstilo = u.fkEstilo
GROUP BY t.descricao, e.nome
ORDER BY t.descricao, e.nome;

-- ----- PESSOAL (usuário 1) -----
-- SELECT 4 (KPI): minutos de ensaio nos últimos 7 dias
SELECT IFNULL(SUM(minutos), 0) AS minutos_7_dias
FROM ensaio
WHERE fkUsuario = 1
  AND dtEnsaio >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- SELECT 5 (KPI): vídeos assistidos nos últimos 7 dias
SELECT COUNT(*) AS videos_7_dias
FROM usuario_video
WHERE fkUsuario = 1
  AND dtAssistido >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- SELECT 7 (meta da semana): minutos da semana x meta do perfil (relacionamento 1:1)
SELECT IFNULL(SUM(en.minutos), 0) AS minutos_semana,
       p.metaSemanalMin AS meta,
       LEAST(100, ROUND(IFNULL(SUM(en.minutos), 0) / p.metaSemanalMin * 100)) AS pct_da_meta
FROM perfil_usuario p
LEFT JOIN ensaio en ON en.fkUsuario = p.idUsuario
                   AND en.dtEnsaio >= DATE_SUB(NOW(), INTERVAL 7 DAY)
WHERE p.idUsuario = 1
GROUP BY p.metaSemanalMin;

-- SELECT 11 (gráfico de linha): minutos de ensaio por dia
SELECT DATE(dtEnsaio) AS dia, SUM(minutos) AS minutos
FROM ensaio
WHERE fkUsuario = 1
  AND dtEnsaio >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(dtEnsaio)
ORDER BY dia;

-- SELECT 12 (gráfico de rosca): vídeos assistidos por estilo (passa pelo N:N)
SELECT e.nome AS estilo, COUNT(*) AS videos
FROM usuario_video uv
JOIN video v  ON v.idVideo = uv.fkVideo
JOIN estilo e ON e.idEstilo = v.fkEstilo
WHERE uv.fkUsuario = 1
GROUP BY e.nome;


-- ============ EXTRAS: HAVING, SUBQUERY E FUNÇÕES MATEMÁTICAS ============

-- HAVING: estilos com pelo menos 2 dançarinos
SELECT e.nome AS estilo, COUNT(*) AS total
FROM usuario u
JOIN estilo e ON e.idEstilo = u.fkEstilo
GROUP BY e.nome
HAVING COUNT(*) >= 2;

-- Subquery com NOT IN: usuários que nunca registraram um ensaio
SELECT idUsuario, nome
FROM usuario
WHERE idUsuario NOT IN (SELECT fkUsuario FROM ensaio);

-- Subquery com NOT EXISTS: o mesmo resultado, de outro jeito
SELECT u.idUsuario, u.nome
FROM usuario u
WHERE NOT EXISTS (SELECT 1 FROM ensaio en WHERE en.fkUsuario = u.idUsuario);

-- Subquery como filtro: quem ensaiou mais que a média (usa a view)
SELECT nome, minutos_total
FROM vw_resumo_usuario
WHERE minutos_total > (SELECT AVG(minutos_total) FROM vw_resumo_usuario)
ORDER BY minutos_total DESC;

-- Funções matemáticas do material de aula: TRUNCATE, CEIL, FLOOR, MOD, ROUND
-- horas inteiras e minutos que sobram (MOD), e quantas semanas de meta o total equivale (CEIL)
SELECT nome,
       minutos_total,
       FLOOR(minutos_total / 60)     AS horas_inteiras,
       MOD(minutos_total, 60)        AS minutos_que_sobram,
       TRUNCATE(minutos_total / 60, 1) AS horas_com_1_casa,
       CEIL(minutos_total / 180)     AS semanas_de_meta_180
FROM vw_resumo_usuario
WHERE minutos_total > 0
ORDER BY minutos_total DESC;

-- SQRT e POWER: desvio padrão dos minutos por dia de ensaio do usuário 1
-- (mesma ideia do cálculo "Minha regularidade" em calculos.html; aqui só entram os dias com ensaio)
SELECT ROUND(AVG(por_dia.minutos), 1) AS media_min,
       ROUND(SQRT(SUM(POWER(por_dia.minutos - (SELECT AVG(x.minutos)
                                                 FROM (SELECT SUM(minutos) AS minutos
                                                         FROM ensaio WHERE fkUsuario = 1
                                                        GROUP BY DATE(dtEnsaio)) AS x), 2))
                  / COUNT(*)), 1) AS desvio_padrao
FROM (SELECT SUM(minutos) AS minutos
        FROM ensaio
       WHERE fkUsuario = 1
       GROUP BY DATE(dtEnsaio)) AS por_dia;
