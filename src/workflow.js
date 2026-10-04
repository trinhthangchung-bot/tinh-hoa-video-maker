export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
const encode=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Không đọc được file để sao lưu.'));r.readAsDataURL(blob);});
export async function exportProject(project,assets,media){
  if([...assets,...media].reduce((n,r)=>n+r.blob.size,0)>100*1024*1024)throw Error('Bản sao lưu hỗ trợ tối đa 100 MB ảnh và video. Hãy tải các video lớn riêng trước.');
  const pack=async rows=>Promise.all(rows.map(async({blob,...r})=>({...r,data:await encode(blob)})));
  const data={format:'tinh-hoa-backup',version:1,project,assets:await pack(assets),media:await pack(media)};
  downloadBlob(new Blob([JSON.stringify(data)],{type:'application/json'}),'tinh-hoa-du-an.json');
}
export async function importProject(file){
  if(file.size>145*1024*1024)throw Error('File sao lưu quá lớn (tối đa 145 MB).');
  let data;try{data=JSON.parse(await file.text());}catch{throw Error('File không phải bản sao lưu JSON hợp lệ.');}
  const p=data.project;
  if(data.format!=='tinh-hoa-backup'||data.version!==1||!p||typeof p.name!=='string'||!p.name.trim()||typeof p.notes!=='string'||!Array.isArray(p.prompts)||!Array.isArray(p.videos)||!Array.isArray(data.assets)||!Array.isArray(data.media)||data.assets.length>50||p.prompts.length>1000||p.videos.length>1000)throw Error('Cấu trúc bản sao lưu không hợp lệ.');
  const id=crypto.randomUUID(),map=new Map(),newId=old=>{if(typeof old!=='string'||!old)throw Error('Mã dữ liệu trong bản sao lưu không hợp lệ.');if(!map.has(old))map.set(old,crypto.randomUUID());return map.get(old);};
  const unpack=(rows,kind)=>rows.map(r=>{if(typeof r.data!=='string'||!r.data.startsWith('data:'+kind+'/')||!r.data.includes(';base64,'))throw Error('File ảnh hoặc video trong bản sao lưu không hợp lệ.');const [head,base64]=r.data.split(',');let raw;try{raw=atob(base64);}catch{throw Error('Dữ liệu file bị hỏng.');}const blob=new Blob([Uint8Array.from(raw,c=>c.charCodeAt(0))],{type:head.slice(5,head.indexOf(';'))});return {id:kind==='video'&&r.id===p.id+'-merged'?id+'-merged':newId(r.id),projectId:id,name:String(r.name||'File'),type:['product','character','context'].includes(r.type)?r.type:'product',blob,createdAt:Date.now()};});
  const assets=unpack(data.assets,'image'),media=unpack(data.media,'video');
  const prompts=p.prompts.map((r,i)=>{if(typeof r.text!=='string')throw Error('Câu lệnh trong bản sao lưu bị hỏng.');return {id:newId(r.id),title:String(r.title||`Cảnh ${i+1}`),text:r.text,assetIds:(Array.isArray(r.assetIds)?r.assetIds:r.assetId?[r.assetId]:[]).filter(x=>map.has(x)).map(x=>map.get(x)),status:r.status==='ready'?'ready':'draft',collapsed:!!r.collapsed};});
  const videos=p.videos.map(r=>({id:newId(r.id),promptId:map.get(r.promptId)||'',title:String(r.title||'Video'),fileName:String(r.fileName||''),createdAt:Date.now()}));
  const product={};for(const key of ['name','description','audience','idea','duration','kind','ratio'])product[key]=String(p.product?.[key]||'');
  return {project:{id,name:p.name+' (khôi phục)',notes:p.notes,product,prompts,videos,updatedAt:Date.now()},assets,media};
}
function once(target,event,timeout=20000){return new Promise((resolve,reject)=>{const done=e=>{clearTimeout(t);target.removeEventListener(event,ok);target.removeEventListener('error',fail);e?reject(e):resolve();},ok=()=>done(),fail=()=>done(Error('Không giải mã được clip. Hãy thử file MP4 hoặc WebM khác.')),t=setTimeout(()=>done(Error('Clip không phản hồi. Hãy thử lại.')),timeout);target.addEventListener(event,ok,{once:true});target.addEventListener('error',fail,{once:true});});}
export async function mergeClips(blobs,ratio){
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)throw Error('Trình duyệt chưa hỗ trợ ghép. Hãy mở bằng Chrome hoặc Cốc Cốc mới.');
  const mime=['video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!mime)throw Error('Trình duyệt không hỗ trợ xuất WebM.');
  const dialog=document.createElement('dialog'),text=document.createElement('p'),cancel=document.createElement('button');text.textContent='Đang chuẩn bị ghép…';cancel.textContent='Hủy ghép';dialog.append(text,cancel);document.body.append(dialog);dialog.showModal();
  const audio=new AudioContext(),destination=audio.createMediaStreamDestination(),canvas=document.createElement('canvas');
  [canvas.width,canvas.height]=ratio==='16:9'?[1280,720]:ratio==='1:1'?[720,720]:[720,1280];
  const ctx=canvas.getContext('2d'),stream=canvas.captureStream(30);destination.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
  let cancelled=false,current,recorder,frame,url;const chunks=[];cancel.onclick=()=>{cancelled=true;current?.pause();};dialog.addEventListener('cancel',e=>{e.preventDefault();cancel.click();});
  const onVisibility=()=>{if(document.hidden){cancelled=true;current?.pause();}};document.addEventListener('visibilitychange',onVisibility);
  try{
    await audio.resume();recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:4000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    for(let i=0;i<blobs.length;i++){
      if(cancelled)throw Error('Đã hủy ghép. Các clip gốc vẫn được giữ.');
      current=document.createElement('video');current.playsInline=true;current.preload='auto';url=URL.createObjectURL(blobs[i]);current.src=url;
      await once(current,'loadeddata');if(!Number.isFinite(current.duration)||current.duration<=0)throw Error('Clip không có thời lượng hợp lệ.');
      const source=audio.createMediaElementSource(current);source.connect(destination);
      const paint=()=>{ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);const scale=Math.min(canvas.width/current.videoWidth,canvas.height/current.videoHeight),w=current.videoWidth*scale,h=current.videoHeight*scale;ctx.drawImage(current,(canvas.width-w)/2,(canvas.height-h)/2,w,h);text.textContent=`Đang ghép cảnh ${i+1}/${blobs.length} · ${Math.floor(current.currentTime)}/${Math.ceil(current.duration)} giây. Giữ tab này mở.`;frame=requestAnimationFrame(paint);};
      paint();if(recorder.state==='inactive')recorder.start(1000);else recorder.resume();await current.play();
      await new Promise((resolve,reject)=>{let last=-1,stalled=0;const timer=setInterval(()=>{if(cancelled||current.error||stalled>300){clearInterval(timer);reject(Error(cancelled?'Đã hủy ghép (hoặc tab bị ẩn). Các clip gốc vẫn được giữ.':'Clip bị lỗi khi ghép.'));}else if(current.ended){clearInterval(timer);resolve();}else{stalled=current.currentTime===last?stalled+1:0;last=current.currentTime;}},100);});
      recorder.pause();cancelAnimationFrame(frame);source.disconnect();current.removeAttribute('src');current.load();URL.revokeObjectURL(url);url=null;
    }
    const stopped=once(recorder,'stop');recorder.stop();await stopped;return new Blob(chunks,{type:'video/webm'});
  }finally{cancelAnimationFrame(frame);current?.pause();if(url)URL.revokeObjectURL(url);if(recorder&&recorder.state!=='inactive')recorder.stop();stream.getTracks().forEach(t=>t.stop());await audio.close();document.removeEventListener('visibilitychange',onVisibility);dialog.remove();}
}
