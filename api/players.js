export default async function handler(req,res){
 res.setHeader("Access-Control-Allow-Origin","*");
 const key=process.env.API_FOOTBALL_KEY;
 if(!key)return res.status(503).json({ok:false,error:"API_FOOTBALL_KEY non configurata"});
 const page=Math.max(1,parseInt(req.query.page||"1",10));
 try{
  const r=await fetch("https://v3.football.api-sports.io/players?league=135&season=2026&page="+page,{headers:{"x-apisports-key":key}});
  const d=await r.json();
  if(!r.ok||d.errors&&Object.keys(d.errors).length)return res.status(502).json({ok:false,error:d.errors||"Provider error"});
  const rows=(d.response||[]).map(x=>({apiPlayerId:x.player?.id,name:x.player?.name,firstname:x.player?.firstname,lastname:x.player?.lastname,age:x.player?.age,nationality:x.player?.nationality,height:x.player?.height,weight:x.player?.weight,injured:x.player?.injured,photo:x.player?.photo,statistics:(x.statistics||[]).map(s=>({teamId:s.team?.id,team:s.team?.name,position:s.games?.position,appearances:s.games?.appearences,lineups:s.games?.lineups,minutes:s.games?.minutes,rating:s.games?.rating,goals:s.goals?.total,assists:s.goals?.assists,shots:s.shots?.total,shotsOn:s.shots?.on,keyPasses:s.passes?.key,passes:s.passes?.total,passesAccuracy:s.passes?.accuracy,tackles:s.tackles?.total,interceptions:s.tackles?.interceptions,duels:s.duels?.total,duelsWon:s.duels?.won,dribbles:s.dribbles?.attempts,dribblesSuccess:s.dribbles?.success,yellow:s.cards?.yellow,red:s.cards?.red,penaltyWon:s.penalty?.won,penaltyScored:s.penalty?.scored,penaltyMissed:s.penalty?.missed,penaltySaved:s.penalty?.saved}))}));
  return res.status(200).json({ok:true,leagueId:135,season:2026,page:d.paging?.current||page,totalPages:d.paging?.total||1,count:rows.length,players:rows});
 }catch(e){return res.status(502).json({ok:false,error:"Import giocatori non riuscito"});}
}