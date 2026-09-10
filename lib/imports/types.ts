export type ParsedScoreRow = {
  sourceLine: string;
  date: string;
  time?: string;
  homeSourceName: string;
  homeDisplayName: string;
  homeClass?: string;
  homeRegion?: string;
  homeScore?: number;
  visitorSourceName: string;
  visitorDisplayName: string;
  visitorClass?: string;
  visitorRegion?: string;
  visitorScore?: number;
  status: "final" | "scheduled" | "suspended" | "review";
  note?: string;
};
