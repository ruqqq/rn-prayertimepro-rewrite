import '@testing-library/jest-native/extend-expect';
/* eslint-disable no-undef */
import Db from './src/Db';

beforeEach(Db.open);
afterEach(() => Db._db().deleteAsync());
