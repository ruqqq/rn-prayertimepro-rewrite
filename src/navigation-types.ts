import * as Zone from './domain/Zone';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  LocationPicker: {
    selectedZone?: Zone.T;
  };
};
