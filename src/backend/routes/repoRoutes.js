const express = require("express");
const { getRepositories, createRepository } = require("../controllers/repoController");

const router = express.Router();

router.get("/repos", getRepositories);
router.post("/repos", createRepository);

module.exports = router;
