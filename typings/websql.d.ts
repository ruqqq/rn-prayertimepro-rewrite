declare module 'websql' {
  export default function openDatabase(
    name: string,
    version: string,
    description: string,
    size: number,
    callback: (db: any) => void,
  );
}
