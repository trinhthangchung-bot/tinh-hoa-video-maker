import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAiServer} from './ai-server.mjs';
test('AI proxy authenticates, validates and forwards media without exposing Google key',async()=>{
 const calls=[],env={GEMINI_API_KEY:'server-only-key',AI_ACCESS_TOKEN:'a'.repeat(40),APP_ORIGIN:'https://tool.example'};
 const fake=async(url,init)=>{calls.push([String(url),init]);if(String(url).includes(':predictLongRunning'))return Response.json({name:'models/veo-3.1-generate-preview/operations/job1'});if(String(url).endsWith('/operations/job1'))return Response.json({done:false});if(String(url).includes(':generateContent'))return Response.json({candidates:[{content:{parts:[{inlineData:{data:'eA==',mimeType:'image/png'}}]}}]});return Response.json({name:'models/test'});};
 const server=createAiServer(env,fake);await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,headers={Authorization:'Bearer '+env.AI_ACCESS_TOKEN,Origin:env.APP_ORIGIN,'Content-Type':'application/json'};
 try{assert.equal((await fetch(base+'/health')).status,401);assert.equal((await fetch(base+'/health',{headers:{...headers,Origin:'https://evil.example'}})).status,403);assert.equal(calls.length,0);
 const h=await fetch(base+'/health',{headers});assert.equal((await h.json()).ok,true);assert.equal(calls.length,2);
 const bad=await fetch(base+'/video',{method:'POST',headers,body:JSON.stringify({prompt:'hello',images:[],seconds:8,ratio:'16:9'})});assert.equal(bad.status,400);assert.equal(calls.length,2);
 const img=await fetch(base+'/image',{method:'POST',headers,body:JSON.stringify({prompt:'photo'})});assert.equal((await img.json()).data,'eA==');assert.equal(calls.at(-1)[1].headers['x-goog-api-key'],env.GEMINI_API_KEY);
 const v=await fetch(base+'/video',{method:'POST',headers,body:JSON.stringify({prompt:'scene',images:[{data:'eA==',mimeType:'image/png'}],seconds:8,ratio:'16:9'})});const job=await v.json();assert.ok(job.ticket);assert.equal((await (await fetch(base+'/jobs/'+job.ticket,{headers})).json()).done,false);const count=calls.length;assert.equal((await fetch(base+'/jobs/bad.sig',{headers})).status,400);assert.equal(calls.length,count);
 }finally{await new Promise(r=>server.close(r));}
});
