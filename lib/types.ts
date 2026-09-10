export type Classification='7A'|'6A'|'5A'|'4A'|'3A'|'2A'|'1A'|'A'|'AA';
export type Team={id:string;slug:string;name:string;mascot:string;city:string;classification:Classification;region:number;colors?:string[]};
export type Game={id:string;season:number;week:number;date:string;homeTeamId:string;awayTeamId:string;homeScore?:number;awayScore?:number;status:'scheduled'|'final';regionGame:boolean;playoffRound?:string};
export type Standing={teamId:string;overallWins:number;overallLosses:number;regionWins:number;regionLosses:number};
export type TeamSeason={teamId:string;season:number;classification:Classification;region:number;wins:number;losses:number;playoffResult?:string};
