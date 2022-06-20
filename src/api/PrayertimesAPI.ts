import axios from 'axios';
import { constructDataBaseUrl, constructMetaBaseUrl } from './utils';

const PRAYERTIMES_REPO_PATH = 'ruqqq/prayertimes-database';

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

async function getZones(): Promise<ZonesAPIResponse> {
  const url = `${constructDataBaseUrl(PRAYERTIMES_REPO_PATH)}/data/zones.json`;
  console.log(`GET ${url}`);
  const response = await axios.get(url);
  return response.data;
}

export type DailyPrayertimesAPIResponse = {
  date: number;
  month: number;
  year: number;
  localityCode: string;
  source_id: number;
  times: [string, string, string, string, string, string];
  updated: string;
};

export type YearlyPrayertimesAPIResponse = DailyPrayertimesAPIResponse[][];

async function getTimesForYear(
  countryCode: string,
  locality: string,
  year: number,
): Promise<YearlyPrayertimesAPIResponse> {
  const url = `${constructDataBaseUrl(
    PRAYERTIMES_REPO_PATH,
  )}/data/${countryCode}/${locality}/${year}.json`;
  console.log(`GET ${url}`);
  const response = await axios.get(url);
  return response.data;
}

export type DailyHijriAPIResponse = {
  hijriDate: number;
  hijriMonth: number;
  hijriYear: number;
  date: number;
  month: number;
  year: number;
  localityCode: string;
  source_id: number;
};

export type YearlyHijrisAPIResponse = DailyHijriAPIResponse[][];

async function getHijrisForYear(
  countryCode: string,
  locality: string,
  year: number,
): Promise<YearlyHijrisAPIResponse> {
  const url = `${constructDataBaseUrl(
    PRAYERTIMES_REPO_PATH,
  )}/hijri/${year}/SG-1.json`;
  console.log(`GET ${url}`);
  // The API has no support for other locality yet
  const response = await axios.get(url);
  return response.data.map((months: any[]) =>
    months.map(item => ({
      ...item,
      localityCode: `${countryCode}-${locality}`,
    })),
  );
}

async function getPrayertimesLatestSHA(): Promise<string> {
  const url = `${constructMetaBaseUrl(PRAYERTIMES_REPO_PATH)}`;
  console.log(`GET ${url}`);
  const response = await axios.get(url);
  return response.data.sha;
}

export default {
  getZones,
  getTimesForYear,
  getHijrisForYear,
  getPrayertimesLatestSHA,
};
