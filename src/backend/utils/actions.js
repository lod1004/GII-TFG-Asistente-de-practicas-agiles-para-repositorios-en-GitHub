const axios = require("axios");
const { getHeaders  } = require('./github');

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

module.exports = {
    getActions,
};