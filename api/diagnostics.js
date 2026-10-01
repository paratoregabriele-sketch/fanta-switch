export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  const key=process.env.API_FOOTBALL_KEY;
  if(!key)return res.status(503).json({ok:false,error:"API_FOOTBALL_KEY non configurata"});
  const headers={"x-apisports-key":key};
  const get=async path=>{const r=await fetch("https://v3.football.api-sports.io"+path,{headers});const d=await r.json();return {status:r.status,data:d};};
  try{
    const [seasonsReq,currentReq,italyReq]=await Promise.all([
      get("/leagues/seasons"),
      get("/leagues?country=Italy&current=true"),
      get("/leagues?country=Italy")
    ]);
    const seasons=Array.isArray(seasonsReq.data.response)?seasonsReq.data.response:[];
    const italy=Array.isArray(italyReq.data.response)?italyReq.data.response:[];
    const current=Array.isArray(currentReq.data.response)?currentReq.data.response:[];
    const serieAAll=italy.filter(x=>x.league?.name==="Serie A");
    const serieACurrent=current.filter(x=>x.league?.name==="Serie A");
    const available=[...new Set(serieAAll.flatMap(x=>(x.seasons||[]).map(s=>s.year)))].sort((a,b)=>b-a);
    const target=serieAAll.find(x=>(x.seasons||[]).some(s=>s.year===2026))||serieACurrent.find(x=>(x.seasons||[]).some(s=>s.year===2026));
    return res.status(200).json({
      ok:true,
      targetSeason:2026,
      targetAvailable:!!target,
      serieALeagueId:(target||serieAAll[0]||serieACurrent[0])?.league?.id||null,
      serieAAvailableSeasons:available,
      globalAvailableSeasons:seasons.slice().sort((a,b)=>b-a).slice(0,12),
      currentSerieA:serieACurrent.map(x=>({id:x.league.id,seasons:(x.seasons||[]).map(s=>({year:s.year,current:s.current,coverage:s.coverage}))})),
      providerErrors:{seasons:seasonsReq.data.errors||[],current:currentReq.data.errors||[],italy:italyReq.data.errors||[]}
    });
  }catch(e){return res.status(502).json({ok:false,error:"Diagnostica API-Football non riuscita"});}
}