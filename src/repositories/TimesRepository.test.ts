import Db from '../Db';
import DbMigrator from '../DbMigrator';
import * as DailyPrayertimes from '../domain/DailyPrayertimes';
import { dateOnlyOf } from '../domain/DailyPrayertimes';
import TimesRepository from './TimesRepository';

describe('TimesRepository', () => {
  beforeEach(async () => {
    await DbMigrator.migrate();
  });

  it('should insert DailyPrayertimes to db', async () => {
    const dto = {
      date: 1,
      month: 6,
      year: 2022,
      localityCode: 'SG-1',
      source_id: 0,
      times: [
        '2022-05-31T21:34:00.000Z',
        '2022-05-31T22:58:00.000Z',
        '2022-06-01T05:04:00.000Z',
        '2022-06-01T08:29:00.000Z',
        '2022-06-01T11:09:00.000Z',
        '2022-06-01T12:23:00.000Z',
      ] as [string, string, string, string, string, string],
      updated: '2022-01-31T03:48:24.352Z',
    };
    const dailyPrayertimes = DailyPrayertimes.fromDto(dto);

    await TimesRepository.upsertTimes([dailyPrayertimes]);

    const results = await Db.query(
      `SELECT * FROM ${TimesRepository.TimesTableName}`,
    );
    expect(results).toEqual(DailyPrayertimes.toDb(dailyPrayertimes));
  });

  it('should perform an upsert of DailyPrayertimes to db', async () => {
    const dto1 = {
      date: 1,
      month: 6,
      year: 2022,
      localityCode: 'SG-1',
      source_id: 0,
      times: [
        '2022-05-31T21:34:00.000Z',
        '2022-05-31T22:58:00.000Z',
        '2022-06-01T05:04:00.000Z',
        '2022-06-01T08:29:00.000Z',
        '2022-06-01T11:09:00.000Z',
        '2022-06-01T12:23:00.000Z',
      ] as [string, string, string, string, string, string],
      updated: '2022-01-31T03:48:24.352Z',
    };
    const dailyPrayertimes1 = DailyPrayertimes.fromDto(dto1);
    const dto2 = {
      ...dto1,
      updated: '2022-12-01T00:00:00.000Z',
    };
    const dailyPrayertimes2 = DailyPrayertimes.fromDto(dto2);

    await TimesRepository.upsertTimes([dailyPrayertimes1]);
    await TimesRepository.upsertTimes([dailyPrayertimes2]);

    const results = await Db.query(
      `SELECT * FROM ${TimesRepository.TimesTableName}`,
    );
    expect(results).toEqual(DailyPrayertimes.toDb(dailyPrayertimes2));
  });

  it("should get the prayertimes for the day when there's data", async () => {
    const dto = {
      date: 1,
      month: 6,
      year: 2022,
      localityCode: 'SG-1',
      source_id: 0,
      times: [
        '2022-05-31T21:34:00.000Z',
        '2022-05-31T22:58:00.000Z',
        '2022-06-01T05:04:00.000Z',
        '2022-06-01T08:29:00.000Z',
        '2022-06-01T11:09:00.000Z',
        '2022-06-01T12:23:00.000Z',
      ] as [string, string, string, string, string, string],
      updated: '2022-01-31T03:48:24.352Z',
    };
    await TimesRepository.upsertTimes([DailyPrayertimes.fromDto(dto)]);

    const dailyPrayertimes = await TimesRepository.getTimesForDay(
      dateOnlyOf(1, 6, 2022),
    );

    expect(dailyPrayertimes).not.toBeNull();
  });

  it("should return null when getting prayertimes for the day when there's no data", async () => {
    const dailyPrayertimes = await TimesRepository.getTimesForDay(
      dateOnlyOf(1, 6, 2022),
    );

    expect(dailyPrayertimes).toBeNull();
  });
});
