import { AxiosRequestConfig } from 'axios';

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

// Auth [Signin/Signup] interfaces ...

export interface InputErrState {
  err?: boolean;
  helperText?: string;
}

export interface PostStateProps {
  downvote_count: number;
  reactions: UserData[];
  reply_count: number;
  repost_count: number;
  reposted: boolean;
  upvote_count: number;
  downvotes: number;
  id: string;
  media: any[];
  date: number;
  pipe: SocketPipe;
  parent_id: string;
  reaction: Reaction;
  colleague_replies: Partial<PostStateProps>[];
  colleague_reposts: Partial<PostStateProps>[];
  sender: {
    cover_photo: string;
    department: string;
    first_name: string;
    id: string;
    last_name: string;
    last_seen: number;
    level: string;
    online_status: OnlineStatus;
    profile_photo: string;
    username: string;
  };
  parent: { id: string; reply_count: number };
  text: string;
  upvotes: number;
  sec_type?: 'REPOST' | 'REPLY';
  type?: 'post' | 'reply';
}

interface PostExtraProps {
  type: 'UPVOTE' | 'DOWNVOTE';
  colleague_id: string;
  colleague_name: string;
  colleague_username: string;
}

export interface SendReplyProps extends SocketStruct {
  post_id: string;
  reaction?: Reaction;
  interaction?: 'SEEN' | 'ENGAGED';
  hashtags?: string[];
  mentions?: string[];
  text?: string;
}

