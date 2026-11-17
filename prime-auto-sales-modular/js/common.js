/* Shared storage and helper functions used by all four modules. */
const Auth = {
  demoUser: 'admin', demoPassword: 'Prime123!',
  users() { try { return JSON.parse(localStorage.getItem('prime_users') || '[]'); } catch { return []; } },
  loggedIn() { return localStorage.getItem('prime_session') === 'active'; },
  login(user, password) {
    const normalized = String(user || '').trim().toLowerCase();
    const demoMatch = normalized === this.demoUser && password === this.demoPassword;
    const account = this.users().find(u => u.username.toLowerCase() === normalized && u.password === password);
    if (demoMatch || account) {
      localStorage.setItem('prime_session', 'active');
      localStorage.setItem('prime_session_user', demoMatch ? this.demoUser : account.username);
      return true;
    }
    return false;
  },
  register({ name, username, email, password }) {
    const users = this.users();
    const cleanUsername = String(username || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) return { ok: false, message: 'That username is already taken.' };
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) return { ok: false, message: 'An account with that email already exists.' };
    users.push({ name: String(name).trim(), username: cleanUsername, email: cleanEmail, password });
    localStorage.setItem('prime_users', JSON.stringify(users));
    return { ok: true };
  },
  logout() {
    localStorage.removeItem('prime_session');
    localStorage.removeItem('prime_session_user');
    location.href = location.pathname.includes('/modules/') ? '../../index.html' : 'index.html';
  }
};
/* SQLite-backed shared storage. Run the project with: npm install && npm start.
   The module files continue using the same Store methods, so their functionality is unchanged. */
const Store = {
  request(method, key, item) {
    const allowed = ['customers', 'vehicles', 'sales', 'enquiries', 'bookings'];
    if (!allowed.includes(key)) throw new Error('Unknown database collection: ' + key);
    const xhr = new XMLHttpRequest();
    xhr.open(method, '/api/' + key + (method === 'DELETE' ? '/' + encodeURIComponent(item) : ''), false);
    if (method === 'POST' || method === 'PUT') xhr.setRequestHeader('Content-Type', 'application/json');
    try {
      xhr.send(method === 'POST' || method === 'PUT' ? JSON.stringify(item) : null);
      if (xhr.status < 200 || xhr.status >= 300) throw new Error(xhr.responseText || 'Database request failed.');
      return xhr.responseText ? JSON.parse(xhr.responseText) : null;
    } catch (error) {
      console.error('Prime Auto Sales database error:', error);
      if (typeof toast === 'function') toast('Database connection failed. Please start the app using npm start.');
      throw error;
    }
  },
  all(key) { return this.request('GET', key) || []; },
  save(key, rows) { return this.request('PUT', key, rows); },
  nextId(key, field) { return this.all(key).reduce((max, row) => Math.max(max, Number(row[field]) || 0), 0) + 1; },
  upsert(key, field, item) { return this.request('POST', key, item); },
  remove(key, field, id) { return this.request('DELETE', key, id); }
};
function esc(value='') { return String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function money(value) { return new Intl.NumberFormat('en-DK',{style:'currency',currency:'DKK',maximumFractionDigits:2}).format(Number(value)||0); }
function dateNow() { return new Date().toISOString().slice(0,16); }
function toast(message) { const old=document.querySelector('.toast'); if(old) old.remove(); const el=document.createElement('div'); el.className='toast'; el.textContent=message; document.body.appendChild(el); setTimeout(()=>el.remove(),2400); }
function setActiveNav() { const path=location.pathname; document.querySelectorAll('.nav-link').forEach(a=>{a.classList.toggle('active',new URL(a.href).pathname===path);}); }
function moduleShell(title, subtitle, content) { document.title=title+' | Prime Auto Sales'; document.getElementById('app').innerHTML=`<header class="topbar"><a class="brand" href="../../index.html"><span class="brand-mark">P</span><span>PRIME <b>AUTO SALES</b></span></a><span class="top-note">Dealership Management System</span></header><div class="shell"><aside class="sidebar"><div class="side-label">WORKSPACE</div><a class="nav-link" href="../../index.html">▦ &nbsp; Dashboard</a><a class="nav-link" href="../customer-management/index.html">♙ &nbsp; Customer Management</a><a class="nav-link" href="../vehicle-management/index.html">▣ &nbsp; Vehicle Management</a><a class="nav-link" href="../sales/index.html">＄ &nbsp; Sales</a><a class="nav-link" href="../customer-service/index.html">☏ &nbsp; Customer Service</a><div class="sidebar-foot">Prime Auto Sales<br><small>Local demo application</small><button class="btn secondary logout-btn" id="logout">Log out</button></div></aside><main class="main-content"><div class="page-heading"><div><p class="eyebrow">PRIME AUTO SALES / MODULE</p><h1>${title}</h1><p class="muted">${subtitle}</p></div><a class="back-link" href="../../index.html">← Dashboard</a></div>${content}</main></div>`; setActiveNav(); document.getElementById('logout')?.addEventListener('click',()=>Auth.logout()); }
function optionsFrom(key, idField, labelFn, selected='') { return Store.all(key).map(r=>`<option value="${esc(r[idField])}" ${String(r[idField])===String(selected)?'selected':''}>${esc(labelFn(r))}</option>`).join(''); }
