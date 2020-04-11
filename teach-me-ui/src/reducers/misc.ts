import { NETWORK_STATUS_CHECK, ReduxAction } from '../constants';

export const online = (state: boolean = true, action: ReduxAction): boolean => {
  return action.type === NETWORK_STATUS_CHECK ? action.newState : state;
};
