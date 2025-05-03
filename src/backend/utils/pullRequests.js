const axios = require("axios");
const { getHeaders } = require('./github');

function getPullRequestStats(owner, repoTitle, averageDays, startDate, endDate) {
    const perPage = 100;

    return (async function () {
        let allPRs = [];
        let page = 1;
        let hasMorePRs = true;

        while (hasMorePRs) {
            const res = await axios.get(
                `https://api.github.com/repos/${owner}/${repoTitle}/pulls?state=all&per_page=${perPage}&page=${page}`,
                { headers: getHeaders() }
            );

            const prs = res.data;
            allPRs.push(...prs);
            hasMorePRs = prs.length === perPage;
            page++;
        }

        allPRs = allPRs.filter(pr => {
            const createdAt = new Date(pr.created_at);
            return createdAt >= startDate && createdAt <= endDate;
        });

        const total = allPRs.length;
        const lifeDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
        const periodCount = Math.ceil(lifeDays / averageDays);

        if (total === 0) {
            console.log("No hay pull requests en el repositorio.");
            return {
                openPrCount: 0,
                closedPrCount: 0,
                reviewersPrPercent: 0,
                assigneesPrPercent: 0,
                labelsPrPercent: 0,
                milestonesPrPercent: 0,
                collaborativePrPercent: 0,
                averageClosedPr,
                prParticipants: []
            };
        }

        const openPrCount = allPRs.filter(pr => pr.state === "open").length;
        const closedPrCount = allPRs.filter(pr => pr.state === "closed").length;
        const averageClosedPr = periodCount > 0 ? (closedPrCount / periodCount).toFixed(2) : "0.00";
        const withReviewers = allPRs.filter(pr => pr.requested_reviewers?.length).length;
        const withAssignees = allPRs.filter(pr => pr.assignees?.length).length;
        const withLabels = allPRs.filter(pr => pr.labels?.length).length;
        const withMilestones = allPRs.filter(pr => pr.milestone !== null).length;

        let collaborativePRs = 0;
        const prParticipantsMap = new Map();

        for (let i = 0; i < allPRs.length; i++) {
            const pr = allPRs[i];
            const text = `${pr.title} ${pr.body || ""}`;
            if (/@[a-z0-9_-]+/i.test(text)) collaborativePRs++;

            if (pr.user?.login) {
                prParticipantsMap.set(
                    pr.user.login,
                    (prParticipantsMap.get(pr.user.login) || 0) + 1
                );
            }
        }

        function toPercent(n) {
            return ((n / total) * 100).toFixed(2);
        }

        const prParticipants = Array.from(prParticipantsMap.entries())
            .map(([login, participations]) => ({ login, participations }));

        const stats = {
            openPrCount,
            closedPrCount,
            reviewersPrPercent: toPercent(withReviewers),
            assigneesPrPercent: toPercent(withAssignees),
            labelsPrPercent: toPercent(withLabels),
            milestonesPrPercent: toPercent(withMilestones),
            collaborativePrPercent: toPercent(collaborativePRs),
            averageClosedPr,
            prParticipants
        };

        console.log("Pull requests abiertas:", openPrCount);
        console.log("Pull requests cerradas:", closedPrCount);
        console.log("% PRs con reviewers:", stats.reviewersPrPercent);
        console.log("% PRs con assignees:", stats.assigneesPrPercent);
        console.log("% PRs con labels:", stats.labelsPrPercent);
        console.log("% PRs con milestone:", stats.milestonesPrPercent);
        console.log("% PRs colaborativas:", stats.collaborativePrPercent);
        console.log("Media de PRs (cada", averageDays, " días):", stats.averageClosedPr);
        console.log("Usuarios que participaron en PRs:", prParticipants);

        return stats;
    })();
}

module.exports = { getPullRequestStats };
