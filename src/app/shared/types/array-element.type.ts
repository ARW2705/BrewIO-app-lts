export type ArrayElement<A> = A extends (infer Element)[] ? Element : never;
