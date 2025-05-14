const axios = require("axios");
const logger = require('../../logger');
const { getHeaders } = require('./github');

function getParticipantsStats(
    issueParticipants = [],
    commitParticipants = [],
    prParticipants = [],
    releaseParticipants = [],
    averageDays,
    startDate,
    endDate
) {
    const participantMap = new Map();

    function addParticipation(participantsList, type) {
        if (!Array.isArray(participantsList)) return;

        for (let i = 0; i < participantsList.length; i++) {
            const participant = participantsList[i];
            const login = participant.login;
            if (!participantMap.has(login)) {
                participantMap.set(login, { login, issues: 0, commits: 0, prs: 0, releases: 0 });
            }
            participantMap.get(login)[type] = participant.participations;
        }
    }

    addParticipation(issueParticipants, 'issues');
    addParticipation(commitParticipants, 'commits');
    addParticipation(prParticipants, 'prs');
    addParticipation(releaseParticipants, 'releases');

    const participants = Array.from(participantMap.values());
    const totalUsers = participants.length || 1;

    const usersWithCommits = participants.filter(p => p.commits > 0).length;
    const usersWithIssues = participants.filter(p => p.issues > 0).length;
    const usersWithPRs = participants.filter(p => p.prs > 0).length;
    const usersWithReleases = participants.filter(p => p.releases > 0).length;

    const totalParticipations = participants.reduce((sum, p) =>
        sum + p.issues + p.commits + p.prs + p.releases, 0
    );

    const lifeDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const periodCount = Math.ceil(lifeDays / averageDays) || 1;

    const averageUserActivity = (totalParticipations / totalUsers / periodCount).toFixed(2);

    function toPercent(n) {
        return ((n / totalUsers) * 100).toFixed(2);
    }

    const stats = {
        totalParticipants: totalUsers,
        commitParticipationPercent: toPercent(usersWithCommits),
        issueParticipationPercent: toPercent(usersWithIssues),
        prParticipationPercent: toPercent(usersWithPRs),
        releaseParticipationPercent: toPercent(usersWithReleases),
        averageUserActivity,
        participants
    };

    logger.info("Total de participantes únicos: " + stats.totalParticipants);
    logger.info("Porcentaje de participación en Issues: " + stats.issueParticipationPercent);
    logger.info("Porcentaje de participación en Commits: " + stats.commitParticipationPercent);
    logger.info("Porcentaje de participación en PRs: " + stats.prParticipationPercent);
    logger.info("Porcentaje de participación en Releases: " + stats.releaseParticipationPercent);
    logger.info("Media de actividad por usuario (cada " + averageDays + " días): " + stats.averageUserActivity);

    return stats;
}

module.exports = {
    getParticipantsStats
};