// Episode metadata stays on the project; shared reference images are never copied.
export function ensureEpisodes(p){
 if(p.product?.kind!=='Video từ văn bản')return false;
 let changed=false;
 if(!p.episodes?.length){p.episodes=[{id:crypto.randomUUID(),title:'Tập 1',idea:'',status:'draft'}];changed=true;}
 for(const e of p.episodes){if(!e.id){e.id=crypto.randomUUID();changed=true;}if(!e.status){e.status='draft';changed=true;}}
 if(!p.episodes.some(e=>e.id===p.activeEpisodeId)){p.activeEpisodeId=p.episodes[0].id;changed=true;}
 for(const s of p.prompts){if(!p.episodes.some(e=>e.id===s.episodeId)){const e=p.episodes.find(e=>s.title?.startsWith(e.title+' · '))||p.episodes[0];s.episodeId=e.id;changed=true;}}
 for(const v of p.videos){if(!p.episodes.some(e=>e.id===v.episodeId)){v.episodeId=p.prompts.find(s=>s.id===v.promptId)?.episodeId||p.episodes[0].id;changed=true;}}
 return changed;
}
export function episodeWorkspace(p){
 if(p.product?.kind!=='Video từ văn bản')return {view:p,commit(){}};
 const e=p.episodes.find(e=>e.id===p.activeEpisodeId),view={...p,episodes:[],episodeId:e.id,notes:[p.notes,e.idea].filter(Boolean).join('\n'),prompts:p.prompts.filter(s=>s.episodeId===e.id),videos:p.videos.filter(v=>v.episodeId===e.id)};
 // Reference prompts and settings remain shared across all episodes.
 Object.defineProperty(view,'referencePrompts',{get:()=>p.referencePrompts,set:v=>p.referencePrompts=v,enumerable:true});
 return {view,commit(){for(const key of ['prompts','videos'])p[key]=[...p[key].filter(s=>s.episodeId!==e.id),...view[key].map(s=>({...s,episodeId:e.id}))];}};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function episodeFolders(p){if(p.product?.kind!=='Video từ văn bản')return '';const e=p.episodes.find(e=>e.id===p.activeEpisodeId);return `<section class="episode-folders" aria-label="Các tập trong dự án"><div class="section-title"><div><strong>${esc(p.name)}</strong><p>Thư viện ảnh chung · Nội dung và video riêng cho từng tập</p></div><button id="episode-complete">${e.status==='done'?'Mở lại tập để chỉnh sửa':'Đánh dấu tập hoàn thành'}</button></div><nav class="episode-folder-list" aria-label="Chọn tập">${p.episodes.map(e=>`<button data-open-episode="${e.id}" aria-pressed="${e.id===p.activeEpisodeId}" class="${e.id===p.activeEpisodeId?'active':''}"><span aria-hidden="true">▱</span><strong>${esc(e.title||'Chưa đặt tên')}</strong><small>${e.status==='done'?'✓ Hoàn thành':'Đang làm'}</small></button>`).join('')}<button id="add-episode">＋ Thêm ${p.seriesKind==='products'?'sản phẩm':'tập'} mới</button></nav><form id="new-episode-form" class="card" hidden><h2>Thêm nội dung tiếp theo</h2><label>Tên tập / sản phẩm<input id="add-episode-title" maxlength="120" required value="${p.seriesKind==='products'?'Sản phẩm':'Tập'} ${p.episodes.length+1}"></label><label>Ý tưởng của tập mới<textarea id="add-episode-idea" rows="4" maxlength="20000" placeholder="Nội dung riêng của tập này…"></textarea></label><p>Dùng thư viện ảnh và cài đặt chung của dự án. Các prompt, video của tập trước được giữ nguyên.</p><div class="actions"><button class="primary" type="submit">Tạo tập và mở prompt</button><button type="button" id="cancel-episode">Hủy</button></div><p id="episode-error" role="alert"></p></form></section>`;}
