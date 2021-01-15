import moment from 'moment';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

import {
  ReduxAction,
  StatusPropsState,
  BasicInputState,
  UserData,
  NetworkAction,
  Reaction,
  ONLINE_STATUS,
  AuthState,
  ConversationMessages,
  APIConversationResponse,
  LoopFind,
  FetchState,
  OnlineStatus,
  apiBaseURL,
  PostStateProps,
  APIResponseModel,
  HTTP
} from '../constants';

import store from '../appStore';
import {
  displaySnackbar,
  setUserData,
  profileData as _profileData,
  initWebSocket,
  closeWebSocket,
  posts,
  getPosts
} from '../actions';
import { userDeviceIsMobile } from '../';
import activateSocketRouters from '../socket.router';
import {
  getConversations,
  conversations,
  getConversationsMessages,
  conversationsMessages
} from '../actions/main/chat';

export const { dispatch, getState }: any = store;

export const http: Readonly<Omit<HTTP, 'token'>> & { token: string } = {
  token: getState().userData.token,
  returnRequestConfig: (
    method: 'GET' | 'POST',
    url: string,
    requiresAuth?: boolean,
    data?: any,
    contentType?: string
  ): AxiosRequestConfig => ({
    url: `${apiBaseURL}${url}`,
    method,
    headers: {
      Authorization: requiresAuth ? `Bearer ${http.token}` : null,
      'Content-Type': contentType || 'application/json'
    },
    data,
    validateStatus: (status) => (!/^(2|3|4)/.test(`${status}`) ? false : true)
  }),
  /**
   *
   * @param url url of destination e.g. /profile/5df9e8t0wekc/posts ... Base URL should not be included
   * @param requiresAuth if token/authentication will be required for the get action
   */
  get: async <T>(url: string, requiresAuth?: boolean) => {
    const response: AxiosResponse<APIResponseModel<T>> = await axios(
      http.returnRequestConfig('GET', url, requiresAuth)
    );

    return Promise.resolve({ ...response.data });
  },
  /**
   *
   * @param url (relative) url of destination e.g. /profile/5df9e8t0wekc/posts ... Base URL should not be included
   * @param data data to be posted to destination
   * @param requiresAuth that is if token/authentication will be required for the get action
   */
  post: async <T>(
    url: string,
    data?: any,
    requiresAuth?: boolean,
    contentType?: string
  ) => {
    const response: AxiosResponse<APIResponseModel<T>> = await axios(
      http.returnRequestConfig('POST', url, requiresAuth, data, contentType)
    );

    return Promise.resolve({ ...response.data });
  }
};

