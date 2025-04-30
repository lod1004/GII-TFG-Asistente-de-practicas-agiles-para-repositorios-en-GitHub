const axios = require("axios");
const { getHeaders } = require('./github');

const getReleaseStats = async (owner, repoTitle, startDate, endDate) => {
    let allReleases = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const res = await axios.get(
            `https://api.github.com/repos/${owner}/${repoTitle}/releases?per_page=${perPage}&page=${page}`,
            { headers: getHeaders() }
        );
        if (res.data.length === 0) break;
        allReleases.push(...res.data);
        if (res.data.length < perPage) break;
        page++;
    }

    allReleases = allReleases.filter(release => {
        const createdAt = new Date(release.created_at);
        return createdAt >= startDate && createdAt <= endDate;
    });

    const releasesCount = allReleases.length;

    // Count tags
    let tagsCount = 0;
    page = 1;
    while (true) {
        const res = await axios.get(
            `https://api.github.com/repos/${owner}/${repoTitle}/tags?per_page=${perPage}&page=${page}`,
            { headers: getHeaders() }
        );
        tagsCount += res.data.length;
        if (res.data.length < perPage) break;
        page++;
    }

    if (releasesCount === 0) {
        console.log("No hay releases en el repositorio.");
        return {
            releasesCount: 0,
            tagsCount,
            descriptionReleasesPercent: 0,
            collaborativeReleasesPercent: 0,
            releaseParticipants: []
        };
    }

    const withDescription = allReleases.filter(r => r.body?.trim().length).length;
    const collaborativeReleases = allReleases.filter(r =>
        /@[a-z0-9_-]+/i.test(`${r.name || ""} ${r.body || ""}`)
    ).length;

    const releaseParticipantsMap = new Map();
    for (const r of allReleases) {
        if (r.author?.login) {
            releaseParticipantsMap.set(r.author.login, (releaseParticipantsMap.get(r.author.login) || 0) + 1);
        }
    }

    const toPercent = n => ((n / releasesCount) * 100).toFixed(2);
    const releaseParticipants = Array.from(releaseParticipantsMap.entries())
        .map(([login, participations]) => ({ login, participations }));

    const stats = {
        releasesCount,
        tagsCount,
        descriptionReleasesPercent: toPercent(withDescription),
        collaborativeReleasesPercent: toPercent(collaborativeReleases),
        releaseParticipants
    };

    console.log("Total de releases:", releasesCount);
    console.log("Total de tags:", tagsCount);
    console.log("% Releases con descripción:", stats.descriptionReleasesPercent);
    console.log("% Releases colaborativas:", stats.collaborativeReleasesPercent);
    console.log("Usuarios que participaron en Releases:", stats.releaseParticipants);

    return stats;
};

module.exports = { getReleaseStats };
