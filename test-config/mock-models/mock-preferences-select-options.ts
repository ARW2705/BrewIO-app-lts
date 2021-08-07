import { FormSelectOption } from '../../src/app/shared/interfaces';

export const mockPreferencesSelectOptions: () => FormSelectOption[] = (): FormSelectOption[] => {
  const mock: FormSelectOption[] = [
    { label: 'label1', value: 'value1' },
    { label: 'label2', value: 'value2' },
    { label: 'label3', value: 'value3' }
  ];
  return mock;
};
