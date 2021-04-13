export const mockBlob: (content: any[], type: string) => Blob = (content: any[], type: string): Blob => {
  return new Blob(content, { type: type });
};
