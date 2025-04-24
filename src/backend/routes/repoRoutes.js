const express = require("express");
const router = express.Router();
const { getRepositories, createRepository } = require("../controllers/repoController");

router.get("/repos", getRepositories);
router.post("/repos", createRepository);

module.exports = router;
