function norm(s=""){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");}
function tokens(s=""){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(Boolean);}
function scoreName(a,b){
 const A=norm(a),B=norm(b); if(!A||!B)return 0;if(A===B)return 100;
 const ta=tokens(a),tb=tokens(b);const common=ta.filter(x=>tb.includes(x));
 if(common.length)return Math.min(95,65+common.length*10);
 if(A.includes(B)||B.includes(A))return 72;return 0;
}
export default async function handler(req,res){
 res.setHeader("Access-Control-Allow-Origin","*");
 if(req.method!=="POST")return res.status(405).json({ok:false,error:"Usa POST"});
 const {listone=[],apiPlayers=[]}=req.body||{};
 if(!Array.isArray(listone)||!Array.isArray(apiPlayers))return res.status(400).json({ok:false,error:"listone e apiPlayers devono essere array"});
 const used=new Set(),matches=[],unmatched=[];
 for(const f of listone){
  let best=null,bestScore=0;
  for(const a of apiPlayers){if(used.has(a.apiPlayerId))continue;let s=scoreName(f.Nome||f.nome,a.name||"");
   const fs=norm(f.Squadra||f.squadra),as=norm(a.statistics?.[0]?.team||a.team||"");if(fs&&as&&fs===as)s+=8;
   if(s>bestScore){bestScore=s;best=a;}}
  if(best&&bestScore>=72){used.add(best.apiPlayerId);matches.push({fantacalcioId:f.Id||f.id||null,nomeFantacalcio:f.Nome||f.nome,apiPlayerId:best.apiPlayerId,nomeApi:best.name,score:Math.min(100,bestScore),status:bestScore>=95?"AUTO_OK":"REVIEW"});}
  else unmatched.push({fantacalcioId:f.Id||f.id||null,nome:f.Nome||f.nome});
 }
 return res.status(200).json({ok:true,matches:matches.length,unmatched:unmatched.length,autoOk:matches.filter(x=>x.status==="AUTO_OK").length,review:matches.filter(x=>x.status==="REVIEW").length,results:matches,unmatchedPlayers:unmatched});
}