const express = require("express");
const router = express.Router();
const { getRepositories, getRulesResults, createRepository } = require("../controllers/repoController");

router.get("/repos", getRepositories);
router.get("/rules", getRulesResults);
router.post("/repos", createRepository);

module.exports = router;
