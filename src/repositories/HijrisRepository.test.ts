import Db from '../Db';
import DbMigrator from '../DbMigrator';
import * as Hijri from '../domain/Hijri';
import { dateOnlyOf, localityCodeOf } from '../domain/DailyPrayertimes';
import HijrisRepository from './HijrisRepository';

describe('HijrisRepository', () => {
  beforeEach(async () => {
    await DbMigrator.migrate();
  });

  it('should insert Hijri to db', async () => {
    const dto = {
      date: 1,
      month: 6,
      year: 2022,
      hijriDate: 1,
      hijriMonth: 2,
      hijriYear: 1500,
      localityCode: 'SG-1',
      source_id: 0,
    };
    const hijri = Hijri.fromDto(dto);

    await HijrisRepository.upsertHijris([hijri]);

    const results = await Db.query(
      `SELECT * FROM ${HijrisRepository.HijrisTableName}`,
    );
    expect(results).toEqual([Hijri.toDb(hijri)]);
  });

  it('should perform an upsert of Hijri to db', async () => {
    const dto1 = {
      date: 1,
      month: 6,
      year: 2022,
      hijriDate: 1,
      hijriMonth: 2,
      hijriYear: 1500,
      localityCode: 'SG-1',
      source_id: 0,
    };
    const hijri1 = Hijri.fromDto(dto1);
    const dto2 = {
      ...dto1,
      hijriDate: 4,
    };
    const hijri2 = Hijri.fromDto(dto2);

    await HijrisRepository.upsertHijris([hijri1]);
    await HijrisRepository.upsertHijris([hijri2]);

    const results = await Db.query(
      `SELECT * FROM ${HijrisRepository.HijrisTableName}`,
    );
    expect(results).toEqual([Hijri.toDb(hijri2)]);
  });

  it("should get the hijri for the day when there's data", async () => {
    const dto = {
      date: 1,
      month: 6,
      year: 2022,
      hijriDate: 1,
      hijriMonth: 2,
      hijriYear: 1500,
      localityCode: 'SG-1',
      source_id: 0,
    };
    const hijri = Hijri.fromDto(dto);
    await HijrisRepository.upsertHijris([hijri]);

    const hijriResult = await HijrisRepository.getHijrisForDay(
      localityCodeOf('SG-1'),
      dateOnlyOf(1, 6, 2022),
    );

    expect(Hijri.toDto(hijriResult!)).toEqual(Hijri.toDto(hijri));
  });

  it("should return null when getting hijri for the day when there's no data for the localityCode", async () => {
    const dto = {
      date: 1,
      month: 6,
      year: 2022,
      hijriDate: 1,
      hijriMonth: 2,
      hijriYear: 1500,
      localityCode: 'SG-1',
      source_id: 0,
    };
    const hijri = Hijri.fromDto(dto);
    await HijrisRepository.upsertHijris([hijri]);

    const hijriResult = await HijrisRepository.getHijrisForDay(
      localityCodeOf('MY-JHR01'),
      dateOnlyOf(1, 6, 2022),
    );

    expect(hijriResult).toBeNull();
  });

  it("should return null when getting hijri for the day when there's no data", async () => {
    const hijri = await HijrisRepository.getHijrisForDay(
      localityCodeOf('SG-1'),
      dateOnlyOf(1, 6, 2022),
    );

    expect(hijri).toBeNull();
  });

  it('should get the hijri for the year sorted by date asc', async () => {
    const dto1 = {
      date: 5,
      month: 6,
      year: 2022,
      hijriDate: 1,
      hijriMonth: 2,
      hijriYear: 1500,
      localityCode: 'SG-1',
      source_id: 0,
    };
    const hijri1 = Hijri.fromDto(dto1);
    const dto2 = {
      ...dto1,
      date: 4,
    };
    const hijri2 = Hijri.fromDto(dto2);
    const dto3 = {
      ...dto1,
      year: 2021,
    };
    const hijri3 = Hijri.fromDto(dto3);
    const dto4 = {
      ...dto1,
      month: 5,
    };
    const hijri4 = Hijri.fromDto(dto4);
    await HijrisRepository.upsertHijris([hijri1, hijri2, hijri3, hijri4]);

    const hijris = await HijrisRepository.getHijrisForYear(
      localityCodeOf('SG-1'),
      2022,
    );

    expect(hijris.map(Hijri.toDto)).toEqual(
      [hijri4, hijri2, hijri1].map(Hijri.toDto),
    );
  });

  it("should return empty array when getting hijri for the day when there's no data for the localityCode", async () => {
    const dto1 = {
      date: 5,
      month: 6,
      year: 2022,
      hijriDate: 1,
      hijriMonth: 2,
      hijriYear: 1500,
      localityCode: 'SG-1',
      source_id: 0,
    };
    const hijri1 = Hijri.fromDto(dto1);
    await HijrisRepository.upsertHijris([hijri1]);

    const hijris = await HijrisRepository.getHijrisForYear(
      localityCodeOf('MY-JHR01'),
      2022,
    );

    expect(hijris).toHaveLength(0);
  });
});
