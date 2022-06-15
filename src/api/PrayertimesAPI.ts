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
  console.log(`${constructDataBaseUrl(PRAYERTIMES_REPO_PATH)}/data/zones.json`);
  const response = await axios.get(
    `${constructDataBaseUrl(PRAYERTIMES_REPO_PATH)}/data/zones.json`,
  );
  return response.data;
}

export type DailyPrayertimesAPIResponse = {
  date: number;
  month: number;
  year: number;
  localityCode: string;
  source_id: number;
  times: string[6];
  updated: string;
};

export type YearlyPrayertimesAPIResponse = DailyPrayertimesAPIResponse[][12];

async function getTimesForYear(
  countryCode: string,
  locality: string,
  year: number,
): Promise<YearlyPrayertimesAPIResponse> {
  const response = await axios.get(
    `${constructDataBaseUrl(
      PRAYERTIMES_REPO_PATH,
    )}/data/${countryCode}/${locality}/${year}.json`,
  );
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

export type YearlyHijrisAPIResponse = DailyHijriAPIResponse[][12];

async function getHijrisForYear(
  countryCode: string,
  locality: string,
  year: number,
): Promise<YearlyHijrisAPIResponse> {
  console.log(
    `${constructDataBaseUrl(
      PRAYERTIMES_REPO_PATH,
    )}/hijri/${year}/${countryCode}-${locality}.json`,
  );
  const response = await axios.get(
    `${constructDataBaseUrl(
      PRAYERTIMES_REPO_PATH,
    )}/hijri/${year}/${countryCode}-${locality}.json`,
  );
  return response.data;
}

async function getPrayertimesLatestSHA(): Promise<string> {
  console.log(`${constructMetaBaseUrl(PRAYERTIMES_REPO_PATH)}`);
  const response = await axios.get(
    `${constructMetaBaseUrl(PRAYERTIMES_REPO_PATH)}`,
  );
  return response.data.sha;
}

export default {
  getZones,
  getTimesForYear,
  getHijrisForYear,
  getPrayertimesLatestSHA,
};
