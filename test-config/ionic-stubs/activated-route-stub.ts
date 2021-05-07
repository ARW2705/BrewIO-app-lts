export class ActivatedRouteStub {
  static getter = () => {};

  snapshot = {
    paramMap: {
      get: ActivatedRouteStub.getter
    }
  };
}
