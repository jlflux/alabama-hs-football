import {Game,Standing,Team,TeamSeason} from './types';
export const teams:Team[]=[
{id:'homewood',slug:'homewood',name:'Homewood',mascot:'Patriots',city:'Homewood',classification:'5A',region:4},
{id:'briarwood',slug:'briarwood-christian',name:'Briarwood Christian',mascot:'Lions',city:'Birmingham',classification:'5A',region:4},
{id:'mountain-brook',slug:'mountain-brook',name:'Mountain Brook',mascot:'Spartans',city:'Mountain Brook',classification:'6A',region:3},
{id:'pelham',slug:'pelham',name:'Pelham',mascot:'Panthers',city:'Pelham',classification:'6A',region:3},
{id:'helena',slug:'helena',name:'Helena',mascot:'Huskies',city:'Helena',classification:'6A',region:3},
{id:'calera',slug:'calera',name:'Calera',mascot:'Eagles',city:'Calera',classification:'5A',region:4}
];
export const games:Game[]=[
{id:'g1',season:2026,week:0,date:'2026-08-21',homeTeamId:'homewood',awayTeamId:'briarwood',homeScore:31,awayScore:17,status:'final',regionGame:false},
{id:'g2',season:2026,week:1,date:'2026-08-28',homeTeamId:'mountain-brook',awayTeamId:'homewood',homeScore:24,awayScore:27,status:'final',regionGame:false},
{id:'g3',season:2026,week:2,date:'2026-09-04',homeTeamId:'homewood',awayTeamId:'pelham',homeScore:35,awayScore:21,status:'final',regionGame:false},
{id:'g4',season:2026,week:3,date:'2026-09-11',homeTeamId:'helena',awayTeamId:'homewood',status:'scheduled',regionGame:false},
{id:'g5',season:2026,week:4,date:'2026-09-18',homeTeamId:'homewood',awayTeamId:'calera',status:'scheduled',regionGame:true}
];
export const standings:Standing[]=[
{teamId:'homewood',overallWins:3,overallLosses:0,regionWins:0,regionLosses:0},
{teamId:'briarwood',overallWins:2,overallLosses:1,regionWins:1,regionLosses:0},
{teamId:'calera',overallWins:1,overallLosses:2,regionWins:0,regionLosses:1}
];
export const history:TeamSeason[]=[
{teamId:'homewood',season:2026,classification:'5A',region:4,wins:3,losses:0},
{teamId:'homewood',season:2025,classification:'6A',region:5,wins:8,losses:3,playoffResult:'First Round'},
{teamId:'homewood',season:2024,classification:'6A',region:5,wins:9,losses:3,playoffResult:'Second Round'}
];
export const teamById=(id:string)=>teams.find(t=>t.id===id);
export const teamBySlug=(slug:string)=>teams.find(t=>t.slug===slug);
