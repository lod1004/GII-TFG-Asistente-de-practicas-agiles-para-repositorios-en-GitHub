const logger = require('../logger');
const { validationResult } = require("express-validator");

const axios = require('axios');
const { getHeaders } = require("../utils/stats/github");

const Repository = require("../models/repo");
const Counter = require("../models/counter");
const IssueStats = require("../models/issue_stats");
const CommitStats = require("../models/commit_stats");
const PullRequestStats = require("../models/pull_request_stats");
const ActionStats = require("../models/action_stats");
const ReleaseStats = require("../models/release_stats");
const ParticipantStats = require("../models/participant_stats");
const RulesResult = require("../models/rules_result");
const User = require('../models/user');

const { evaluateAllRules } = require("../utils/rules/rule-evaluator");

const { getRepoPrimaryStats } = require("../utils/stats/github");
const { getCommitStats } = require("../utils/stats/commits");
const { getActionsStats } = require("../utils/stats/actions");
const { getPullRequestStats } = require("../utils/stats/pullRequests");
const { getReleaseStats } = require("../utils/stats/releases");
const { getIssueStats } = require("../utils/stats/issues");
const { getParticipantsStats } = require("../utils/stats/participants");

async function getNextId(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
}

async function saveIssueStats(repoId, data) {
  const { issueParticipants, ...issueStats } = data;
  await IssueStats.create({ repoId, ...issueStats });
  return issueParticipants;
}

async function saveCommitStats(repoId, data) {
  const { commitParticipants, ...commitStats } = data;
  await CommitStats.create({ repoId, ...commitStats });
  return commitParticipants;
}

async function savePRStats(repoId, data) {
  const { prParticipants, ...prStats } = data;
  await PullRequestStats.create({ repoId, ...prStats });
  return prParticipants;
}

async function saveActionStats(repoId, data) {
  await ActionStats.create({ repoId, ...data });
}

async function saveReleaseStats(repoId, data) {
  const { releaseParticipants, ...releaseStats } = data;
  await ReleaseStats.create({ repoId, ...releaseStats });
  return releaseParticipants;
}

async function saveParticipantStats(repoId, data) {
  await ParticipantStats.create({ repoId, ...data });
}

async function processRepository({
  url,
  isMain,
  averageDays,
  useRelativeDates,
  startTimeInterval,
  endTimeInterval,
  userId,
  group
}) {
  if (typeof url !== "string" || !/^https?:\/\/.+/.test(url)) {
    throw new Error("URL inválida");
  }

  const isMainBool = Boolean(isMain);
  const averageDaysInt = parseInt(averageDays, 10);
  if (isNaN(averageDaysInt) || averageDaysInt <= 0) {
    throw new Error("averageDays debe ser un número positivo");
  }

  const userIdSanitized = String(userId).trim();
  if (userIdSanitized === "") {
    throw new Error("userId inválido");
  }

  const parsedGroup = parseInt(group, 10);
  if (isNaN(parsedGroup)) {
    throw new Error("Group debe ser un número");
  }

  const parsed = await getRepoPrimaryStats(url, useRelativeDates, startTimeInterval, endTimeInterval);
  if (!parsed) return null;

  const repoId = await getNextId("repositoryId");
  const { owner, repoTitle, startDate, endDate } = parsed;

  const repoData = {
    id: repoId,
    averageDays: averageDaysInt,
    url: url.trim(),
    owner: String(owner).trim(),
    repoTitle: String(repoTitle).trim(),
    startDate,
    endDate,
    isMain: isMainBool,
    userId: userIdSanitized,
    createdAt: new Date()
  };

  if (parsedGroup !== 0) {
    repoData.group = parsedGroup;
  }

  await Repository.create(repoData);

  const issueStats = await getIssueStats(owner, repoTitle, averageDaysInt, startDate, endDate);
  const commitStats = await getCommitStats(owner, repoTitle, averageDaysInt, startDate, endDate);
  const prStats = await getPullRequestStats(owner, repoTitle, averageDaysInt, startDate, endDate);
  const actionStats = await getActionsStats(owner, repoTitle, startDate, endDate);
  const releaseStats = await getReleaseStats(owner, repoTitle, averageDaysInt, startDate, endDate);

  const issueParticipants = await saveIssueStats(repoId, issueStats);
  const commitParticipants = await saveCommitStats(repoId, commitStats);
  const prParticipants = await savePRStats(repoId, prStats);
  await saveActionStats(repoId, actionStats);
  const releaseParticipants = await saveReleaseStats(repoId, releaseStats);

  const participantStats = await getParticipantsStats(
    issueParticipants,
    commitParticipants,
    prParticipants,
    releaseParticipants,
    averageDaysInt,
    startDate,
    endDate
  );
  await saveParticipantStats(repoId, participantStats);

  return { id: repoId, url: url.trim() };
}

