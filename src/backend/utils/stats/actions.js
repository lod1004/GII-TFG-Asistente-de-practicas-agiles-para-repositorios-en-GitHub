const axios = require("axios");
const { getHeaders } = require('./github');

async function getActionsStats(owner, repoTitle, startDate, endDate) {
    let actionsCount = 0;
    let actionsRuns = 0;
    let successfulRuns = 0;
    let runTimestamps = [];

    try {
        const res = await axios.get(
            `https://api.github.com/repos/${owner}/${repoTitle}/contents/.github/workflows`,
            { headers: getHeaders() }
        );

        const files = res.data || [];
        const workflows = files.filter(file =>
            file.name.endsWith(".yml") || file.name.endsWith(".yaml")
        );

        const validWorkflows = [];

        for (const workflow of workflows) {
            try {
                const commitsRes = await axios.get(
                    `https://api.github.com/repos/${owner}/${repoTitle}/commits?path=${encodeURIComponent(workflow.path)}&per_page=1&sha=main`,
                    { headers: getHeaders() }
                );

                const commit = commitsRes.data[0];
                if (commit) {
                    const commitDate = new Date(commit.commit.author.date);
                    if (commitDate >= startDate && commitDate <= endDate) {
                        validWorkflows.push(workflow);
                    }
                }
            } catch (err) {
                console.warn(`No se pudo obtener el commit para el workflow ${workflow.name}:`, err.message);
                continue;
            }
        }

        actionsCount = validWorkflows.length;
        console.log(`Workflows creados dentro del rango: ${actionsCount}`);
    } catch (err) {
        if (err.response?.status === 404) {
            console.log("No se encontraron workflows en .github/workflows.");
            return {
                actionsCount: 0,
                actionsRuns: 0,
                actionsSuccess: 0,
                actionFrequency: 0,
            };
        } else {
            console.error("Error al obtener los workflows:", err.message);
            return null;
        }
    }

    try {
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const res = await axios.get(
                `https://api.github.com/repos/${owner}/${repoTitle}/actions/runs?per_page=100&page=${page}`,
                { headers: getHeaders() }
            );

            const runs = res.data.workflow_runs || [];
            if (runs.length === 0) break;

            for (const run of runs) {
                const createdAt = new Date(run.created_at);
                if (createdAt >= startDate && createdAt <= endDate) {
                    actionsRuns++;
                    runTimestamps.push(createdAt.getTime());
                    if (run.conclusion === "success") successfulRuns++;
                }
            }

            hasMore = runs.length === 100;
            page++;
        }
    } catch (err) {
        console.error(`Error al obtener ejecuciones de workflows:`, err.message);
        return null;
    }

    let actionFrequency = 0;
    if (runTimestamps.length > 1) {
        runTimestamps.sort((a, b) => a - b);
        let totalDiff = 0;
        for (let i = 1; i < runTimestamps.length; i++) {
            totalDiff += runTimestamps[i] - runTimestamps[i - 1];
        }
        const averageDiffMs = totalDiff / (runTimestamps.length - 1);
        actionFrequency = (averageDiffMs / (1000 * 60 * 60 * 24)).toFixed(2);
    }

    const actionsSuccess = actionsRuns > 0
        ? ((successfulRuns / actionsRuns) * 100).toFixed(2)
        : "0.00";

    console.log("Ejecuciones totales de workflows:", actionsRuns);
    console.log("Workflows exitosos:", actionsSuccess + "%");
    console.log("Frecuencia media de ejecución:", actionFrequency + " días");

    return {
        actionsCount,
        actionsRuns,
        actionsSuccess,
        actionFrequency
    };
}

module.exports = { getActionsStats };