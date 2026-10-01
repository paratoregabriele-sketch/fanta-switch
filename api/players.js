export default async function handler(req,res){
 res.setHeader("Access-Control-Allow-Origin","*");
 const key=process.env.API_FOOTBALL_KEY;
 if(!key)return res.status(503).json({ok:false,error:"API_FOOTBALL_KEY non configurata"});
 const start=Math.max(1,parseInt(req.query.start||req.query.page||"1",10));
 const pages=Math.min(4,Math.max(1,parseInt(req.query.pages||"1",10)));
 const season=2024,league=135;
 try{
  let players=[],totalPages=null,calls=0,remaining=null;
  for(let page=start;page<start+pages;page++){
   if(totalPages!==null&&page>totalPages)break;
   const r=await fetch("https://v3.football.api-sports.io/players?league="+league+"&season="+season+"&page="+page,{headers:{"x-apisports-key":key}});
   remaining=r.headers.get("x-ratelimit-requests-remaining");
   const d=await r.json();calls++;
   if(!r.ok||d.errors&&Object.keys(d.errors).length)return res.status(502).json({ok:false,page,error:d.errors||"Provider error"});
   totalPages=d.paging?.total||1;
   players.push(...(d.response||[]).map(x=>({apiPlayerId:x.player?.id,name:x.player?.name,firstname:x.player?.firstname,lastname:x.player?.lastname,injured:x.player?.injured,photo:x.player?.photo,statistics:(x.statistics||[]).filter(s=>s.league?.id===league).map(s=>({teamId:s.team?.id,team:s.team?.name,position:s.games?.position,appearances:s.games?.appearences,lineups:s.games?.lineups,minutes:s.games?.minutes,rating:s.games?.rating,goals:s.goals?.total,assists:s.goals?.assists,shots:s.shots?.total,shotsOn:s.shots?.on,keyPasses:s.passes?.key,tackles:s.tackles?.total,interceptions:s.tackles?.interceptions,duels:s.duels?.total,duelsWon:s.duels?.won,dribbles:s.dribbles?.attempts,dribblesSuccess:s.dribbles?.success,yellow:s.cards?.yellow,red:s.cards?.red,penaltyScored:s.penalty?.scored,penaltyMissed:s.penalty?.missed,penaltySaved:s.penalty?.saved}))})));
  }
  return res.status(200).json({ok:true,mode:"development-test-only",leagueId:league,season,startPage:start,pagesFetched:calls,totalPages,count:players.length,nextPage:(start+calls<=totalPages)?start+calls:null,requestsRemaining:remaining,warning:"Dataset 2024 solo per sviluppo; non usare per valutazioni 2026/27.",players});
 }catch(e){return res.status(502).json({ok:false,error:"Import batch non riuscito"});}
}