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
            releaseParticipationPercent: 0
        };
    }

    const repoContributorsRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repoTitle}/contributors`,
        { headers: getHeaders() }
    );
    const contributors = repoContributorsRes.data.map(c => c.login);
    const contributorsSet = new Set(contributors);

    const withBody = allReleases.filter(rel => rel.body && rel.body.trim().length > 0).length;

    let collaborativeReleases = 0;
    const participatingAuthors = new Set();

    for (const release of allReleases) {
        const textToCheck = (release.name || "") + " " + (release.body || "");
        if (/@[a-z0-9_-]+/i.test(textToCheck)) {
            collaborativeReleases++;
        }

        if (release.author && contributorsSet.has(release.author.login)) {
            participatingAuthors.add(release.author.login);
        }
    }

    const toPercent = n => ((n / total) * 100).toFixed(2);
    const toPercentAuthors = n => ((n / contributors.length) * 100).toFixed(2);

    const stats = {
        descriptionReleasesPercent: toPercent(withBody),
        collaborativeReleasesPercent: toPercent(collaborativeReleases),
        releaseParticipationPercent: toPercentAuthors(participatingAuthors.size)
    };

    console.log(`% Releases con descripción: ${stats.descriptionReleasesPercent}%`);
    console.log(`% Releases colaborativas (menciones @): ${stats.collaborativeReleasesPercent}%`);
    console.log(`% Participación de colaboradores en Releases: ${stats.releaseParticipationPercent}%`);

    return stats;
}


module.exports = {
    getReleaseStats,
    getReleaseQualityStats
};