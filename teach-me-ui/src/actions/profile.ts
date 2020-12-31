import Axios from 'axios';

import {
  ReduxAction,
  SearchState,
  UserData,
  GET_PROFILE_DATA,
  PROFILE_DATA,
  apiBaseURL as baseURL,
  RequestState,
  ADD_COLLEAGUE_STARTED,
  ADD_COLLEAGUE_RESOLVED,
  ADD_COLLEAGUE_REJECTED,
  FETCH_DEEP_PROFILE_STARTED,
  FETCH_DEEP_PROFILE_REJECTED,
  FETCH_DEEP_PROFILE_RESOLVED,
  REMOVE_COLLEAGUE_STARTED,
  REMOVE_COLLEAGUE_REJECTED,
  REMOVE_COLLEAGUE_RESOLVED,
  ACCEPT_COLLEAGUE_STARTED,
  ACCEPT_COLLEAGUE_REJECTED,
  ACCEPT_COLLEAGUE_RESOLVED,
  DECLINE_COLLEAGUE_STARTED,
  DECLINE_COLLEAGUE_REJECTED,
  DECLINE_COLLEAGUE_RESOLVED,
  UNCOLLEAGUE_STARTED,
  UNCOLLEAGUE_REJECTED,
  UNCOLLEAGUE_RESOLVED,
  FETCH_COLLEAGUES_STARTED,
  FETCH_COLLEAGUES_REJECTED,
  FETCH_COLLEAGUES_RESOLVED,
  FETCHED_COLLEAGUES,
  FETCH_COLLEAGUE_REQUESTS_STARTED,
  FETCH_COLLEAGUE_REQUESTS_REJECTED,
  FETCH_COLLEAGUE_REQUESTS_RESOLVED,
  FETCHED_COLLEAGUE_REQUESTS,
  FETCHED_DEEP_PROFILE_DATA
} from '../constants';
import { checkNetworkStatusWhilstPend, getState, logError } from '../functions';
import { pingUser } from './notifications';

export const profileData = (payload: SearchState): ReduxAction => {
  return {
    type: PROFILE_DATA,
    payload
  };
};

export const getProfileData = (userId: string) => (
  dispatch: Function
): ReduxAction => {
  checkNetworkStatusWhilstPend({
    name: 'profileData',
    func: profileData
  });
  dispatch(profileData({ status: 'pending' }));

  Axios({
    url: `/profile/${userId}`,
    baseURL,
    method: 'GET'
  })
    .then(({ data }: any) => {
      const _data = { ...data.data };
      const { error } = data;

      delete _data.error;

      if (!error) {
        const dob = _data.date_of_birth;
        const displayName = `${_data.first_name} ${_data.last_name}`;

        delete _data.error;
        delete _data.date_of_birth;

        const userData: UserData = { ..._data, displayName, dob };

        dispatch(
          profileData({
            status: 'fulfilled',
            err: false,
            data: [userData]
          })
        );
      } else {
        dispatch(
          profileData({
            status: 'fulfilled',
            err: true,
            data: [{}]
          })
        );
      }
    })
    .catch(logError(profileData));

  return {
    type: GET_PROFILE_DATA,
    newState: userId
  };
};

