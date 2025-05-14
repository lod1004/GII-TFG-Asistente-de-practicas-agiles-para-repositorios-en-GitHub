const axios = require("axios");
const logger = require('../../logger');

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
    logger.error("Error obteniendo la fecha del primer commit: " + err.message);
    return null;
  }

  let lastCommitDate;
  try {
    const lastCommitRes = await axios.get(
      `https://api.github.com/repos/${owner}/${repoTitle}/commits?per_page=1&page=1&sort=created&direction=desc`,
      { headers: getHeaders() }
    );
    lastCommitDate = new Date(lastCommitRes.data[0].commit.author.date);
  } catch (err) {
    logger.error("Error obteniendo la fecha del último commit: " + err.message);
    return null;
  }

  // Cálculo de las fechas
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

  logger.info('Dueño del repositorio: ' + owner);
  logger.info('Título del repositorio: ' + repoTitle);
  logger.info('Fecha del primer commit: ' + firstCommitDate);
  logger.info('Fecha del final commit: ' + lastCommitDate);
  logger.info('Fecha de inicio: ' + startDate);
  logger.info('Fecha de fin: ' + endDate);

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