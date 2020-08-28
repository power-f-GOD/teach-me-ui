import {
  ReduxAction,
  StatusPropsState,
  BasicInputState,
  UserData,
  NetworkAction,
  Reaction,
  ONLINE_STATUS
} from '../constants';

import store from '../appStore';
import {
  displaySnackbar,
  setUserData,
  profileData as _profileData
} from '../actions';
import { userDeviceIsMobile } from '../';

import moment from 'moment';

export const { dispatch, getState }: any = store;

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
export function callNetworkStatusCheckerFor(action: NetworkAction) {
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
  }, 18000);

  function callTimeoutToAbortNetworkAction(action: NetworkAction) {
    if (navigator.onLine && state[action.name]?.status === 'pending') {
      dispatch(action.func({ ...errFeedback }));
      dispatch(
        displaySnackbar({
          open: true,
          message: errFeedback.statusText,
          severity: 'error'
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
            severity: 'error'
          })
        );
      }
    }, 18000);
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

export const logError = (action: Function) => (error: any) => {
  let message = /network/i.test(error.message)
    ? 'A network error occurred. Check your internet connection.'
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
      severity: 'error'
    })
  );
  console.error('An error occured: ', error);
};

export const addEventListenerOnce = (
  target: HTMLElement | any,
  callback: Function | any,
  event?: string,
  options?: { capture?: boolean; once?: boolean }
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

export const getMentionsFromText = (text: string): string[] => {
  let mentions: string[] = [];
  const checkTextForMention = (text1: string) => {
    let startOfMention = text1.indexOf('@');
    if (startOfMention !== -1) {
      let newText = text1.substring(startOfMention + 1);
      let endOfMention = newText.search(/[^A-Za-z0-9_]/);
      if (endOfMention === -1) {
        let mention = newText;
        if (mention) {
          mentions.push(mention);
        }
      } else {
        let mention = newText.substring(0, endOfMention);
        if (mention) {
          mentions.push(mention);
        }
        checkTextForMention(newText);
      }
    }
  };
  checkTextForMention(text);
  return mentions;
};

export const getHashtagsFromText = (text: string): string[] => {
  let hashtags: string[] = [];
  const checkTextForHashtag = (text1: string) => {
    let startOfHashtag = text1.indexOf('#');
    if (startOfHashtag !== -1) {
      let newText = text1.substring(startOfHashtag + 1);
      let endOfHashtag = newText.search(/[^A-Za-z0-9_]/);
      if (endOfHashtag === -1) {
        let hashtag = newText;
        if (hashtag.length > 1) {
          hashtags.push(`#${hashtag}`);
        }
      } else {
        let hashtag = newText.substring(0, endOfHashtag);
        if (hashtag.length > 1) {
          hashtags.push(`#${hashtag}`);
        }
        checkTextForHashtag(newText);
      }
    }
  };
  checkTextForHashtag(text);
  return hashtags;
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
            ` <a style="color: rgb(0, 115, 160)" href='${
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