export function constructDataBaseUrl(
  repoPath: string,
  branch = 'master',
): string {
  return `https://raw.githubusercontent.com/${repoPath}/${branch}`;
}

export function constructMetaBaseUrl(
  repoPath: string,
  branch = 'master',
): string {
  return `https://api.github.com/repos/${repoPath}/commits/${branch}`;
}
