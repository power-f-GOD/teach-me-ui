import { FetchState } from '.';
import { UserData } from './shared';

export interface DeepProfileProps {
  status?:
    | 'IS_COLLEAGUE'
    | 'PENDING_REQUEST'
    | 'AWAITING_REQUEST_ACTION'
    | 'NOT_COLLEAGUES';
  mutual_colleagues?: number;
  request_id?: string;
  username?: string;
}

export interface ColleagueAction
  extends FetchState<{
    colleague_id?: string;
    request_id?: string;
    username?: string;
    displayName?: string;
  }> {
  action:
    | 'ADD_COLLEAGUE'
    | 'CANCEL_REQUEST'
    | 'ACCEPT_REQUEST'
    | 'DECLINE_REQUEST'
    | 'UNCOLLEAGUE';
}

export interface RequestState {
  status: 'pending' | 'rejected' | 'resolved';
  error?: boolean;
  message?: string;
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

export interface ColleagueData extends UserData {
  since?: number;
}

export interface EditProfileState {
  err?: boolean;
  status: 'settled' | 'pending' | 'fulfilled';
  data?: Object;
}
