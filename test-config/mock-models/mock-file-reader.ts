export const mockFileReader: (testResult: any, testError: any) => FileReader = (testResult: any, testError: any): FileReader => {
  const mock: FileReader = {
    error: testError,
    onabort: null,
    onerror: null,
    onload: null,
    onloadend: null,
    onloadstart: null,
    onprogress: null,
    readyState: 0,
    result: testResult,
    abort: () => {},
    readAsText: () => {},
    readAsDataURL: () => {},
    readAsArrayBuffer: () => {},
    readAsBinaryString: () => {},
    DONE: 0,
    LOADING: 1,
    EMPTY: 2,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  };

  return mock;
};
