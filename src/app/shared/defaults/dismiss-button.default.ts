export const defaultDismissButton: () => object = () => {
  const _default: object = {
    role: 'cancel',
    text: 'Dismiss',
    handler: () => {
      console.log('Dismiss button clicked');
    }
  };
  return _default;
};
