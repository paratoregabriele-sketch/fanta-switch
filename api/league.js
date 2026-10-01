export default async function handler(req,res){
 res.setHeader("Access-Control-Allow-Origin","*");
 const key=process.env.API_FOOTBALL_KEY;
 if(!key)return res.status(503).json({ok:false,error:"API_FOOTBALL_KEY non configurata"});
 try{
  const r=await fetch("https://v3.football.api-sports.io/leagues?id=135&season=2026",{headers:{"x-apisports-key":key}});
  const d=await r.json(); const item=(d.response||[])[0];
  if(!r.ok||!item)return res.status(502).json({ok:false,error:d.errors||"Serie A 2026 non disponibile"});
  const s=(item.seasons||[]).find(x=>x.year===2026);
  return res.status(200).json({ok:true,season:2026,league:{id:item.league.id,name:item.league.name,country:item.country?.name||"Italy"},current:!!s?.current,coverage:s?.coverage||null});
 }catch(e){return res.status(502).json({ok:false,error:"Ricerca competizione non riuscita"});}
}