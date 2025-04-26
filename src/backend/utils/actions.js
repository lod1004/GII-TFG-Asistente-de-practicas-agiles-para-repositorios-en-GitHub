const axios = require("axios");
const { getHeaders } = require('./github');

const getActions = async (owner, repo) => {

    try {
        const res = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents/.github/workflows`,
            { headers: getHeaders() }
        );

        const files = res.data || [];
        const workflowFiles = files.filter(file =>
            file.name.endsWith(".yml") || file.name.endsWith(".yaml")
        );

        console.log(`El repositorio tiene ${workflowFiles.length} workflow(s) de GitHub Actions`);

        actionsCount = workflowFiles.length;

        return { actionsCount }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log("No se encontraron workflows en .github/workflows");
            actionsCount = 0
            return { actionsCount };
        }
    }
};

const getActionsSuccess = async (owner, repo) => {
    let page = 1;
    let actionsRuns = 0;
    let successfulRuns = 0;

    try {
        while (true) {
            const res = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=100&page=${page}`,
                { headers: getHeaders() }
            );

            const runs = res.data.workflow_runs || [];
            if (runs.length === 0) break;

            actionsRuns += runs.length;
            successfulRuns += runs.filter(run => run.conclusion === "success").length;

            page++;
        }

        const actionsSuccess = actionsRuns > 0
            ? parseFloat(((successfulRuns / actionsRuns) * 100).toFixed(2))
            : 0;

        console.log(`Ejecuciones totales de los workflows: ${actionsRuns}`);
        console.log(`Workflows ejecutados con éxito: ${actionsSuccess}%`);

        return { actionsRuns, actionsSuccess };
    } catch (error) {
        console.error("Error al obtener las ejecuciones de los workflows:", error.message);
        return { actionsRuns: 0, actionsSuccess: 0 };
    }
};


module.exports = {
    getActions,
    getActionsSuccess
};