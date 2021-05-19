import { of } from 'rxjs';

export class ActivatedRouteStub {
  static getter: () => any = () => {};
  static params: {[key: string]: any} = null;

  queryParams = of({});

  snapshot = {
    paramMap: {
      get: ActivatedRouteStub.getter
    }
  };
}
