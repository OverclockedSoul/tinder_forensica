export type TinderUsageSeries = Record<string, number>;

export interface TinderMessageThread {
  match_id?: string;
  messages?: Array<{
    to?: number;
    from?: string;
    message?: string;
    sent_date?: string;
  }>;
}

export interface TinderExport {
  Usage?: {
    swipes_likes?: TinderUsageSeries;
    swipes_passes?: TinderUsageSeries;
    matches?: TinderUsageSeries;
  };
  Messages?: TinderMessageThread[];
}

export interface TinderMetrics {
  totalSwipes: number;
  leftSwipes: number;
  rightSwipes: number;
  matches: number;
  noMatch: number;
  chats: number;
  noChats: number;
}
