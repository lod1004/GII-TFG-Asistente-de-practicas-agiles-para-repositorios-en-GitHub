const axios = require("axios");
const { getHeaders  } = require('./github');

async function getReleaseStats(owner, repoTitle) {

    // Contar releases
    let releasesCount = 0;
    let page = 1;
    const perPage = 100;

    while (true) {
        const res = await axios.get(
            `https://api.github.com/repos/${owner}/${repoTitle}/releases?per_page=${perPage}&page=${page}`,
            { headers: getHeaders() }
        );

        const releases = res.data;
        releasesCount += releases.length;

        if (releases.length < perPage) break;
        page++;
    }

    // Contar tags
    let tagsCount = 0;
    page = 1;

    while (true) {
        const res = await axios.get(
            `https://api.github.com/repos/${owner}/${repoTitle}/tags?per_page=${perPage}&page=${page}`,
            { headers: getHeaders() }
        );

        const tags = res.data;
        tagsCount += tags.length;

        if (tags.length < perPage) break;
        page++;
    }

    console.log("Total de releases:", releasesCount);
    console.log("Total de tags:", tagsCount);

    return { releasesCount, tagsCount };
}

async function getReleaseQualityStats(owner, repoTitle) {
    let allReleases = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const res = await axios.get(
            `https://api.github.com/repos/${owner}/${repoTitle}/releases?per_page=${perPage}&page=${page}`,
            { headers: getHeaders() }
        );

        const releases = res.data;
        if (releases.length === 0) break;

        allReleases.push(...releases);

        if (releases.length < perPage) break;
        page++;
    }

    const total = allReleases.length;

    if (total === 0) {
        console.log("No hay releases en el repositorio.");
        return {
            descriptionReleasesPercent: 0,
            collaborativeReleasesPercent: 0,
            releaseParticipants: []
        };
    }

    const withBody = allReleases.filter(rel => rel.body && rel.body.trim().length > 0).length;

    let collaborativeReleases = 0;
    const releaseParticipantsMap = new Map();

    for (const release of allReleases) {
        const textToCheck = (release.name || "") + " " + (release.body || "");
        if (/@[a-z0-9_-]+/i.test(textToCheck)) {
            collaborativeReleases++;
        }

        if (release.author && release.author.login) {
            const login = release.author.login;
            releaseParticipantsMap.set(login, (releaseParticipantsMap.get(login) || 0) + 1);
        }
    }

    const toPercent = n => ((n / total) * 100).toFixed(2);

    const releaseParticipants = Array.from(releaseParticipantsMap.entries())
        .map(([login, participations]) => ({ login, participations }));

    const stats = {
        descriptionReleasesPercent: toPercent(withBody),
        collaborativeReleasesPercent: toPercent(collaborativeReleases),
        releaseParticipants
    };

    console.log(`% Releases con descripción: ${stats.descriptionReleasesPercent}%`);
    console.log(`% Releases colaborativas (menciones @): ${stats.collaborativeReleasesPercent}%`);
    console.log(`Usuarios que participaron en Releases:`, stats.releaseParticipants);

    return stats;
}


module.exports = {
    getReleaseStats,
    getReleaseQualityStats
};