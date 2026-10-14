(function (g) {
  'use strict';
  const groups = [
    ['Chưa chi BT lần đầu', 'Bồi thường lần đầu'],
    ['Chưa chi BT BS', 'Bồi thường bổ sung, NVTC'],
    ['Chưa chi BGMB', 'Thưởng bàn giao mặt bằng'],
    ['Chưa chi Tạm cư', 'Tạm cư'],
  ];
  const norm = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/\s+/g, ' ').trim();
  function parseSheets(wb) {
    return groups.map(([sheet, title]) => {
      const name = wb.SheetNames.find(n => norm(n) === norm(sheet));
      if (!name) return {sheet, title, headers: [], records: [], missing: true};
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], {header: 1, defval: null, raw: true});
      const top = rows.findIndex(r => r.some(v => norm(v) === 'stt') && r.some(v => norm(v) === 'ho ten'));
      if (top < 0) throw Error('Không tìm thấy tiêu đề STT / Họ tên trong sheet ' + name);
      const headers = rows[top].map(v => String(v ?? '').trim());
      const stt = headers.findIndex(v => norm(v) === 'stt');
      const person = headers.findIndex(v => norm(v) === 'ho ten');
      const remaining = headers.findIndex(v => norm(v).startsWith('chua chi'));
      if (remaining < 0) throw Error('Thiếu cột Chưa chi trong sheet ' + name);
      const records = rows.slice(top + 1).filter(r => r[stt] != null && String(r[stt]).trim() !== '' && Number.isFinite(Number(r[stt])) && String(r[person] ?? '').trim());
      for (const r of records) for (let c = 0; c < headers.length; c++) {
        if (/^(du toan|da chi|chua chi)/.test(norm(headers[c]))) {
          const v = r[c];
          if (v != null && v !== '' && (typeof v !== 'number' || !Number.isFinite(v))) throw Error('Ô tiền không phải số: sheet ' + name + ', STT ' + r[stt] + ', cột ' + headers[c] + '. Hãy kiểm tra Excel.');
        }
      }
      return {sheet: name, title, headers, records, remaining, missing: false};
    });
  }
  g.RXTUnpaid = {parseSheets};
  if (typeof document === 'undefined') return;
  const el = id => document.getElementById(id);
  let lists = [], active = 0, source = '';
  function dateText(v) {
    if (v instanceof Date) return v.toLocaleDateString('vi-VN');
    if (typeof v === 'number') { const d = XLSX.SSF.parse_date_code(v); return d ? `${d.d}/${d.m}/${d.y}` : String(v); }
    return String(v ?? '');
  }
  function display(v, header) {
    if (norm(header) === 'phuong' && norm(v) === 'bt') return 'Bình Thạnh';
    if (norm(header).includes('ngay')) return dateText(v) || '—';
    if (/^(du toan|da chi|chua chi)/.test(norm(header))) return v == null || v === '' ? '—' : v.toLocaleString('vi-VN');
    return v == null || v === '' ? '—' : String(v);
  }
  function render() {
    el('tabs').replaceChildren();
    lists.forEach((list, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.role = 'tab'; b.setAttribute('aria-selected', String(i === active)); b.textContent = `${list.title} (${list.records.length})`; b.onclick = () => {active = i; el('search').value = ''; render();}; el('tabs').append(b);
    });
    const list = lists[active]; if (!list) return;
    const q = norm(el('search').value);
    const filtered = list.records.filter(r => norm(r.map((v,c) => display(v,list.headers[c] || '')).join(' ')).includes(q));
    const total = filtered.reduce((s,r) => s + (r[list.remaining] ?? 0), 0);
    el('source').textContent = source + ' · Sheet: ' + list.sheet;
    el('stats').textContent = list.missing ? 'File này không có sheet ' + list.sheet + '. Hãy nhập báo cáo có đủ 4 sheet chưa chi.' : `${filtered.length} / ${list.records.length} dòng · Tổng chưa chi trong kết quả: ${total.toLocaleString('vi-VN')} đồng`;
    el('head').replaceChildren(); el('body').replaceChildren();
    const tr = document.createElement('tr'); list.headers.forEach(h => {const th = document.createElement('th'); th.textContent = h; tr.append(th);}); el('head').append(tr);
    filtered.forEach(r => {const tr = document.createElement('tr'); list.headers.forEach((h,c) => {const td = document.createElement('td'); td.textContent = display(r[c],h); if (/^(du toan|da chi|chua chi)/.test(norm(h))) td.className='num'; tr.append(td);}); el('body').append(tr);});
  }
  function read(buffer, name) {
    const wb = XLSX.read(buffer, {type:'array',cellDates:true});
    const parsed = parseSheets(wb);
    let date = '';
    const main = wb.SheetNames.find(n => norm(n) === norm('Tổng hơp RXT - Bình Thạnh'));
    if (main) {const rows = XLSX.utils.sheet_to_json(wb.Sheets[main],{header:1,defval:null});for(const r of rows.slice(0,10)){const c=r.findIndex(v=>norm(v).includes('thoi diem bao cao'));if(c>=0){date=dateText(r.slice(c+1).find(v=>v!=null&&v!==''));break;}}}
    return {parsed, source: 'Nguồn: ' + name + (date ? ' · Thời điểm báo cáo: ' + date : '')};
  }
  function commit(result) {lists=result.parsed;source=result.source;active=0;el('error').hidden=true;render();}
  function error(e) {el('error').textContent=e.message;el('error').hidden=false;}
  el('search').oninput=render;
  el('print').onclick=()=>window.print();
  el('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const buffer=await f.arrayBuffer();const result=read(buffer,f.name);if(result.parsed.every(l=>l.missing))throw Error('File không có 4 sheet chưa chi. Dữ liệu hiện tại được giữ nguyên.');await rxtStore('set',{buffer,source:f.name});commit(result);}catch(err){error(err);}finally{e.target.value='';}};
  (async()=>{try{if(!g.XLSX)throw Error('Không tải được assets/vendor/xlsx.full.min.js.');const saved=await rxtStore('get');if(saved){commit(read(saved.buffer,saved.source));return;}const res=await fetch('../data/RXT.xlsx');if(!res.ok)throw Error('Chưa có dữ liệu. Bấm Nhập Excel mới và chọn báo cáo 14-10.');commit(read(await res.arrayBuffer(),'RXT.xlsx'));}catch(e){error(e);}})();
})(globalThis);
