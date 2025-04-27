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

    while (true) {
        const url = `https://api.github.com/repos/${owner}/${repoTitle}/commits?per_page=${perPage}&page=${page}`;
        const response = await axios.get(url, { headers: getHeaders() });
        const commits = response.data;

        if (commits.length === 0) break;

        allCommits.push(...commits);

        if (commits.length < perPage) break;
        page++;
    }

    const total = allCommits.length;
    if (total === 0) {
        console.log("No hay commits en el repositorio.");
        return {
            titledCommitsPercent: 0,
            descriptionCommitsPercent: 0,
            referencesCommitsPercent: 0,
            collaborativeCommitsPercent: 0,
            commitParticipants: []
        };
    }

    let withTitleCommits = 0;
    let withDescriptionCommits = 0;
    let withReferencesCommits = 0;
    let collaborativeCommits = 0;

    const commitParticipantsMap = new Map();

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

        if (commitData.author && commitData.author.login) {
            const login = commitData.author.login;
            commitParticipantsMap.set(login, (commitParticipantsMap.get(login) || 0) + 1);
        }
    }

    const toPercent = (n) => (n / total) * 100;

    const commitParticipants = Array.from(commitParticipantsMap.entries())
        .map(([login, participations]) => ({ login, participations }));

    const stats = {
        titledCommitsPercent: toPercent(withTitleCommits).toFixed(2),
        descriptionCommitsPercent: toPercent(withDescriptionCommits).toFixed(2),
        referencesCommitsPercent: toPercent(withReferencesCommits).toFixed(2),
        collaborativeCommitsPercent: toPercent(collaborativeCommits).toFixed(2),
        commitParticipants
    };

    console.log("% Commits con título personalizado:", stats.titledCommitsPercent);
    console.log("% Commits con descripción:", stats.descriptionCommitsPercent);
    console.log("% Commits con referencias a Issues o Pull Requests:", stats.referencesCommitsPercent);
    console.log("% Commits colaborativos:", stats.collaborativeCommitsPercent);
    console.log("Usuarios que participaron en Commits:", stats.commitParticipants);

    return stats;
}


module.exports = {
    getCommitStats,
    getCommitQualityStats,
};