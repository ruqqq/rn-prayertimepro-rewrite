export type MigrationId = string;
export type MigrationStatements = string[];

export function generateCreateTableStatement(
  tableName: string,
  columnNames: { [name: string]: string },
  columnTypes: { [name: string]: string },
  primaryKeyColumns: string[] = [],
): string {
  const columns = Object.keys(columnNames)
    .map(col => `${columnNames[col]} ${columnTypes[col]}`)
    .join(', ');
  const primaryKey =
    primaryKeyColumns.length > 0
      ? `, PRIMARY KEY (${primaryKeyColumns.join(', ')})`
      : '';
  return `CREATE TABLE IF NOT EXISTS ${tableName} (${columns}${primaryKey})`;
}