const getRepositories = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const username = req.query.username?.toString().trim();

  if (typeof username !== "string" || username === "") {
    return res.status(400).json({ message: "Nombre de usuario inválido." });
  }

  const user = await User.findOne({ username: { $eq: username } });
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  try {
    const mainRepo = await Repository.findOne({ userId: user.id, isMain: true }).sort({ createdAt: -1 });
    if (!mainRepo) {
      return res.status(404).json({ message: "No se encontró repositorio principal para este usuario" });
    }

    const newestGroupRepo = await Repository.findOne({
      userId: user.id,
      isMain: false,
      group: { $exists: true }
    }).sort({ createdAt: -1 });

    const groupId = newestGroupRepo?.group;

    let comparisonRepos = [];
    if (groupId !== undefined) {
      comparisonRepos = await Repository.find({
        userId: user.id,
        isMain: false,
        group: groupId
      });
    }

    const allRepos = [mainRepo, ...comparisonRepos];

    const enrichedRepositories = await Promise.all(
      allRepos.map(async (repo) => {
        const [issues, commits, pulls, actions, releases, participants] = await Promise.all([
          IssueStats.findOne({ repoId: repo.id }),
          CommitStats.findOne({ repoId: repo.id }),
          PullRequestStats.findOne({ repoId: repo.id }),
          ActionStats.findOne({ repoId: repo.id }),
          ReleaseStats.findOne({ repoId: repo.id }),
          ParticipantStats.findOne({ repoId: repo.id }),
        ]);

        return {
          ...repo.toObject(),
          issueStats: issues || {},
          commitStats: commits || {},
          pullRequestStats: pulls || {},
          actionStats: actions || {},
          releaseStats: releases || {},
          participantStats: participants || {},
        };
      })
    );

    res.json(enrichedRepositories);
  } catch (error) {
    logger.error("Error al cargar los repositorios recientes: " + error.message);
    res.status(500).json({ message: "Error al cargar repositorios recientes del usuario" });
  }
};

const getRulesResults = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const username = req.query.username?.toString().trim();

    if (typeof username !== "string" || username === "") {
      return res.status(400).json({ message: "Nombre de usuario inválido." });
    }

    const user = await User.findOne({ username: { $eq: username } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const mainRepo = await Repository.findOne({ userId: user.id, isMain: true }).sort({ createdAt: -1 });
    if (!mainRepo) {
      return res.status(404).json({ message: "Repositorio principal no encontrado para el usuario" });
    }

    const rules = await RulesResult.find({ mainRepoId: mainRepo.id }).sort({ createdAt: -1 });

    res.json({ rules });
  } catch (error) {
    logger.error("Error al recuperar resultados de reglas: " + error.message);
    res.status(500).json({ message: "Error al obtener resultados de reglas." });
  }
};

