import {
  ReduxAction,
  StatusPropsState,
  BasicInputState,
  UserData,
  NetworkAction,
  Reaction
} from '../constants';
import store from '../appStore';
import { displaySnackbar, setUserData } from '../actions';
import { userDeviceIsMobile } from '../';

export const { dispatch, getState }: any = store;

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
  }, 15000);

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
    }, 15000);
  }
}

export async function populateStateWithUserData(
  data: UserData
): Promise<ReduxAction> {
  return await promisedDispatch(setUserData({ ...data }));
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

  // let is12hour = ;

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
  for (let colleague of colleagueArray ) {
    mentionArray.push({ 
      name: colleague.username, 
      link: `/@${colleague.username}`,
      avatar: '/images/avatar-1.png'
    });
  };
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
        if (mention.length > 0) {
          mentions.push(mention);
        };
      } else {
        let mention = newText.substring(0, endOfMention);
        if (mention.length > 0) {
          mentions.push(mention);
        };
        checkTextForMention(newText)
      };
    };
  };
  checkTextForMention(text)
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
        };
      } else {
        let hashtag = newText.substring(0, endOfHashtag);
        if (hashtag.length > 1) {
          hashtags.push(`#${hashtag}`);
        };
        checkTextForHashtag(newText)
      };
    };
  };
  checkTextForHashtag(text)
  return hashtags;
};