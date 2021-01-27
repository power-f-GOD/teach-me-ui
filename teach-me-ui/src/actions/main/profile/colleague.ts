import {
  CANCEL_REQUEST,
  ACCEPT_REQUEST,
  DECLINE_REQUEST,
  UNCOLLEAGUE,
  REQUEST_COLLEAGUE_ACTION,
  COLLEAGUE_ACTION,
  ADD_COLLEAGUE,
  NOT_COLLEAGUES,
  IS_COLLEAGUE,
  AWAITING_REQUEST_ACTION
} from '../../../constants';
import {
  ReduxActionV2,
  ColleagueAction,
  DeepProfileProps,
  PingUserProps
} from '../../../types';
import {
  checkNetworkStatusWhilstPend,
  http,
  logError
} from '../../../functions';
import { deepProfileData } from './deepProfile';
import { displaySnackbar } from '../../misc';
import { pingUser, getConversations } from '../..';

export const requestColleagueAction = (_payload: ColleagueAction) => (
  dispatch: Function
) => {
  const { action, data: _data } = _payload;
  const { colleague_id, request_id, displayName, username } = _data ?? {};
  const userFirstName = displayName?.split(' ')[0];
  let deepProfileStatus: DeepProfileProps['status'] = NOT_COLLEAGUES;
  let feedBack = '';
  const data = {
    url: '/colleague/request',
    payload: /(ADD_|UN)COLLEAGUE/i.test(action)
      ? { colleague: colleague_id }
      : { request_id }
  };

  checkNetworkStatusWhilstPend({
    name: 'colleagueAction',
    func: colleagueAction
  });
  dispatch(colleagueAction({ status: 'pending', action }));

  switch (action) {
    case ADD_COLLEAGUE:
      deepProfileStatus = AWAITING_REQUEST_ACTION;
      feedBack = 'Colleague request sent.';
      break;
    case CANCEL_REQUEST:
      data.url += '/cancel';
      deepProfileStatus = NOT_COLLEAGUES;
      feedBack = 'Colleague request unsent.';
      break;
    case ACCEPT_REQUEST:
      data.url += '/accept';
      deepProfileStatus = IS_COLLEAGUE;
      feedBack = `You are now colleagues.`;
      break;
    case DECLINE_REQUEST:
      data.url += '/decline';
      deepProfileStatus = NOT_COLLEAGUES;
      feedBack = `You declined ${userFirstName}'s colleague request.`;
      break;
    case UNCOLLEAGUE:
      data.url = '/colleague/remove';
      deepProfileStatus = NOT_COLLEAGUES;
      feedBack = `You are no longer colleagues.`;
      break;
  }

  http
    .post<{ id: string }>(data.url, data.payload, true)
    .then(({ error, data: _data }) => {
      const { id: res_request_id } = _data ?? {};
      const payload = { action, data: { request_id: res_request_id } };
      const deepProfilePayload = {
        request_id: res_request_id,
        status: deepProfileStatus
      };

      if (error) delete payload.data;

      deepProfilePayload.status = deepProfileStatus;

      dispatch(
        colleagueAction({
          err: error ?? false,
          status: error ? 'settled' : 'fulfilled',
          statusText: feedBack,
          ...payload
        })
      );
      dispatch(
        deepProfileData({
          data: deepProfilePayload
        })
      );
      dispatch(
        displaySnackbar({
          open: true,
          message: feedBack,
          severity: /IS_COLLEAGUE|AWAITING/.test(deepProfileStatus!)
            ? 'success'
            : 'info',
          timeout: 5000
        })
      );

      if (username) {
        pingUser<PingUserProps['data']>([username], {
          type: deepProfileStatus,
          payload: {
            action,
            request_id: res_request_id
          }
        });
      }

      switch (action) {
        case ACCEPT_REQUEST:
        case DECLINE_REQUEST:
        case UNCOLLEAGUE:
          dispatch(getConversations('settled')(dispatch));
          break;
      }
    })
    .catch(logError(colleagueAction));

  return {
    type: REQUEST_COLLEAGUE_ACTION
  };
};

export const colleagueAction = (
  payload: ColleagueAction
): ReduxActionV2<ColleagueAction> => {
  return { type: COLLEAGUE_ACTION, payload };
};

// export const fetchColleagues = () => (dispatch: Function) => {
//   dispatch(fetchColleaguesStarted());
//   const userData = getState().userData as UserData;
//   const token = userData.token as string;
//   Axios({
//     url: `/colleague/find`,
//     baseURL,
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${token}`
//     }
//   })
//     .then((res) => {
//       if (res.data.error) {
//         throw new Error(res.data.message);
//       }
//       return res.data.data;
//     })
//     .then((state) => {
//       dispatch(fetchedColleagues(state.colleagues));
//       dispatch(
//         fetchColleaguesResolved({
//           error: false,
//           message: state.message
//         })
//       );
//     })
//     .catch((err) => {
//       dispatch(fetchColleaguesRejected({ error: true, message: err.message }));
//     });
// };

// export const fetchColleagueRequests = () => (dispatch: Function) => {
//   dispatch(fetchColleagueRequestsStarted());
//   const userData = getState().userData as UserData;
//   const token = userData.token as string;
//   Axios({
//     url: `/colleague/requests`,
//     baseURL,
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${token}`
//     }
//   })
//     .then((res) => {
//       if (res.data.error) {
//         throw new Error(res.data.message);
//       }
//       return res.data.data;
//     })
//     .then((state) => {
//       dispatch(fetchedColleagueRequests(state));
//       dispatch(
//         fetchColleagueRequestsResolved({
//           error: false,
//           message: state.message
//         })
//       );
//     })
//     .catch((err) => {
//       dispatch(
//         fetchColleagueRequestsRejected({ error: true, message: err.message })
//       );
//     });
// };

// export const fetchedColleagues = (
//   payload?: Partial<RequestState>
// ): ReduxAction => {
//   return {
//     type: FETCHED_COLLEAGUES,
//     payload
//   };
// };
