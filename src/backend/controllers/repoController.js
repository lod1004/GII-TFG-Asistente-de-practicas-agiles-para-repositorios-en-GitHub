const Repository = require("../models/repo");
const Counter = require("../models/counter");
const { extractOwnerAndRepo } = require("../utils/github");
const { getCommitStats, getCommitQualityStats } = require("../utils/commits");
const { getActions, getActionsSuccess } = require("../utils/actions");
const { getPullRequestStats, getPullRequestQualityStats } = require("../utils/pullRequests");
const { getReleaseStats, getReleaseQualityStats } = require("../utils/releases");
const { getIssueStats, getIssueQualityStats } = require("../utils/issues");
const { getParticipantsStats } = require("../utils/participants");

async function getNextId(sequenceName) {
  const counter = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
}

const getRepositories = async (req, res) => {
  try {
    const repos = await Repository.find();
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los repositorios" });
  }
};

const createRepository = async (req, res) => {
  const { main, examples } = req.body;

  if (!main || !Array.isArray(examples)) {
    return res.status(400).json({ message: "Se requiere una URL principal y una o varias URLs de ejemplo" });
  }

  const parsedMain = extractOwnerAndRepo(main);
  if (!parsedMain) {
    return res.status(400).json({ message: "URL principal inválida" });
  }


  const repositories = [];

  await Repository.deleteMany({});
  try {
    const newId = await getNextId("repositoryId");
    const { owner, repoTitle } = parsedMain;

    const { openIssuesCount, closedIssuesCount } = await getIssueStats(owner, repoTitle);
    const { descriptionIssuesPercent, commentedIssuesPercent, imagedIssuesPercent, assignedIssuesPercent, labeledIssuesPercent, milestonedIssuesPercent, storyPointsIssuesPercent, reopenedIssuesPercent, collaborativeIssuesPercent, issueParticipants } = await getIssueQualityStats(owner, repoTitle);
    const { commitCount } = await getCommitStats(owner, repoTitle);
    const { titledCommitsPercent, descriptionCommitsPercent, referencesCommitsPercent, collaborativeCommitsPercent, commitParticipants } = await getCommitQualityStats(owner, repoTitle);
    const { openPrCount, closedPrCount } = await getPullRequestStats(owner, repoTitle);
    const { reviewersPrPercent, assigneesPrPercent, labelsPrPercent, milestonesPrPercent, collaborativePrPercent, prParticipants } = await getPullRequestQualityStats(owner, repoTitle);
    const { actionsCount } = await getActions(owner, repoTitle);
    const { actionsRuns, actionsSuccess } = await getActionsSuccess(owner, repoTitle);
    const { releasesCount, tagsCount } = await getReleaseStats(owner, repoTitle);
    const { descriptionReleasesPercent, collaborativeReleasesPercent, releaseParticipants } = await getReleaseQualityStats(owner, repoTitle);
    const { commitParticipationPercent, issueParticipationPercent, prParticipationPercent, releaseParticipationPercent } = await getParticipantsStats(issueParticipants, commitParticipants, prParticipants, releaseParticipants);

    const mainRepo = new Repository({
      id: newId,
      url: main,
      owner,
      repoTitle,
      openIssuesCount,
      closedIssuesCount,
      descriptionIssuesPercent,
      commentedIssuesPercent,
      imagedIssuesPercent,
      assignedIssuesPercent,
      labeledIssuesPercent,
      milestonedIssuesPercent,
      storyPointsIssuesPercent, 
      reopenedIssuesPercent, 
      collaborativeIssuesPercent,
      issueParticipationPercent, 
      commitCount,
      titledCommitsPercent,
      descriptionCommitsPercent,
      referencesCommitsPercent,
      collaborativeCommitsPercent, 
      commitParticipationPercent,
      openPrCount,
      closedPrCount,
      reviewersPrPercent,
      assigneesPrPercent,
      labelsPrPercent,
      milestonesPrPercent,
      collaborativePrPercent, 
      prParticipationPercent,
      actionsCount,
      actionsRuns,
      actionsSuccess,
      releasesCount,
      tagsCount,
      descriptionReleasesPercent,
      collaborativeReleasesPercent, 
      releaseParticipationPercent,
      isMain: boolean = true,
      createdAt: new Date()
    });

    await mainRepo.save();
    repositories.push(mainRepo);

    for (const url of examples) {
      const parsed = extractOwnerAndRepo(url);
      if (!parsed) continue;

      const exampleId = await getNextId("repositoryId");
      const { owner, repoTitle } = parsed;

      const { openIssuesCount, closedIssuesCount } = await getIssueStats(owner, repoTitle);
      const { descriptionIssuesPercent, commentedIssuesPercent, imagedIssuesPercent, assignedIssuesPercent, labeledIssuesPercent, milestonedIssuesPercent, storyPointsIssuesPercent, reopenedIssuesPercent, collaborativeIssuesPercent, issueParticipants } = await getIssueQualityStats(owner, repoTitle);
      const { commitCount } = await getCommitStats(owner, repoTitle);
      const { titledCommitsPercent, descriptionCommitsPercent, referencesCommitsPercent, collaborativeCommitsPercent, commitParticipants } = await getCommitQualityStats(owner, repoTitle);
      const { openPrCount, closedPrCount } = await getPullRequestStats(owner, repoTitle);
      const { reviewersPrPercent, assigneesPrPercent, labelsPrPercent, milestonesPrPercent, collaborativePrPercent, prParticipants } = await getPullRequestQualityStats(owner, repoTitle);
      const { actionsCount } = await getActions(owner, repoTitle);
      const { actionsRuns, actionsSuccess } = await getActionsSuccess(owner, repoTitle);
      const { releasesCount, tagsCount } = await getReleaseStats(owner, repoTitle);
      const { descriptionReleasesPercent, collaborativeReleasesPercent, releaseParticipants } = await getReleaseQualityStats(owner, repoTitle);
      const { commitParticipationPercent, issueParticipationPercent, prParticipationPercent, releaseParticipationPercent } = await getParticipantsStats(issueParticipants, commitParticipants, prParticipants, releaseParticipants);
  
      const exampleRepo = new Repository({
        id: exampleId,
        url: main,
        owner,
        repoTitle,
        openIssuesCount,
        closedIssuesCount,
        descriptionIssuesPercent,
        commentedIssuesPercent,
        imagedIssuesPercent,
        assignedIssuesPercent,
        labeledIssuesPercent,
        milestonedIssuesPercent,
        storyPointsIssuesPercent, 
        reopenedIssuesPercent, 
        collaborativeIssuesPercent,
        issueParticipationPercent, 
        commitCount,
        titledCommitsPercent,
        descriptionCommitsPercent,
        referencesCommitsPercent,
        collaborativeCommitsPercent, 
        commitParticipationPercent,
        openPrCount,
        closedPrCount,
        reviewersPrPercent,
        assigneesPrPercent,
        labelsPrPercent,
        milestonesPrPercent,
        collaborativePrPercent, 
        prParticipationPercent,
        actionsCount,
        actionsRuns,
        actionsSuccess,
        releasesCount,
        tagsCount,
        descriptionReleasesPercent,
        collaborativeReleasesPercent, 
        releaseParticipationPercent,
        isMain: boolean = false,
        createdAt: new Date()
      });

      await exampleRepo.save();
      repositories.push(exampleRepo);
    }

    res.status(201).json({ message: "Repos procesados correctamente", repositories });
  } catch (error) {
    console.error("Error al procesar las URLs:", error.message, error);
    res.status(500).json({ message: "Error al obtener datos de los repositorios" });
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
