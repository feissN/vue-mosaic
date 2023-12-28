import { InjectionKey, inject } from "vue";

export const injectStrict = <T>(key: InjectionKey<T>) => {
  const injected = inject(key);

  if (!injected) {
    throw "No injection for key " + key + "found";
  }

  return injected;
};
