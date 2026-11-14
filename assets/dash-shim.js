/*
 * Minimal stand-in for the Claude dashboard runtime, so the page runs as a static site.
 * It loads the JSON files in /data, computes the page's derived values (dash.calc),
 * and runs each drawing (dash.draw) on load and when the window is resized.
 */
(function () {
  const FILES = {
    odds: 'data/odds.json',
    stats: 'data/stats.json',
    poll: 'data/poll.json',
    odds_history: 'data/odds_history.json',
    fan_vote: 'data/fan_vote.json',
    x_posts: 'data/x_posts.json',
  };

  const store = {};
  const calcs = {};
  const draws = [];
  const listeners = [];
  let started = false;

  const loading = () => ({ status: 'loading', data: [], refreshing: false, truncated: false, meta: null });

  function data(id) {
    if (calcs[id]) return calcs[id].result || { status: 'loading', data: null, refreshing: false, truncated: false };
    return store[id] || loading();
  }

  function computeCalcs() {
    Object.values(calcs).forEach((c) => { c.result = null; });
    let pending = Object.keys(calcs);
    for (let pass = 0; pass < 10 && pending.length; pass++) {
      pending = pending.filter((id) => {
        const c = calcs[id];
        const inputs = c.def.inputs.map(data);
        if (inputs.some((d) => d.status === 'error')) { c.result = { status: 'error', data: null }; return false; }
        if (inputs.some((d) => d.status !== 'ok')) return true;
        try {
          c.result = { status: 'ok', data: c.def.fn(...inputs.map((d) => d.data)), truncated: false };
        } catch (e) {
          console.error('calc ' + id, e);
          c.result = { status: 'error', data: null, message: String(e) };
        }
        return false;
      });
    }
  }

  function runDraw(d) {
    document.querySelectorAll('[data-draw="' + d.name + '"]').forEach((el) => {
      try {
        if (typeof d.fn === 'function') d.fn(el);
        else {
          if (!el.__made && d.fn.mount) el.__made = d.fn.mount(el);
          if (d.fn.update) d.fn.update(el, el.__made);
        }
      } catch (e) { console.error('draw ' + d.name, e); }
    });
  }

  function refreshAll() {
    listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    draws.forEach(runDraw);
  }

  async function load() {
    await Promise.all(Object.entries(FILES).map(async ([id, url]) => {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
        const rows = await res.json();
        store[id] = { status: 'ok', data: rows, columns: Object.keys(rows[0] || {}), refreshing: false, truncated: false, meta: null };
      } catch (e) {
        console.error('load ' + id, e);
        store[id] = { status: 'error', data: [], message: String(e) };
      }
    }));
    computeCalcs();
    refreshAll();
  }

  function start() {
    if (started) return;
    started = true;
    refreshAll();
    load();
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(refreshAll, 120); });
  }

  window.dash = {
    data,
    calc(id, def) { calcs[id] = { def, result: null }; },
    loader() {},
    onData(fn) { listeners.push(fn); if (started) { try { fn(); } catch (e) { console.error(e); } } },
    draw(name, fn) {
      if (fn === undefined) { draws.filter((d) => d.name === name).forEach(runDraw); return; }
      draws.push({ name, fn });
    },
    colors: ['#ddf240', '#f4f2e9', '#c7a882', '#9aa36b', '#e07a4f', '#8fb7c9', '#d6a0a8'],
    params: () => ({}),
    setParams() {},
    resetParams() {},
    setLink() {},
    refresh() {},
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else setTimeout(start, 0);
})();
