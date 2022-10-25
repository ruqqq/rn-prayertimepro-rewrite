import { LocalityCode, localityCodeOf } from './DailyPrayertimes';
import { valueOf, ValueType } from './utils';

export type ZoneCode = ValueType<'ZoneCode', string>;
export function zoneCodeOf(code: string): ZoneCode {
  return {
    type: 'ZoneCode',
    value: code,
  };
}

type State = ValueType<'State', string>;
export function stateOf(state: string): State {
  return {
    type: 'State',
    value: state,
  };
}

type City = ValueType<'City', string>;
export function cityOf(city: string): City {
  return {
    type: 'City',
    value: city,
  };
}

type Country = ValueType<'Country', string>;
export function countryOf(country: string): Country {
  return {
    type: 'Country',
    value: country,
  };
}

export function countryFromState(state: string): Country {
  if (state === 'Singapore') {
    return {
      type: 'Country',
      value: 'SG',
    };
  }

  return {
    type: 'Country',
    value: 'MY',
  };
}

type LatLng = ValueType<'LatLng', number>;
export function latLngOf(latLng: number): LatLng {
  return {
    type: 'LatLng',
    value: latLng,
  };
}

type Timezone = ValueType<
  'Timezone',
  'Asia/Singapore' | 'Asia/Kuala_Lumpur' | 'Asia/Jakarta'
>;
export function timezoneOf(timezone: string): Timezone {
  if (
    timezone === 'Asia/Singapore' ||
    timezone === 'Asia/Kuala_Lumpur' ||
    timezone === 'Asia/Jakarta'
  ) {
    return {
      type: 'Timezone',
      value: timezone,
    };
  }

  throw new Error(`Cannot convert ${timezone} to Timezone.`);
}

type Zone = {
  code: ZoneCode;
  state: State;
  city: City;
  country: Country;
  lat: LatLng;
  lng: LatLng;
  timezone: Timezone;
  localityCode: LocalityCode;
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
    localityCode: localityCodeOf(
      `${countryFromState(dto.state).value}-${dto.code}`,
    ),
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
    localityCode: localityCodeOf(
      `${countryFromState(dbValues.state).value}-${dbValues.code}`,
    ),
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

export function toDto(zone: Zone): {
  code: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  timezone: string;
} {
  return {
    code: valueOf(zone.code),
    state: valueOf(zone.state),
    city: valueOf(zone.city),
    lat: valueOf(zone.lat),
    lng: valueOf(zone.lng),
    timezone: valueOf(zone.timezone),
  };
}
