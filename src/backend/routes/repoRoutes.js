const express = require("express");
const router = express.Router();
const { getRepositories, getRulesResults, createRepository} = require("../controllers/repoController");
const { registerUser, loginUser, changePassword} = require("../controllers/authController");

router.get("/repos", getRepositories);
router.get("/rules", getRulesResults);
router.post("/repos", createRepository);

router.post("/auth/registerUser", registerUser);
router.post("/auth/loginUser", loginUser);
router.post("/auth/change-password", changePassword);

module.exports = router;