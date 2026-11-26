# Chumseon Space

Site de dança com **Node.js + Express + MySQL** no servidor e HTML/CSS/JS puro no navegador.
Projeto independente: tem o próprio banco (`chumseon_space`) e não depende de nenhum outro projeto.

## Rodar em outro computador

1. Instale o **Node.js** e o **MySQL** (e o MySQL Workbench, se quiser).
2. No MySQL deste computador, execute o arquivo `src/database/chumseon_space.sql` inteiro.
   > Atenção: ele faz `DROP DATABASE IF EXISTS chumseon_space` e recria o banco do zero.
3. Na pasta do projeto:
   ```
   npm install
   ```
4. Copie `.env.exemplo` para `.env.dev` e preencha `DB_USER`, `DB_PASSWORD` e `DB_PORT`
   com os dados do MySQL **deste** computador (o `.env.dev` não vai para o git).
5. Confira tudo de uma vez (conexão, banco, tabelas, cadastro de teste):
   ```
   node diagnostico.js
   ```
6. Ligue o servidor:
   ```
   node app.js
   ```
7. Acesse **http://localhost:3333**. Conta de teste: `demo@chumseon.space` / `123456`.
   De outro aparelho, use `http://IP-DO-COMPUTADOR:3333` (libere a porta 3333 no firewall).

> Abra o site sempre pelo endereço do `node` (porta 3333), e não pelo Live Server: é o `app.js` que entrega as páginas e a API juntos.

## Se o cadastro der erro

A mensagem aparece em vermelho embaixo do formulário e diz o que conferir. Rode `node diagnostico.js`
na pasta do projeto: ele para no primeiro problema e explica como resolver.

## Estrutura

```
app.js                    liga o servidor, as rotas e a pasta public
diagnostico.js            confere .env.dev, MySQL, banco, tabelas e o INSERT do cadastro
.env.exemplo              modelo do .env.dev (cada computador cria o seu)
public/                   o site (html, css, js, img)
src/
├── database/             config.js (executar) e chumseon_space.sql
├── routes/               URL + método -> controller
├── controllers/          valida o que chegou e responde (400, 403, 409, 500...)
└── models/               os SQLs (SELECT/INSERT) com "?" nos valores
```

## Rotas da API

| Método | URL | O que faz |
|---|---|---|
| POST | /usuarios/cadastrar | INSERT em `usuario` e `perfil_usuario` (409 se o e-mail já existe) |
| POST | /usuarios/autenticar | SELECT do login (403 se errar e-mail/senha) |
| GET | /dashboard/comunidade | KPIs e gráficos da comunidade |
| GET | /dashboard/pessoal/:idUsuario/:periodo | KPIs e gráficos pessoais (periodo = 7 ou 30 dias) |
| POST | /ensaios/registrar | INSERT em `ensaio` |
| POST | /videos/assistir | INSERT na tabela N:N `usuario_video` |
| POST | /quiz/registrar | INSERT em `tentativa_quiz` |
