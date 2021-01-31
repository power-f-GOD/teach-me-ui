import { AxiosRequestConfig } from 'axios';
import { OnlineStatus } from './chat';
import { PostContent } from './home';

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface NotificationSoundState {
  play?: boolean;
  isPlaying?: boolean;
  isReady?: boolean;
  hasEnded?: boolean;
  toneType?:
    | 'INCOMING_MESSAGE'
    | 'OUTGOING_MESSAGE'
    | 'ACTION_SUCCESS'
    | 'GENERAL';
  toneName?:
    | 'exquisite-557'
    | 'juntos-607'
    | 'open-ended-563'
    | 'piece-of-cake-611'
    | 'quite-impressed-565'
    | 'slow-spring-board-570'
    | 'all-eyes-on-me-465'
    | 'suppressed-437'
    | 'just-like-that-404';
}

export interface HTTP {
  token: string;
  returnRequestConfig(
    method: 'GET' | 'POST',
    url: string,
    requiresAuth?: boolean,
    data?: any,
    contentType?: string
  ): AxiosRequestConfig;
  get<T>(url: string, requiresAuth?: boolean): Promise<APIResponseModel<T>>;
  post<T, T2 = T | any>(
    url: string,
    data?: T2,
    requiresAuth?: boolean,
    contentType?: string
  ): Promise<APIResponseModel<T>>;
}

export type LoopFind<valueType> = {
  value: valueType;
  index: number;
};

export interface NetworkAction {
  name: string;
  func: Function;
}

export interface ReduxAction {
  type: string;
  newState?: any;
  payload?: any;
}

export interface ReduxActionV2<T> {
  type: string;
  newState?: T;
  payload?: T;
}

export interface SocketStruct {
  pipe: SocketPipe;
}

export type SocketPipe =
  | 'POST_REACTION'
  | 'POST_REPLY'
  | 'POST_INTERACTION'
  | 'POST_REPOST'
  | 'CHAT_NEW_MESSAGE'
  | 'CHAT_MESSAGE_DELETED'
  | 'CHAT_MESSAGE_DELETED_FOR'
  | 'ONLINE_STATUS'
  | 'CHAT_READ_RECEIPT'
  | 'CHAT_MESSAGE_DELIVERED'
  | 'CHAT_TYPING'
  | 'PING_USER';

export interface ApiProps {
  endpoint: string;
  method: any;
  headers?: Record<string, any>;
}

export type UseApiResponse<T> = [() => Promise<void>, T, boolean];

export interface StatusPropsState {
  status?: 'settled' | 'pending' | 'fulfilled';
  err?: boolean;
  statusText?: string;
  data?: any;
}

export interface SearchState extends StatusPropsState {
  data?: any[];
}

export interface FetchState<T, T2 = any> extends StatusPropsState {
  data?: T;
  extra?: T2;
}

export interface APIResponseModel<T> {
  error: boolean;
  message?: string;
  data: T;
}

export interface SnackbarState {
  open?: boolean;
  message?: string;
  severity?: 'error' | 'info' | 'success' | 'warning';
  autoHide?: boolean;
  timeout?: number;
}

export interface ModalState {
  open: boolean;
  type?: 'MAKE_POST' | 'MAKE_REPOST';
  meta?: { title?: string; [key: string]: any };
}

export interface UserData {
  bio?: string;
  avatar?: string;
  cover_photo?: string;
  profile_photo?: string;
  id: string;
  displayName: string;
  token?: string | null;
  department: string;
  first_name: string;
  institution: string;
  last_login?: number;
  last_seen?: number;
  last_name: string;
  level: string;
  email?: string;
  dob?: string;
  date_joined?: number;
  date_of_birth?: string;
  online_status?: OnlineStatus;
  username: string;
  reaction?: 'UPVOTE' | 'DOWNVOTE';
}

export interface PostEditorState {
  post: PostContent;
  [key: string]: any;
}

export interface UploadState {
  err: boolean;
  status: 'settled' | 'pending' | 'fulfilled';
  data: Array<string>;
}
