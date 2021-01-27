export interface Style {
  _id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  originalGravity: number[];
  finalGravity: number[];
  IBU: number[];
  SRM: number[];
  co2Volume: number[];
}

export interface Grains {
  _id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  lovibond: number;
  gravity: number;
  description: string;
}

export interface Hops {
  _id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  alphaAcid: number;
  type: string;
  description: string;
  usedFor: Style[];
  alternatives: Hops[];
}

export interface HopsRefs {
  name: string;
  usedFor: string[];
  alternatives: string[];
}

export interface Yeast {
  _id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  brand: string;
  form: string;
  description: string;
  attenuation: number[];
  flocculation: string;
  optimumTemperature: number[];
  alcoholTolerance: number[];
  recommendedStyles: Style[];
}

export interface YeastRefs {
  name: string;
  styles: string[];
}

export interface LibraryStorage {
  grains: Grains[];
  hops: Hops[];
  yeast: Yeast[];
  style: Style[];
}
