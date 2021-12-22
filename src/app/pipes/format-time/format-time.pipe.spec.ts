/* Pipe imports */
import { FormatTimePipe } from './format-time.pipe';

/* Mock imports */
import { TimerServiceStub } from '../../../../test-config/service-stubs';

/* Serivce imports */
import { TimerService } from '../../services/services';


describe('FormatTimePipe', (): void => {
  let formatPipe: FormatTimePipe;

  beforeEach((): void => {
    const timerServiceStub: TimerService = (new TimerServiceStub()) as TimerService;
    timerServiceStub.getFormattedDurationString = jest.fn()
      .mockImplementation((duration: number): string => duration.toString());
    formatPipe = new FormatTimePipe(timerServiceStub);
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
    expect(formatPipe.formatDuration(122)).toMatch('122');
  });

});
