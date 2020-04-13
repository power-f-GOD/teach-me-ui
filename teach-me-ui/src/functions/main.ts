import { dispatch } from "./utils";
import { requestSignout } from "../actions";

export function handleSignoutRequest() {
  dispatch(requestSignout()(dispatch));
}