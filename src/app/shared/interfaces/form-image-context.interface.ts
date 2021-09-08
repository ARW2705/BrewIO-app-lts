import { Image } from './image.interface';

export interface FormImageContext {
  eventHandler: (...options: any) => void;
  image: Image;
  label: string;
}
