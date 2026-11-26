var express = require("express");
var router = express.Router();
var dashboardController = require("../controllers/dashboardController");

router.get("/comunidade", function (req, res) {
    dashboardController.comunidade(req, res);
});

router.get("/pessoal/:idUsuario/:periodo", function (req, res) {
    dashboardController.pessoal(req, res);
});

module.exports = router;
