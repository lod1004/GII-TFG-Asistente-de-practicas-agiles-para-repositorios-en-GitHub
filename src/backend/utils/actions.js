const axios = require("axios");
const { getHeaders } = require('./github');

const getActionsStats = async (owner, repoTitle, startDate, endDate) => {
    let actionsCount = 0;
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
        console.log(`El repositorio tiene ${actionsCount} workflow(s) de GitHub Actions`);
    } catch (err) {
        if (err.response?.status === 404) {
            console.log("No se encontraron workflows en .github/workflows");
        }
    }

    let page = 1;
    let actionsRuns = 0;
    let successfulRuns = 0;

    try {
        while (true) {
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
                    if (run.conclusion === "success") successfulRuns++;
                }
            }

            if (runs.length < 100) break;
            page++;
        }
    } catch (err) {
        console.error("Error al obtener las ejecuciones de workflows:", err.message);
    }

    const actionsSuccess = actionsRuns > 0
        ? ((successfulRuns / actionsRuns) * 100).toFixed(2)
        : 0;

    console.log(`Ejecuciones totales de workflows: ${actionsRuns}`);
    console.log(`Workflows ejecutados con éxito: ${actionsSuccess}%`);

    return { actionsCount, actionsRuns, actionsSuccess };
};

module.exports = { getActionsStats };