import { RecipeMaster } from '../interfaces';
import { defaultRecipeVariant } from './recipe-variant.default';
import { defaultStyle } from './style.default';

export const defaultRecipeMaster: () => RecipeMaster = () => {
  const _default: RecipeMaster = {
    cid: '0',
    name: '',
    style: defaultStyle(),
    notes: [],
    master: '',
    owner: '',
    isPublic: false,
    isFriendsOnly: false,
    variants: [defaultRecipeVariant()]
  };
  return _default;
};
