import axios from 'axios';
import { constructDataBaseUrl, constructMetaBaseUrl } from './utils';

const MUSOLLA_REPO_PATH = 'ruqqq/musolla-database';

export type MusollasAPIResponse = {
  [id: string]: {
    uuid: string;
    type: 'Musolla' | 'Mosque';
    geohash: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    address: string;
    contact?: string;
    directions?: string;
    level?: string;
    location: {
      latitude: number;
      longitude: number;
    };
    mrt?: string;
    provision?: string;
    toiletLevel?: string;
    remarks?: string;
  };
};

async function getMusollas(): Promise<MusollasAPIResponse> {
  const response = await axios.get(
    `${constructDataBaseUrl(MUSOLLA_REPO_PATH)}/data.json`,
  );
  return response.data;
}

async function getMusollasLatestSHA(): Promise<string> {
  const response = await axios.get(
    `${constructMetaBaseUrl(MUSOLLA_REPO_PATH)}`,
  );
  return response.data.sha;
}

export default {
  getMusollas,
  getMusollasLatestSHA,
};
