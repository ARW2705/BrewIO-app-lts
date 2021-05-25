/* Pipe imports */
import { TruncatePipe } from './truncate.pipe';


describe('TruncatePipe', (): void => {
  let truncatePipe: TruncatePipe;

  beforeAll((): void => {
    truncatePipe = new TruncatePipe();
  });

  test('should create the pipe', (): void => {
    expect(truncatePipe).toBeTruthy();
  });

  test('should tranform given value truncated to given number of places', (): void => {
    expect(truncatePipe.transform(1.009, 2)).toMatch('1.01');
    expect(truncatePipe.transform(1, 3)).toMatch('1.000');
  });

});
