import { StatusPropsState, UserData, SocketPipe } from './shared';
import { DeepProfileProps, ColleagueAction } from '.';

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

export interface PingUserProps {
  data?: {
    type: 'NEW_CONVERSATION' | DeepProfileProps['status'];
    payload?: { action: ColleagueAction['action']; request_id: string };
  };
  from: UserData;
  message: string;
  pipe: SocketPipe;
}
