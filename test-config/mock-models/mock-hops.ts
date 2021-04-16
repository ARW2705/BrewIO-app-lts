import { Hops } from '../../src/app/shared/interfaces/library';
import { HopsSchedule } from '../../src/app/shared/interfaces/hops-schedule';

export const mockHops = () => {
  const mock: Hops[] = [
    {
      usedFor: [],
      alternatives: [],
      _id: '5ca28662f7e5f91a1f31d835',
      name: 'Eureka',
      alphaAcid: 18.5,
      type: 'dual-purpose',
      description: 'Hüller Bitterer has the distinction of being the first wilt resistant variety to come from the Hüll program. Known for its clean, bittering character. It has been replaced by other wilt resistant varieties, particularly Perle.',
      createdAt: '2019-04-01T21:45:06.342Z',
      updatedAt: '2019-04-01T21:45:06.342Z'
    },
    {
        usedFor: [],
        alternatives: [],
        _id: '5ca28662f7e5f91a1f31d836',
        name: 'Falconer\'s Flight 7 C\'s Blend',
        alphaAcid: 9.5,
        type: 'dual-purpose',
        description: 'This proprietary pellet blend is comprised of seven varieties of \'C\' hops and is perfect for any Northwest-style IPA. Each hop has been hand selected for its superior aromatic qualities, imparting distinct tropical, citrus, floral, lemon and grapefruit tones. Aroma: Specific aroma descriptors include strong fruit and citrus characteristics with layers of spicy and earthy overtones.',
        createdAt: '2019-04-01T21:45:06.342Z',
        updatedAt: '2019-04-01T21:45:06.342Z'
    },
    {
        usedFor: [],
        alternatives: [],
        _id: '5ca28662f7e5f91a1f31d837',
        name: 'Falconer\'s Flight Blend',
        alphaAcid: 11.5,
        type: 'dual-purpose',
        description: 'Tropical Fruit, Citrus, floral, lemon and Grapefruit character. Hop Union has hand selected the best of the best Northwest hops, chosen for aroma and flavor qualities and blended them into one AWESOME pelletized hop bomb. Aroma: Specific aroma descriptors include distinct tropical, floral, lemon and grapefruit characteristics.',
        createdAt: '2019-04-01T21:45:06.342Z',
        updatedAt: '2019-04-01T21:45:06.342Z'
    },
  ];
  return mock;
};

export const mockHopsSchedule = () => {
  const mock: HopsSchedule[] = [
    {
      _id: '1',
      cid: '1234567890123',
      hopsType: {
        usedFor: [],
        alternatives: [],
        _id: '5ca28662f7e5f91a1f31d812',
        name: 'Amarillo',
        alphaAcid: 9.5,
        type: 'dual-purpose',
        description: 'Popular American mid-range alpha acid variety with a unique and distinct aroma. It has a flowery, citrus like aroma; more orange than grapefruit. Specific aroma descriptors include grapefruit, orange, lemon, melon, apricot and peach.',
        createdAt: '2019-04-01T21:45:06.336Z',
        updatedAt: '2019-04-01T21:45:06.336Z'
      },
      quantity: 1,
      duration: 60,
      dryHop: false,
      notes: []
    },
    {
      _id: '2',
      cid: '1234567890124',
      hopsType: {
        usedFor: [],
        alternatives: [],
        _id: '5ca28662f7e5f91a1f31d840',
        name: 'Hallertau',
        alphaAcid: 4.5,
        type: 'finishing',
        description: 'Named for its origins in the Hallertauer region of Germany, this is a noble aroma hop with ever-so-subtle flower and spice fragrances defining its “über alles” superiority. Aroma: Specific aroma descriptors include noble, earthy, and herbal.',
        createdAt: '2019-04-01T21:45:06.342Z',
        updatedAt: '2019-04-01T21:45:06.342Z',
      },
      quantity: 0.5,
      duration: 30,
      dryHop: false,
      notes: []
    },
    {
      _id: '3',
      cid: '1234567890125',
      hopsType: {
        usedFor: [],
        alternatives: [],
        _id: '5ca28662f7e5f91a1f31d853',
        name: 'Medusa',
        alphaAcid: 4.25,
        type: 'finishing',
        description: 'Medusa™ delivers strong flavor and aroma characteristics of intense guava, melon, apricot and citrus fruit. Along with these highly desirable aroma and flavor characteristics, it comes in with low alpha levels. Excellent as an aroma hop in IPA’s, Pale Ales and anything that is looking for strong aromatics. Probably one of the most striking features of this hops is it’s multi-headed cone; it adds to the allure and story of Medusa™, truly a unique hop that is sure to become the talk of the industry.',
        createdAt: '2019-04-01T21:45:06.345Z',
        updatedAt: '2019-04-01T21:45:06.345Z',
      },
      quantity: 0.5,
      duration: 5,
      dryHop: false,
      notes: []
    },
    {
      _id: '4',
      cid: '1234567890126',
      hopsType: {
        usedFor: [],
        alternatives: [],
        _id: '5ca28662f7e5f91a1f31d812',
        name: 'Amarillo',
        alphaAcid: 9.5,
        type: 'dual-purpose',
        description: 'Popular American mid-range alpha acid variety with a unique and distinct aroma. It has a flowery, citrus like aroma; more orange than grapefruit. Specific aroma descriptors include grapefruit, orange, lemon, melon, apricot and peach.',
        createdAt: '2019-04-01T21:45:06.336Z',
        updatedAt: '2019-04-01T21:45:06.336Z'
      },
      quantity: 1,
      duration: 0,
      dryHop: true,
      notes: []
    }
  ];
  return mock;
};
