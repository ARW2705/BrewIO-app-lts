import { FormCommonAttributes } from '../../src/app/shared/interfaces';

export const mockFormCommonAttributes: () => FormCommonAttributes = (): FormCommonAttributes => {
  const mock: FormCommonAttributes = {
    shouldAutocapitalize: false,
    shouldAutocomplete: false,
    shouldAutocorrect: false,
    shouldSpellcheck: false
  };

  return mock;
};