const createRepository = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    main,
    examples,
    useRelativeDates,
    averageDays,
    startTimeInterval,
    endTimeInterval,
    useOldRepositories,
    groupId
  } = req.body;

  const username = req.body.username?.toString().trim();

  if (typeof username !== "string" || username === "") {
    return res.status(400).json({ message: "Nombre de usuario inválido." });
  }

  const user = await User.findOne({ username: { $eq: username } });
  const userId = user.id;

  if (!main || !Array.isArray(examples)) {
    return res.status(400).json({ message: "Se requiere una URL principal y una o varias URLs de ejemplo" });
  }

  try {
    const processedMain = await processRepository({
      url: main,
      isMain: true,
      averageDays,
      useRelativeDates,
      startTimeInterval,
      endTimeInterval,
      userId,
      group: 0
    });

    let processedExamples = [];

    if (useOldRepositories && groupId !== 0) {
      const oldRepos = await Repository.find({ userId, group: groupId, isMain: false });

      const now = new Date();
      await Repository.updateMany(
        { userId, group: groupId, isMain: false },
        { $set: { createdAt: now } }
      );

      processedExamples = await Repository.find({ userId, group: groupId, isMain: false });
    } else {
      const comparisonGroupId = await getNextId("comparisonGroupId");
      for (const url of examples) {
        const result = await processRepository({
          url,
          isMain: false,
          averageDays,
          useRelativeDates,
          startTimeInterval,
          endTimeInterval,
          userId,
          group: comparisonGroupId
        });
        if (result) processedExamples.push(result);
      }
    }

    const mainRepoStats = {
      issue_stats: await IssueStats.findOne({ repoId: processedMain.id }),
      commit_stats: await CommitStats.findOne({ repoId: processedMain.id }),
      pull_request_stats: await PullRequestStats.findOne({ repoId: processedMain.id }),
      release_stats: await ReleaseStats.findOne({ repoId: processedMain.id }),
      action_stats: await ActionStats.findOne({ repoId: processedMain.id }),
      participant_stats: await ParticipantStats.findOne({ repoId: processedMain.id }),
    };

    const comparisonReposStats = [];
    for (const { id } of processedExamples) {
      comparisonReposStats.push({
        issue_stats: await IssueStats.findOne({ repoId: id }),
        commit_stats: await CommitStats.findOne({ repoId: id }),
        pull_request_stats: await PullRequestStats.findOne({ repoId: id }),
        release_stats: await ReleaseStats.findOne({ repoId: id }),
        action_stats: await ActionStats.findOne({ repoId: id }),
        participant_stats: await ParticipantStats.findOne({ repoId: id }),
      });
    }

    const mainRepoId = processedMain.id;
    const rulesResults = evaluateAllRules(mainRepoStats, comparisonReposStats, averageDays, mainRepoId);

    await RulesResult.insertMany(rulesResults);

    res.status(201).json({
      message: "Repositorios procesados correctamente",
      repositories: [processedMain, ...processedExamples]
    });
  } catch (error) {
    logger.error("Error al procesar las URLs: " + error.message, error);
    res.status(500).json({ message: "Error al obtener datos de los repositorios" });
  }
};

const checkUrls = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { main, examples } = req.body;
  const allRepos = [main, ...examples];

  try {
    for (const url of allRepos) {
      const match = url.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/);
      if (!match) {
        logger.error("URL malformada o no válida: " + url)
        return res.status(400).json({
          success: false,
          message: `URL malformada o no válida: ${url}`
        });
      }

      const owner = match[1];
      const repo = match[2];
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

      logger.info(`Verificando acceso a: ${apiUrl}`);

      const response = await axios.get(apiUrl, { headers: getHeaders() });

      if (response.status !== 200) {
        return res.status(400).json({
          success: false,
          message: `No se pudo acceder al repositorio: ${url}`
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error("Error verificando repositorios: " + err.message);
    return res.status(500).json({
      success: false,
      message: "Error al comprobar los repositorios: " + err.message
    });
  }
};

const getRepositoryGroups = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username } = req.query;

  try {
    const username = req.query.username?.toString().trim();

    if (typeof username !== "string" || username === "") {
      return res.status(400).json({ message: "Nombre de usuario inválido." });
    }

    const user = await User.findOne({ username: { $eq: username } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const repos = await Repository.find({ userId: user.id, isMain: false, group: { $exists: true } });

    const groupsMap = new Map();
    for (const repo of repos) {
      if (!groupsMap.has(repo.group)) {
        groupsMap.set(repo.group, []);
      }
      groupsMap.get(repo.group).push(repo);
    }

    const groups = Array.from(groupsMap.entries()).map(([groupId, repos]) => ({
      groupId,
      repositories: repos
    }));

    res.json(groups);
  } catch (error) {
    logger.error("Error al obtener los grupos de comparación: " + error.message);
    res.status(500).json({ message: "Error al obtener los grupos de comparación." });
  }
};

const deleteGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const username = req.query.username?.toString().trim();
  const groupIdRaw = req.query.groupId;

  if (!username || !groupIdRaw) {
    return res.status(400).json({ message: "Faltan parámetros requeridos." });
  }

  const groupId = parseInt(groupIdRaw, 10);
  if (isNaN(groupId)) {
    return res.status(400).json({ message: "El groupId debe ser un número válido." });
  }

  try {
    const username = req.query.username?.toString().trim();

    if (typeof username !== "string" || username === "") {
      return res.status(400).json({ message: "Nombre de usuario inválido." });
    }

    const user = await User.findOne({ username: { $eq: username } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const result = await Repository.deleteMany({ group: { $eq: groupId } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No se encontraron repositorios con ese groupId." });
    }

    res.status(200).json({
      success: true,
      message: `Grupo eliminado correctamente (${result.deletedCount} repositorios eliminados).`
    });
  } catch (error) {
    logger.error("Error al eliminar el grupo: " + error.message);
    res.status(500).json({ message: "Error al eliminar el grupo." });
  }
};

module.exports = {
  getRepositories,
  getRepositoryGroups,
  deleteGroup,
  getRulesResults,
  createRepository,
  checkUrls
};