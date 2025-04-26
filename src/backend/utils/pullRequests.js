const axios = require("axios");
const { getHeaders } = require('./github');

async function getPullRequestStats(owner, repoTitle) {

    const [openRes, closedRes] = await Promise.all([
        axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repoTitle}+type:pr+state:open`, { headers: getHeaders() }),
        axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repoTitle}+type:pr+state:closed`, { headers: getHeaders() })
    ]);

    const openPrCount = openRes.data.total_count;
    const closedPrCount = closedRes.data.total_count;

    console.log("Pull requests abiertas:", openPrCount);
    console.log("Pull requests cerradas:", closedPrCount);

    return { openPrCount, closedPrCount };
}

const getPullRequestQualityStats = async (owner, repoTitle) => {
    let allPRs = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const res = await axios.get(
            `https://api.github.com/repos/${owner}/${repoTitle}/pulls?state=all&per_page=${perPage}&page=${page}`,
            { headers: getHeaders() }
        );

        const prs = res.data;
        if (prs.length === 0) break;

        allPRs.push(...prs);

        if (prs.length < perPage) break;
        page++;
    }

    const total = allPRs.length;
    if (total === 0) {
        console.log("No hay pull requests en el repositorio.");
        return {        
            assigneesPrPercent: 0,
            labelsPrPercent: 0,
            milestonesPrPercent: 0,
            collaborativePrPercent: 0,
            prParticipationPercent: 0
        };
    }

    const repoContributorsRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repoTitle}/contributors`,
        { headers: getHeaders() }
    );
    const contributors = repoContributorsRes.data.map(c => c.login);
    const contributorsSet = new Set(contributors);

    const withReviewers = allPRs.filter(pr => pr.requested_reviewers && pr.requested_reviewers.length > 0).length;
    const withAssignees = allPRs.filter(pr => pr.assignees && pr.assignees.length > 0).length;
    const withLabels = allPRs.filter(pr => pr.labels && pr.labels.length > 0).length;
    const withMilestones = allPRs.filter(pr => pr.milestone !== null).length;

    let collaborativePRs = 0;
    const participatingAuthors = new Set();

    for (const pr of allPRs) {
        const textToCheck = (pr.title || "") + " " + (pr.body || "");
        if (/@[a-z0-9_-]+/i.test(textToCheck)) {
            collaborativePRs++;
        }

        // console.log(pr.user)
        // console.log(contributors)
        // console.log(contributors.length)
        if (pr.user && contributorsSet.has(pr.user.login)) {
            participatingAuthors.add(pr.user.login);
        }
    }

    const toPercent = n => ((n / total) * 100).toFixed(2);
    const toPercentAuthors = n => ((n / contributors.length) * 100).toFixed(2);

    const stats = {
        reviewersPrPercent: toPercent(withReviewers),
        assigneesPrPercent: toPercent(withAssignees),
        labelsPrPercent: toPercent(withLabels),
        milestonesPrPercent: toPercent(withMilestones),
        collaborativePrPercent: toPercent(collaborativePRs),
        prParticipationPercent: toPercentAuthors(participatingAuthors.size)
    };

    console.log("% PRs con reviewers:", stats.reviewersPrPercent);
    console.log("% PRs con assignees:", stats.assigneesPrPercent);
    console.log("% PRs con labels:", stats.labelsPrPercent);
    console.log("% PRs con milestone:", stats.milestonesPrPercent);
    console.log("% PRs colaborativas (menciones @):", stats.collaborativePrPercent);
    console.log("% Participación de colaboradores en PRs:", stats.prParticipationPercent);

    return stats;
};


module.exports = {
    getPullRequestStats,
    getPullRequestQualityStats,
};