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

        if (issues.length < perPage) break;
        page++;
    }

    const total = allIssues.length;
    if (total === 0) {
        console.log("No hay issues en el repositorio.");
        return {
            descriptionIssuesPercent: 0,
            imagedIssuesPercent: 0,
            commentedIssuesPercent: 0,
            assignedIssuesPercent: 0,
            labeledIssuesPercent: 0,
            milestonedIssuesPercent: 0,
            storyPointsIssuesPercent: 0,
            reopenedIssuesPercent: 0,
            collaborativeIssuesPercent: 0,
            issueParticipants: []
        };
    }

    const labelRegex = /(p:\d+|story[-_ ]?points?:?:?\d*)/i;

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

    const issueParticipantsMap = new Map(); // login -> nº de participaciones

    for (const issue of allIssues) {
        if (issue.body && issue.body.trim().length > 0) { withDescription++; }
        if (/!\[.*?\]\(.*?\)|<img\s+.*?>/i.test(issue.body || "")) { withBodyImages++; }
        if (issue.assignees && issue.assignees.length > 0) { withAssignees++; }
        if (issue.labels && issue.labels.length > 0) { withLabels++; }
        if (issue.milestone !== null) { withMilestones++; }
        if (issue.labels.some(label => labelRegex.test(label.name))) { issuesWithStoryPoints++; }

        if (issue.user && issue.user.login) {
            const login = issue.user.login;
            issueParticipantsMap.set(login, (issueParticipantsMap.get(login) || 0) + 1);
        }

        if (issue.assignees && issue.assignees.length > 0) {
            issue.assignees.forEach(assignee => {
                if (assignee.login) {
                    issueParticipantsMap.set(assignee.login, (issueParticipantsMap.get(assignee.login) || 0) + 1);
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
            if (comment.user && comment.user.login) {
                const login = comment.user.login;
                issueParticipantsMap.set(login, (issueParticipantsMap.get(login) || 0) + 1);
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

    const toPercent = (n) => (n / total) * 100;

    const issueParticipants = Array.from(issueParticipantsMap.entries())
        .map(([login, participations]) => ({ login, participations }));

    const stats = {
        descriptionIssuesPercent: toPercent(withDescription).toFixed(2),
        imagedIssuesPercent: toPercent(withImages).toFixed(2),
        commentedIssuesPercent: toPercent(withComments).toFixed(2),
        assignedIssuesPercent: toPercent(withAssignees).toFixed(2),
        labeledIssuesPercent: toPercent(withLabels).toFixed(2),
        milestonedIssuesPercent: toPercent(withMilestones).toFixed(2),
        storyPointsIssuesPercent: toPercent(issuesWithStoryPoints).toFixed(2),
        reopenedIssuesPercent: toPercent(reopenedIssues).toFixed(2),
        collaborativeIssuesPercent: toPercent(collaborativeIssues).toFixed(2),
        issueParticipants
    };

    console.log("% Issues con descripción:", stats.descriptionIssuesPercent);
    console.log("% Issues con imágenes:", stats.imagedIssuesPercent);
    console.log("% Issues con comentarios:", stats.commentedIssuesPercent);
    console.log("% Issues con personas asignadas:", stats.assignedIssuesPercent);
    console.log("% Issues con etiquetas:", stats.labeledIssuesPercent);
    console.log("% Issues con milestone:", stats.milestonedIssuesPercent);
    console.log("% Issues con Story Points:", stats.storyPointsIssuesPercent);
    console.log("% Issues reabiertas:", stats.reopenedIssuesPercent);
    console.log("% Issues colaborativas:", stats.collaborativeIssuesPercent);
    console.log("Usuarios que participaron en Issues:", stats.issueParticipants);

    return stats;
}


module.exports = {
    getIssueStats,
    getIssueQualityStats,
};