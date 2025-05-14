const axios = require("axios");
const logger = require('../../logger');
const { getHeaders } = require('./github');

function getIssueStats(owner, repoTitle, averageDays, startDate, endDate) {
    const perPage = 100;

    return (async function () {
        let allIssues = [];
        let page = 1;
        let hasMoreIssues = true;

        while (hasMoreIssues) {
            try {
                const res = await axios.get(
                    `https://api.github.com/repos/${owner}/${repoTitle}/issues?state=all&per_page=${perPage}&page=${page}`,
                    { headers: getHeaders() }
                );

                const issues = res.data.filter(issue => !issue.pull_request);
                allIssues = allIssues.concat(issues);

                hasMoreIssues = issues.length === perPage;
                page++;
            } catch (err) {
                logger.error(`Error obteniendo las Issues:` + err.message);
                return null;
            }
        }

        allIssues = allIssues.filter(issue => {
            const createdAt = new Date(issue.created_at);
            return createdAt >= startDate && createdAt <= endDate;
        });

        const openIssuesCount = allIssues.filter(issue => issue.state === 'open').length;
        const closedIssuesList = allIssues.filter(issue => issue.state === 'closed');
        const closedIssuesCount = closedIssuesList.length;

        const totalClosedTime = closedIssuesList.reduce((sum, issue) => {
            if (issue.closed_at) {
                const created = new Date(issue.created_at);
                const closed = new Date(issue.closed_at);
                const diffDays = (closed - created) / (1000 * 60 * 60 * 24);
                return sum + diffDays;
            }
            return sum;
        }, 0);

        const averageCloseTime = closedIssuesCount > 0
            ? (totalClosedTime / closedIssuesCount).toFixed(2)
            : "0.00";

        const issuesCount = openIssuesCount + closedIssuesCount;

        const lifeDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
        const periodCount = Math.ceil(lifeDays / averageDays);
        const averageClosedIssues = periodCount > 0 ? (closedIssuesCount / periodCount).toFixed(2) : "0.00";

        const total = allIssues.length;
        if (total === 0) {
            logger.info("No hay Issues en el repositorio.");
            return {
                openIssuesCount,
                closedIssuesCount,
                issuesCount,
                averageClosedIssues: 0,
                averageCloseTime: 0,
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

        const issueParticipantsMap = new Map();

        for (const issue of allIssues) {
            if (issue.body && issue.body.trim().length > 0) withDescription++;
            if (/!\[.*?\]\(.*?\)|<img\s+.*?>/i.test(issue.body || "")) withBodyImages++;
            if (issue.assignees?.length > 0) withAssignees++;
            if (issue.labels?.length > 0) withLabels++;
            if (issue.milestone !== null) withMilestones++;
            if (issue.labels.some(label => labelRegex.test(label.name))) issuesWithStoryPoints++;

            if (issue.user?.login) {
                const login = issue.user.login;
                issueParticipantsMap.set(login, (issueParticipantsMap.get(login) || 0) + 1);
            }

            if (issue.assignees?.length > 0) {
                issue.assignees.forEach(assignee => {
                    if (assignee.login) {
                        issueParticipantsMap.set(assignee.login, (issueParticipantsMap.get(assignee.login) || 0) + 1);
                    }
                });
            }

            let comments = [];
            let events = [];

            try {
                const [commentRes, eventsRes] = await Promise.all([
                    axios.get(`https://api.github.com/repos/${owner}/${repoTitle}/issues/${issue.number}/comments`, { headers: getHeaders() }),
                    axios.get(`https://api.github.com/repos/${owner}/${repoTitle}/issues/${issue.number}/events`, { headers: getHeaders() })
                ]);
                comments = commentRes.data;
                events = eventsRes.data;
            } catch (err) {
                logger.error(`Error obteniendo comentarios o eventos del issue #${issue.number}:` + err.message);
                continue;
            }

            if (comments.length > 0) withComments++;
            if (comments.some(c => /!\[.*?\]\(.*?\)|<img\s+.*?>/i.test(c.body || ""))) withImageComments++;

            comments.forEach(c => {
                if (c.user?.login) {
                    const login = c.user.login;
                    issueParticipantsMap.set(login, (issueParticipantsMap.get(login) || 0) + 1);
                }
            });

            const mentionedInBody = (issue.body || "").includes("@");
            const mentionsInComments = comments.some(c => (c.body || "").includes("@"));
            const multipleAssignees = issue.assignees && issue.assignees.length >= 2;
            if (multipleAssignees || mentionedInBody || mentionsInComments) collaborativeIssues++;

            const wasReopened = events.some(event => event.event === "reopened");
            if (wasReopened) reopenedIssues++;
        }

        const withImages = withBodyImages + withImageComments;

        const toPercent = (n) => (n / total) * 100;

        const issueParticipants = Array.from(issueParticipantsMap.entries())
            .map(([login, participations]) => ({ login, participations }));

        const stats = {
            openIssuesCount,
            closedIssuesCount,
            issuesCount,
            averageClosedIssues,
            averageCloseTime,
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

        logger.info("Issues abiertas: " + stats.openIssuesCount);
        logger.info("Issues cerradas: " + stats.closedIssuesCount);
        logger.info("Total Issues (abiertas + cerradas): " + stats.issuesCount);
        logger.info("Media de Issues cerradas (cada " + averageDays + " días): " + stats.averageClosedIssues);
        logger.info("Tiempo medio de cierre de Issues (en días): " + stats.averageCloseTime);
        logger.info("% Issues con descripción: " + stats.descriptionIssuesPercent);
        logger.info("% Issues con imágenes: " + stats.imagedIssuesPercent);
        logger.info("% Issues con comentarios: " + stats.commentedIssuesPercent);
        logger.info("% Issues con personas asignadas: " + stats.assignedIssuesPercent);
        logger.info("% Issues con etiquetas: " + stats.labeledIssuesPercent);
        logger.info("% Issues con milestone: " + stats.milestonedIssuesPercent);
        logger.info("% Issues con Story Points: " + stats.storyPointsIssuesPercent);
        logger.info("% Issues reabiertas: " + stats.reopenedIssuesPercent);
        logger.info("% Issues colaborativas: " + stats.collaborativeIssuesPercent);
        logger.info("Usuarios que participaron en Issues: " + stats.issueParticipants);

        return stats;
    })();

}

module.exports = {
    getIssueStats
};