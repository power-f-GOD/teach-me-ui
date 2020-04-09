import { signupState } from './signup';

export * from './signup';
export * from './interfaces';

export const appState: any = {
  ...signupState,
};
