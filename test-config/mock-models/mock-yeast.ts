import { Yeast } from '../../src/app/shared/interfaces/library';
import { YeastBatch } from '../../src/app/shared/interfaces/yeast-batch';

export const mockYeast: () => Yeast[] = (): Yeast[] => {
  const mock: Yeast[] = [
    {
      attenuation: [
          69,
          73
      ],
      flocculation: 'high',
      optimumTemperature: [
          55,
          75
      ],
      alcoholTolerance: [
          12
      ],
      recommendedStyles: [],
      _id: '5ca286b7f7e5f91a1f31d8ae',
      name: 'Scottish Ale 1728',
      brand: 'White Labs',
      form: 'liquid',
      description: 'Our Scottish ale strain is ideally suited for the strong, malty ales of Scotland. This strain is very versatile, and is often used as a “House” strain as it ferments neutral and clean. Higher fermentation temperatures will result in an increased ester profile.',
      createdAt: '2019-04-01T21:46:31.968Z',
      updatedAt: '2019-04-01T21:46:31.968Z'
    },
    {
      attenuation: [
          68,
          72
      ],
      flocculation: 'high',
      optimumTemperature: [
          64,
          72
      ],
      alcoholTolerance: [
          9
      ],
      recommendedStyles: [],
      _id: '5ca286b7f7e5f91a1f31d8af',
      name: 'English Special Bitter 1768-PC',
      brand: 'White Labs',
      form: 'liquid',
      description: 'A great yeast for malt-predominate ales. Produces light fruit and ethanol aromas along with soft, nutty flavors. Exhibits a mild malt profile with a neutral finish. Bright beers are easily achieved without any filtration. It is similar to our 1968 London ESB Ale but slightly less flocculent.',
      createdAt: '2019-04-01T21:46:31.968Z',
      updatedAt: '2019-04-01T21:46:31.968Z'
    }
  ];
  return mock;
};

export const mockYeastBatch: () => YeastBatch[] = (): YeastBatch[] => {
  const mock: YeastBatch[] = [
    {
      _id: '1',
      cid: '1234567890123',
      yeastType: {
        attenuation: [
            73,
            77
        ],
        flocculation: 'low',
        optimumTemperature: [
            55,
            68
        ],
        alcoholTolerance: [
            11
        ],
        recommendedStyles: [],
        _id: '5ca286b7f7e5f91a1f31d89c',
        name: 'German Ale 1007',
        brand: 'White Labs',
        form: 'liquid',
        description: 'A true top cropping yeast with low ester formation and a broad temperature range. Fermentation at higher temperatures may produce mild fruitiness. This powdery strain results in yeast that remains in suspension post fermentation. Beers mature rapidly, even when cold fermentation is used. Low or no detectable diacetyl.',
        createdAt: '2019-04-01T21:46:31.967Z',
        updatedAt: '2019-04-01T21:46:31.967Z',
      },
      quantity: 1,
      requiresStarter: false,
      notes: []
    },
    {
      _id: '2',
      cid: '1234567890124',
      yeastType: {
        attenuation: [
            71,
            75
        ],
        flocculation: 'medium-high',
        optimumTemperature: [
            64,
            72
        ],
        alcoholTolerance: [
            11
        ],
        recommendedStyles: [],
        _id: '5ca286b7f7e5f91a1f31d8a1',
        name: 'Wyeast Bohemian Ale Blend 1087-PC',
        brand: 'White Labs',
        form: 'liquid',
        description: 'Formerly known as Wyeast Ale Blend 1540-PC, this is a blend of the best ale strains to provide quick starts, good flavor, and good flocculation. The profile of these strains provides a balanced finish for British and American style ales.',
        createdAt: '2019-04-01T21:46:31.967Z',
        updatedAt: '2019-04-01T21:46:31.967Z',
      },
      quantity: 1,
      requiresStarter: false,
      notes: []
    }
  ];
  return mock;
};