export const addColleagueStarted = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: ADD_COLLEAGUE_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const addColleagueResolved = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: ADD_COLLEAGUE_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const addColleagueRejected = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: ADD_COLLEAGUE_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const addColleague = (userId: string, username: string) => (
  dispatch: Function
) => {
  dispatch(addColleagueStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  Axios({
    url: `/colleague/request`,
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: { colleague: userId }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    })
    .then((state) => {
      dispatch(fetchDeepProfile(userId));
      dispatch(
        addColleagueResolved({
          error: false,
          message: state.message
        })
      );
      pingUser([`${username}`]);
    })
    .catch((err) => {
      dispatch(addColleagueRejected({ error: true, message: err.message }));
    });
};

export const fetchDeepProfileStarted = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCH_DEEP_PROFILE_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const fetchDeepProfileResolved = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCH_DEEP_PROFILE_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const fetchDeepProfileRejected = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCH_DEEP_PROFILE_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const fetchedDeepProfileData = (payload: any): ReduxAction => {
  return {
    type: FETCHED_DEEP_PROFILE_DATA,
    payload
  };
};

export const fetchDeepProfile = (id: string) => (dispatch: Function) => {
  dispatch(fetchDeepProfileStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  Axios({
    url: `/deep/profile/${id}`,
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: { colleague: id }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    })
    .then((state) => {
      dispatch(fetchedDeepProfileData(state));
      dispatch(
        fetchDeepProfileResolved({
          error: false,
          message: state.message
        })
      );
    })
    .catch((err) => {
      dispatch(fetchDeepProfileRejected({ error: true, message: err.message }));
    });
};

export const removeColleagueStarted = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: REMOVE_COLLEAGUE_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const removeColleagueResolved = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: REMOVE_COLLEAGUE_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const removeColleagueRejected = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: REMOVE_COLLEAGUE_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const removeColleague = (id: string, userId: string) => (dispatch: Function) => {
  dispatch(removeColleagueStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  Axios({
    url: `/colleague/request/remove`,
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: { request_id: id }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    })
    .then((state) => {
      dispatch(fetchDeepProfile(userId));
      dispatch(
        removeColleagueResolved({
          error: false,
          message: state.message
        })
      );
    })
    .catch((err) => {
      dispatch(removeColleagueRejected({ error: true, message: err.message }));
    });
};

export const acceptColleagueStarted = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: ACCEPT_COLLEAGUE_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const acceptColleagueResolved = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: ACCEPT_COLLEAGUE_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const acceptColleagueRejected = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: ACCEPT_COLLEAGUE_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const acceptColleague = (id: string, username: string, userId: string) => (
  dispatch: Function
) => {
  dispatch(acceptColleagueStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  Axios({
    url: `/colleague/request/accept`,
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: { request_id: id }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    })
    .then((state) => {
      dispatch(fetchDeepProfile(userId));
      dispatch(
        acceptColleagueResolved({
          error: false,
          message: state.message
        })
      );
      pingUser([`${username}`], { type: 'NEW_CONVERSATION' });
    })
    .catch((err) => {
      dispatch(acceptColleagueRejected({ error: true, message: err.message }));
    });
};

export const declineColleagueStarted = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: DECLINE_COLLEAGUE_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const declineColleagueResolved = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: DECLINE_COLLEAGUE_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const declineColleagueRejected = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: DECLINE_COLLEAGUE_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const declineColleague = (id: string, userId: string) => (dispatch: Function) => {
  dispatch(declineColleagueStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  Axios({
    url: `/colleague/request/decline`,
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: { request_id: id }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    })
    .then((state) => {
      dispatch(fetchDeepProfile(userId));
      dispatch(
        declineColleagueResolved({
          error: false,
          message: state.message
        })
      );
    })
    .catch((err) => {
      dispatch(declineColleagueRejected({ error: true, message: err.message }));
    });
};

export const unColleagueStarted = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: UNCOLLEAGUE_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const unColleagueResolved = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: UNCOLLEAGUE_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const unColleagueRejected = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: UNCOLLEAGUE_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const unColleague = (id: string) => (dispatch: Function) => {
  dispatch(unColleagueStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  Axios({
    url: `/uncolleague`,
    baseURL,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: { colleague: id }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    })
    .then((state) => {
      dispatch(fetchDeepProfile(id));
      dispatch(
        unColleagueResolved({
          error: false,
          message: state.message
        })
      );
    })
    .catch((err) => {
      dispatch(unColleagueRejected({ error: true, message: err.message }));
    });
};

export const fetchColleaguesStarted = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCH_COLLEAGUES_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const fetchColleaguesResolved = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCH_COLLEAGUES_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const fetchColleaguesRejected = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCH_COLLEAGUES_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};

export const fetchedColleagues = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCHED_COLLEAGUES,
    payload
  };
};

export const fetchColleagues = () => (dispatch: Function) => {
  dispatch(fetchColleaguesStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  Axios({
    url: `/colleague/find`,
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    })
    .then((state) => {
      dispatch(fetchedColleagues(state.colleagues));
      dispatch(
        fetchColleaguesResolved({
          error: false,
          message: state.message
        })
      );
    })
    .catch((err) => {
      dispatch(fetchColleaguesRejected({ error: true, message: err.message }));
    });
};

export const fetchColleagueRequestsStarted = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCH_COLLEAGUE_REQUESTS_STARTED,
    payload: { ...payload, status: 'pending' }
  };
};
export const fetchColleagueRequestsResolved = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCH_COLLEAGUE_REQUESTS_RESOLVED,
    payload: { ...payload, status: 'resolved' }
  };
};
export const fetchColleagueRequestsRejected = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCH_COLLEAGUE_REQUESTS_REJECTED,
    payload: { ...payload, status: 'rejected' }
  };
};
export const fetchedColleagueRequests = (
  payload?: Partial<RequestState>
): ReduxAction => {
  return {
    type: FETCHED_COLLEAGUE_REQUESTS,
    payload
  };
};

export const fetchColleagueRequests = () => (dispatch: Function) => {
  dispatch(fetchColleagueRequestsStarted());
  const userData = getState().userData as UserData;
  const token = userData.token as string;
  Axios({
    url: `/colleague/requests`,
    baseURL,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then((res) => {
      if (res.data.error) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    })
    .then((state) => {
      dispatch(fetchedColleagueRequests(state));
      dispatch(
        fetchColleagueRequestsResolved({
          error: false,
          message: state.message
        })
      );
    })
    .catch((err) => {
      dispatch(
        fetchColleagueRequestsRejected({ error: true, message: err.message })
      );
    });
};
