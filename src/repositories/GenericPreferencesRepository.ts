import Db from '../Db';
import { MigrationId, MigrationStatements } from './utils';

class GenericPreferencesRepository<IdTypes, Ids extends keyof IdTypes> {
  private readonly tableName: string;

  private readonly columns: string[];
  private readonly defaultValues: IdTypes;
  private readonly migrationsFn: () => [MigrationId, MigrationStatements][];

  constructor(
    tableName: string,
    columns: string[],
    defaultValues: IdTypes,
    migrationsFn: () => [MigrationId, MigrationStatements][],
  ) {
    this.tableName = tableName;
    this.columns = columns;
    this.defaultValues = defaultValues;
    this.migrationsFn = migrationsFn;
  }

  public async get<Id extends Ids>(id: Id) {
    const defaultValue = this.defaultValues[id];
    const results = await Db.query(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id as any],
    );
    if (results.length === 0) {
      return defaultValue;
    }

    const { value } = results[0];
    if (typeof defaultValue === 'boolean') {
      return (value === 'true') as any;
    } else if (typeof defaultValue === 'number') {
      return parseFloat(value) as any;
    }

    return `${value}` as any;
  }

  public async set<Id extends Ids>(id: Id, value: IdTypes[Id]): Promise<void> {
    await Db.insert(
      `INSERT INTO ${this.tableName} (${this.columns.join(
        ', ',
      )}) VALUES (?, ?) ON CONFLICT (id) DO UPDATE SET value=?`,
      [id as any, `${value}`, `${value}`],
    );
  }

  public async del<Id extends Ids>(id: Id): Promise<void> {
    await Db.executeSql(`DELETE FROM ${this.tableName} WHERE id = ?`, [
      id as any,
    ]);
  }

  public getDefaultValues() {
    return this.defaultValues;
  }

  public migrations(): [MigrationId, MigrationStatements][] {
    return this.migrationsFn();
  }
}

export default GenericPreferencesRepository;
