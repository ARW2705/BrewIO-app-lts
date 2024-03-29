/* Interface imports */
import { YeastBatch } from '../../src/app/shared/interfaces';

export const mockYeastBatch: () => YeastBatch[] = (): YeastBatch[] => {
  const mock: YeastBatch[] = [
    {
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
      requiresStarter: false
    },
    {
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
      requiresStarter: false
    }
  ];
  return mock;
};
