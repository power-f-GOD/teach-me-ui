import { signupState } from './validate';

export * from './validate';
export * from './interfaces';
export * from './authenticate';

export const appState: any = {
  ...signupState,
};
