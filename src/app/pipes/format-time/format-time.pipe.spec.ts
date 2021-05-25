/* Pipe imports */
import { FormatTimePipe } from './format-time.pipe';


describe('FormatTimePipe', (): void => {
  let formatPipe: FormatTimePipe;

  beforeEach((): void => {
    formatPipe = new FormatTimePipe();
  });

  test('should create the pipe', (): void => {
    expect(formatPipe).toBeTruthy();
  });

  test('should call appropriate helper function on transform', (): void => {
    formatPipe.formatDuration = jest
      .fn()
      .mockImplementation((value: string): string => (parseFloat(value) * 2).toString());

    const formatSpy: jest.SpyInstance = jest.spyOn(formatPipe, 'formatDuration');

    expect(formatPipe.transform('10', 'duration')).toMatch('20');
    expect(formatPipe.transform('10', 'other')).toMatch('10');
    expect(formatSpy).toHaveBeenCalledTimes(1);
  });

  test('should format duration', (): void => {
    expect(formatPipe.formatDuration(122)).toMatch('Duration: 2 hours 2 minutes');
    expect(formatPipe.formatDuration(60)).toMatch('Duration: 1 hour');
    expect(formatPipe.formatDuration(10)).toMatch('Duration: 10 minutes');
    expect(formatPipe.formatDuration(1)).toMatch('Duration: 1 minute');
  });

});
