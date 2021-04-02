import { StatusPropsState, SocketPipe, FetchState, UserData } from "./shared";

export interface ChatState {
  pathname?: string;
  queryParam?: string;
  isOpen?: boolean;
  history?: any | History;
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
  colleague: Partial<UserData>;
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
