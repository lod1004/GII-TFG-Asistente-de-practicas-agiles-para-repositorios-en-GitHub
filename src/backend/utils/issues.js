const axios = require("axios");
const { getHeaders } = require('./github');

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

        if ( issues.length < perPage ) break;

        page++;
    }

    const total = allIssues.length;
    if (total === 0) {
        console.log("No hay issues en el repositorio.");
        return {};
    }

    const labelRegex = /(p:\d+|story[-_ ]?points?:?:?\d*)/i;

    const repoContributorsRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repoTitle}/contributors`,
        { headers: getHeaders() }
    );
    const contributors = repoContributorsRes.data.map(c => c.login);
    const contributorsSet = new Set(contributors);

    let withDescription = 0;
    let withBodyImages = 0;
    let withComments = 0;
    let withImageComments = 0;
    let withAssignees = 0;
    let withLabels = 0;
    let withMilestones = 0;
    let issuesWithStoryPoints = 0;
    let reopenedIssues = 0;
    let collaborativeIssues = 0;

    const participatingAuthors = new Set();

    for (const issue of allIssues) {
        if (issue.body && issue.body.trim().length > 0) {withDescription++;}
        if (/!\[.*?\]\(.*?\)|<img\s+.*?>/i.test(issue.body || "")) {withBodyImages++;}
        if (issue.assignees && issue.assignees.length > 0) {withAssignees++;}
        if (issue.labels && issue.labels.length > 0) {withLabels++;}
        if (issue.milestone !== null) {withMilestones++;}
        if (issue.labels.some(label => labelRegex.test(label.name))) {issuesWithStoryPoints++;}

        if (issue.user && contributorsSet.has(issue.user.login)) {
            participatingAuthors.add(issue.user.login);
        }
        if (issue.assignees && issue.assignees.length > 0) {
            issue.assignees.forEach(assignee => {
                if (contributorsSet.has(assignee.login)) {
                    participatingAuthors.add(assignee.login);
                }
            });
        }

        const [commentRes, eventsRes] = await Promise.all([
            axios.get(`https://api.github.com/repos/${owner}/${repoTitle}/issues/${issue.number}/comments`, { headers: getHeaders() }),
            axios.get(`https://api.github.com/repos/${owner}/${repoTitle}/issues/${issue.number}/events`, { headers: getHeaders() })
        ]);

        const comments = commentRes.data;
        if (comments.length > 0) withComments++;
        if (comments.some(comment => /!\[.*?\]\(.*?\)|<img\s+.*?>/i.test(comment.body || ""))) withImageComments++;

        comments.forEach(comment => {
            if (comment.user && contributorsSet.has(comment.user.login)) {
                participatingAuthors.add(comment.user.login);
            }
        });

        const mentionedInBody = (issue.body || "").includes("@");
        const mentionsInComments = comments.some(comment => (comment.body || "").includes("@"));
        const multipleAssignees = issue.assignees && issue.assignees.length >= 2;
        if (multipleAssignees || mentionedInBody || mentionsInComments) collaborativeIssues++;

        const events = eventsRes.data;
        const wasReopened = events.some(event => event.event === "reopened");
        if (wasReopened) reopenedIssues++;
    }

    const withImages = withBodyImages + withImageComments;
    const authorsWhoParticipated = participatingAuthors.size;
    const toPercent = (n) => (n / total) * 100;
    const toPercentAuthors = (n) => (n / contributors.length) * 100;

    const stats = {
        descriptionIssuesPercent: toPercent(withDescription),
        imagedIssuesPercent: toPercent(withImages),
        commentedIssuesPercent: toPercent(withComments),
        assignedIssuesPercent: toPercent(withAssignees),
        labeledIssuesPercent: toPercent(withLabels),
        milestonedIssuesPercent: toPercent(withMilestones),
        storyPointsIssuesPercent: toPercent(issuesWithStoryPoints),
        reopenedIssuesPercent: toPercent(reopenedIssues),
        issueParticipationPercent: toPercentAuthors(authorsWhoParticipated),
        collaborativeIssuesPercent: toPercent(collaborativeIssues),
    };

    console.log("% Issues con descripción:", stats.descriptionIssuesPercent.toFixed(2));
    console.log("% Issues con comentarios:", stats.commentedIssuesPercent.toFixed(2));
    console.log("% Issues con imágenes en descripción o comentarios:", stats.imagedIssuesPercent.toFixed(2));
    console.log("% Issues con personas asignadas:", stats.assignedIssuesPercent.toFixed(2));
    console.log("% Issues con etiquetas:", stats.labeledIssuesPercent.toFixed(2));
    console.log("% Issues con milestone:", stats.milestonedIssuesPercent.toFixed(2));
    console.log("% Issues con Story Points:", stats.storyPointsIssuesPercent.toFixed(2));
    console.log("% Issues reabiertas:", stats.reopenedIssuesPercent.toFixed(2));
    console.log("% Participación de colaboradores en las Issues:", stats.issueParticipationPercent.toFixed(2));
    console.log("% Issues colaborativas:", stats.collaborativeIssuesPercent.toFixed(2));

    return stats;
}

module.exports = {
    getIssueStats,
    getIssueQualityStats,
};