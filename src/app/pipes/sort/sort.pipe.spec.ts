/* Pipe imports */
import { SortPipe } from './sort.pipe';


describe('SortPipe', (): void => {
  let sortPipe: SortPipe;

  beforeEach((): void => {
    sortPipe = new SortPipe();
  });

  test('should create the pipe', (): void => {
    expect(sortPipe).toBeTruthy();
  });

  test('should sort array based on given criteria', (): void => {
    sortPipe.sortByISOString = jest
      .fn()
      .mockImplementation((): number => -1);

    expect(sortPipe.transform({}, '')).toBeUndefined();
    expect(sortPipe.transform([3, 2, 1], 'datetime')).toStrictEqual([1, 2, 3
    ]);
    expect(sortPipe.transform([3, 2, 1], 'other')).toStrictEqual([3, 2, 1]);
  });

  test('should sort array by ISOString datetime', (): void => {
    const first: string = (new Date('2019-01-01')).toISOString();
    const second: string = (new Date('2020-01-01')).toISOString();
    const third: string = (new Date('2021-01-01')).toISOString();

    const firstItem: object = { datetime: first };
    const secondItem: object = { datetime: second};
    const thirdItem: object = { datetime: third };
    const fourthItem: object = { datetime: third };
    const missingDatetimeItem: object = {};

    const datetimeArray: object[] = [ thirdItem, firstItem, fourthItem, secondItem, missingDatetimeItem ];

    const consoleSpy: jest.SpyInstance = jest.spyOn(console, 'error');

    datetimeArray.sort(sortPipe.sortByISOString);

    expect(datetimeArray).toStrictEqual([
      firstItem,
      secondItem,
      thirdItem,
      fourthItem,
      missingDatetimeItem
    ]);
    expect(consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1][0]).toMatch('Sort pipe error: comparate missing \'datetime\' property');
  });

});
