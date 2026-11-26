var express = require("express");
var router = express.Router();
var atividadeController = require("../controllers/atividadeController");

router.post("/ensaios/registrar", function (req, res) {
    atividadeController.registrarEnsaio(req, res);
});

router.post("/videos/assistir", function (req, res) {
    atividadeController.registrarAssistido(req, res);
});

module.exports = router;
