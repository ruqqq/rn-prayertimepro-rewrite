import { valueOf, ValueType } from './utils';

type ZoneCode = ValueType<'ZoneCode', string>;
export function zoneCodeOf(code: string): ZoneCode {
  return ['ZoneCode', code];
}

type State = ValueType<'State', string>;
export function stateOf(state: string): State {
  return ['State', state];
}

type City = ValueType<'City', string>;
export function cityOf(city: string): City {
  return ['City', city];
}

type Country = ValueType<'Country', string>;
export function countryOf(country: string): Country {
  return ['Country', country];
}

export function countryFromState(state: string): Country {
  if (state === 'Singapore') {
    return ['Country', 'SG'];
  }

  return ['Country', 'MY'];
}

type LatLng = ValueType<'LatLng', number>;
export function latLngOf(latLng: number): LatLng {
  return ['LatLng', latLng];
}

type Timezone = ValueType<'Timezone', string>;
export function timezoneOf(timezone: string): Timezone {
  return ['Timezone', timezone];
}

type Zone = {
  code: ZoneCode;
  state: State;
  city: City;
  country: Country;
  lat: LatLng;
  lng: LatLng;
  timezone: Timezone;
};
export type T = Zone;

export function fromDto(dto: {
  code: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  timezone: string;
}): Zone {
  return {
    code: zoneCodeOf(dto.code),
    state: stateOf(dto.state),
    city: cityOf(dto.city),
    country: countryFromState(dto.state),
    lat: latLngOf(dto.lat),
    lng: latLngOf(dto.lng),
    timezone: timezoneOf(dto.timezone),
  };
}

export function fromDb(dbValues: {
  code: string;
  state: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}): Zone {
  return {
    code: zoneCodeOf(dbValues.code),
    state: stateOf(dbValues.state),
    city: cityOf(dbValues.city),
    country: countryOf(dbValues.country),
    lat: latLngOf(dbValues.lat),
    lng: latLngOf(dbValues.lng),
    timezone: timezoneOf(dbValues.timezone),
  };
}

export function toDb(zone: Zone): {
  [column: string]: string | number | undefined;
} {
  return {
    code: valueOf(zone.code),
    state: valueOf(zone.state),
    city: valueOf(zone.city),
    country: valueOf(zone.country),
    lat: valueOf(zone.lat),
    lng: valueOf(zone.lng),
    timezone: valueOf(zone.timezone),
  };
}
