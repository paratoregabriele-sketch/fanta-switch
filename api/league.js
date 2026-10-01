export default async function handler(req,res){
 res.setHeader("Access-Control-Allow-Origin","*");
 const key=process.env.API_FOOTBALL_KEY;
 if(!key)return res.status(503).json({ok:false,error:"API_FOOTBALL_KEY non configurata"});
 try{
  const r=await fetch("https://v3.football.api-sports.io/leagues?country=Italy",{headers:{"x-apisports-key":key}});
  const d=await r.json();
  if(!r.ok)return res.status(r.status).json({ok:false,error:d.errors||"Provider error"});
  const serieA=(d.response||[]).find(x=>x.league?.name==="Serie A"&&(x.seasons||[]).some(s=>s.year===2026));
  if(!serieA)return res.status(200).json({ok:false,error:"Serie A 2026/27 non disponibile",availableSeasons:[...new Set((d.response||[]).filter(x=>x.league?.name==="Serie A").flatMap(x=>(x.seasons||[]).map(s=>s.year)))].sort((a,b)=>b-a)});
  const season=serieA.seasons.find(s=>s.year===2026);
  return res.status(200).json({ok:true,season:2026,league:{id:serieA.league.id,name:serieA.league.name,country:serieA.country?.name||"Italy"},current:!!season?.current,coverage:season?.coverage||null});
 }catch(e){return res.status(502).json({ok:false,error:"Ricerca competizione non riuscita"});}
}