type ValueType<N extends string, T> = readonly [N, T];
export function valueOf<N extends string, T>(value: ValueType<N, T>): T {
  return value[1];
}

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
  lat: LatLng;
  lng: LatLng;
  timezone: Timezone;
};

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
    lat: latLngOf(dto.lat),
    lng: latLngOf(dto.lng),
    timezone: timezoneOf(dto.timezone),
  };
}
