const MainRepository = require("../models/repo");
const Counter = require("../models/counter");
const { extractOwnerAndRepo, getIssueStats, getIssueQualityStats, getCommitStats, getCommitQualityStats, getPullRequestStats, getPullRequestQualityStats, getActions } = require("../utils/github");

async function getNextId(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
}

const getMainRepositories = async (req, res) => {
  try {
    const repos = await MainRepository.find();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los repositorios" });
  }
};

const createRepository = async (req, res) => {
  const { url } = req.body;
  const newId = await getNextId("repositoryId");

  if (!url) {
    return res.status(400).json({ message: "URL requerida" });
  }

  const parsed = extractOwnerAndRepo(url);
  if (!parsed) {
    return res.status(400).json({ message: "URL inválida" });
  }

  const { owner, repoTitle } = parsed;

  try {
    const { openIssuesCount, closedIssuesCount } = await getIssueStats(owner, repoTitle);
    const { descriptionIssuesPercent, imagedIssuesPercent, assignedIssuesPercent, labeledIssuesPercent, milestonedIssuesPercent } = await getIssueQualityStats(owner, repoTitle);
    const { commitCount } = await getCommitStats(owner, repoTitle);
    const { titledCommitsPercent, descriptionCommitsPercent, referencesCommitsPercent } = await getCommitQualityStats(owner, repoTitle);
    const { openPrCount, closedPrCount } = await getPullRequestStats(owner, repoTitle);
    const { reviewersPrPercent, assigneesPrPercent, labelsPrPercent, milestonesPrPercent}  = await getPullRequestQualityStats(owner, repoTitle);
    const { actionsCount } = await getActions(owner, repoTitle);

console.log(actionsCount);

    const newRepo = new MainRepository({
      id: newId,
      url,
      owner,
      repoTitle,
      openIssuesCount,
      closedIssuesCount,
      descriptionIssuesPercent,
      imagedIssuesPercent,
      assignedIssuesPercent,
      labeledIssuesPercent,
      milestonedIssuesPercent,
      commitCount,
      titledCommitsPercent,
      descriptionCommitsPercent,
      referencesCommitsPercent,
      openPrCount,
      closedPrCount,
      reviewersPrPercent,
      assigneesPrPercent,
      labelsPrPercent,
      milestonesPrPercent,
      actionsCount,
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
      const repos = await MainRepository.find();
      res.json(repos);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los repositorios" });
    }
  },
  createRepository
};
