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
        return { descriptionReleasesPercent: 0 };
    }

    const withBody = allReleases.filter(rel => rel.body && rel.body.trim().length > 0).length;
    const percent = ((withBody / total) * 100).toFixed(2);

    console.log(`% Releases con descripción: ${percent}%`);

    return {
        descriptionReleasesPercent: percent
    };
}

module.exports = {
    getReleaseStats,
    getReleaseQualityStats
};