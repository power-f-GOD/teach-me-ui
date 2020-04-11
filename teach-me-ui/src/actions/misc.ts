import { ReduxAction, NETWORK_STATUS_CHECK } from "../constants"

export const online = (newState: boolean): ReduxAction => {
  return {
    type: NETWORK_STATUS_CHECK,
    newState
  }
}