interface SocketStruct {
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

export interface PostReactionResult {
  downvotes?: number;
  upvotes?: number;
  id: string;
}

export interface RepostResult {
  count?: number;
  id: string;
}

export type Reaction = 'UPVOTE' | 'DOWNVOTE' | 'NEUTRAL';

export interface FetchPostsState {
  status: 'pending' | 'rejected' | 'resolved';
  error?: boolean;
  message?: string;
}

export interface RequestState {
  status: 'pending' | 'rejected' | 'resolved';
  error?: boolean;
  message?: string;
}

export interface MakeRepostState extends FetchPostsState {}

export interface TopicPropsState {
  topic: string;
  numberOfDiscussions: number;
}

export interface ReactPostState {
  id: string;
  type: Reaction;
}

export interface BasicInputState extends InputErrState {
  value?: string;
}
export interface ApiProps {
  endpoint: string;
  method: any;
  headers?: HeaderProps;
}

export type useApiResponse<T> = [() => Promise<void>, T, boolean];

interface HeaderProps {
  [key: string]: any;
}

export interface ColleagueProps {
  [x: string]: any;
  firstname: string;
  lastname: string;
  id: string;
  username: string;
}

export interface ColleagueRequestProps {
  sender: ColleagueRequestSender;
  request: ColleagueRequest;
}

interface ColleagueRequestSender {
  [x: string]: any;
  firstname: string;
  date_of_birth: string;
  id: string;
  email: string;
  lastname: string;
  username: string;
  department: string;
  level: string;
}

interface ColleagueRequest {
  date: number;
  id: string;
}

export interface DeepProfileProps {
  status:
    | 'IS_COLLEAGUE'
    | 'PENDING_REQUEST'
    | 'AWAITING_REQUEST_ACTION'
    | 'NOT_COLLEAGUES';
  mutual_colleagues?: number;
  request_id?: string;
}

export interface InstitutionInputState extends InputErrState {
  value?: { keyword?: string; uid?: string };
}

export interface AuthState {
  isAuthenticated?: boolean;
  status?: 'settled' | 'pending' | 'fulfilled';
}

export interface StatusPropsState {
  status?: 'settled' | 'pending' | 'fulfilled';
  err?: boolean;
  statusText?: string;
}

export interface ForgotPasswordStatusState {
  status?: 'pending' | 'completed';
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

export interface SignupPropsState {
  first_name: BasicInputState;
  last_name: BasicInputState;
  username: BasicInputState;
  email: BasicInputState;
  dob: BasicInputState;
  password: BasicInputState;
  institution: InstitutionInputState;
  department: BasicInputState;
  level: BasicInputState;
  matchingInstitutions: SearchState;
  matchingDepartments: SearchState;
  matchingLevels: SearchState;
  [key: string]: any;
}

export interface SignupFormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  dob: string;
  password?: string;
  institution: string;
  department: string;
  level: string;
}

export interface SigninPropsState {
  signinId: BasicInputState;
  signinPassword: BasicInputState;
  [key: string]: any;
}

export interface SigninFormData {
  id: string;
  password: string;
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
  type?: 'CREATE_POST' | 'CREATE_REPOST';
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
  date_of_birth?: string;
  online_status?: OnlineStatus;
  username: string;
  reaction?: 'UPVOTE' | 'DOWNVOTE';
}

export interface ColleagueData {
  firstname: string;
  lastname: string;
  username: string;
  institution: string;
  department: string;
  level: string;
  id: string;
}

export interface CreateDepartmentState extends StatusPropsState {
  department?: string;
  institution?: string;
}

export interface CreateLevelState extends StatusPropsState {
  level?: string;
  department?: string;
}

// ChatBox interfaces...

export interface ChatState {
  pathname?: string;
  queryParam?: string;
  isOpen?: boolean;
}

export interface RoomInfo {
  participants?: any[];
}

export interface ConversationsMessages extends StatusPropsState {
  convoId?: string;
  pipe?: SocketPipe;
  data?: { [convoId: string]: ConversationMessages['data'] };
}

export interface ConversationMessages
  extends FetchState<Partial<APIMessageResponse>[]> {
  convoId?: string;
  pipe?: SocketPipe;
}

export interface ConversationInfo
  extends FetchState<
    Partial<Omit<UserData, 'token'> & APIConversationResponse>
  > {
  user_typing?: string;
  online_status?: OnlineStatus;
  conversationId?: string;
}

// export interface PostSocketMessageResponse
//   extends Partial<Omit<APIMessageResponse, 'seen_by' | 'delivered_to'>> {
//   status: OnlineStatus;
//   user_id: string;
//   seen_by: string;
//   delivered_to: string;
// }

export interface ChatSocketMessageResponse
  extends Partial<Omit<APIMessageResponse, 'seen_by' | 'delivered_to'>> {
  status: OnlineStatus;
  user_id: string;
  seen_by: string;
  delivered_to: string;
}

export interface ChatSocketConversationResponse
  extends Partial<APIConversationResponse> {
  status: OnlineStatus;
  user_id: string;
  seen_by: string;
  delivered_to: string;
}

export type OnlineStatus = 'ONLINE' | 'AWAY' | 'OFFLINE';

export interface APIMessageResponse {
  __v: number;
  conversation_id: string;
  created_at: number;
  date: number;
  deleted: boolean;
  delivered_to: string[];
  id: string;
  is_recent?: boolean;
  message: string;
  parent?: APIMessageResponse;
  pipe?: SocketPipe;
  seen_by: string[];
  sender_id: string;
  timestamp_id?: string;
}

export interface APIConversationResponse {
  colleague: Partial<{
    cover_photo: string;
    department: string;
    first_name: string;
    id: string;
    institution: string;
    last_name: string;
    last_seen: number;
    level: string;
    profile_photo: string;
    username: string;
    online_status: OnlineStatus;
  }>;
  conversation_name: string;
  created_at: number;
  creator: 'SYSTEM' | string;
  friendship: string;
  id: string;
  last_activity: number;
  last_message: APIMessageResponse;
  last_read: number;
  new_message?: Partial<APIMessageResponse>;
  participants: string[];
  pipe: SocketPipe;
  type: 'ONE_TO_ONE' | string;
  unread_count: number;
  user_typing: string;
  user_id: string;
}

export interface NotificationState extends StatusPropsState {
  data?: {
    notifications?: any[];
    entities?: any;
  };
  [key: string]: any;
}

export interface HashTag {
  hashtag: string;
  count: 2;
}

export interface NotificationData {
  _id: string;
  data: any;
  date: any;
  message: string;
  type: string;
  [key: string]: any;
}

export interface MentionState extends StatusPropsState {
  data?: any[];
  [key: string]: any;
}

export interface MentionData extends ColleagueData {
  [index: string]: any;
}

export interface PostContent {
  text: string;
  media?: Array<string>;
  mentions?: Array<string>;
  hashtags?: Array<string>;
}

export interface ReplyProps extends PostContent {
  pipe: 'POST_REPLY';
  post_id: string;
}

export interface ReplyResult extends ReplyProps {
  error: boolean;
  sec_type: 'REPLY';
  id: string;
  text: string;
  parent: PostStateProps;
  action_count: number;
}

export interface ReplyState {
  err?: boolean;
  data?: ReplyResult;
  status: 'settled' | 'pending' | 'fulfilled';
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

export interface EditProfileState {
  err?: boolean;
  status: 'settled' | 'pending' | 'fulfilled';
  data?: Object;
}

export interface MakePostState {
  status: 'settled' | 'pending' | 'fulfilled';
}

export interface QuestionEditor {
  question: {
    title: string;
    body: string;
    tags: Array<string>;
  };
  selectedUploads: Array<any>;
  selectedFiles: Array<File>;
  tempSelectedUploads: Array<any>;
  showUploads: boolean;
}

export interface QuestionState {
  err?: boolean;
  status: 'settled' | 'pending' | 'fulfilled';
  data?: Object;
}