export function loopThru<T>(
  _data: T[],
  loopCheckCallback: <T2 = any>(datum: T, index?: number) => T2 | any,
  options?: {
    type?: 'find' | 'findIndex' | 'native';
    includeIndex?: boolean;
    rightToLeft?: boolean;
    returnReverse?: boolean;
    makeCopy?: boolean;
  },
  doneCallback?: (data?: T[]) => T[] | any
): LoopFind<T> | T[] | T | number | null {
  const { type, rightToLeft, includeIndex, returnReverse, makeCopy } =
    options || {};
  const data = makeCopy ? _data.slice() : _data;
  const lim = data.length - 1;
  const dataReversed = [];
  const reverse = rightToLeft || returnReverse;
  let i = reverse ? lim : 0;
  let valueToReturn: LoopFind<T> | T[] | T | number | null = null;

  try {
    outer: for (; reverse ? i >= 0 : i <= lim; reverse ? i-- : i++) {
      const datum = data[i];
      let _break = '';

      switch (type) {
        case 'find':
          if (!!loopCheckCallback(datum, i)) {
            valueToReturn = includeIndex ? { value: datum, index: i } : datum;
            break outer;
          }
          break;
        case 'findIndex':
          if (!!loopCheckCallback(datum, i)) {
            valueToReturn = i;
            break outer;
          }
          break;
        default:
          _break = loopCheckCallback(datum, i);

          if (returnReverse) {
            dataReversed.push(datum);
          }
      }

      if (_break === 'break') {
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }

  if (typeof doneCallback === 'function')
    doneCallback(returnReverse ? dataReversed : data);

  return /find/.test(type!)
    ? valueToReturn
    : returnReverse
    ? dataReversed
    : data;
}

export const createObserver = (
  root: HTMLElement | null,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const { rootMargin, threshold } = options || {};

  return new IntersectionObserver(
    callback,
    options
      ? { rootMargin: rootMargin ?? '0px', threshold: threshold ?? 1.0, root }
      : {
          root,
          rootMargin: '0px',
          threshold: Array(101)
            .fill(0)
            .map((_, i) => Number((i / 100).toFixed(2)))
        }
  );
};

export const emitUserOnlineStatus = (
  shouldReInitWebSocket?: boolean,
  connectionIsDead?: boolean,
  snackBarOptions?: {
    open?: boolean;
    severity?: 'error' | 'success' | 'info';
    message?: string | null;
    autoHide?: boolean;
  }
) => {
  const { open, severity, message, autoHide } = snackBarOptions ?? {};

  if (connectionIsDead) {
    dispatch(
      displaySnackbar({
        open: true,
        autoHide: false,
        message: message ? message : 'You are offline.',
        severity: severity ? severity : 'info'
      })
    );
  } else if (open) {
    dispatch(
      displaySnackbar({
        open: true,
        autoHide: autoHide !== undefined ? autoHide : true,
        message: message ? message : 'You are back online.',
        severity: severity ? severity : 'success'
      })
    );
  }

  const {
    userData,
    auth,
    conversations: _conversations,
    conversationsMessages: _conversationsMessages,
    posts: _posts
  } = getState() as {
    userData: UserData & APIConversationResponse;
    auth: AuthState;
    conversations: FetchState<APIConversationResponse[]>;
    conversationsMessages: ConversationMessages;
    posts: FetchState<PostStateProps[]>;
  };
  let timeToEmitOnlineStatus: any = undefined;

  if (auth.isAuthenticated && !connectionIsDead) {
    if (shouldReInitWebSocket) {
      dispatch(initWebSocket(userData.token as string));
      activateSocketRouters();
    }

    if (_conversations.err) {
      dispatch(getConversations('settled')(dispatch));
    }

    if (_conversationsMessages.err) {
      dispatch(
        getConversationsMessages('updating message list...', true)(dispatch)
      );
    }

    if (_posts.err) {
      if (!_posts.data?.length) {
        dispatch(getPosts('FEED', undefined, !!_posts.data?.length));
      } else if (navigator.onLine) {
        dispatch(posts({ status: 'fulfilled', err: false }));
      }
    }

    return function recurse() {
      clearTimeout(timeToEmitOnlineStatus);
      timeToEmitOnlineStatus = setTimeout(() => {
        //make sure to use updated/reinitialized webSock from state as former would have been closed
        const socket = getState().webSocket as WebSocket;
        const docIsVisible = document.visibilityState === 'visible';

        if (socket && socket.readyState === 1) {
          socket.send(
            JSON.stringify({
              online_status: docIsVisible ? 'ONLINE' : 'AWAY',
              pipe: ONLINE_STATUS
            })
          );
          dispatch(
            setUserData({
              online_status: docIsVisible ? 'ONLINE' : 'AWAY'
            })
          );
        } else {
          if (window.navigator.onLine && docIsVisible) {
            recurse();
          }
        }
      }, 1000);
    };
  }

  return () => {
    if (auth.isAuthenticated && connectionIsDead) {
      const updateConversations = _conversations.data?.map((conversation) => {
        return {
          ...conversation,
          colleague: {
            ...conversation.colleague,
            online_status: 'OFFLINE' as OnlineStatus
          }
        };
      });

      dispatch(closeWebSocket());
      dispatch(
        conversations({
          err: true,
          data: [...updateConversations],
          status: 'settled'
        })
      );
      dispatch(conversationsMessages({ status: 'settled', err: true }));
      dispatch(
        setUserData({
          online_status: 'OFFLINE'
        })
      );
      dispatch(posts({ status: 'settled', err: true, statusText: '' }));
    }
  };
};

export const cleanUp = (isUnmount: boolean) => {
  let shouldCleanUp =
    /@/.test(window.location.pathname) &&
    (getState().profileData.data[0] as UserData).username !==
      window.location.pathname.split('/')[1].replace('@', '');
  shouldCleanUp = isUnmount ? isUnmount : shouldCleanUp;

  if (shouldCleanUp) {
    dispatch(
      _profileData({
        status: 'settled',
        err: false,
        data: [{}]
      })
    );
  }
};

export const validateEmailFn = (email: string) =>
  !!email && /^\w+[\w\d.]*[\w\d]+@\w+\.[\w\d.]+[\w\d]$/.test(email);

export const validateResetPasswordFn = (password: string) => {
  const result: BasicInputState = {
    value: password,
    err: false,
    helperText: ''
  };
  if (!password || password.length < 8) {
    result.err = true;
    result.helperText = 'Password should not be less than 8 characters.';
  } else if (/^[A-Z]$|^[a-z]+$|^[0-9]+$/.test(password)) {
    result.err = true;
    result.helperText =
      'Password weak. Consider combining alphanumerics/symbols.';
  }
  return result;
};

export const resultantReaction: Function = (
  oldReaction: Reaction,
  newReaction: Reaction
): Reaction => {
  if (oldReaction === newReaction) return 'NEUTRAL';
  return newReaction;
};

export function promisedDispatch(action: ReduxAction): Promise<ReduxAction> {
  dispatch(action);
  return new Promise((resolve: Function) => {
    setTimeout(() => resolve(action), 200);
  });
}

let timeoutToGiveFeedback: any;
let timeoutToAbortNetworkAction: any;
export function checkNetworkStatusWhilstPend(action: NetworkAction) {
  //clear timeout in case it's already been initialized by multiple submit actions
  clearTimeout(timeoutToGiveFeedback);
  clearTimeout(timeoutToAbortNetworkAction);

  let state: any;
  const errFeedback: StatusPropsState = {
    status: 'pending',
    err: true,
    statusText: "Network is taking too long to respond. Sure you're connected?"
  };
  const abortionFeedback: StatusPropsState = {
    status: 'settled',
    err: true,
    statusText:
      'Something, probably, seems to be wrong with your data connection. Try contact your Service Provider.'
  };

  //if after 12 seconds of sending request there's no response, throw a network error feedback to user
  timeoutToGiveFeedback = setTimeout(() => {
    state = getState();

    if (!state[action.name])
      throw Error(
        `Dispatch function '${action.name}' does not exist in state. Did you forget to map to props.`
      );

    callTimeoutToAbortNetworkAction(action);
  }, 14000);

  function callTimeoutToAbortNetworkAction(action: NetworkAction) {
    if (navigator.onLine && state[action.name]?.status === 'pending') {
      dispatch(action.func({ ...errFeedback }));
      dispatch(
        displaySnackbar({
          open: true,
          message: errFeedback.statusText,
          severity: 'info'
        })
      );
    }

    timeoutToAbortNetworkAction = setTimeout(() => {
      state = getState();

      if (navigator.onLine && state[action.name].status === 'pending') {
        dispatch(action.func({ ...abortionFeedback }));
        dispatch(
          displaySnackbar({
            open: true,
            message: abortionFeedback.statusText,
            severity: 'info'
          })
        );
      }
    }, 14000);
  }
}

export async function populateStateWithUserData(
  data: UserData
): Promise<ReduxAction> {
  setTimeout(() => {
    const socket = getState().webSocket as WebSocket;

    if (socket && socket.readyState === 1) {
      socket.send(
        JSON.stringify({
          online_status:
            document.visibilityState === 'visible' ? 'ONLINE' : 'AWAY',
          pipe: ONLINE_STATUS
        })
      );
    }
  }, 2000);

  return await promisedDispatch(
    setUserData({
      ...data,
      online_status: document.visibilityState === 'visible' ? 'ONLINE' : 'AWAY'
    })
  );
}

export const logError = (action: Function) => (error: Error) => {
  let message = /network|connect|internet/i.test(error.message)
    ? 'A network error occurred. Check your internet connection'
    : error.message;

  dispatch(
    action({
      status: 'settled',
      err: true
    })
  );
  dispatch(
    displaySnackbar({
      open: true,
      message: navigator.onLine
        ? `${message[0].toUpperCase()}${message.slice(1)}.`
        : 'You are offline.',
      severity:
        navigator.onLine && !/network|connect|internet/i.test(message)
          ? 'error'
          : 'info'
    })
  );

  if (process.env.NODE_ENV === 'development') {
    console.error('An error occured: ', error);
  }
};

export const addEventListenerOnce = (
  target: HTMLElement | any,
  callback: Function | any,
  event?: string,
  options?: { capture?: boolean; once?: boolean; passive?: boolean }
) => {
  event = event ? event : 'transitionend';

  try {
    target.addEventListener(
      event,
      callback,
      options
        ? {
            ...(options ?? {}),
            once: options.once !== undefined ? options.once : true
          }
        : { once: true }
    );
  } catch (err) {
    target.removeEventListener(
      event,
      callback,
      options?.capture ? true : false
    );
    target.addEventListener(event, callback, options?.capture ? true : false);
  }
};

export const timestampFormatter = (
  _timestamp?: string | number,
  withSeconds?: boolean
): string => {
  let timestamp = new Date(Number(_timestamp)).toLocaleTimeString();

  if (timestamp) {
    if (!Number(_timestamp) && !/^\d\d:\d\d:\d\d$/.test(String(timestamp))) {
      return String(timestamp);
    }
  } else {
    timestamp = new Date().toLocaleTimeString();
  }

  if (/(a|p)m/i.test(timestamp)) {
    timestamp = timestamp.replace(/:\d\d\s?(\w)/, ' $1');

    let [hr, remnant] = timestamp.split(':');

    return `${+hr < 10 ? '0' + hr : hr}:${remnant}`;
  }

  let [hour, minute, second] = String(timestamp).split(':');
  let hr = +hour;
  let amOrPm = '';

  if (hr > 11) {
    amOrPm = 'pm';
    hr = hr === 12 ? hr : hr - 12;
  } else {
    amOrPm = 'am';
    hr = hr === 0 ? 12 : hr;
  }

  hour = hr < 10 ? '0' + hr : '' + hr;

  return withSeconds
    ? `${hour}:${minute}:${second} ${amOrPm}`
    : `${hour}:${minute} ${amOrPm}`;
};

export const bigNumberFormat: Function = (number: number): string => {
  if (isNaN(number)) return `${number}`;

  if (number < 9999) {
    return `${number}`;
  }

  if (number < 1000000) {
    return `${Math.floor(number / 1000)}K`;
  }
  if (number < 10000000) {
    return `${(number / 1000000).toFixed(2)}M`;
  }

  if (number < 1000000000) {
    return `${Math.floor(number / 1000000)}M`;
  }

  if (number < 1000000000000) {
    return `${Math.floor(number / 1000000000)}B`;
  }

  return '1T+';
};

export const preventEnterNewLine = (e: any) => {
  if (!e.shiftKey && e.key === 'Enter' && !userDeviceIsMobile) {
    e.preventDefault();
  }
};

// more performant (custom) timers utilizing window.requestAnimationFrame...

const _requestAnimationFrame = _requestAnimationFrameWrapper();

export function delay(
  timeout: number,
  clearCallback?: Function
): Promise<number> {
  if (isNaN(timeout))
    throw Error(
      "'delay' expects a time [number] in milliseconds as parameter."
    );

  return new Promise((resolve: Function) => {
    let start = 0;
    let id = _requestAnimationFrame(animate);
    let clear = clearCallback ? clearCallback : () => false;

    function animate(timestamp: number) {
      if (!start) start = timestamp;
      let timeElapsed = timestamp - start;

      if (timeElapsed < timeout && !clear())
        id = _requestAnimationFrame(animate);
      else resolve(id);
    }
  });
}

export function interval(
  callback: Function,
  _interval: number,
  clearCallback?: Function
): Promise<number> {
  if (isNaN(_interval))
    throw Error(
      "'interval' expects a time [number] in milliseconds as parameter."
    );

  return new Promise((resolve: Function) => {
    let start = 0;
    let id = _requestAnimationFrame(animate);
    let clear = false;

    function animate(timestamp: number) {
      if (!start) start = timestamp;

      let timeElapsed = timestamp - start;

      if (!clear) id = _requestAnimationFrame(animate);
      else resolve(id);

      if (timeElapsed % _interval < 17 && timeElapsed > _interval) {
        callback();
        clear = clearCallback ? clearCallback() : false;
      }
    }
  });
}

function _requestAnimationFrameWrapper() {
  let previousTime = 0;

  if (window.requestAnimationFrame) return window.requestAnimationFrame;
  return (callback: Function) => {
    /**
     * Credit to Paul Irish (@ www.paulirish.com) for creating/providing this polyfill
     */
    let timestamp = new Date().getTime();
    let timeout = Math.max(0, 16 - (timestamp - previousTime));
    let id = setTimeout(() => {
      callback(timestamp + timeout);
    }, 16); //corrected this line from 'timeout' in actual polyfill to '16' as it made animation slow and jank

    previousTime = timestamp + timeout;

    return id;
  };
}

export const convertColleagueArrayToMentionFormat = (colleagueArray: any) => {
  let mentionArray: any[] = [];
  for (let colleague of colleagueArray) {
    mentionArray.push({
      name: colleague.username,
      link: `/@${colleague.username}`,
      avatar: '/images/avatar-1.png'
    });
  }
  return mentionArray;
};

export const getCharacterSequenceFromText = (text: string, char: string) => {
  let finArray = [];
  let array = text
    .split(' ')
    .filter(
      (text) =>
        text.startsWith(char) &&
        text.length > 1 &&
        !text.substring(1).match(/[^A-Za-z0-9_.,?!]/)
    );

  for (let item of array) {
    if (char === '@') {
      finArray.push(
        item.substring(
          1,
          item.substring(1).search(/[^A-Za-z0-9_]/) === -1
            ? undefined
            : item.substring(1).search(/[^A-Za-z0-9_]/) + 1
        )
      );
    } else {
      finArray.push(
        item.substring(
          0,
          item.substring(1).search(/[^A-Za-z0-9_]/) === -1
            ? undefined
            : item.substring(1).search(/[^A-Za-z0-9_]/) + 1
        )
      );
    }
  }
  return finArray;
};

export const formatDate = (dateTime: Date | number) => {
  if (!dateTime) {
    return null;
  }

  const today = moment();
  const time = moment(dateTime);
  const diff = today.diff(time);
  const duration = moment.duration(diff);

  if (duration.years() > 0) {
    return time.format('ll');
  } else if (duration.weeks() > 0) {
    return duration.weeks() > 1 ? time.format('ll') : 'a week ago';
  } else if (duration.days() > 0) {
    return duration.days() > 1 ? duration.days() + ' days ago' : 'a day ago';
  } else if (duration.hours() > 0) {
    return duration.hours() > 1
      ? duration.hours() + ' hours ago'
      : 'an hour ago';
  } else if (duration.minutes() > 0) {
    return duration.minutes() > 1
      ? duration.minutes() + ' minutes ago'
      : 'a minute ago';
  } else if (duration.seconds() > 0) {
    return duration.seconds() > 1
      ? duration.seconds() + ' seconds ago'
      : 'just now';
  }
};

export const formatMapDateString = (
  timestamp: number | string,
  includeDay?: boolean,
  includeYear?: boolean,
  dayMonthSeparator?: string
): string => {
  if (isNaN(timestamp as number)) {
    return timestamp as string;
  }

  const today = new Date().toDateString();
  const dateString = new Date(timestamp).toDateString();
  const dateIsToday = dateString === today;
  const dateIsYesterday =
    (Math.abs(
      (new Date(today) as any) - (new Date(dateString) as any)
    ) as any) /
      864e5 ===
    1;

  if (dateIsToday) return 'today';
  if (dateIsYesterday) return 'yesterday';

  let [day, month, date, year] = dateString.split(' ');

  switch (true) {
    case /sun/i.test(day):
      day = 'Sunday';
      break;
    case /mon/i.test(day):
      day = 'Monday';
      break;
    case /tue/i.test(day):
      day = 'Tuesday';
      break;
    case /wed/i.test(day):
      day = 'Wednesday';
      break;
    case /thu/i.test(day):
      day = 'Thursday';
      break;
    case /fri/i.test(day):
      day = 'Friday';
      break;
    case /sat/i.test(day):
      day = 'Saturday';
      break;
  }

  switch (true) {
    case /jan/i.test(month):
      month = 'January';
      break;
    case /feb/i.test(month):
      month = 'February';
      break;
    case /mar/i.test(month):
      month = 'March';
      break;
    case /apr/i.test(month):
      month = 'April';
      break;
    case /may/i.test(month):
      month = 'May';
      break;
    case /jun/i.test(month):
      month = 'June';
      break;
    case /jul/i.test(month):
      month = 'July';
      break;
    case /aug/i.test(month):
      month = 'August';
      break;
    case /sep/i.test(month):
      month = 'September';
      break;
    case /oct/i.test(month):
      month = 'October';
      break;
    case /nov/i.test(month):
      month = 'November';
      break;
    case /dec/i.test(month):
      month = 'December';
      break;
  }

  return `${
    includeDay
      ? day + (dayMonthSeparator ? ' ' + dayMonthSeparator + ' ' : ' - ')
      : ''
  }${month} ${date}${includeYear ? ', ' + year : ''}`;
};

export const formatNotification = (entities: any, text: string) => {
  const text1 = text.replace('\n', ' ');
  let string = '';
  text1.split(' ').map((w) => {
    /(^{{)[A-Za-z0-9-]+(}}$)/.test(w)
      ? entities[w.substring(2, w.length - 2)].action
        ? (string = string.concat(
            ` <a class='underline-hover' href='${
              entities[w.substring(2, w.length - 2)].action
            }'>${entities[w.substring(2, w.length - 2)].subject}</a>`
          ))
        : (string = string.concat(
            ` ${entities[w.substring(2, w.length - 2)].subject}`
          ))
      : (string = string.concat(` ${w}`));
    return true;
  });
  return string;
};

export const countNewNotifications = (notifications: Array<any>) => {
  let newNotifications = 0;
  for (let notification of notifications) {
    if (notification.seen) {
      break;
    } else {
      newNotifications++;
    }
  }
  return newNotifications;
};

export const isImage = (file: File) => {
  return file['type'].split('/')[0] === 'image';
};

export const getFileExtension = (filename: string) => {
  return filename.split('.').pop();
};
