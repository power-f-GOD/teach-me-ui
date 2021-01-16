declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare module 'query-string';

declare module 'draft-js-mention-plugin';
declare module 'draft-js-hashtag-plugin';
declare module 'draft-js-linkify-plugin';
declare module '*.css';
