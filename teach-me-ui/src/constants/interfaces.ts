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
  displayName: string;
  username: string;
  upvotes: number;
  postBody: string;
  downvotes: number;
  noOfComments: number;
  userAvatar: string;
  reaction: 'upvote' | 'downvote' | 'neutral';
}

export interface TopicPropsState {
  topic: string;
  numberOfDiscussions: number;
}

export interface ReactButtonPropsState {
  reactions: number;
  type: 'upvote' | 'downvote';
  reacted: 'upvote' | 'downvote' | 'neutral';
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
  [key: string]: any;
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
export interface Message {
  type: 'incoming' | 'outgoing';
  text: string;
  timestamp: string | number;
  senderId?: string | number;
  id?: string | number;
}

export interface Chat {
  anchor: AnchorInfo;
  // displayName: string;
  // type?: 'conversation' | 'classroom';
  // avatar: string;
  // id: string;
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
  messages?: Message[];
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
  firstname: string;
  lastname: string;
  id: string;
  username: string;
  institution: string;
  department: string;
  level: string;
}

export interface NotificationState extends StatusPropsState {
  data?: any[]
  [key: string]: any
}

export interface NotificationData {
  _id: string,
  data: any,
  date: any,
  message: string,
  type: string,
  [key: string]: any
}
          