import {db,member,send,validate} from './_shared.js';
export default async function handler(req,res){try{
 if(req.method==='GET'){const items=await db('?select=*&order=created_at.asc&limit=1000');return send(res,200,{items});}
 if(!member(req))return send(res,401,{error:'Solo Juanma puede administrar La Cinemateca. Código incorrecto'});
 if(req.method==='POST'){const item=validate(req.body||{});const items=await db('',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({...item,created_by:member(req)})});return send(res,201,{item:items[0]});}
 const id=String(req.query.id||'');if(!/^[0-9a-f-]{36}$/i.test(id))return send(res,400,{error:'ID inválido'});
 if(req.method==='PATCH'){const item=validate(req.body||{});const items=await db('?id=eq.'+id,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...item,updated_at:new Date().toISOString()})});return send(res,200,{item:items[0]});}
 if(req.method==='DELETE'){await db('?id=eq.'+id,{method:'DELETE'});return send(res,200,{ok:true});}
 return send(res,405,{error:'Método no permitido'});
}catch(e){return send(res,500,{error:e.message});}}
