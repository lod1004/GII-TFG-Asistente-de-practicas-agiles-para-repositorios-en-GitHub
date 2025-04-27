const axios = require("axios");
const { getHeaders } = require('./github');

const getParticipantsStats = (issueParticipants = [], commitParticipants = [], prParticipants = [], releaseParticipants = []) => {

    const participantMap = new Map();

    const addParticipation = (participantsList, type) => {
        if (!Array.isArray(participantsList)) return; 

        for (const participant of participantsList) {
            const login = participant.login;
            if (!participantMap.has(login)) {
                participantMap.set(login, { login, issues: 0, commits: 0, prs: 0, releases: 0 });
            }
            participantMap.get(login)[type] = participant.participations;
        }
    };

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

    const toPercent = (n) => ((n / totalUsers) * 100).toFixed(2);

    const stats = {
        commitParticipationPercent: toPercent(usersWithCommits),
        issueParticipationPercent: toPercent(usersWithIssues),
        prParticipationPercent: toPercent(usersWithPRs),
        releaseParticipationPercent: toPercent(usersWithReleases),
        participants
    };

    console.log("Porcentaje de participación en Issues:", stats.issueParticipationPercent);
    console.log("Porcentaje de participación en Commits:", stats.commitParticipationPercent);
    console.log("Porcentaje de participación en PRs:", stats.prParticipationPercent);
    console.log("Porcentaje de participación en Releases:", stats.releaseParticipationPercent);

    return stats;
};

module.exports = {
    getParticipantsStats
};


module.exports = {
    getParticipantsStats
};
