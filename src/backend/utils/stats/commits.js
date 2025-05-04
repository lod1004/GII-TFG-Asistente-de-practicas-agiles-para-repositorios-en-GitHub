const axios = require("axios");
const { getHeaders } = require('./github');

function getCommitStats(owner, repoTitle, averageDays, startDate, endDate) {
    const perPage = 100;

    return (async function () {
        let page = 1;
        let allCommits = [];
        let hasMoreCommits = true;

        while (hasMoreCommits) {
            const url = `https://api.github.com/repos/${owner}/${repoTitle}/commits?per_page=${perPage}&page=${page}`;
            const response = await axios.get(url, { headers: getHeaders() });
            const commits = response.data;

            if (commits.length === 0) break;

            allCommits.push(...commits);
            hasMoreCommits = commits.length === perPage;
            page++;
        }

        allCommits = allCommits.filter(commit => {
            const commitDate = new Date(commit.commit.author.date);
            return commitDate >= startDate && commitDate <= endDate;
        });

        const commitCount = allCommits.length;
        const lifeDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
        const periodCount = Math.ceil(lifeDays / averageDays);
        const averageCommits = periodCount > 0 ? (commitCount / periodCount).toFixed(2) : "0.00";

        if (commitCount === 0) {
            console.log("No hay Commits en el repositorio.");
            return {
                commitCount: 0,
                titledCommitsPercent: 0,
                descriptionCommitsPercent: 0,
                referencesCommitsPercent: 0,
                collaborativeCommitsPercent: 0,
                averageCommits: 0,
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

        const toPercent = (n) => (n / commitCount) * 100;

        const commitParticipants = Array.from(commitParticipantsMap.entries())
            .map(([login, participations]) => ({ login, participations }));

        const stats = {
            commitCount,
            titledCommitsPercent: toPercent(withTitleCommits).toFixed(2),
            descriptionCommitsPercent: toPercent(withDescriptionCommits).toFixed(2),
            referencesCommitsPercent: toPercent(withReferencesCommits).toFixed(2),
            collaborativeCommitsPercent: toPercent(collaborativeCommits).toFixed(2),
            averageCommits,
            commitParticipants
        };

        console.log("Total de Commits:", stats.commitCount);
        console.log("% Commits con título personalizado:", stats.titledCommitsPercent);
        console.log("% Commits con descripción:", stats.descriptionCommitsPercent);
        console.log("% Commits con referencias a Issues o Pull Requests:", stats.referencesCommitsPercent);
        console.log("% Commits colaborativos:", stats.collaborativeCommitsPercent);
        console.log("Media de Commits (cada", averageDays, " días):", stats.averageCommits);
        console.log("Usuarios que participaron en Commits:", stats.commitParticipants);

        return stats;
    })();
}

module.exports = {
    getCommitStats
};
