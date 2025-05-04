const axios = require("axios");
const { getHeaders } = require('./github');

function getReleaseStats(owner, repoTitle, averageDays, startDate, endDate) {
    const perPage = 100;

    return (async function () {
        let allReleases = [];
        let page = 1;
        let hasMoreReleases = true;

        while (hasMoreReleases) {
            const res = await axios.get(
                `https://api.github.com/repos/${owner}/${repoTitle}/releases?per_page=${perPage}&page=${page}`,
                { headers: getHeaders() }
            );

            const releases = res.data;
            allReleases.push(...releases);
            hasMoreReleases = releases.length === perPage;
            page++;
        }

        allReleases = allReleases.filter(release => {
            const createdAt = new Date(release.created_at);
            return createdAt >= startDate && createdAt <= endDate;
        });

        const releasesCount = allReleases.length;

        const lifeDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
        const periodCount = Math.ceil(lifeDays / averageDays);
        const averageReleases = periodCount > 0 ? (releasesCount / periodCount).toFixed(2) : "0.00";

        // Count tags
        let tagsCount = 0;
        page = 1;
        let hasMoreTags = true;

        while (hasMoreTags) {
            const res = await axios.get(
                `https://api.github.com/repos/${owner}/${repoTitle}/tags?per_page=${perPage}&page=${page}`,
                { headers: getHeaders() }
            );

            const tags = res.data;
            tagsCount += tags.length;
            hasMoreTags = tags.length === perPage;
            page++;
        }

        if (releasesCount === 0) {
            console.log("No hay Releases en el repositorio.");
            return {
                releasesCount: 0,
                tagsCount,
                descriptionReleasesPercent: 0,
                collaborativeReleasesPercent: 0,
                averageReleases,
                releaseParticipants: []
            };
        }

        const withDescription = allReleases.filter(r => r.body?.trim().length).length;
        const collaborativeReleases = allReleases.filter(r =>
            /@[a-z0-9_-]+/i.test(`${r.name || ""} ${r.body || ""}`)
        ).length;

        const releaseParticipantsMap = new Map();
        for (let i = 0; i < allReleases.length; i++) {
            const r = allReleases[i];
            if (r.author?.login) {
                releaseParticipantsMap.set(
                    r.author.login,
                    (releaseParticipantsMap.get(r.author.login) || 0) + 1
                );
            }
        }

        function toPercent(n) {
            return ((n / releasesCount) * 100).toFixed(2);
        }

        const releaseParticipants = Array.from(releaseParticipantsMap.entries())
            .map(([login, participations]) => ({ login, participations }));

        const stats = {
            releasesCount,
            tagsCount,
            descriptionReleasesPercent: toPercent(withDescription),
            collaborativeReleasesPercent: toPercent(collaborativeReleases),
            averageReleases: 0,
            releaseParticipants
        };

        console.log("Total de Releases:", releasesCount);
        console.log("Total de tags:", tagsCount);
        console.log("% Releases con descripción:", stats.descriptionReleasesPercent);
        console.log("% Releases colaborativas:", stats.collaborativeReleasesPercent);
        console.log("Media de Releases (cada", averageDays, " días):", stats.averageReleases);
        console.log("Usuarios que participaron en Releases:", stats.releaseParticipants);

        return stats;
    })();
}

module.exports = { getReleaseStats };
