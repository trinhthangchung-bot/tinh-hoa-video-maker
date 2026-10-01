import './style.css';
const KEY = 'tinh-hoa.projects.v1';
let projects = [], active = null, timer, dirty = false, fault = '';
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.some(p => !p || typeof p.id !== 'string' || typeof p.name !== 'string' || typeof p.notes !== 'string' || !Number.isFinite(p.updatedAt))) throw Error();
    projects = data;
  }
} catch { fault = 'Không thể đọc dữ liệu đã lưu. Dữ liệu gốc được giữ nguyên. Hãy kiểm tra bộ nhớ trình duyệt trước khi tiếp tục.'; }
const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = n => new Intl.DateTimeFormat('vi-VN', {dateStyle:'short', timeStyle:'short'}).format(n);
function persist(next) {
  if (fault) return false;
  try { localStorage.setItem(KEY, JSON.stringify(next)); projects = next; return true; }
  catch { status('Không lưu được: bộ nhớ trình duyệt không khả dụng hoặc đã đầy. Hãy giữ trang mở và thử lưu lại.', true); return false; }
}
function status(message, error = false) {
  const el = document.querySelector('#status');
  if (el) { el.textContent = message; el.classList.toggle('error', error); }
}
function save(manual = false) {
  clearTimeout(timer);
  if (!active) return true;
  if (!dirty) { if (manual) status('Đã lưu · ' + date(active.updatedAt)); return true; }
  const next = {...active, updatedAt: Date.now()};
  if (!persist(projects.map(p => p.id === next.id ? next : p))) return false;
  active = next; dirty = false; status('Đã lưu · ' + date(next.updatedAt)); renderList(); return true;
}
function renderList() {
  const list = document.querySelector('#projects');
  list.innerHTML = projects.length ? [...projects].sort((a,b) => b.updatedAt-a.updatedAt).map(p => `<li class="${active?.id === p.id ? 'selected' : ''}"><button class="project" data-open="${esc(p.id)}"><strong>${esc(p.name)}</strong><span>${date(p.updatedAt)}</span></button><button class="delete" data-delete="${esc(p.id)}" aria-label="Xóa dự án ${esc(p.name)}" title="Xóa dự án">×</button></li>`).join('') : '<li class="empty-list">Chưa có dự án nào.<br>Tạo dự án đầu tiên của bạn.</li>';
  document.querySelector('#count').textContent = projects.length;
}
function render() {
  document.querySelector('#app').innerHTML = `<header><div class="brand"><span class="logo">TH</span><div><strong>Tinh Hoa</strong><span>VIDEO MAKER</span></div></div><span class="badge">Không gian sáng tạo</span></header><div class="layout"><aside><div class="aside-title"><h2>Dự án gần đây</h2><span id="count"></span></div><button id="new" class="primary" ${fault ? 'disabled' : ''}>＋ Tạo dự án</button><ul id="projects"></ul><p class="storage">Dữ liệu lưu trên trình duyệt này.<br>Không sử dụng dịch vụ hoặc tín dụng AI.</p></aside><main>${fault ? `<div class="notice error" role="alert">${esc(fault)}</div>` : ''}${active ? `<div class="editor-top"><div><p class="eyebrow">KHÔNG GIAN DỰ ÁN</p><h1>Ý tưởng của bạn, được lưu giữ.</h1></div><div class="actions"><button id="close">Đóng dự án</button><button id="save" class="primary">Lưu dự án</button></div></div><div id="status" role="status" aria-live="polite">Đã lưu · ${date(active.updatedAt)}</div><section class="card"><label for="name">Tên dự án</label><input id="name" maxlength="120" value="${esc(active.name)}" autocomplete="off"><p class="hint">Đổi tên ngay tại đây. Thay đổi được tự động lưu.</p><label for="notes">Ý tưởng & kịch bản</label><textarea id="notes" placeholder="Ghi lại ý tưởng, nội dung hoặc kịch bản video…">${esc(active.notes)}</textarea><div class="card-footer"><span>Tự động lưu sau mỗi thay đổi</span><span id="chars">${active.notes.length} ký tự</span></div></section><p class="footnote">Phiên bản nền tảng · Chuẩn bị ý tưởng và quản lý dự án của bạn.</p>` : `<section class="welcome"><span class="welcome-icon">✦</span><p class="eyebrow">TINH HOA VIDEO MAKER</p><h1>Mỗi video bắt đầu<br>từ một ý tưởng.</h1><p>Tạo một không gian cho ý tưởng và kịch bản của bạn.<br>Mọi thay đổi được lưu tự động trên trình duyệt.</p><button id="first" class="primary" ${fault ? 'disabled' : ''}>＋ Tạo dự án mới</button><div class="features"><span>01 · Tạo dự án</span><span>02 · Lưu ý tưởng</span><span>03 · Tiếp tục bất cứ lúc nào</span></div></section>`}</main></div><dialog id="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description"><form method="dialog"><h2 id="dialog-title"></h2><p id="dialog-description"></p><label id="dialog-label" for="project-name">Tên dự án</label><input id="project-name" maxlength="120" required placeholder="Ví dụ: Chuyện một buổi sáng"><p id="dialog-error" role="alert"></p><div class="actions"><button value="cancel" formnovalidate>Hủy</button><button id="confirm" class="primary" value="confirm">Tạo dự án</button></div></form></dialog>`;
  renderList();
  document.querySelector('#new').onclick = create;
  document.querySelector('#first')?.addEventListener('click', create);
  document.querySelector('#projects').onclick = e => {
    const open = e.target.closest('[data-open]'); const del = e.target.closest('[data-delete]');
    if (open && save()) { active = {...projects.find(p => p.id === open.dataset.open)}; render(); }
    if (del) remove(del.dataset.delete);
  };
  if (active) {
    document.querySelector('#save').onclick = () => save(true);
    document.querySelector('#close').onclick = () => { if (save()) { active = null; render(); } };
    document.querySelector('#name').oninput = e => { active.name = e.target.value; changed(); };
    document.querySelector('#name').onblur = e => { active.name = e.target.value.trim() || 'Dự án chưa đặt tên'; e.target.value = active.name; dirty = true; save(); };
    document.querySelector('#notes').oninput = e => { active.notes = e.target.value; document.querySelector('#chars').textContent = active.notes.length + ' ký tự'; changed(); };
  }
}
function changed() { dirty = true; status('Đang chờ lưu…'); clearTimeout(timer); timer = setTimeout(() => save(), 400); }
function create() {
  if (fault || !save()) return;
  const dialog = document.querySelector('#dialog'), input = document.querySelector('#project-name');
  document.querySelector('#dialog-title').textContent = 'Tạo dự án mới';
  document.querySelector('#dialog-description').textContent = 'Đặt tên để bắt đầu lưu ý tưởng của bạn.';
  input.hidden = false; input.required = true; input.value = '';
  document.querySelector('#dialog-label').hidden = false;
  document.querySelector('#confirm').textContent = 'Tạo dự án';
  document.querySelector('#dialog-error').textContent = '';
  dialog.querySelector('form').onsubmit = e => {
    if (e.submitter?.value !== 'confirm') return;
    e.preventDefault();
    const name = input.value.trim();
    if (!name) { document.querySelector('#dialog-error').textContent = 'Vui lòng nhập tên dự án.'; return; }
    const p = {id: crypto.randomUUID(), name, notes:'', updatedAt:Date.now()};
    if (persist([...projects,p])) { active = {...p}; dirty = false; dialog.close(); render(); }
    else document.querySelector('#dialog-error').textContent = 'Không thể tạo dự án vì dữ liệu chưa lưu được.';
  };
  dialog.showModal(); input.focus();
}
function remove(id) {
  if (fault || !save()) return;
  const p = projects.find(p => p.id === id), dialog = document.querySelector('#dialog');
  document.querySelector('#dialog-title').textContent = 'Xóa dự án?';
  document.querySelector('#dialog-description').textContent = `Dự án “${p.name}” sẽ bị xóa khỏi trình duyệt. Thao tác này không thể hoàn tác.`;
  document.querySelector('#project-name').hidden = true; document.querySelector('#project-name').required = false;
  document.querySelector('#dialog-label').hidden = true;
  document.querySelector('#dialog-error').textContent = '';
  document.querySelector('#confirm').textContent = 'Xóa dự án';
  dialog.querySelector('form').onsubmit = e => {
    if (e.submitter?.value !== 'confirm') return;
    e.preventDefault();
    if (persist(projects.filter(p => p.id !== id))) { if (active?.id === id) active = null; dialog.close(); render(); }
    else document.querySelector('#dialog-error').textContent = 'Không thể lưu thay đổi. Dự án chưa bị xóa.';
  };
  dialog.showModal();
}
window.addEventListener('pagehide', () => save());
window.addEventListener('beforeunload', e => { if (!save()) { e.preventDefault(); e.returnValue = ''; } });
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
window.addEventListener('storage', e => { if (e.key === KEY || e.key === null) { fault = 'Dữ liệu đã thay đổi ở tab khác. Hãy tải lại trang để sử dụng dữ liệu mới nhất.'; clearTimeout(timer); status(fault, true); document.querySelector('#new').disabled = true; } });
render();
