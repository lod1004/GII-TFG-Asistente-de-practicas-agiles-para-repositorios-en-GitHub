const express = require("express");
const router = express.Router();
const { getRepositories, getRulesResults, createRepository, checkUrls, getRepositoryGroups} = require("../controllers/repoController");
const { registerUser, loginUser, changePassword,changeLanguage} = require("../controllers/authController");

router.get("/repos", getRepositories);
router.get("/repos/groups", getRepositoryGroups);
router.get("/rules", getRulesResults);
router.post("/repos", createRepository);
router.post('/repos/check-urls', checkUrls);

router.post("/auth/registerUser", registerUser);
router.post("/auth/loginUser", loginUser);
router.post("/auth/change-password", changePassword);
router.post("/auth/change-language", changeLanguage);

module.exports = router;