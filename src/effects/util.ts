type IdleState = {
  state: 'idle';
};

type DownloadingState = {
  state: 'downloading';
};

type DownloadedState = {
  state: 'downloaded';
};

type ErrorState = {
  state: 'error';
  error: Error;
};

export type DownloadDataState =
  | IdleState
  | DownloadingState
  | DownloadedState
  | ErrorState;
