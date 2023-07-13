function instanceOf<T>(object: any, key: string): object is T {
  return key in object;
}

export const mapper = <T, K>(o: K, obj: T): T => {
  Object.keys(o).map((key) => {
    if (instanceOf<T>(obj, key)) {
      // @ts-ignore
      obj[key] = o[key];
    }
  });

  return obj;
};
