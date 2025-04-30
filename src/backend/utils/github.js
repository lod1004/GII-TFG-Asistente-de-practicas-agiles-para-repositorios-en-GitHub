const axios = require("axios");

function getHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };
}

async function getRepoPrimaryStats(url, useRelativeDates, startTimeInterval, endTimeInterval) {

  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;

  const owner = match[1];
  const repoTitle = match[2];

  const perPage = 100;

  let firstCommitDate;
  try {
    let page = 1;
    let lastPageCommits = [];

    while (true) {
      const res = await axios.get(`https://api.github.com/repos/${owner}/${repoTitle}/commits?per_page=${perPage}&page=${page}`, {
        headers: getHeaders()
      });
      const commits = res.data;
      if (commits.length === 0) break;

      lastPageCommits = commits;
      if (commits.length < perPage) break;
      page++;
    }

    const firstCommit = lastPageCommits[lastPageCommits.length - 1];
    firstCommitDate = new Date(firstCommit.commit.author.date);
  } catch (err) {
    console.error("Error obteniendo el primer commit:", err.message);
    return null;
  }

  const lastCommitRes = await axios.get(
    `https://api.github.com/repos/${owner}/${repoTitle}/commits?per_page=1&page=1&sort=created&direction=desc`,
    { headers: getHeaders() }
  );
  const lastCommitDate = new Date(lastCommitRes.data[0].commit.author.date);
  console.log('Fecha del primer commit:', firstCommitDate)
  console.log('Fecha del final commit:', lastCommitDate)

  // Calculo de las fechas
  let startDate, endDate;
  if (useRelativeDates) {
    const durationMs = lastCommitDate - firstCommitDate;
    const quarterMs = durationMs / 4;

    startDate = new Date(firstCommitDate.getTime() + (quarterMs * startTimeInterval));
    endDate = new Date(firstCommitDate.getTime() + (quarterMs * endTimeInterval));

    if (endDate > lastCommitDate) {
      endDate = lastCommitDate;
    }

  } else {
    const totalMonths = (lastCommitDate.getFullYear() - firstCommitDate.getFullYear()) * 12 +
      (lastCommitDate.getMonth() - firstCommitDate.getMonth());

    if (startTimeInterval > (totalMonths - 1)) {
      startDate = new Date(lastCommitDate);
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate = new Date(firstCommitDate);
      startDate.setMonth(startDate.getMonth() + startTimeInterval);
    }
    if (endTimeInterval > totalMonths) {
      endDate = lastCommitDate;
    } else {
      endDate = new Date(firstCommitDate);
      endDate.setMonth(endDate.getMonth() + endTimeInterval);
    }
  }

  console.log('Dueño del repositorio:', owner);
  console.log('Título del repositorio:', repoTitle);
  console.log('Fecha de inicio:', startDate);
  console.log('Fecha de fin:', endDate);

  return {    
    owner,
    repoTitle,
    startDate,
    endDate
  };
}

module.exports = {
  getRepoPrimaryStats,
  getHeaders
};
