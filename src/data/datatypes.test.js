import { describe, it, expect } from 'vitest';
import { DB } from './constants';
import { dbToTypes, defaultTypes } from './datatypes';

describe('MYPRIMETYPE datatype', () => {
  it('is defined in default types and db-specific maps', () => {
    expect(defaultTypes.MYPRIMETYPE).toBeTruthy();
    expect(dbToTypes[DB.GENERIC].MYPRIMETYPE).toBeTruthy();
    expect(dbToTypes[DB.MYSQL].MYPRIMETYPE).toBeTruthy();
    expect(dbToTypes[DB.POSTGRES].MYPRIMETYPE).toBeTruthy();
    expect(dbToTypes[DB.SQLITE].MYPRIMETYPE).toBeTruthy();
    expect(dbToTypes[DB.MSSQL].MYPRIMETYPE).toBeTruthy();
    expect(dbToTypes[DB.ORACLESQL].MYPRIMETYPE).toBeTruthy();
    expect(dbToTypes[DB.MARIADB].MYPRIMETYPE).toBeTruthy();
  });

  it('accepts positive odd integer defaults and rejects others', () => {
    const type = defaultTypes.MYPRIMETYPE;

    const makeField = (value) => ({ default: String(value) });

    // Values that should be accepted: 1,3,5,7,9,11,...
    [1, 3, 5, 7, 9, 11].forEach((v) => {
      expect(type.checkDefault(makeField(v))).toBe(true);
    });

    // Values that should be rejected: non-positive, even, non-numeric
    [0, -1, 2, 4, 10, 'foo', '', '3.5'].forEach((v) => {
      expect(type.checkDefault(makeField(v))).toBe(false);
    });
  });
});

