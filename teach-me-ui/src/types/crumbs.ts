import { StatusPropsState } from "./shared";

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
