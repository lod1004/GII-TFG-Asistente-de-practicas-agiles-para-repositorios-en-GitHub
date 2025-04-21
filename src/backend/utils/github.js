function getHeaders() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
  };
}
function extractOwnerAndRepo(url) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repoTitle: match[2]
  };
}

module.exports = {
  extractOwnerAndRepo,
  getHeaders
};
