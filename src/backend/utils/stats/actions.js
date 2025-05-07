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
        actionsCount = workflows.length;

        console.log(`El repositorio tiene ${actionsCount} workflow(s) de GitHub Actions.`);
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
            try {
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
            } catch (err) {
                console.error(`Error al obtener las ejecuciones de los workflows:`, err.message);
                return null;
            }
        }
    } catch (err) {
        console.error("Error general al obtener los ficheros workflow y sus ejecuciones", err.message);
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