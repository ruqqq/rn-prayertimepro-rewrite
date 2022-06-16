import Db from '../Db';
import DbMigrator from '../DbMigrator';
import * as Zone from '../domain/Zone';
import ZonesRepository from './ZonesRepository';

describe('ZoneRepository', () => {
  beforeEach(async () => {
    await DbMigrator.migrate();
  });

  it('should insert Zones to db', async () => {
    const zones: Zone.T[] = [
      Zone.fromDto({
        code: 'SG-1',
        state: 'Singapore',
        city: 'Singapore',
        lat: 1.0,
        lng: 0.5,
        timezone: 'Asia/Singapore',
      }),
      Zone.fromDto({
        code: 'JHR01',
        state: 'Johor',
        city: 'Johor Bahru',
        lat: 0.1,
        lng: 0.2,
        timezone: 'Asia/Kuala_Lumpur',
      }),
    ];

    await ZonesRepository.replaceZones(zones);

    const results = await Db.query(
      `SELECT * FROM ${ZonesRepository.ZonesTableName}`,
    );
    expect(results).toEqual(zones.map(Zone.toDb));
  });

  it('should clear Zones from db before insertion', async () => {
    await ZonesRepository.replaceZones([
      Zone.fromDto({
        code: 'SG-1',
        state: 'Singapore',
        city: 'Singapore',
        lat: 1.0,
        lng: 0.5,
        timezone: 'Asia/Singapore',
      }),
    ]);
    await ZonesRepository.replaceZones([
      Zone.fromDto({
        code: 'JHR01',
        state: 'Johor',
        city: 'Johor Bahru',
        lat: 0.1,
        lng: 0.2,
        timezone: 'Asia/Kuala_Lumpur',
      }),
    ]);

    const results = await Db.query(
      `SELECT * FROM ${ZonesRepository.ZonesTableName}`,
    );
    expect(results).toHaveLength(1);
  });

  it('should get Zones from db', async () => {
    const zones: Zone.T[] = [
      Zone.fromDto({
        code: 'SG-1',
        state: 'Singapore',
        city: 'Singapore',
        lat: 1.0,
        lng: 0.5,
        timezone: 'Asia/Singapore',
      }),
      Zone.fromDto({
        code: 'JHR01',
        state: 'Johor',
        city: 'Johor Bahru',
        lat: 0.1,
        lng: 0.2,
        timezone: 'Asia/Kuala_Lumpur',
      }),
    ];
    await ZonesRepository.replaceZones(zones);

    const zonesResults = await ZonesRepository.getZones();

    expect(zonesResults.map(Zone.toDto)).toEqual(zones.map(Zone.toDto));
  });
});
