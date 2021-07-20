import { Style } from '../interfaces';

export const defaultStyle: () => Style = () => {
  const _default: Style = {
    _id: '-1',
    createdAt: '',
    updatedAt: '',
    name: 'None Selected',
    description: '',
    originalGravity: [-1, -1],
    finalGravity: [-1, -1],
    IBU: [-1, -1],
    SRM: [-1, -1],
    co2Volume: [-1, -1]
  };
  return _default;
};
