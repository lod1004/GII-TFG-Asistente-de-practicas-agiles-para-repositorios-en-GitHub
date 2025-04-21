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

module.exports = {
    getCommitStats,
    getCommitQualityStats,
};