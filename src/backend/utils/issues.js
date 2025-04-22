const axios = require("axios");
const { getHeaders  } = require('./github');

async function getIssueStats(owner, repoTitle) {

    const [openRes, closedRes] = await Promise.all([
        axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repoTitle}+type:issue+state:open`, { headers: getHeaders() }),
        axios.get(`https://api.github.com/search/issues?q=repo:${owner}/${repoTitle}+type:issue+state:closed`, { headers: getHeaders() }),
    ]);

    const openIssuesCount = openRes.data.total_count;
    const closedIssuesCount = closedRes.data.total_count;

    console.log("Issues abiertas:", openIssuesCount);
    console.log("Issues cerradas:", closedIssuesCount);

    return { openIssuesCount, closedIssuesCount };
}

async function getIssueQualityStats(owner, repoTitle) {
    let allIssues = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const res = await axios.get(
            `https://api.github.com/repos/${owner}/${repoTitle}/issues?state=all&per_page=${perPage}&page=${page}`,
            { headers: getHeaders() }
        );

        const issues = res.data.filter(issue => !issue.pull_request);
        allIssues = allIssues.concat(issues);

        if (issues.length < perPage) break;
        page++;
    }

    const total = allIssues.length;
    if (total === 0) {
        console.log("No hay issues en el repositorio.");
        return {};
    }

    const withDescription = allIssues.filter(issue => issue.body && issue.body.trim().length > 0).length;
    const withBodyImages = allIssues.filter(issue =>
        /!\[.*?\]\(.*?\)|<img\s+.*?>/i.test(issue.body || "")
    ).length;

    let withComments = 0;
    let withImageComments = 0;

    for (const issue of allIssues) {
        const commentRes = await axios.get(
            `https://api.github.com/repos/${owner}/${repoTitle}/issues/${issue.number}/comments`,
            { headers: getHeaders() }
        );

        const comments = commentRes.data;
        if (comments.length > 0) withComments++;

        if (comments.some(comment => /!\[.*?\]\(.*?\)|<img\s+.*?>/i.test(comment.body || ""))) {
            withImageComments++;
        }
    }

    const withImages = withBodyImages + withImageComments;

    const withAssignees = allIssues.filter(issue => issue.assignees && issue.assignees.length > 0).length;
    const withLabels = allIssues.filter(issue => issue.labels && issue.labels.length > 0).length;
    const withMilestones = allIssues.filter(issue => issue.milestone !== null).length;

    const toPercent = (n) => (n / total) * 100;

    const stats = {
        descriptionIssuesPercent: toPercent(withDescription),
        imagedIssuesPercent: toPercent(withImages),
        commentedIssuesPercent: toPercent(withComments),
        assignedIssuesPercent: toPercent(withAssignees),
        labeledIssuesPercent: toPercent(withLabels),
        milestonedIssuesPercent: toPercent(withMilestones),
    };

    console.log("% Issues con descripción:", stats.descriptionIssuesPercent.toFixed(2));
    console.log("% Issues con comentarios:", stats.commentedIssuesPercent.toFixed(2));
    console.log("% Issues con imágenes en descripción o comentarios:", stats.imagedIssuesPercent.toFixed(2));
    console.log("% Issues con personas asignadas:", stats.assignedIssuesPercent.toFixed(2));
    console.log("% Issues con etiquetas:", stats.labeledIssuesPercent.toFixed(2));
    console.log("% Issues con milestone:", stats.milestonedIssuesPercent.toFixed(2));

    return stats;
}


module.exports = {
    getIssueStats,
    getIssueQualityStats,
};