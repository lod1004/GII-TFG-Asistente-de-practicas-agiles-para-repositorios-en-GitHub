const Repository = require("../models/repo");
const Counter = require("../models/counter");
const { getRepoPrimaryStats } = require("../utils/github");
const { getCommitStats } = require("../utils/commits");
const { getActionsStats } = require("../utils/actions");
const { getPullRequestStats } = require("../utils/pullRequests");
const { getReleaseStats } = require("../utils/releases");
const { getIssueStats } = require("../utils/issues");
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
  const { main, examples, useRelativeDates, averageDays, startTimeInterval, endTimeInterval } = req.body;

  if (!main || !Array.isArray(examples)) {
    return res.status(400).json({ message: "Se requiere una URL principal y una o varias URLs de ejemplo" });
  }

  const parsedMain = await getRepoPrimaryStats(main, useRelativeDates, startTimeInterval, endTimeInterval );
  if (!parsedMain) {
    return res.status(400).json({ message: "URL principal inválida" });
  }
  const repositories = [];

  await Repository.deleteMany({});
  try {
    const newId = await getNextId("repositoryId");
    const { owner, repoTitle, startDate, endDate } = parsedMain;

    const { openIssuesCount, closedIssuesCount, averageClosedIssues, descriptionIssuesPercent, commentedIssuesPercent, 
      imagedIssuesPercent, assignedIssuesPercent, labeledIssuesPercent, milestonedIssuesPercent, 
      storyPointsIssuesPercent, reopenedIssuesPercent, collaborativeIssuesPercent, issueParticipants } = await getIssueStats(owner, repoTitle, averageDays, startDate, endDate);

    const { commitCount, averageCommits, titledCommitsPercent, descriptionCommitsPercent, referencesCommitsPercent, 
      collaborativeCommitsPercent, commitParticipants } = await getCommitStats(owner, repoTitle, averageDays, startDate, endDate);
   
    const { openPrCount, closedPrCount, averageClosedPr, reviewersPrPercent, assigneesPrPercent, 
      labelsPrPercent, milestonesPrPercent, collaborativePrPercent, prParticipants } = await getPullRequestStats(owner, repoTitle, averageDays, startDate, endDate);
    
    const { actionsCount, actionsRuns, actionsSuccess, actionFrequency } = await getActionsStats(owner, repoTitle, startDate, endDate);

    const { releasesCount, averageReleases, tagsCount, descriptionReleasesPercent, collaborativeReleasesPercent, 
      releaseParticipants } = await getReleaseStats(owner, repoTitle, averageDays, startDate, endDate);
    const { commitParticipationPercent, issueParticipationPercent, prParticipationPercent, releaseParticipationPercent, 
      averageUserActivity } = await getParticipantsStats(issueParticipants, commitParticipants, prParticipants, releaseParticipants, averageDays, startDate, endDate);

    const mainRepo = new Repository({
      id: newId,
      url: main,
      owner,
      repoTitle,
      startDate,
      endDate,
      openIssuesCount,
      closedIssuesCount,
      averageClosedIssues,
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
      averageCommits,
      titledCommitsPercent,
      descriptionCommitsPercent,
      referencesCommitsPercent,
      collaborativeCommitsPercent, 
      commitParticipationPercent,
      openPrCount,
      closedPrCount,
      averageClosedPr,
      reviewersPrPercent,
      assigneesPrPercent,
      labelsPrPercent,
      milestonesPrPercent,
      collaborativePrPercent, 
      prParticipationPercent,
      actionsCount,
      actionsRuns,
      actionsSuccess,
      actionFrequency,
      releasesCount,
      averageReleases,
      tagsCount,
      descriptionReleasesPercent,
      collaborativeReleasesPercent, 
      releaseParticipationPercent,
      averageUserActivity,
      isMain: boolean = true,
      createdAt: new Date()
    });

    await mainRepo.save();
    repositories.push(mainRepo);

    for (const url of examples) {
      const parsed = await getRepoPrimaryStats(url, useRelativeDates, startTimeInterval, endTimeInterval );
      if (!parsed) continue;

      const exampleId = await getNextId("repositoryId");

      const { owner, repoTitle, startDate, endDate } = parsed;

      const { openIssuesCount, closedIssuesCount, averageClosedIssues, descriptionIssuesPercent, commentedIssuesPercent, 
        imagedIssuesPercent, assignedIssuesPercent, labeledIssuesPercent, milestonedIssuesPercent, 
        storyPointsIssuesPercent, reopenedIssuesPercent, collaborativeIssuesPercent, issueParticipants } = await getIssueStats(owner, repoTitle, averageDays, startDate, endDate);
  
      const { commitCount, averageCommits, titledCommitsPercent, descriptionCommitsPercent, referencesCommitsPercent, 
        collaborativeCommitsPercent, commitParticipants } = await getCommitStats(owner, repoTitle, averageDays, startDate, endDate);
     
      const { openPrCount, closedPrCount, averageClosedPr, reviewersPrPercent, assigneesPrPercent, 
        labelsPrPercent, milestonesPrPercent, collaborativePrPercent, prParticipants } = await getPullRequestStats(owner, repoTitle, averageDays, startDate, endDate);
      
      const { actionsCount, actionsRuns, actionsSuccess, actionFrequency } = await getActionsStats(owner, repoTitle, startDate, endDate);
  
      const { releasesCount, averageReleases, tagsCount, descriptionReleasesPercent, collaborativeReleasesPercent, 
        releaseParticipants } = await getReleaseStats(owner, repoTitle, averageDays, startDate, endDate);
      const { commitParticipationPercent, issueParticipationPercent, prParticipationPercent, releaseParticipationPercent, 
        averageUserActivity } = await getParticipantsStats(issueParticipants, commitParticipants, prParticipants, releaseParticipants, averageDays, startDate, endDate);
  
      const exampleRepo = new Repository({
        id: exampleId,
        url: main,
        owner,
        repoTitle,
        startDate,
        endDate,
        openIssuesCount,
        closedIssuesCount,
        averageClosedIssues,
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
        averageCommits,
        titledCommitsPercent,
        descriptionCommitsPercent,
        referencesCommitsPercent,
        collaborativeCommitsPercent, 
        commitParticipationPercent,
        openPrCount,
        closedPrCount,
        averageClosedPr,
        reviewersPrPercent,
        assigneesPrPercent,
        labelsPrPercent,
        milestonesPrPercent,
        collaborativePrPercent, 
        prParticipationPercent,
        actionsCount,
        actionsRuns,
        actionsSuccess,
        actionFrequency,
        releasesCount,
        averageReleases,
        tagsCount,
        descriptionReleasesPercent,
        collaborativeReleasesPercent, 
        releaseParticipationPercent,
        averageUserActivity,
        isMain: boolean = false,
        createdAt: new Date()
      });

      await exampleRepo.save();
      repositories.push(exampleRepo);
    }

    res.status(201).json({ message: "Repositorios procesados correctamente", repositories });
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
