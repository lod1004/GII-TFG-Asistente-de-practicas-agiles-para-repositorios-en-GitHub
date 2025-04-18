const axios = require("axios");

function extractOwnerAndRepo(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repoTitle: match[2]
  };
}

async function getIssueStats(owner, repoTitle) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  const [openRes, closedRes] = await Promise.all([
    axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repoTitle}+type:issue+state:open`, { headers }),
    axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repoTitle}+type:issue+state:closed`, { headers }),
  ]);

  const openIssuesCount = openRes.data.total_count;
  const closedIssuesCount = closedRes.data.total_count;

  console.log("Issues abiertas:", openIssuesCount);
  console.log("Issues cerradas:", closedIssuesCount);

  return { openIssuesCount, closedIssuesCount };
}

async function getIssueQualityStats(owner, repoTitle) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  let allIssues = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repoTitle}/issues?state=all&per_page=${perPage}&page=${page}`,
      { headers }
    );

    const issues = res.data.filter(issue => !issue.pull_request); // excluir PRs
    allIssues = allIssues.concat(issues);

    if (issues.length < perPage) break;
    page++;
  }

  const total = allIssues.length;
  if (total === 0) {
    console.log("No hay issues en el repositorio.");
    return {};
  }

  const withDescription = allIssues.filter(issue => issue.body && issue.body.trim().length > 0).length;
  const withImages = allIssues.filter(issue =>
    /!\[.*?\]\(.*?\)|<img\s+.*?>/i.test(issue.body || "")
  ).length;
  const withAssignees = allIssues.filter(issue => issue.assignees && issue.assignees.length > 0).length;
  const withLabels = allIssues.filter(issue => issue.labels && issue.labels.length > 0).length;
  const withMilestones = allIssues.filter(issue => issue.milestone !== null).length;

  const toPercent = (n) => (n / total) * 100;

  const stats = {
    descriptionIssuesPercent: toPercent(withDescription),
    imagedIssuesPercent: toPercent(withImages),
    assignedIssuesPercent: toPercent(withAssignees),
    labeledIssuesPercent: toPercent(withLabels),
    milestonedIssuesPercent: toPercent(withMilestones),
  };

  console.log("% Issues con descripción:", stats.descriptionIssuesPercent.toFixed(2));
  console.log("% Issues con imágenes:", stats.imagedIssuesPercent.toFixed(2));
  console.log("% Issues con personas asignadas:", stats.assignedIssuesPercent.toFixed(2));
  console.log("% Issues con etiquetas:", stats.labeledIssuesPercent.toFixed(2));
  console.log("% Issues con milestone:", stats.milestonedIssuesPercent.toFixed(2));

  return stats;
}

// Por defecto en la rama main
async function getCommitStats(owner, repoTitle) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  const commitsUrl = `https://api.github.com/repos/${owner}/${repoTitle}/commits?per_page=1`;

  const response = await axios.get(commitsUrl, { headers });

  const linkHeader = response.headers.link;
  let commitCount = 0;

  if (linkHeader) {
    const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
    commitCount = match ? parseInt(match[1]) : response.data.length;
  } else {
    commitCount = response.data.length;
  }

  console.log("Total de commits:", commitCount);
  return { commitCount };
}

