const axios = require("axios");
const { getHeaders  } = require('./github');

// Por defecto en la rama main
async function getCommitStats(owner, repoTitle) {

    const commitsUrl = `https://api.github.com/repos/${owner}/${repoTitle}/commits?per_page=1`;

    const response = await axios.get(commitsUrl, { headers: getHeaders() });

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
    let page = 1;
    const perPage = 100;
    let allCommits = [];
    const url = `https://api.github.com/repos/${owner}/${repoTitle}/commits?per_page=${perPage}&page=${page}`;
    const response = await axios.get(url, { headers: getHeaders() });
    const commits = response.data;

    while (true) {
        const url = `https://api.github.com/repos/${owner}/${repoTitle}/commits?per_page=${perPage}&page=${page}`;
        const response = await axios.get(url, { headers: getHeaders() });
        const commits = response.data;

        if (commits.length === 0) break;

        allCommits.push(...commits);

        if (commits.length < perPage) break;
        page++;
    }

    const repoContributorsRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repoTitle}/contributors`,
        { headers: getHeaders() }
    );
    const contributors = repoContributorsRes.data.map(c => c.login);
    const contributorsSet = new Set(contributors);

    let withTitleCommits = 0;
    let withDescriptionCommits = 0;
    let withReferencesCommits = 0;
    let collaborativeCommits = 0;

    const participatingAuthors = new Set();

    const defaultTitles = [
        "update readme", "create readme", "initial commit", "add files via upload"
    ];

    for (const commitData of allCommits) {
        const message = commitData.commit.message;
        const lines = message.trim().split("\n");
        const title = lines[0].trim().toLowerCase();

        if (!defaultTitles.some(def => title === def || title.startsWith(def))) {
            withTitleCommits++;
        }

        const hasDescription = lines.length > 1 && lines.slice(1).some(line => line.trim().length > 0);
        if (hasDescription) withDescriptionCommits++;

        const hasIssueReference = /(^|\s)#\d+[.,(){}\[\]:;!?-]?(\s|$)/.test(message);
        if (hasIssueReference) withReferencesCommits++;

        if (/@[a-z0-9_-]+/i.test(message)) collaborativeCommits++;

        if (commitData.author && contributorsSet.has(commitData.author.login)) {
            participatingAuthors.add(commitData.author.login);
        }
    }

    const total = allCommits.length;
    const totalContributors = contributors.length;

    const toPercent = (n) => (n / total) * 100;
    const toPercentAuthors = (n) => (n / contributors.length) * 100;

    const stats = {
        titledCommitsPercent: toPercent(withTitleCommits),
        descriptionCommitsPercent: toPercent(withDescriptionCommits),
        referencesCommitsPercent: toPercent(withReferencesCommits),
        collaborativeCommitsPercent: toPercent(collaborativeCommits),
        commitParticipationPercent: toPercentAuthors(participatingAuthors.size, totalContributors)
    };

    console.log("% Commits con título personalizado:", stats.titledCommitsPercent.toFixed(2));
    console.log("% Commits con descripción:", stats.descriptionCommitsPercent.toFixed(2));
    console.log("% Commits con referencias a Issues o Pull Requests:", stats.referencesCommitsPercent.toFixed(2));
    console.log("% Commits colaborativos:", stats.collaborativeCommitsPercent.toFixed(2));
    console.log("% de contribuidores que han hecho commits:", stats.commitParticipationPercent.toFixed(2));

    return stats;
}

module.exports = {
    getCommitStats,
    getCommitQualityStats,
};