/* Interface imports */
import { Process } from '../../src/app/shared/interfaces/process';

export const mockProcessSchedule: () => Process[] = (): Process[] => {
  const mock: Process[] = [
    {
      splitInterval: 1,
      duration: 0,
      concurrent: false,
      _id: '5d02b47a78264160488b6397',
      cid: '1234567890123',
      type: 'manual',
      name: 'Gather ingredients',
      description: 'RO water, ice, grains, hops, and yeast',
      expectedDuration: null
    },
    {
      splitInterval: 1,
      duration: 0,
      concurrent: false,
      _id: '5d02b47a78264160488b6396',
      cid: '1234567890124',
      type: 'manual',
      name: 'Heat strike water',
      description: 'Add 5 gallons of water to Mash and Boil kettle and set to 162F.',
      expectedDuration: 60
    },
    {
      splitInterval: 1,
      duration: 60,
      concurrent: true,
      _id: '5d02b47a78264160488b6395',
      cid: '1234567890125',
      type: 'timer',
      name: 'Mash',
      description: 'Mash grains'
    },
    {
      splitInterval: 1,
      duration: 45,
      concurrent: true,
      _id: '5d02b47a78264160488b6394',
      cid: '1234567890126',
      type: 'timer',
      name: 'Heat sparge water',
      description: 'Heat 2 gallons of water to 170F, start 15 minutes before end of mash'
    },
    {
      splitInterval: 1,
      duration: 0,
      concurrent: false,
      _id: '5d02b47a78264160488b6393',
      cid: '1234567890127',
      type: 'manual',
      name: 'Mash out / Heat to boil',
      description: 'Raise grain basket to drain. Set kettle to 218F. While heating, squeeze grain bag. Add fermcap.',
      expectedDuration: 60
    },
    {
      splitInterval: 1,
      duration: 0,
      concurrent: true,
      _id: '5d02b47a78264160488b6391',
      cid: '1234567890129',
      type: 'timer',
      name: 'Add Nugget hops',
      description: 'Hops addition'
    },
    {
      splitInterval: 1,
      duration: 10,
      concurrent: true,
      _id: '5d02b47a78264160488b6390',
      cid: '1234567890130',
      type: 'timer',
      name: 'Sterilize yeast water',
      description: 'Boil 2 cups water with 4 teaspoons of extract or corn sugar and yeast nutrient. Allow to cool to < 115F before transferring to flask adding yeast. Cover with sanitized foil and swirl'
    },
    {
      splitInterval: 1,
      duration: 60,
      concurrent: true,
      _id: '5d02b47a78264160488b6392',
      cid: '1234567890128',
      type: 'timer',
      name: 'Boil',
      description: 'Boil wort'
    },
    {
      splitInterval: 1,
      duration: 0,
      concurrent: false,
      _id: '5d02b47a78264160488b638f',
      cid: '1234567890131',
      type: 'manual',
      name: 'Chill wort',
      description: 'Start wort chiller - begin with hose water until wort temperature goes below 120F, then switch to recirculated ice water',
      expectedDuration: 30
    },
    {
      splitInterval: 1,
      duration: 0,
      concurrent: false,
      _id: '5d02b47a78264160488b638e',
      cid: '1234567890132',
      type: 'manual',
      name: 'Transfer to fermenter',
      description: 'Transfer wort from kettle to fermenter',
      expectedDuration: 5
    },
    {
      splitInterval: 1,
      duration: 30,
      concurrent: false,
      _id: '5d02b47a78264160488b638d',
      cid: '1234567890133',
      type: 'timer',
      name: 'Aerate wort',
      description: 'Install aeration pump - watch for foam overflow'
    },
    {
      splitInterval: 1,
      duration: 0,
      concurrent: false,
      _id: '5d02b47a78264160488b638c',
      cid: '1234567890134',
      type: 'manual',
      name: 'Pitch yeast',
      description: 'Pitch entire yeast slurry from flask to fermenter',
      expectedDuration: null
    },
    {
      splitInterval: 1,
      duration: 0,
      concurrent: false,
      _id: '5d02b47a78264160488b638b',
      cid: '1234567890135',
      type: 'manual',
      name: 'Store fermenter',
      description: 'Place fermenter in it\'s fermentation location.  Install appropriate airlock.',
      expectedDuration: null
    },
    {
      splitInterval: 1,
      duration: 14,
      concurrent: false,
      _id: '5d02b47a78264160488b638a',
      cid: '1234567890136',
      type: 'calendar',
      name: 'Primary Fermentation',
      description: 'Check gravity at 7 days and 14 days'
    },
    {
      splitInterval: 1,
      duration: 2,
      concurrent: false,
      _id: '5d02b47a78264160488b6389',
      cid: '1234567890137',
      type: 'calendar',
      name: 'Add biofine',
      description: 'If final gravity has been reached, add biofine and move fermenter to kitchen (fermenter should not be moved after this point, if able)'
    },
    {
      splitInterval: 1,
      duration: 10,
      concurrent: false,
      _id: '5d02b47a78264160488b6388',
      cid: '1234567890138',
      type: 'timer',
      name: 'Sterilize priming sugar',
      description: 'Add priming sugar to 2 cups water and boil'
    },
    {
      splitInterval: 1,
      duration: 0,
      concurrent: false,
      _id: '5d02b47a78264160488b6387',
      cid: '1234567890139',
      type: 'manual',
      name: 'Prep bottle day',
      description: 'Clean and sanitize bottles, bottling bucket, siphon, hoses, etc',
      expectedDuration: 90
    },
    {
      splitInterval: 1,
      duration: 0,
      concurrent: false,
      _id: '5d02b47a78264160488b6386',
      cid: '1234567890140',
      type: 'manual',
      name: 'Bottle beer',
      description: 'Bottle beer and store for conditioning',
      expectedDuration: 60
    },
    {
      splitInterval: 1,
      duration: 42,
      concurrent: false,
      _id: '5d02b47a78264160488b6385',
      cid: '1234567890141',
      type: 'calendar',
      name: 'Conditioning',
      description: 'Check one at half way point'
    },
    {
      splitInterval: 1,
      duration: 0,
      concurrent: false,
      _id: '5d02b47a78264160488b6384',
      cid: '1234567890142',
      type: 'manual',
      name: 'Taste and evaluate',
      description: 'Taste beer and update notes',
      expectedDuration: null
    }
  ];
  return mock;
};
