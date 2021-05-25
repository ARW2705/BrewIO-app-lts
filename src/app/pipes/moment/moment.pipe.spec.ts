/* Pipe imports */
import { MomentPipe } from './moment.pipe';
import * as moment from 'moment';


describe('MomentPipe', (): void => {
  let momentPipe: MomentPipe;

  beforeAll((): void => {
    momentPipe = new MomentPipe();
  });

  test('should create the pipe', (): void => {
    expect(momentPipe).toBeTruthy();
  });

  test('should call appropriate helper on transform', (): void => {
    const datetime: moment.Moment = moment('2020-01-01');
    const option: string = 'MMM YY';

    expect(momentPipe.transform(datetime, 'format', option)).toMatch('Jan 20');
    expect(momentPipe.transform(datetime, 'date')).toMatch('1');
    expect(momentPipe.transform(datetime, 'other').length).toEqual(0);
  });

});
