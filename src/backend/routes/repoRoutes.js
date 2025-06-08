const express = require("express");
const { body, query, validationResult } = require("express-validator");
const router = express.Router();

const {
  getRepositories,
  getRulesResults,
  createRepository,
  checkUrls,
  getRepositoryGroups,
  deleteGroup,
} = require("../controllers/repoController");

const {
  registerUser,
  loginUser,
  changePassword,
  changeLanguage,
} = require("../controllers/authController");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get("/repos",
  query("username").trim().isString().notEmpty(),
  validate,
  getRepositories
);

router.get("/repos/groups",
  query("username").trim().isString().notEmpty(),
  validate,
  getRepositoryGroups
);

router.delete("/repos/groups",
  query("username").trim().notEmpty(),
  query("groupId").isNumeric(),
  validate,
  deleteGroup
);

router.get("/rules",
  query("username").trim().isString().notEmpty(),
  validate,
  getRulesResults
);

router.post("/repos",
  body("main").isURL(),
  body("examples").isArray(),
  body("username").trim().notEmpty(),
  validate,
  createRepository
);

router.post("/repos/check-urls",
  body("main").isURL(),
  body("examples").isArray(),
  validate,
  checkUrls
);

router.post("/auth/registerUser",
  body("username").trim().notEmpty(),
  body("password").isLength({ min: 1 }),
  validate,
  registerUser
);

router.post("/auth/loginUser",
  body("username").trim().notEmpty(),
  body("password").notEmpty(),
  validate,
  loginUser
);

router.post("/auth/change-password",
  body("username").trim().notEmpty(),
  body("oldPassword").notEmpty(),
  body("repeatPassword").isLength({ min: 6 }),
  validate,
  changePassword
);

router.post("/auth/change-language",
  body("username").trim().notEmpty(),
  body("language").isString().notEmpty(),
  validate,
  changeLanguage
);

module.exports = router;
