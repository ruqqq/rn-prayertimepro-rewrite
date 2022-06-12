import wOpenDatabase from 'websql';

export function openDatabase(
  _name: string,
  version: string,
  description: string,
  size: number,
  callback: (db: any) => void,
) {
  return wOpenDatabase(':memory:', version, description, size, callback);
}
