/* ============================================================
   TimeCapsule · 共享数据层
   种子数据 · 增删改查 · 工具函数 · 天气/情绪定义
   ============================================================ */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'timecapsule-entries';
  var SEED_FLAG = 'timecapsule-seeded';
  var WEEK = ['日', '一', '二', '三', '四', '五', '六'];

  /* --- 情绪定义 --- */
  var MOODS = [
    { key: 'happy',    label: '开心', emoji: '😊', color: '#F0C674' },
    { key: 'calm',     label: '平静', emoji: '😌', color: '#A8C5A0' },
    { key: 'moved',    label: '感动', emoji: '🥹', color: '#E8A0B8' },
    { key: 'tired',    label: '疲惫', emoji: '😴', color: '#B0A8C0' },
    { key: 'anxious',  label: '焦虑', emoji: '😰', color: '#D4B896' },
    { key: 'sad',      label: '难过', emoji: '😢', color: '#9DBBD4' },
    { key: 'angry',    label: '愤怒', emoji: '😤', color: '#E0A0A0' },
    { key: 'grateful', label: '感恩', emoji: '🙏', color: '#C4B5D9' }
  ];

  var MOOD_MAP = {};
  MOODS.forEach(function (m) { MOOD_MAP[m.key] = m; });

  /* --- 天气图标 SVG（内联，零外网依赖） --- */
  function weatherIcon(name) {
    var svg = function (inner) {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
    };
    var map = {
      '晴': svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
      '多云': svg('<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>'),
      '阴': svg('<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>'),
      '小雨': svg('<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>'),
      '阵雨': svg('<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>'),
      '雷阵雨': svg('<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/>'),
      '雪': svg('<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/>'),
      '大风': svg('<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>'),
      '雾': svg('<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/>')
    };
    return map[name] || map['阴'];
  }

  /* --- 种子数据（首次进入时写入 localStorage） --- */
  function getSeedData() {
    return [
      {
        dateISO: '2026-08-08T19:30',
        weather: '晴',
        mood: 'happy',
        title: '窗边的一杯热咖啡',
        body: '<p>清晨六点半，窗外的梧桐叶还挂着露水。冲了一杯手冲咖啡，香气慢慢散开，忽然觉得日子也可以慢一点。</p>',
        images: [{ src: '../assets/diary-coffee.jpg', caption: '今天的第二杯手冲', rotate: 0 }],
        audios: []
      },
      {
        dateISO: '2026-08-07T18:15',
        weather: '多云',
        mood: 'calm',
        title: '傍晚在公园散步',
        body: '<p>下班后绕去公园走了两圈，晚风很轻。看见一个小男孩追着泡泡跑，笑得特别大声，原来快乐可以这么简单。</p>',
        images: [{ src: '../assets/diary-park.jpg', caption: '傍晚的公园', rotate: 0 }],
        audios: []
      },
      {
        dateISO: '2026-08-05T22:02',
        weather: '阴',
        mood: 'moved',
        title: '重读《小王子》',
        body: '<p>睡前又翻了几页《小王子》，狐狸说的话依旧让人心里一暖。长大以后，才慢慢听懂这些温柔的道理。</p>',
        images: [{ src: '../assets/diary-book.jpg', caption: '枕边的书', rotate: 0 }],
        audios: []
      },
      {
        dateISO: '2026-08-03T21:30',
        weather: '阵雨',
        mood: 'grateful',
        title: '给妈妈打了个电话',
        body: '<p>周末给妈妈打了四十分钟的电话，聊家常也聊最近的烦恼。挂了电话之后，心里踏实了很多，这就是家人的力量吧。</p>',
        images: [],
        audios: []
      },
      {
        dateISO: '2026-08-01T14:20',
        weather: '晴',
        mood: 'tired',
        title: '忙碌的一周终于结束了',
        body: '<p>连续加班五天，今天终于可以喘口气。下午窝在沙发上什么都不想做，就这样放空了一下午，也算是一种休息。</p>',
        images: [],
        audios: []
      },
      {
        dateISO: '2026-07-28T08:00',
        weather: '晴',
        mood: 'happy',
        title: '清晨跑步打卡',
        body: '<p>早起跑了五公里，公园里的空气特别清新。运动后的多巴胺让人心情愉悦，准备把这习惯坚持下去。</p>',
        images: [],
        audios: []
      }
    ];
  }

  /* --- 首次进入：写入种子数据 --- */
  function seedIfNeeded() {
    try {
      if (!localStorage.getItem(SEED_FLAG)) {
        var existing = readEntries();
        if (existing.length === 0) {
          writeEntries(getSeedData());
        }
        localStorage.setItem(SEED_FLAG, '1');
      }
    } catch (err) { /* ignore */ }
  }

  /* --- 读写 localStorage --- */
  function readEntries() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (err) { return []; }
  }

  function writeEntries(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  /* --- 增删改 --- */
  function saveEntry(entry) {
    var list = readEntries();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].dateISO === entry.dateISO) { idx = i; break; }
    }
    if (idx >= 0) { list[idx] = entry; } else { list.unshift(entry); }
    writeEntries(list);
  }

  function deleteEntry(dateISO) {
    var kept = readEntries().filter(function (it) { return it && it.dateISO !== dateISO; });
    writeEntries(kept);
  }

  function findEntry(dateISO) {
    var list = readEntries();
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].dateISO === dateISO) { return list[i]; }
    }
    return null;
  }

  /* --- 工具函数 --- */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html || '';
    return (div.textContent || '').trim();
  }

  function escapeAttr(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function makeNowISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function makeLabel(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) { return ''; }
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return m[1] + '年' + Number(m[2]) + '月' + Number(m[3]) + '日 星期' + WEEK[d.getDay()];
  }

  function makeGroupTitle(dateStr) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr || '');
    if (!m) { return dateStr || ''; }
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return m[1] + '年' + Number(m[2]) + '月' + Number(m[3]) + '日 · 星期' + WEEK[d.getDay()];
  }

  /* --- 底部导航栏 HTML --- */
  function tabBarHTML(active) {
    var items = [
      { key: 'list', label: '日记', href: 'diary-list.html',
        icon: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>' },
      { key: 'history', label: '历史', href: 'diary-history.html',
        icon: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/>' },
      { key: 'analytics', label: '分析', href: 'diary-analytics.html',
        icon: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>' }
    ];
    var html = '<nav class="tab-bar"><div class="tab-bar-inner">';
    items.forEach(function (it) {
      html += '<a class="tab-item' + (it.key === active ? ' is-active' : '') + '" href="' + it.href + '">';
      html += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + it.icon + '</svg>';
      html += '<span>' + it.label + '</span></a>';
    });
    html += '</div></nav>';
    return html;
  }

  /* --- Toast 工具 --- */
  var toastEl = null;
  var toastTimer = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2200);
  }

  /* --- 词频提取（用于词云） --- */
  function extractKeywords(entries) {
    var freq = {};
    var stopWords = {
      '的': 1, '了': 1, '是': 1, '在': 1, '我': 1, '有': 1, '和': 1, '就': 1,
      '不': 1, '人': 1, '都': 1, '一': 1, '一个': 1, '上': 1, '也': 1, '很': 1,
      '到': 1, '说': 1, '要': 1, '去': 1, '你': 1, '会': 1, '着': 1, '没有': 1,
      '看': 1, '好': 1, '自己': 1, '这': 1, '那': 1, '里面': 1, '什么': 1,
      '可以': 1, '还': 1, '把': 1, '给': 1, '让': 1, '从': 1, '被': 1,
      '今天': 1, '昨天': 1, '明天': 1, '然后': 1, '因为': 1, '所以': 1,
      '但': 1, '但是': 1, '如果': 1, '虽然': 1, '不过': 1, '一下': 1,
      '一些': 1, '这个': 1, '那个': 1, '起来': 1, '下来': 1, '上来': 1,
      '过': 1, '后': 1, '前': 1, '里': 1, '下': 1, '中': 1, '为': 1,
      '以': 1, '及': 1, '或': 1, '与': 1, '之': 1, '其': 1, '此': 1,
      '才': 1, '再': 1, '只': 1, '又': 1, '更': 1, '最': 1, '太': 1,
      '多': 1, '少': 1, '大': 1, '小': 1, '个': 1, '们': 1, '地': 1
    };
    entries.forEach(function (e) {
      var text = plainText(e.body || '') + ' ' + (e.title || '');
      /* 简单分词：提取 2-4 字的连续中文片段 */
      var segments = text.replace(/[^\u4e00-\u9fa5A-Za-z]/g, ' ').split(/\s+/);
      segments.forEach(function (seg) {
        if (seg.length >= 2 && seg.length <= 4 && !stopWords[seg]) {
          freq[seg] = (freq[seg] || 0) + 1;
        }
      });
    });
    var arr = [];
    for (var k in freq) { if (freq[k] >= 1) { arr.push({ word: k, count: freq[k] }); } }
    arr.sort(function (a, b) { return b.count - a.count; });
    return arr.slice(0, 50);
  }

  /* --- 主题切换（深色/浅色） --- */
  var THEME_KEY = 'timecapsule-theme';
  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === 'dark') { root.classList.add('dark'); } else { root.classList.remove('dark'); }
    try { localStorage.setItem(THEME_KEY, theme); } catch (err) { /* ignore */ }
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (err) { /* ignore */ }
    /* 未设置时跟随系统 */
    var theme = saved ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(theme);
    return theme;
  }
  function toggleTheme() {
    var isDark = document.documentElement.classList.contains('dark');
    var next = isDark ? 'light' : 'dark';
    applyTheme(next);
    return next;
  }

  /* --- 数据备份 / 恢复 --- */
  var BACKUP_META_KEY = 'timecapsule-backup-meta';

  function exportBackup() {
    var payload = {
      app: 'TimeCapsule',
      version: 2,
      exportedAt: new Date().toISOString(),
      entries: readEntries()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var d = new Date();
    var fname = 'TimeCapsule备份_' +
      d.getFullYear() + '-' + TC.pad2(d.getMonth() + 1) + '-' + TC.pad2(d.getDate()) + '.json';
    a.href = url; a.download = fname;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function restoreBackup(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var payload = JSON.parse(reader.result);
        var entries = Array.isArray(payload) ? payload :
          (Array.isArray(payload.entries) ? payload.entries : null);
        if (!entries) { cb(false, '文件格式无法识别（不是 TimeCapsule 备份）'); return; }
        /* 简单校验条目关键字段 */
        var ok = true;
        entries.forEach(function (e) {
          if (!e || typeof e.dateISO !== 'string') { ok = false; }
        });
        if (!ok) { cb(false, '备份内容似乎不是有效的日记数据'); return; }
        writeEntries(entries);
        try { localStorage.setItem(SEED_FLAG, '1'); } catch (err) { /* ignore */ }
        cb(true, '已恢复 ' + entries.length + ' 篇日记');
      } catch (err) {
        cb(false, '备份文件解析失败：' + (err && err.message ? err.message : '格式错误'));
      }
    };
    reader.onerror = function () { cb(false, '读取文件失败'); };
    reader.readAsText(file);
  }

  function backupMeta() {
    var list = readEntries();
    var withText = 0, withImages = 0, withAudio = 0;
    list.forEach(function (e) {
      if (TC.plainText(e.body || '')) withText++;
      if (e.images && e.images.length) withImages++;
      if (e.audios && e.audios.length) withAudio++;
    });
    return { total: list.length, withText: withText, withImages: withImages, withAudio: withAudio };
  }

  /* --- 确认弹层（Modal），替代 window.confirm --- */
  var modalEl = null;
  var DANGER_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  var INFO_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';

  /* 返回 Promise<boolean>，resolve(true) 表示用户点确定 */
  function confirmDialog(opts) {
    var o = opts || {};
    var title = o.title || '确认操作';
    var desc = o.desc || '';
    var confirmText = o.confirmText || '确定';
    var cancelText = o.cancelText || '取消';
    var isDanger = !!o.danger;

    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'modal-overlay';
      modalEl.setAttribute('role', 'alertdialog');
      modalEl.setAttribute('aria-modal', 'true');
      document.body.appendChild(modalEl);
    }
    modalEl.innerHTML =
      '<div class="modal">' +
        '<div class="modal-icon' + (isDanger ? ' danger' : '') + '">' + (isDanger ? DANGER_ICON : INFO_ICON) + '</div>' +
        '<div class="modal-title">' + TC.escapeAttr(title) + '</div>' +
        (desc ? '<div class="modal-desc">' + TC.escapeAttr(desc) + '</div>' : '') +
        '<div class="modal-actions">' +
          '<button type="button" class="modal-btn-cancel" data-act="cancel">' + TC.escapeAttr(cancelText) + '</button>' +
          '<button type="button" class="modal-btn-confirm' + (isDanger ? ' modal-btn-danger' : '') + '" data-act="confirm">' + TC.escapeAttr(confirmText) + '</button>' +
        '</div>' +
      '</div>';

    modalEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    return new Promise(function (resolve) {
      function close(result) {
        modalEl.classList.remove('is-open');
        document.body.style.overflow = '';
        modalEl.removeEventListener('click', handler);
        modalEl.removeEventListener('keydown', keyHandler);
        resolve(result);
      }
      function handler(e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
        if (!btn) { if (e.target === modalEl) { close(false); } return; }
        close(btn.getAttribute('data-act') === 'confirm');
      }
      function keyHandler(e) {
        if (e.key === 'Escape') { close(false); }
        else if (e.key === 'Enter') { close(true); }
      }
      modalEl.addEventListener('click', handler);
      modalEl.addEventListener('keydown', keyHandler);
      var confirmBtn = modalEl.querySelector('[data-act="confirm"]');
      if (confirmBtn) { setTimeout(function () { confirmBtn.focus(); }, 30); }
    });
  }

  /* --- 导出 --- */
  global.TC = {
    STORAGE_KEY: STORAGE_KEY,
    WEEK: WEEK,
    MOODS: MOODS,
    MOOD_MAP: MOOD_MAP,
    weatherIcon: weatherIcon,
    seedIfNeeded: seedIfNeeded,
    readEntries: readEntries,
    writeEntries: writeEntries,
    saveEntry: saveEntry,
    deleteEntry: deleteEntry,
    findEntry: findEntry,
    plainText: plainText,
    escapeAttr: escapeAttr,
    pad2: pad2,
    makeNowISO: makeNowISO,
    makeLabel: makeLabel,
    makeGroupTitle: makeGroupTitle,
    tabBarHTML: tabBarHTML,
    showToast: showToast,
    extractKeywords: extractKeywords,
    initTheme: initTheme,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    exportBackup: exportBackup,
    restoreBackup: restoreBackup,
    backupMeta: backupMeta,
    confirmDialog: confirmDialog
  };

  /* --- 页面加载时自动种子 --- */
  seedIfNeeded();
})(window);
