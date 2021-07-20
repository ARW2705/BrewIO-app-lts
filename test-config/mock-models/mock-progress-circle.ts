/* Interface imports */
import { ProgressCircleSettings } from '../../src/app/shared/interfaces';

export const mockProgressCircle: () => ProgressCircleSettings = (): ProgressCircleSettings => {
  const mock: ProgressCircleSettings = {
    height: 360,
    width: 360,
    circle: {
      strokeDasharray: '5',
      strokeDashoffset: '10',
      stroke: '2',
      strokeWidth: 1,
      fill: 'fill',
      radius: 1,
      originX: 1,
      originY: 1
    },
    text: {
      textX: 'textX',
      textY: 'textY',
      textAnchor: 'textAnchor',
      fill: 'fill',
      fontSize: 'fontSize',
      fontFamily: 'fontFamily',
      dY: 'dY',
      content: 'content'
    }
  };
  return mock;
};