async function getCommitQualityStats(owner, repoTitle) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  let page = 1;
  const perPage = 100;
  let allCommits = [];

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repoTitle}/commits?per_page=${perPage}&page=${page}`;
    const response = await axios.get(url, { headers });
    const commits = response.data;

    if (commits.length === 0) break;

    allCommits.push(...commits);

    if (commits.length < perPage) break;
    page++;
  }

  let withTitleCommitsPercent = 0;
  let withDescriptionCommitsPercent = 0;
  let withReferencesCommitsPercent = 0;

  const defaultTitles = [
    "update readme", "create readme", "initial commit", "add files via upload"
  ];

  for (const commitData of allCommits) {
    const message = commitData.commit.message;
    const lines = message.trim().split("\n");

    const title = lines[0].trim().toLowerCase();

    const isCustomTitle = !defaultTitles.some(def =>
      title === def || title.startsWith(def)
    );
    if (isCustomTitle) withTitleCommitsPercent++;

    const hasDescription = lines.length > 1 && lines.slice(1).some(line => line.trim().length > 0);
    if (hasDescription) withDescriptionCommitsPercent++;

    const hasIssueReference = /(^|\s)#\d+[.,(){}\[\]:;!?-]?(\s|$)/.test(message);
    if (hasIssueReference) withReferencesCommitsPercent++;
  }

  const total = allCommits.length;
  const percent = (count) => ((count / total) * 100).toFixed(2);

  console.log(`Un ${percent(withTitleCommitsPercent)}% de los commits tienen título personalizado`);
  console.log(`Un ${percent(withDescriptionCommitsPercent)}% tienen descripción`);
  console.log(`Un ${percent(withReferencesCommitsPercent)}% hacen referencia a issues o pull requests`);

  stats = {
    titledCommitsPercent: percent(withTitleCommitsPercent),
    descriptionCommitsPercent: percent(withDescriptionCommitsPercent),
    referencesCommitsPercent: percent(withReferencesCommitsPercent),
  };

  return stats
}

async function getPullRequestStats(owner, repoTitle) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  const [openRes, closedRes] = await Promise.all([
    axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repoTitle}+type:pr+state:open`, { headers }),
    axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repoTitle}+type:pr+state:closed`, { headers })
  ]);

  const openPrCount = openRes.data.total_count;
  const closedPrCount = closedRes.data.total_count;

  console.log("Pull requests abiertas:", openPrCount);
  console.log("Pull requests cerradas:", closedPrCount);

  return { openPrCount, closedPrCount };
}

const getPullRequestQualityStats = async (owner, repoTitle) => {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  let allPRs = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repoTitle}/pulls?state=all&per_page=${perPage}&page=${page}`,
      { headers }
    );

    const prs = res.data;
    if (prs.length === 0) break;

    allPRs.push(...prs);

    if (prs.length < perPage) break;
    page++;
  }

  const total = allPRs.length;
  if (total === 0) {
    console.log("No hay pull requests en el repositorio.");
    return {};
  }

  const withReviewers = allPRs.filter(pr => pr.requested_reviewers && pr.requested_reviewers.length > 0).length;
  const withAssignees = allPRs.filter(pr => pr.assignees && pr.assignees.length > 0).length;
  const withLabels = allPRs.filter(pr => pr.labels && pr.labels.length > 0).length;
  const withMilestones = allPRs.filter(pr => pr.milestone !== null).length;

  const toPercent = n => ((n / total) * 100).toFixed(2);

  const stats = {
    reviewersPrPercent: toPercent(withReviewers),
    assigneesPrPercent: toPercent(withAssignees),
    labelsPrPercent: toPercent(withLabels),
    milestonesPrPercent: toPercent(withMilestones)
  };

  console.log("% PRs con reviewers:", stats.reviewersPrPercent);
  console.log("% PRs con assignees:", stats.assigneesPrPercent);
  console.log("% PRs con labels:", stats.labelsPrPercent);
  console.log("% PRs con milestone:", stats.milestonesPrPercent);

  return stats;
};

const getActions = async (owner, repo) => {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows`,
      { headers }
    );

    const files = res.data || [];
    const workflowFiles = files.filter(file =>
      file.name.endsWith(".yml") || file.name.endsWith(".yaml")
    );

    console.log(`El repositorio tiene ${workflowFiles.length} workflow(s) de GitHub Actions`);

    actionsCount = workflowFiles.length;

    return { actionsCount }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No se encontraron workflows en .github/workflows");
      actionsCount = 0
      return { actionsCount };
    }
  }
};

module.exports = {
  extractOwnerAndRepo,
  getIssueStats,
  getIssueQualityStats,
  getCommitStats,
  getCommitQualityStats,
  getPullRequestStats,
  getPullRequestQualityStats,
  getActions
};
