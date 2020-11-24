export type Partial<T> = {
  [P in keyof T]?: T[P];
};

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

export interface PostPropsState {
  downvotes: number;
  id: string;
  media: any[];
  posted_at: number;
  reaction: Reaction;
  replies: number;
  reposts: number;
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
  text: string;
  upvotes: number;
  sec_type?: 'REPOST' | 'REPLY';
  type: 'post' | 'reply';
  child?: PostProps;
  _extra?: PostExtraProps;
  parent?: PostProps;
}

interface PostExtraProps {
  type: 'UPVOTE' | 'DOWNVOTE';
  colleague_id: string;
  colleague_name: string;
  colleague_username: string;
}

interface PostProps {
  downvotes: number;
  id: string;
  media: any[];
  posted_at: number;
  reaction: Reaction;
  replies: number;
  reposts: number;
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
  text: string;
  upvotes: number;
  sec_type?: 'REPOST' | 'REPLY';
}

export interface SocketProps extends SocketStruct {
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

export interface ReactButtonPropsState {
  id: string;
  num_of_reactions: number;
  type: 'UPVOTE' | 'DOWNVOTE';
  reaction: Reaction;
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

export interface SignupPropsState {
  firstname: BasicInputState;
  lastname: BasicInputState;
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
  firstname: string;
  lastname: string;
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
  queryString?: string;
  isOpen?: boolean;
  isMinimized?: boolean;
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

export interface Post {
  text: string;
  media?: Array<string>;
  mentions?: Array<string>;
  hashtags?: Array<string>;
}

export interface Reply {
  text: string;
  media: Array<string>;
  mentions: Array<string>;
  hashtags: Array<string>;
}

export interface ReplyProps extends Post {
  pipe: 'POST_REPLY';
  post_id: string;
}

export interface ReplyResult extends ReplyProps {
  error: boolean;
  sec_type: 'REPLY';
  id: string;
  text: string;
  parent: PostProps;
  action_count: number;
}

export interface ReplyState {
  err?: boolean;
  data?: ReplyResult;
  status: 'settled' | 'pending' | 'fulfilled';
}

export interface PostEditorState {
  post: Post;
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

export interface CustomFile extends File {
  url?: string;
}
