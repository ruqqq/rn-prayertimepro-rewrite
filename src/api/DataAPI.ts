import axios from 'axios';

const PRAYERTIMES_REPO_PATH = 'ruqqq/prayertimes-database';
// const MUSOLLA_REPO_PATH = 'ruqqq/musolla-database';

function constructDataBaseUrl(repoPath: string, branch = 'master'): string {
  return `https://raw.githubusercontent.com/${repoPath}/${branch}`;
}

/* function constructMetaBaseUrl(repoPath: string, branch = 'master'): string {
  return `https://api.github.com/repos/${repoPath}/commits/${branch}`;
} */

export type ZonesAPIResponse = {
  [state: string]: {
    code: string;
    state: string;
    city: string;
    lat: number;
    lng: number;
    timezone: string;
  }[];
};

export async function getZones(): Promise<ZonesAPIResponse> {
  const response = await axios.get(
    `${constructDataBaseUrl(PRAYERTIMES_REPO_PATH)}/data/zones.json`,
  );
  return response.data;
}
