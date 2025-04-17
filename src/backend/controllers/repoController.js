const Repository = require("../models/repo");
const { extractOwnerAndRepo, getIssueStats, getIssueQualityStats, getCommitStats, getCommitQualityStats, getPullRequestStats } = require("../utils/github");

const getRepositories = async (req, res) => {
  try {
    const repos = await Repository.find();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los repositorios" });
  }
};

const createRepository = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "URL requerida" });
  }

  const parsed = extractOwnerAndRepo(url);
  if (!parsed) {
    return res.status(400).json({ message: "URL inválida" });
  }

  const { owner, repo } = parsed;

  try {
    const { openCount, closedCount } = await getIssueStats(owner, repo);
    const { withDescriptionPercent, withImagesPercent, withAssigneesPercent, withLabelsPercent, withMilestonesPercent } = await getIssueQualityStats(owner, repo);
    const { commitCount } = await getCommitStats(owner, repo);
    const { customTitleCount, descriptionCount, issueReferenceCount } = await getCommitQualityStats(owner, repo);
    const { openPrCount, closedPrCount } = await getPullRequestStats(owner, repo);

    const newRepo = new Repository({
      url,
      owner,
      name: repo,
      openIssues: openCount,
      closedIssues: closedCount,
      commits: commitCount,
      openPullRequests: openPrCount,
      closedPullRequests: closedPrCount,
      createdAt: new Date()
    });

    await newRepo.save();
    res.status(201).json(newRepo);
  } catch (error) {
    console.error("Error al procesar la URL:", error.message, error);
    res.status(500).json({ message: "Error al obtener datos del repositorio" });
  }
};

module.exports = {
  getRepositories: async (req, res) => {
    try {
      const repos = await Repository.find();
      res.json(repos);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los repositorios" });
    }
  },
  createRepository
};
