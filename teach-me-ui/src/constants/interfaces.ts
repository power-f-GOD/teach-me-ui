export type Partial<T> = {
  [P in keyof T]?: T[P];
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

// Auth [Signin/Signup] interfaces ...

export interface InputErrState {
  err?: boolean;
  helperText?: string;
}

export interface PostPropsState {
  userAvatar: string;
  reaction: Reaction;
  sender_id: string;
  sender_name: string;
  sender_username: string;
  sec_type?: 'REPOST' | 'REPLY';
  text: string;
  id: string;
  upvotes: number;
  downvotes: number;
  replies: number;
  reposts: number;
  posted_at: number;
  _extra?: PostExtraProps;
  parent?: PostParentProps;
}

interface PostExtraProps {
  type: 'UPVOTE' | 'DOWNVOTE';
  colleague_id: string;
  colleague_name: string;
  colleague_username: string;
}

interface PostParentProps {
  sec_type?: 'REPOST' | 'REPLY';
  text: string;
  id: string;
  sender_id: string;
  sender_name: string;
  sender_username: string;
  userAvatar?: string;
  upvotes: number;
  downvotes: number;
  replies: number;
  reaction?: Reaction;
  reposts: number;
  posted_at?: number;
}

export interface SocketProps {
  pipe: 'POST_REACTION' | 'POST_REPLY';
  post_id: string;
  reaction?: Reaction;
  interaction?: 'SEEN' | 'ENGAGED';
  hashtags?: string[];
  mentions?: string[];
  text?: string;
}

export interface PostReactionResult {
  downvotes: number;
  upvotes: number;
  id: string;
}

export type Reaction = 'UPVOTE' | 'DOWNVOTE' | 'NEUTRAL';

export interface FetchPostsState {
  status: 'pending' | 'rejected' | 'resolved';
  error?: boolean;
  message?: string;
}

export interface TopicPropsState {
  topic: string;
  numberOfDiscussions: number;
}

export interface ReactButtonPropsState {
  id: string;
  reactions: number;
  type: 'UPVOTE' | 'DOWNVOTE';
  reacted: Reaction;
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

export interface ColleagueRequestProps {
  sender: ColleagueRequestSender;
  request: ColleagueRequest;
}

interface ColleagueRequestSender {
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
}

export interface ModalState {
  open: boolean;
  type?: 'CREATE_POST' | 'CREATE_COMMENT';
  title?: string;
}

export interface UserData extends SignupFormData {
  avatar?: string;
  id: string;
  displayName: string;
  token?: string | null;
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

//you should eventually make all the Message props required
export interface MessageProps extends Partial<APIMessageResponse> {
  timestamp?: string | number;
}

export interface ChatState {
  queryString?: string;
  isOpen?: boolean;
  isMinimized?: boolean;
}

export interface ChatData {
  [id: string]: AnchorInfo;
}

export interface AnchorInfo {
  displayName: string;
  id: string;
  messages?: MessageProps[];
  avatar: string;
  info?: UserInfo | RoomInfo;
  type: 'conversation' | 'classroom';
}

export interface UserInfo {
  username?: string;
  institution?: string;
  department?: string;
  level?: string;
}

export interface RoomInfo {
  participants?: any[];
}

export interface UserEnrolledData {
  avatar?: string;
  displayName: string;
  firstname: string;
  lastname: string;
  id: string;
  username: string;
  institution: string;
  department: string;
  level: string;
}

export interface ConversationsMessages extends StatusPropsState {
  [convoId: string]: any;
}

export interface ConversationMessages extends Omit<SearchState, 'data'> {
  conversationId?: string;
  pipe?:
    | 'CHAT_NEW_MESSAGE'
    | 'CHAT_MESSAGE_DELIVERED'
    | 'CHAT_TYPING'
    | 'CHAT_READ_RECEIPT';
  data?: Partial<APIMessageResponse>[];
}

export interface ConversationInfo extends Omit<SearchState, 'data'> {
  user_typing?: string;
  conversationId?: string;
  data?: Partial<UserEnrolledData & APIConversationResponse>;
}

export interface APIMessageResponse {
  deleted: boolean;
  seen_by: string[];
  delivered_to: string[];
  created_at: number;
  _id: string;
  conversation_id: string;
  message: string;
  date: number;
  sender_id: string;
  timestamp_id?: string;
  __v: number;
  pipe: string;
  user_id?: string;
}

export interface APIConversationResponse {
  avatar?: string;
  participants: string[];
  created_at: number;
  last_activity: number;
  _id: string;
  creator: 'SYSTEM' | string;
  type: 'ONE_TO_ONE' | string;
  __v: number;
  friendship: string;
  conversation_name: string;
  associated_username: string;
}

export interface NotificationState extends StatusPropsState {
  data?: any[];
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
  mentions: Array<string>;
  hashtags: Array<string>;
}

export interface ReplyProps extends Post {
  pipe: 'POST_REPLY';
  post_id: string;  
}

export interface ReplyResult extends ReplyProps {
  error: boolean;
  sec_type: "REPLY";
  id: string;
  text: string;
  parent: PostParentProps;
  action_count: number;
}

export interface ReplyState {
  error?: boolean;
  data?: ReplyResult
  status: 'settled' | 'pending' | 'fulfilled';
}
