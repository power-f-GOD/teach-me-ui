import { UserData, SocketPipe, SocketStruct, StatusPropsState } from "./shared";
import { ColleagueData } from "./profile";

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
  pipe?: SocketPipe;
  parent_id?: string;
  reaction: Reaction;
  colleague_replies: Partial<PostStateProps>[];
  colleague_reposts: Partial<PostStateProps>[];
  sender: UserData;
  parent?: { id: string; reply_count: number };
  text: string;
  upvotes: any[];
  sec_type?: 'REPOST' | 'REPLY';
  type?: 'post' | 'reply';
  numRepliesToShow?: number;
}

export interface SendReplyProps extends SocketStruct {
  post_id: string;
  reaction?: Reaction;
  interaction?: 'SEEN' | 'ENGAGED';
  hashtags?: string[];
  mentions?: string[];
  text?: string;
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

export interface HashTag {
  tag: string;
  count: number;
}

export interface MakePostState {
  status: 'settled' | 'pending' | 'fulfilled';
}
