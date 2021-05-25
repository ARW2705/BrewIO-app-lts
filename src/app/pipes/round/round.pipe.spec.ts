/* Pipe imports */
import { RoundPipe } from './round.pipe';


describe('RoundPipe', (): void => {
  let roundPipe: RoundPipe;

  beforeAll((): void => {
    roundPipe = new RoundPipe();
  });

  test('should create the pipe', (): void => {
    expect(roundPipe).toBeTruthy();
  });

  test('should transform input value by rounding to the nearest integer or return the value if not a number', (): void => {
    expect(roundPipe.transform('1.5')).toEqual(2);
    expect(roundPipe.transform(1.1)).toEqual(1);
    expect(roundPipe.transform('nan')).toMatch('nan');
  });

});
