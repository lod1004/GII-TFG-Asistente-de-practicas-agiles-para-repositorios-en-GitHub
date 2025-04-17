const axios = require("axios");

function extractOwnerAndRepo(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2]
  };
}

async function getIssueStats(owner, repo) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  const [openRes, closedRes] = await Promise.all([
    axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue+state:open`, { headers }),
    axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue+state:closed`, { headers }),
  ]);

  const openCount = openRes.data.total_count;
  const closedCount = closedRes.data.total_count;

  console.log("Issues abiertas:", openCount);
  console.log("Issues cerradas:", closedCount);

  return { openCount, closedCount };
}

async function getIssueQualityStats(owner, repo) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  let allIssues = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=${perPage}&page=${page}`,
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
    withDescriptionPercent: toPercent(withDescription),
    withImagesPercent: toPercent(withImages),
    withAssigneesPercent: toPercent(withAssignees),
    withLabelsPercent: toPercent(withLabels),
    withMilestonesPercent: toPercent(withMilestones),
  };

  console.log("% Issues con descripción:", stats.withDescriptionPercent.toFixed(2));
  console.log("% Issues con imágenes:", stats.withImagesPercent.toFixed(2));
  console.log("% Issues con personas asignadas:", stats.withAssigneesPercent.toFixed(2));
  console.log("% Issues con etiquetas:", stats.withLabelsPercent.toFixed(2));
  console.log("% Issues con milestone:", stats.withMilestonesPercent.toFixed(2));

  return stats;
}

// Por defecto en la rama main
async function getCommitStats(owner, repo) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;

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
  return commitCount;
}

async function getCommitQualityStats(owner, repo) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  let page = 1;
  const perPage = 100;
  let allCommits = [];

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`;
    const response = await axios.get(url, { headers });
    const commits = response.data;

    if (commits.length === 0) break;

    allCommits.push(...commits);

    if (commits.length < perPage) break;
    page++;
  }

  console.log(`Total de commits analizados: ${allCommits.length}`);

  let customTitleCount = 0;
  let descriptionCount = 0;
  let issueReferenceCount = 0;

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
    if (isCustomTitle) customTitleCount++;

    const hasDescription = lines.length > 1 && lines.slice(1).some(line => line.trim().length > 0);
    if (hasDescription) descriptionCount++;

    const hasIssueReference = /(^|\s)#\d+[.,(){}\[\]:;!?-]?(\s|$)/.test(message);
    if (hasIssueReference) issueReferenceCount++;
  }

  const total = allCommits.length;
  const percent = (count) => ((count / total) * 100).toFixed(2);

  console.log(`Un ${percent(customTitleCount)}% de los commits tienen título personalizado`);
  console.log(`Un ${percent(descriptionCount)}% tienen descripción`);
  console.log(`Un ${percent(issueReferenceCount)}% hacen referencia a issues o pull requests`);

  return {
    customTitle: percent(customTitleCount),
    description: percent(descriptionCount),
    issueRefs: percent(issueReferenceCount),
  };
}


async function getPullRequestStats(owner, repo) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };

  const [openRes, closedRes] = await Promise.all([
    axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:pr+state:open`, { headers }),
    axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:pr+state:closed`, { headers })
  ]);

  const openPRs = openRes.data.total_count;
  const closedPRs = closedRes.data.total_count;

  console.log("Pull requests abiertas:", openPRs);
  console.log("Pull requests cerradas:", closedPRs);

  return { openPRs, closedPRs };
}

module.exports = {
  extractOwnerAndRepo,
  getIssueStats,
  getIssueQualityStats,
  getCommitStats,
  getCommitQualityStats,
  getPullRequestStats
};
