/* =========================================================
   Өдрийн дэглэм · 51 дүгээр сургууль — DEMO хувилбар
   Цэвэр HTML + CSS + JavaScript. Сервер, database, build хэрэггүй.

   АНХААР: Энэ нь танилцуулгын prototype.
   - Нэвтрэлт нь жинхэнэ authentication БИШ: нууц үгийг хөтөч дээр шалгадаг, хамгаалалт өгөхгүй.
   - Бүх мэдээлэл жишээ бөгөөд зөвхөн энэ хөтчийн localStorage-д хадгалагдана.
   Жинхэнэ хувилбарт эдгээрийг сервер (жишээ нь Supabase Auth + RLS) хариуцна.

   Кодын бүтэц:
     1. Тогтмол утга (ангилал, жишээ хэрэглэгч, төлөвлөгөө)
     2. Огноо
     3. Өгөгдөл хадгалах (localStorage)
     4. Эрх ба өгөгдлийн функц
     5. Theme
     6. Туслах HTML функц, icon
     7. Дэлгэцүүд (login, сурагч, багш, эцэг эх)
     8. Чиглүүлэлт ба үйлдлүүд (event)
   ========================================================= */
(function () {
  "use strict";

  /* ================= 1. ТОГТМОЛ УТГА ================= */

  const STORE_KEY = "odriin-deglem.html.v1";
  const SESSION_KEY = "odriin-deglem.html.session";
  const THEME_KEY = "odriin-deglem.theme";

  const CATEGORIES = [
    { id: "study", label: "Хичээл, сургалт" },
    { id: "home", label: "Гэрийн ажил, бие даах чадвар" },
    { id: "health", label: "Эрүүл ахуй, хооллолт, нойр" },
    { id: "rest", label: "Амралт, хөдөлгөөн, дэлгэц" },
    { id: "interest", label: "Сонирхол" },
  ];
  const SLOTS = { morning: "Өглөө", school: "Сургууль дээр", after: "Хичээлийн дараа", evening: "Орой" };
  const ROLES = {
    student: { label: "Сурагч", desc: "Өдрийн хийх зүйлсээ тэмдэглэнэ", home: "/s", icon: "graduation" },
    teacher: { label: "Багш", desc: "Хариуцсан сурагчийн ахицыг хянана", home: "/t", icon: "users" },
    guardian: { label: "Эцэг эх / Асран хамгаалагч", desc: "Хүүхдийнхээ бүртгэлийг харна", home: "/p", icon: "heart" },
  };
  const MOODS = [["great", "Баяртай"], ["ok", "Тайван"], ["tired", "Ядарсан"], ["upset", "Бухимдсан"]];
  const OFFSCREEN = [["draw", "Зураг"], ["clay", "Шавар"], ["ball", "Бөмбөг"], ["geo", "Газарзүй"], ["other", "Бусад"]];
  const REWARD_ICONS = [["glove", "Бээлий"], ["ball", "Бөмбөг"], ["socks", "Оймс"], ["timer", "Нэмэлт цаг"], ["palette", "Бүтээлч ажил"], ["gift", "Бэлэг"], ["star", "Од"]];

  /** Танилцуулгын жишээ хэрэглэгчид. Бодит хүний мэдээлэл биш. */
  const DEMO_ACCOUNTS = [
    { id: "u-student", username: "bat", password: "demo123", role: "student", full_name: "Бат (жишээ сурагч)" },
    { id: "u-teacher", username: "bagsh", password: "demo123", role: "teacher", full_name: "Сараа багш (жишээ)" },
    { id: "u-guardian", username: "eej", password: "demo123", role: "guardian", full_name: "Дулмаа (жишээ эцэг эх)" },
    { id: "u-student2", username: "nomin", password: "demo123", role: "student", full_name: "Номин (жишээ сурагч)" },
  ];

  /** 51 дүгээр сургуулийн төлөвлөгөөний даалгаврууд. «Хийсэн» бол points оноо өгнө. */
  const DEFAULT_TASKS = [
    ["study", "Цүнх, хэрэгслээ шалгах", "Сургууль явахын өмнө жагсаалтаараа шалга.", 5, "morning", 5],
    ["study", "Хичээлдээ оролцох", "Багшийн зааврыг сонсоод идэвхтэй оролц.", 0, "school", 10],
    ["study", "Монгол хэлний унших-бичих ажил", "10–15 минут. Хэцүү бол 5 минутаар хоёр хуваана.", 15, "after", 10],
    ["study", "Уншсанаа ойлгох", "Уншсан зүйлээсээ 2–3 асуултад хариул.", 5, "after", 5],
    ["home", "Эд зүйлсээ байранд нь хураах", "Харандаа, зураг, тоглоомоо хайрцагт нь хий.", 5, "evening", 5],
    ["home", "Маргаашийн цүнхээ бэлдэх", "Ном, дэвтэр, харандаагаа цүнхэндээ хий.", 5, "evening", 5],
    ["home", "Гэр бүлдээ туслах", "Аяга угаах, ширээ засах зэрэг нэг жижиг ажил.", 10, "evening", 5],
    ["health", "Нүүр, гараа угаах", "Өглөө сэрээд.", 3, "morning", 5],
    ["health", "Шүдээ угаах", "Өглөө ба орой.", 3, "morning", 5],
    ["health", "Өглөөний цайгаа уух", "", 15, "morning", 5],
    ["health", "Хангалттай ус уух", "Сургууль дээр ч, гэртээ ч.", 0, "school", 5],
    ["health", "Оройн ариун цэвэр", "Гараа угааж, шүдээ угаана.", 5, "evening", 5],
    ["health", "Унтахын өмнө дэлгэцээ унтраах", "Унтахаас 45–60 минутын өмнө.", 0, "evening", 5],
    ["rest", "Бөмбөгтэй дасгал эсвэл алхалт", "15–20 минут хөдөлгөөн.", 20, "after", 5],
    ["rest", "Дэлгэцгүй бүтээл", "Зураг зурах эсвэл шавраар бүтээл хийх.", 25, "after", 5],
    ["rest", "Дэлгэцийн цагаа хянах", "Тохирсон цаг дуусахад өөрөө унтраа.", 0, "after", 5],
    ["interest", "Хөлбөмбөгийн сэдвээр өгүүлбэр бичих", "«Хаалгач бөмбөг барив» гэх мэт 2 өгүүлбэр.", 10, "after", 5],
    ["interest", "Газрын зургаас нэр унших", "Нэг газрын нэр уншаад чиглэлийг нь хэл.", 10, "after", 5],
  ];
  const DEFAULT_SCHEDULE = [
    ["07:00", "Өглөө сэрснээс сургууль явах хүртэл", "Ариун цэвэр, өглөөний цай, хувцаслах, цүнх шалгах"],
    ["08:00", "Сургуулийн цаг", "Хичээл, завсарлага, ус уух, хөдөлгөөн"],
    ["13:30", "Сургуулиас ирээд 20–30 минут", "Амрах, тайвшрах, ус уух"],
    ["14:00", "15–20 минут", "Бөмбөгтэй дасгал, алхалт эсвэл хөдөлгөөнт тоглоом"],
    ["14:20", "10–15 минут", "Монгол хэлний унших-бичих богино ажил"],
    ["14:40", "20–30 минут", "Зураг зурах, шавар урлал, бүтээл хийх"],
    ["15:10", "5–10 минут", "Эд зүйлсээ хураах, маргаашийн цүнх бэлдэх"],
    ["19:00", "Орой", "Гэр бүлийн хоол, ярилцах, ариун цэвэр"],
    ["20:30", "Унтахаас 45–60 минутын өмнө", "Дэлгэцээ унтраах, тайван амрах, унтах бэлтгэл"],
  ];
  /** Шагнал: сайт өөрөө юм худалдаж өгөхгүй, эцэг эх/багштай тохиролцож авна. */
  const DEFAULT_REWARDS = [
    ["Хаалгачийн бээлий", "Гол шагнал. Эцэг эх/багштай тохиролцож авна.", "glove", 600],
    ["Хөлбөмбөгийн бөмбөг", "Эцэг эх/багштай тохиролцож авна.", "ball", 350],
    ["Хөлбөмбөгийн оймс", "Эцэг эх/багштай тохиролцож авна.", "socks", 200],
    ["Дасгалын нэмэлт 15 минут", "Хөлбөмбөгийн дасгалд нэмэлт цаг. Эцэг эх/багштай тохиролцоно.", "timer", 80],
    ["Бүтээлч ажлаа өөрөө сонгох", "Зураг, шавар эсвэл газрын зураг. Эцэг эх/багштай тохиролцоно.", "palette", 120],
  ];

  /* ================= 2. ОГНОО (Улаанбаатарын цагаар) ================= */

  const TZ = "Asia/Ulaanbaatar";
  const WEEKDAYS = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
  const WEEKDAYS_SHORT = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];

  function today() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  }
  function nowMinutes() {
    const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
    return (h % 24) * 60 + m;
  }
  function parseDate(d) { const [y, m, dd] = d.split("-").map(Number); return new Date(Date.UTC(y, m - 1, dd)); }
  function addDays(d, n) { const x = parseDate(d); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); }
  function formatLong(d) { const x = parseDate(d); return `${x.getUTCMonth() + 1}-р сарын ${x.getUTCDate()}, ${WEEKDAYS[x.getUTCDay()]}`; }
  function formatShort(d) { const x = parseDate(d); return `${x.getUTCMonth() + 1}/${x.getUTCDate()} ${WEEKDAYS_SHORT[x.getUTCDay()]}`; }
  function lastDays(n, end) { return Array.from({ length: n }, (_, i) => addDays(end, -(n - 1 - i))); }
  /** Сүүлийн 7 хоногийн бүртгэлийг л засна */
  function isEditable(d) { const t = today(); return d <= t && d >= addDays(t, -7); }
  function greeting() { const m = nowMinutes(); return m < 660 ? "Өглөөний мэнд" : m < 1080 ? "Өдрийн мэнд" : "Оройн мэнд"; }
  function fmtMinutes(m) { if (m == null) return "—"; const h = Math.floor(m / 60), r = m % 60; return h ? `${h} ц ${r} мин` : `${r} мин`; }
  function clock() { return new Date().toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" }); }

  /* ================= 3. ӨГӨГДӨЛ ХАДГАЛАХ (localStorage) ================= */

  const uid = (p) => `${p}-${Math.random().toString(36).slice(2, 10)}`;
  // Тогтвортой "санамсаргүй" тоо: дахин эхлүүлэхэд ижил жишээ мэдээлэл гарна
  function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }

  /** Анхны жишээ мэдээлэл: 2 сурагч, өмнөх 6 өдрийн бүртгэл */
  function seed() {
    const t = today();
    const students = [
      { id: "s-bat", user_id: "u-student", full_name: "Бат", class_name: "3б анги (жишээ)", goal_pct: 80, screen_limit_min: 90 },
      { id: "s-nomin", user_id: "u-student2", full_name: "Номин", class_name: "3б анги (жишээ)", goal_pct: 70, screen_limit_min: 90 },
    ];
    const tasks = [], schedule = [], rewards = [];
    for (const s of students) {
      DEFAULT_TASKS.forEach(([category, title, description, minutes, slot, points], i) =>
        tasks.push({ id: `${s.id}-t${i}`, student_id: s.id, category, title, description, minutes, slot, points, sort: (i + 1) * 10, active: true }));
      DEFAULT_SCHEDULE.forEach(([start_time, period, activity], i) =>
        schedule.push({ id: `${s.id}-r${i}`, student_id: s.id, start_time, period, activity, sort: (i + 1) * 10 }));
      DEFAULT_REWARDS.forEach(([title, description, icon, cost], i) =>
        rewards.push({ id: `${s.id}-w${i}`, student_id: s.id, title, description, icon, cost, active: true, sort: (i + 1) * 10 }));
    }
    const r = rng(51), logs = [], home = [], notes = [];
    for (const s of students) {
      for (let d = 6; d >= 1; d--) {
        const date = addDays(t, -d), level = 0.55 + r() * 0.4;
        for (const task of tasks.filter((x) => x.student_id === s.id)) {
          const x = r();
          const status = x < level ? "done" : x < level + 0.08 ? "partial" : x < level + 0.12 ? "help" : null;
          if (status) logs.push({ task_id: task.id, student_id: s.id, log_date: date, status, points: status === "done" ? task.points : 0 });
        }
        home.push({
          student_id: s.id, log_date: date, screen_minutes: 50 + Math.round(r() * 80), movement_minutes: 15 + Math.round(r() * 30),
          offscreen: [["draw", "ball", "clay", "geo"][Math.floor(r() * 4)]], chore: ["Аяга угаасан", "Ширээ зассан", "Хувцсаа эвхсэн"][Math.floor(r() * 3)],
          hygiene_morning: true, hygiene_evening: r() > 0.2, hygiene_reminded: r() > 0.6, mood: ["great", "ok", "ok", "tired"][Math.floor(r() * 4)],
          sleep_note: r() > 0.5 ? "21:30-д унтсан, өглөө сэргэг байсан." : "",
        });
        if (r() > 0.5) notes.push({ student_id: s.id, log_date: date, note: ["Бөмбөгтэй дасгал хамгийн хөгжилтэй байлаа.", "Монгол хэлний даалгавар жаахан хэцүү байсан.", "Газрын зургаас Дорнод аймгийг олсон."][Math.floor(r() * 3)] });
      }
    }
    const timer = rewards.find((x) => x.student_id === "s-bat" && x.icon === "timer");
    return {
      version: 1,
      users: DEMO_ACCOUNTS.map((a) => ({ ...a })),
      students,
      teacher_students: students.map((s) => ({ teacher_id: "u-teacher", student_id: s.id })),
      guardian_students: [{ guardian_id: "u-guardian", student_id: "s-bat" }],
      tasks, schedule, rewards, task_logs: logs, student_notes: notes, home_logs: home,
      redemptions: [{ id: "rd1", student_id: "s-bat", reward_id: timer.id, title: timer.title, icon: timer.icon, cost: timer.cost, created_at: new Date(Date.now() - 3 * 864e5).toISOString() }],
      teacher_notes: [
        { id: "n1", student_id: "s-bat", author_id: "u-teacher", log_date: addDays(t, -2), body: "Монгол хэлний уншлага сайжирч байна. Гэртээ өдөрт 10 минут уншуулаарай.", share_with_guardian: true, created_at: new Date(Date.now() - 2 * 864e5).toISOString() },
        { id: "n2", student_id: "s-bat", author_id: "u-teacher", log_date: addDays(t, -1), body: "Дэмжлэг хүссэн даалгаврыг маргааш хамт хийнэ.", share_with_guardian: false, created_at: new Date(Date.now() - 864e5).toISOString() },
      ],
      day_goals: [{ student_id: "s-bat", log_date: t, goal: "Хоёр өгүүлбэр бие даан бичих" }],
    };
  }

  let db = loadDb();

  function loadDb() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) { const parsed = JSON.parse(raw); if (parsed && parsed.version === 1) return parsed; }
    } catch (e) { /* гэмтсэн эсвэл хаалттай: шинээр эхэлнэ */ }
    const fresh = seed();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(fresh)); } catch (e) { /* хадгалах боломжгүй */ }
    return fresh;
  }

  /**
   * Өгөгдөл өөрчлөх цорын ганц зам. Алдаа гарвал (эрхгүй, оноо сөрөг болох, хадгалж чадахгүй)
   * өөрчлөлтийг бүхэлд нь буцаана. Ингэснээр хадгалагдаагүй зүйлийг хадгалсан мэт харуулахгүй.
   */
  function mutate(fn) {
    const snapshot = JSON.stringify(db);
    try {
      const result = fn(db);
      try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }
      catch (e) { throw new Error("Хөтөч мэдээлэл хадгалахыг зөвшөөрөхгүй байна (нууц цонх эсэхийг шалгана уу)."); }
      return result;
    } catch (e) {
      db = JSON.parse(snapshot);
      throw e;
    }
  }

  function resetDemo() {
    db = seed();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }

  /* ---- demo session (жинхэнэ token биш) ---- */
  function me() {
    try { const id = localStorage.getItem(SESSION_KEY); return id ? db.users.find((u) => u.id === id) || null : null; }
    catch (e) { return null; }
  }
  function setSession(id) {
    try { if (id) localStorage.setItem(SESSION_KEY, id); else localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }

  /* ================= 4. ЭРХ БА ӨГӨГДЛИЙН ФУНКЦ ================= */
  // Эдгээр шалгалт нь жинхэнэ серверийн RLS дүрмийг дуурайсан төдий (хөтөч дээр ажилладаг тул хамгаалалт биш).

  function readableIds(user = me()) {
    if (!user) return [];
    if (user.role === "student") return db.students.filter((s) => s.user_id === user.id).map((s) => s.id);
    if (user.role === "teacher") return db.teacher_students.filter((x) => x.teacher_id === user.id).map((x) => x.student_id);
    if (user.role === "guardian") return db.guardian_students.filter((x) => x.guardian_id === user.id).map((x) => x.student_id);
    return [];
  }
  const canRead = (sid) => readableIds().includes(sid);
  const isSelf = (sid) => me()?.role === "student" && canRead(sid);
  const isTeacherOf = (sid) => me()?.role === "teacher" && canRead(sid);
  const isGuardianOf = (sid) => me()?.role === "guardian" && canRead(sid);
  function need(ok) { if (!ok) throw new Error("Энэ үйлдлийг хийх эрх танд алга."); }

  const myStudents = () => db.students.filter((s) => canRead(s.id)).sort((a, b) => a.full_name.localeCompare(b.full_name));
  const getStudent = (id) => (canRead(id) ? db.students.find((s) => s.id === id) : null);
  const catOrder = (c) => CATEGORIES.findIndex((x) => x.id === c);
  const tasksOf = (sid, all = false) => db.tasks.filter((t) => t.student_id === sid && (all || t.active)).sort((a, b) => catOrder(a.category) - catOrder(b.category) || a.sort - b.sort);
  const statusMap = (sid, date) => new Map(db.task_logs.filter((l) => l.student_id === sid && l.log_date === date).map((l) => [l.task_id, l.status]));
  const homeLog = (sid, date) => db.home_logs.find((h) => h.student_id === sid && h.log_date === date);
  const studentNote = (sid, date) => db.student_notes.find((n) => n.student_id === sid && n.log_date === date)?.note || "";
  const dayGoal = (sid, date) => db.day_goals.find((g) => g.student_id === sid && g.log_date === date)?.goal || "";

  /** Ахиц: хийсэн = 1, хэсэгчлэн = 0.5, дэмжлэг хэрэгтэй = 0 */
  function progress(sid, date) {
    const tasks = tasksOf(sid), st = statusMap(sid, date);
    let score = 0, done = 0, help = 0;
    const byCat = {};
    for (const t of tasks) {
      const s = st.get(t.id), v = s === "done" ? 1 : s === "partial" ? 0.5 : 0;
      score += v; if (s === "done") done++; if (s === "help") help++;
      byCat[t.category] = byCat[t.category] || { score: 0, total: 0 };
      byCat[t.category].score += v; byCat[t.category].total++;
    }
    return { total: tasks.length, done, help, pct: tasks.length ? Math.round((score / tasks.length) * 100) : 0, byCat, statuses: st };
  }

  /**
   * Оноо = «хийсэн» даалгаврын оноо − авсан шагналын оноо.
   * Тусдаа тоолуур хадгалахгүй, бүртгэлээс тухай бүрт тооцно.
   * Бүртгэл (даалгавар, өдөр) хос бүрт ганц мөр тул нэг даалгавраас давхар оноо гарахгүй.
   */
  function points(sid) {
    const earned = db.task_logs.filter((l) => l.student_id === sid).reduce((a, l) => a + (l.points || 0), 0);
    const spent = db.redemptions.filter((r) => r.student_id === sid).reduce((a, r) => a + r.cost, 0);
    return { earned, spent, balance: earned - spent };
  }

  function setTaskStatus(sid, taskId, date, status) {
    mutate((d) => {
      const task = d.tasks.find((t) => t.id === taskId && t.student_id === sid);
      need(isSelf(sid) && isEditable(date) && !!task);
      d.task_logs = d.task_logs.filter((l) => !(l.task_id === taskId && l.log_date === date));
      if (status) d.task_logs.push({ task_id: taskId, student_id: sid, log_date: date, status, points: status === "done" ? task.points : 0 });
      if (points(sid).balance < 0) throw new Error("Энэ даалгаврын оноог шагналд зарцуулсан тул буцаах боломжгүй.");
    });
  }
  function redeem(rewardId) {
    return mutate((d) => {
      const r = d.rewards.find((x) => x.id === rewardId && x.active);
      if (!r) throw new Error("Шагнал олдсонгүй.");
      need(isSelf(r.student_id));
      if (points(r.student_id).balance < r.cost) throw new Error("Оноо хүрэлцэхгүй байна.");
      const row = { id: uid("rd"), student_id: r.student_id, reward_id: r.id, title: r.title, icon: r.icon, cost: r.cost, created_at: new Date().toISOString() };
      d.redemptions.push(row);
      return row;
    });
  }
  function upsert(list, match, row) {
    const i = list.findIndex(match);
    if (i >= 0) list[i] = row; else list.push(row);
  }

  /* ================= 5. THEME ================= */

  function currentTheme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "dark" ? "#16171a" : "#fafaf7");
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* энэ удаад л үйлчилнэ */ }
  }

  /* ================= 6. ТУСЛАХ HTML ФУНКЦ, ICON ================= */

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Lucide загварын энгийн icon-ууд (stroke = одоогийн текстийн өнгө)
  const PATHS = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chevDown: '<path d="m6 9 6 6 6-6"/>',
    chevLeft: '<path d="m15 18-6-6 6-6"/>',
    chevRight: '<path d="m9 18 6-6-6-6"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>',
    graduation: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    glove: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    socks: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>',
    timer: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
    palette: '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    // Хөлбөмбөгийн бөмбөг: зөвхөн logo, сонирхлын хэсэг ба шагналд ашиглана
    ball: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7.6l4 2.9-1.5 4.7h-5L8 10.5z" fill="currentColor" stroke="none"/><path d="M12 7.6V2.6M16 10.5l4.6-1.6M14.5 15.2l2.8 4.1M9.5 15.2l-2.8 4.1M8 10.5L3.4 8.9"/>',
  };
  const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${PATHS[name] || PATHS.gift}</svg>`;

  const brand = (compact) => `
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">${icon("ball")}</span>
      <div><p class="brand-name">Өдрийн дэглэм</p>${compact ? "" : '<p class="brand-sub">51 дүгээр сургууль</p>'}</div>
    </div>`;
  const themeBtn = () => {
    const dark = currentTheme() === "dark";
    return `<button type="button" class="icon-btn" data-action="theme" aria-pressed="${dark}"
      aria-label="${dark ? "Өдрийн горимд шилжих" : "Шөнийн горимд шилжих"}" title="${dark ? "Өдрийн горим" : "Шөнийн горим"}">${icon(dark ? "sun" : "moon")}</button>`;
  };
  const progressBar = (pct, label, thin) =>
    `<div class="progress${thin ? " thin" : ""}" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div style="width:${pct}%"></div></div>`;
  const statusPill = (s) => !s ? '<span class="status none">Хийгээгүй</span>'
    : `<span class="status ${s}">${{ done: "Хийсэн", partial: "Хэсэгчлэн", help: "Дэмжлэг хэрэгтэй" }[s]}</span>`;
  const empty = (title, text = "") => `<div class="empty"><p>${esc(title)}</p>${text ? `<p>${text}</p>` : ""}</div>`;
  const errorAlert = (text) => `<div class="alert error" role="alert">${icon("alert")}<p>${esc(text)}</p></div>`;
  const pageHead = (title, eyebrow, lead) =>
    `<header class="page-head">${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}<h1>${esc(title)}</h1>${lead ? `<p class="lead">${lead}</p>` : ""}</header>`;
  const field = (label, id, control, { hint, error } = {}) =>
    `<div class="field"><label for="${id}">${label}</label>${control}${error ? `<p class="error-text" role="alert">${esc(error)}</p>` : hint ? `<p class="hint">${hint}</p>` : ""}</div>`;

  /* ---- UI төлөв: хадгалагдахгүй, зөвхөн дэлгэцийн байдал ---- */
  const ui = {
    loginRole: null, loginId: "", loginPw: "", loginError: "", showPw: false, resetConfirm: false, resetDone: false,
    open: {},        // дэлгэрсэн бүлгүүд
    drafts: {},      // бичиж байгаа боловч хадгалаагүй утгууд (дахин зурахад алдагдахгүй)
    status: {},      // хадгалалтын төлөв: { ok, text, at }
    errors: {},      // формын алдаа
    editing: null,   // засаж буй мөр
    pickReward: null,
    schedule: null,  // багшийн засаж буй хуваарийн хуулбар
  };
  const draft = (key, fallback) => (key in ui.drafts ? ui.drafts[key] : fallback);
  const clearDrafts = (prefix) => { for (const k of Object.keys(ui.drafts)) if (k.startsWith(prefix)) delete ui.drafts[k]; };
  function saveStatus(key) {
    const s = ui.status[key];
    if (!s) return '<span class="save-status" aria-live="polite"></span>';
    return s.ok
      ? `<span class="save-status ok" aria-live="polite">${icon("checkCircle", "sm")}Хадгалагдсан · ${s.at}</span>`
      : `<span class="save-status err" role="alert">${icon("alert", "sm")}Хадгалагдсангүй: ${esc(s.text)}</span>`;
  }
  /** Хадгалах үйлдлийг ажиллуулж, амжилттай эсэхийг тэмдэглэнэ */
  function attempt(key, fn) {
    try { fn(); ui.status[key] = { ok: true, at: clock() }; return true; }
    catch (e) { ui.status[key] = { ok: false, text: e.message }; return false; }
  }

  /* ================= 7. ДЭЛГЭЦҮҮД ================= */

  /* ---------- Login ---------- */
  function viewLogin() {
    const role = ui.loginRole;
    return `
    <div class="login"><div class="login-inner">
      <div class="row between">${brand()}${themeBtn()}</div>
      <h1>Нэвтрэх</h1>
      <p class="muted" style="margin-top:4px;font-size:15px">Суралцагчийн өдрийн дэглэм, дэмжлэгийн төлөвлөгөө</p>

      <form class="form" data-form="login" novalidate style="margin-top:32px;gap:24px">
        <fieldset style="border:0;margin:0;padding:0">
          <legend class="strong" style="font-size:15px">Та хэн бэ?</legend>
          <div class="roles" role="radiogroup">
            ${Object.entries(ROLES).map(([id, r]) => `
              <button type="button" class="role" role="radio" aria-checked="${role === id}" data-action="pick-role" data-role="${id}" id="role-${id}">
                <span class="role-icon">${icon(r.icon)}</span>
                <span class="grow"><span class="strong" style="display:block">${r.label}</span><span class="muted small" style="display:block">${r.desc}</span></span>
                <span class="role-dot" aria-hidden="true"></span>
              </button>`).join("")}
          </div>
        </fieldset>

        <div class="form login-fields" aria-disabled="${!role}">
          ${field("Нэвтрэх нэр", "login-id", `<input class="input" id="login-id" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" value="${esc(ui.loginId)}" ${role ? "" : "disabled"}>`)}
          <div class="field">
            <label for="login-pw">Нууц үг</label>
            <div class="pw-wrap">
              <input class="input" id="login-pw" name="password" type="${ui.showPw ? "text" : "password"}" autocomplete="current-password" value="${esc(ui.loginPw)}" ${role ? "" : "disabled"}>
              <button type="button" class="icon-btn" data-action="toggle-pw" aria-pressed="${ui.showPw}" aria-label="${ui.showPw ? "Нууц үгийг нуух" : "Нууц үгийг харуулах"}" ${role ? "" : "disabled"}>${icon(ui.showPw ? "eyeOff" : "eye")}</button>
            </div>
          </div>
        </div>

        ${ui.loginError ? errorAlert(ui.loginError) : ""}

        <div style="display:grid;gap:8px">
          <button type="submit" class="btn btn-primary" ${role ? "" : "disabled"}>Нэвтрэх</button>
          <button type="button" class="btn btn-secondary" data-action="demo-login" ${role ? "" : "disabled"}>Demo-оор нэвтрэх</button>
        </div>
      </form>

      <section class="demo-box" aria-labelledby="demo-h">
        <h2 id="demo-h" class="strong" style="font-size:15px">Танилцуулгын (demo) хувилбар</h2>
        <p class="muted" style="margin-top:4px">Жинхэнэ нэвтрэлт биш. Бүх мэдээлэл жишээ бөгөөд зөвхөн энэ хөтөч дээр хадгалагдана.</p>
        <dl>${DEMO_ACCOUNTS.filter((a) => a.id !== "u-student2").map((a) => `<dt>${ROLES[a.role].label}</dt><dd>${a.username} / ${a.password}</dd>`).join("")}</dl>
        <div class="reset">
          ${ui.resetDone ? '<p class="ok-text" role="status">Жишээ мэдээллийг анхны байдалд нь буцаалаа.</p>'
            : ui.resetConfirm ? `<div class="row"><span>Бүх өөрчлөлт арилна. Итгэлтэй байна уу?</span>
                <button type="button" class="btn btn-danger btn-sm" data-action="reset-yes">Тийм, дахин эхлүүлэх</button>
                <button type="button" class="btn btn-ghost btn-sm" data-action="reset-no">Болих</button></div>`
            : '<button type="button" class="link-btn" data-action="reset-ask">Demo өгөгдлийг дахин эхлүүлэх</button>'}
        </div>
      </section>
    </div></div>`;
  }

  function signIn(role, username, password) {
    const id = String(username || "").trim().toLowerCase();
    if (!role) return "Эхлээд нэвтрэх төрлөө сонгоно уу.";
    if (!id || !password) return "Нэвтрэх нэр болон нууц үгээ оруулна уу.";
    const user = db.users.find((u) => u.username === id);
    if (!user || user.password !== password) return "Нэвтрэх нэр эсвэл нууц үг буруу байна.";
    if (user.role !== role) return `Энэ аккаунт «${ROLES[role].label}» эрхгүй байна. Зөв төрлөө сонгоод дахин оролдоно уу.`;
    setSession(user.id);
    ui.loginError = ""; ui.loginPw = ""; ui.resetDone = false;
    go(ROLES[role].home);
    return null;
  }

  /* ---------- Shell: sidebar (desktop), дээд мөр + доод цэс (утас) ---------- */
  const NAV = {
    student: [["/s", "Өнөөдөр", "sun"], ["/s/rewards", "Шагнал", "gift"], ["/s/schedule", "Хуваарь", "calendar"], ["/s/history", "Түүх", "history"]],
    teacher: [["/t", "Сурагчид", "users"]],
    guardian: [["/p", "Өнөөдөр", "sun"], ["/p/week", "Долоо хоног", "clipboard"]],
  };
  function shell(user, path, content) {
    const items = NAV[user.role];
    const active = (to) => (to === path || (to !== ROLES[user.role].home && path.startsWith(to)) || (path.startsWith("/s/day/") && to === "/s/history") || (path.startsWith("/t/") && to === "/t"));
    const links = (cls) => items.map(([to, label, ic]) =>
      `<a href="#${to}" ${active(to) ? 'aria-current="page"' : ""}>${cls === "bottom" ? `<span class="pill-icon">${icon(ic)}</span>` : icon(ic)}${label}</a>`).join("");
    return `
    <div class="layout">
      <aside class="sidebar">
        <div class="row between">${brand()}${themeBtn()}</div>
        <nav class="side-nav" aria-label="Үндсэн цэс">${links("side")}</nav>
        <div class="side-foot">
          <p class="strong" style="font-size:15px">${esc(user.full_name)}</p>
          <p class="muted small">${ROLES[user.role].label}</p>
          <span class="demo-tag">Demo · жишээ мэдээлэл</span>
          <div><button type="button" class="btn btn-ghost btn-sm" data-action="logout" style="margin-top:8px;padding:0 8px">${icon("logout", "sm")}Гарах</button></div>
        </div>
      </aside>
      <header class="topbar"><div class="topbar-inner">
        ${brand(true)}
        <span class="topbar-role">${ROLES[user.role].label} · Demo</span>
        ${themeBtn()}
        <button type="button" class="icon-btn" data-action="logout" aria-label="Гарах">${icon("logout")}</button>
      </div></header>
      <main class="main${items.length > 1 ? " has-bottom-nav" : ""}" id="main">${content}</main>
      ${items.length > 1 ? `<nav class="bottom-nav" aria-label="Үндсэн цэс"><div class="bottom-nav-inner">${links("bottom")}</div></nav>` : ""}
    </div>`;
  }

  /* ---------- Даалгаврын жагсаалт (сурагч засна, бусад нь харна) ---------- */
  function taskGroups(sid, date, editable) {
    const tasks = tasksOf(sid), st = statusMap(sid, date);
    let openedFirst = false;
    return CATEGORIES.map((c) => {
      const items = tasks.filter((t) => t.category === c.id);
      if (!items.length) return "";
      const done = items.filter((t) => st.get(t.id) === "done").length;
      const unfinished = items.some((t) => !st.get(t.id));
      const key = `${sid}:${date}:${c.id}`;
      let open = ui.open[key];
      if (open === undefined) { open = unfinished && !openedFirst; }  // эхний дуусаагүй бүлгийг нээлттэй харуулна
      if (unfinished) openedFirst = true;
      return `
      <div class="group">
        <button type="button" class="group-toggle" data-action="toggle-group" data-key="${key}" aria-expanded="${open}" aria-controls="g-${key}" id="gt-${key}">
          ${c.id === "interest" ? `<span class="group-icon">${icon("ball")}</span>` : ""}
          <span class="grow">${c.label}</span>
          <span class="num small ${done === items.length ? "ok-text" : "muted"}">${done}/${items.length}</span>
          <span class="chev">${icon("chevDown")}</span>
        </button>
        <ul class="list" id="g-${key}" ${open ? "" : "hidden"} style="padding-bottom:8px">
          ${items.map((t) => taskRow(t, st.get(t.id) || null, editable)).join("")}
        </ul>
      </div>`;
    }).join("");
  }
  function taskRow(t, status, editable) {
    const done = status === "done";
    const meta = [SLOTS[t.slot], t.minutes ? `${t.minutes} мин` : "", t.points ? `${t.points} оноо` : ""].filter(Boolean).join(" · ");
    return `
    <li class="task${done ? " done" : ""}" style="border:0">
      ${editable ? `<button type="button" class="check" id="chk-${t.id}" data-action="task" data-id="${t.id}" data-status="${done ? "" : "done"}" aria-pressed="${done}"
          aria-label="${esc(t.title)}: ${done ? "хийсэн тэмдэглэгээг арилгах" : "хийсэн гэж тэмдэглэх"}">${icon("check")}</button>` : ""}
      <div class="grow">
        <p class="task-title">${esc(t.title)}</p>
        ${t.description ? `<p class="task-desc">${esc(t.description)}</p>` : ""}
        <p class="task-meta">${meta}</p>
        ${editable ? `<div class="task-opts">
          <button type="button" class="opt-btn partial" id="par-${t.id}" data-action="task" data-id="${t.id}" data-status="${status === "partial" ? "" : "partial"}" aria-pressed="${status === "partial"}">Хэсэгчлэн хийсэн</button>
          <button type="button" class="opt-btn help" id="hlp-${t.id}" data-action="task" data-id="${t.id}" data-status="${status === "help" ? "" : "help"}" aria-pressed="${status === "help"}">Дэмжлэг хэрэгтэй</button>
        </div>` : ""}
      </div>
      ${editable ? "" : statusPill(status)}
    </li>`;
  }

  /* ---------- Сурагч: өдөр ---------- */
  function viewStudentDay(date) {
    const s = myStudents()[0];
    if (!s) return `<div class="card">${empty("Сурагчийн бүртгэл холбогдоогүй байна", "Анги удирдсан багшдаа хандана уу.")}</div>`;
    const t = today(), isToday = date === t, editable = isEditable(date);
    const p = progress(s.id, date), goal = dayGoal(s.id, date), pts = points(s.id);
    const noteKey = `note:${s.id}:${date}`, savedNote = studentNote(s.id, date);
    const head = isToday
      ? pageHead(`${greeting()}, ${s.full_name.split(" ")[0]}!`, formatLong(date))
      : `<a class="back" href="#/s/history">${icon("chevLeft", "sm")}Түүх</a>${pageHead(formatLong(date), "", editable ? "Энэ өдрийн бүртгэлээ засаж болно." : "Энэ өдрийн бүртгэлийг зөвхөн харах боломжтой.")}`;
    return `
    <div class="stack">
      <div>${head}</div>
      <section class="card card-pad">
        <div class="row between" style="align-items:baseline">
          <p class="strong">Өдрийн ахиц</p>
          <p class="num muted" style="font-size:15px"><span class="strong" style="color:var(--ink)">${p.done}</span> / ${p.total} хийсэн · ${p.pct}%</p>
        </div>
        <div style="margin-top:12px">${progressBar(p.pct, "Өдрийн ахиц")}</div>
        ${goal ? `<p class="row" style="margin-top:16px;align-items:flex-start;flex-wrap:nowrap;font-size:15px"><span class="group-icon">${icon("target")}</span><span><span class="muted">Өнөөдрийн жижиг зорилго: </span>${esc(goal)}</span></p>` : ""}
        ${p.total && p.done === p.total ? '<p class="ok-text strong" style="margin-top:12px;font-size:15px">Өнөөдрийн бүх зүйлээ хийлээ. Сайн байна!</p>' : ""}
        <a class="points-link" href="#/s/rewards"><span>Миний оноо: <b class="num" id="my-points">${pts.balance}</b></span><span class="go">Шагнал${icon("chevRight", "sm")}</span></a>
      </section>
      ${ui.status.task && !ui.status.task.ok ? errorAlert("Хадгалагдсангүй: " + ui.status.task.text) : ""}
      <section class="card">
        <div class="card-head"><div><h2>Хийх зүйлс</h2><p>Хийснээ тэмдэглэ. Хэцүү байвал «Дэмжлэг хэрэгтэй»-г сонго.</p></div></div>
        <div class="card-body">${p.total ? taskGroups(s.id, date, editable) : empty("Даалгавар оноогдоогүй байна", "Багш тань даалгавар нэмэхэд энд харагдана.")}</div>
      </section>
      <section class="card card-pad">
        <form class="form" data-form="note" data-sid="${s.id}" data-date="${date}" novalidate>
          <div class="field">
            <label for="day-note">Өдрийн тэмдэглэл</label>
            <p class="hint">Өнөөдөр юу сайн болсон бэ? Юу хэцүү байсан бэ?</p>
            <textarea class="input" id="day-note" data-draft="${noteKey}" maxlength="500" ${editable ? "" : "disabled"}>${esc(draft(noteKey, savedNote))}</textarea>
          </div>
          <div class="form-foot">${saveStatus(noteKey)}${editable ? '<button type="submit" class="btn btn-primary btn-sm">Хадгалах</button>' : ""}</div>
        </form>
      </section>
    </div>`;
  }

  /* ---------- Сурагч: шагнал ---------- */
  function viewStudentRewards() {
    const s = myStudents()[0];
    if (!s) return `<div class="card">${empty("Сурагчийн бүртгэл холбогдоогүй байна")}</div>`;
    const pts = points(s.id);
    const rewards = db.rewards.filter((r) => r.student_id === s.id && r.active).sort((a, b) => a.cost - b.cost);
    const got = db.redemptions.filter((r) => r.student_id === s.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const msg = ui.status.reward;
    const pick = ui.pickReward && rewards.find((r) => r.id === ui.pickReward);
    return `
    <div class="stack">
      ${pageHead("Шагнал", "", "Хийсэн даалгавар бүр оноо өгнө. Шагналыг эцэг эх, багштайгаа тохиролцож авна.")}
      <section class="card card-pad balance">
        <div><p class="muted" style="font-size:15px">Миний оноо</p><p class="balance-num num" id="balance" aria-live="polite">${pts.balance}</p></div>
        <p class="num muted small">Цуглуулсан ${pts.earned} · Зарцуулсан ${pts.spent}</p>
      </section>
      ${msg ? (msg.ok ? `<div class="alert success" role="status">${esc(msg.text)}</div>` : errorAlert(msg.text)) : ""}
      ${rewards.length ? `<ul class="rewards">${rewards.map((r) => {
        const short = pts.balance < r.cost, pct = Math.min(100, Math.round((Math.max(0, pts.balance) / r.cost) * 100));
        return `<li><article class="card reward">
          <div class="row" style="align-items:flex-start;flex-wrap:nowrap;gap:12px">
            <span class="reward-icon${short ? " locked" : ""}">${icon(r.icon, "lg")}</span>
            <div class="grow"><h3 style="font-size:16px;font-weight:500">${esc(r.title)}</h3><p class="reward-cost num">${r.cost} оноо</p></div>
          </div>
          ${r.description ? `<p class="muted small" style="margin-top:12px">${esc(r.description)}</p>` : ""}
          <div class="reward-foot">
            ${short ? `<div style="margin-bottom:12px">${progressBar(pct, r.title + " хүртэл", true)}<p class="muted small" style="margin-top:6px">Оноо хүрэлцэхгүй байна · ${r.cost - pts.balance} дутуу</p></div>` : ""}
            <button type="button" class="btn btn-block ${short ? "btn-secondary" : "btn-primary"}" id="rw-${r.id}" data-action="pick-reward" data-id="${r.id}" ${short ? "disabled" : ""}
              aria-label="${esc(r.title)}${short ? ": оноо хүрэлцэхгүй байна" : " авах"}">Авах</button>
          </div>
        </article></li>`;
      }).join("")}</ul>` : `<div class="card">${empty("Шагнал алга", "Багш шагнал нэмэхэд энд харагдана.")}</div>`}
      <section class="card" id="got">
        <div class="card-head"><h2>Авсан шагналууд</h2></div>
        ${got.length ? `<ul class="list card-body">${got.map((r) => `
          <li class="list-row"><span class="reward-icon small">${icon(r.icon)}</span>
            <div class="grow"><p class="strong">${esc(r.title)}</p><p class="muted xs">${formatLong(r.created_at.slice(0, 10))}</p></div>
            <span class="num muted small">−${r.cost}</span></li>`).join("")}</ul>`
          : '<p class="muted" style="padding:8px 20px 20px;font-size:15px">Одоогоор шагнал аваагүй байна.</p>'}
      </section>
      ${pick ? `<div class="scrim" data-action="close-dialog" data-self="1">
        <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-h">
          <h2 id="dlg-h">Шагнал авах уу?</h2>
          <p>«${esc(pick.title)}» шагналд <b style="color:var(--ink)">${pick.cost} оноо</b> зарцуулна. Үлдэх оноо: ${pts.balance - pick.cost}.</p>
          <div class="row"><button type="button" class="btn btn-secondary btn-sm" data-action="close-dialog" id="dlg-cancel">Болих</button>
            <button type="button" class="btn btn-primary btn-sm" data-action="confirm-reward" data-id="${pick.id}">Тийм, авах</button></div>
        </div></div>` : ""}
    </div>`;
  }

  /* ---------- Сурагч: хуваарь, түүх ---------- */
  function scheduleList(sid) {
    const rows = db.schedule.filter((r) => r.student_id === sid).sort((a, b) => a.sort - b.sort);
    if (!rows.length) return empty("Хуваарь хоосон байна", "Багш хуваарь нэмэхэд энд харагдана.");
    const now = nowMinutes();
    let current = -1;
    rows.forEach((r, i) => { if (r.start_time) { const [h, m] = r.start_time.split(":").map(Number); if (h * 60 + m <= now) current = i; } });
    return `<ol class="list">${rows.map((r, i) => `
      <li class="sched-row${i === current ? " now" : ""}">
        <span class="sched-time num">${esc(r.start_time || "—")}</span>
        <div class="grow"><p class="muted small">${esc(r.period)}${i === current ? ' <span class="strong" style="color:var(--accent-ink)">· Одоо</span>' : ""}</p><p class="strong">${esc(r.activity)}</p></div>
      </li>`).join("")}</ol>`;
  }
  function viewStudentSchedule() {
    const s = myStudents()[0];
    return `${pageHead("Өдрийн хуваарь", "", "Жишиг хуваарь. Цагийг багш тань тохируулна.")}<section class="card">${s ? scheduleList(s.id) : empty("Бүртгэл алга")}</section>`;
  }
  function viewStudentHistory() {
    const s = myStudents()[0], t = today();
    if (!s) return `<div class="card">${empty("Сурагчийн бүртгэл холбогдоогүй байна")}</div>`;
    const days = lastDays(14, t).reverse();
    return `${pageHead("Өмнөх өдрүүд", "", "Сүүлийн 14 хоног. Сүүлийн 7 хоногийн бүртгэлээ засаж болно.")}
    <section class="card"><ul class="list">${days.map((d) => {
      const p = progress(s.id, d), note = studentNote(s.id, d);
      return `<li><a class="list-row" href="#${d === t ? "/s" : "/s/day/" + d}">
        <div class="grow">
          <div class="row between" style="align-items:baseline"><p class="strong">${d === t ? "Өнөөдөр" : formatLong(d)}</p><p class="num muted small">${p.done}/${p.total}${p.help ? ` · ${p.help} дэмжлэг` : ""}</p></div>
          <div style="margin-top:8px">${progressBar(p.pct, d + " ахиц")}</div>
          ${note ? `<p class="muted small" style="margin-top:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(note)}</p>` : ""}
        </div>${icon("chevRight")}</a></li>`;
    }).join("")}</ul></section>`;
  }

  /* ---------- Хуваалцсан хэсгүүд ---------- */
  function categoryBars(sid, date) {
    const p = progress(sid, date);
    return `<div class="cat-bars">${CATEGORIES.filter((c) => p.byCat[c.id]).map((c) => {
      const v = p.byCat[c.id], pct = Math.round((v.score / v.total) * 100);
      return `<div class="cat-bar"><span style="font-size:15px">${c.label}</span><span class="num muted small right">${pct}%</span>${progressBar(pct, c.label)}</div>`;
    }).join("")}</div>`;
  }
  function weekTable(s) {
    const t = today();
    return `<div class="table-wrap"><table>
      <thead><tr><th>Өдөр</th><th>Биелэлт</th><th class="right">Дэлгэц</th><th class="right">Хөдөлгөөн</th></tr></thead>
      <tbody>${lastDays(7, t).reverse().map((d) => {
        const p = progress(s.id, d), h = homeLog(s.id, d), over = h && h.screen_minutes != null && h.screen_minutes > s.screen_limit_min;
        return `<tr><td>${d === t ? "Өнөөдөр" : formatShort(d)}</td>
          <td><div class="mini-bar">${progressBar(p.pct, d + " биелэлт")}<span class="num muted small">${p.pct}%</span></div></td>
          <td class="right num${over ? " warn-text strong" : ""}">${fmtMinutes(h ? h.screen_minutes : null)}</td>
          <td class="right num">${h && h.movement_minutes != null ? h.movement_minutes + " мин" : "—"}</td></tr>`;
      }).join("")}</tbody></table></div>`;
  }
  function homeSummary(s, date) {
    const h = homeLog(s.id, date);
    if (!h) return '<p class="muted" style="padding:0 20px 20px;font-size:15px">Энэ өдрийн гэрийн хуудас бөглөгдөөгүй байна.</p>';
    const hyg = [h.hygiene_morning ? "өглөө" : "", h.hygiene_evening ? "орой" : ""].filter(Boolean).join(", ") + (h.hygiene_reminded ? " · сануулгатай" : "");
    const rows = [
      ["Дэлгэц", `${fmtMinutes(h.screen_minutes)}${h.screen_minutes != null ? ` (хязгаар ${fmtMinutes(s.screen_limit_min)})` : ""}`],
      ["Хөдөлгөөн", h.movement_minutes != null ? h.movement_minutes + " мин" : "—"],
      ["Ариун цэвэр", hyg || "—"],
      ["Дэлгэцгүй үйл ажиллагаа", h.offscreen.map((o) => (OFFSCREEN.find((x) => x[0] === o) || [o, o])[1]).join(", ") || "—"],
      ["Гэрийн ажил", h.chore || "—"],
      ["Сэтгэл санаа", (MOODS.find((m) => m[0] === h.mood) || [0, "—"])[1]],
      ["Нойр, ажиглалт", h.sleep_note || "—"],
    ];
    return `<dl class="facts">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`;
  }

  /* ---------- Багш: сурагчдын жагсаалт ---------- */
  function viewTeacherHome() {
    const t = today(), list = myStudents();
    return `${pageHead("Хариуцсан сурагчид", formatLong(t), "Өнөөдрийн биелэлт. Дэлгэрэнгүйг сурагч дээр дарж харна.")}
    <section class="card">${list.length ? `<ul class="list">${list.map((s) => {
      const p = progress(s.id, t);
      return `<li><a class="list-row" href="#/t/student/${s.id}">
        <div class="grow">
          <div class="row between" style="align-items:baseline"><p class="strong">${esc(s.full_name)} <span class="muted small" style="font-weight:400">${esc(s.class_name || "")}</span></p>
            <p class="num muted small">${p.pct}% · ${p.done}/${p.total}${p.help ? ` <span class="status help">${p.help} дэмжлэг</span>` : ""}</p></div>
          <div style="margin-top:8px">${progressBar(p.pct, s.full_name + " ахиц")}</div>
        </div>${icon("chevRight")}</a></li>`;
    }).join("")}</ul>` : empty("Танд хариуцуулсан сурагч алга", "Сургуулийн админ холбосны дараа энд харагдана.")}</section>`;
  }

  /* ---------- Багш: нэг сурагч ---------- */
  const TEACHER_TABS = [["overview", "Тойм"], ["tasks", "Даалгавар"], ["schedule", "Хуваарь"], ["rewards", "Шагнал"], ["notes", "Тэмдэглэл, зорилго"], ["settings", "Тохиргоо"]];
  function viewTeacherStudent(id, tab) {
    const s = getStudent(id);
    if (!s) return `<div class="card">${empty("Сурагч олдсонгүй", 'Энэ сурагч танд хариуцуулагдаагүй байна. <a href="#/t">Жагсаалт руу буцах</a>')}</div>`;
    const panel = { overview: tOverview, tasks: tTasks, schedule: tSchedule, rewards: tRewards, notes: tNotes, settings: tSettings }[tab] || tOverview;
    return `<a class="back" href="#/t">${icon("chevLeft", "sm")}Сурагчид</a>
      ${pageHead(s.full_name, "", esc(s.class_name || "51 дүгээр сургууль"))}
      <div class="pills" role="tablist" aria-label="Сурагчийн хэсгүүд">${TEACHER_TABS.map(([k, label]) =>
        `<button type="button" class="pill-btn" role="tab" id="tab-${k}" aria-selected="${tab === k}" data-action="tab" data-tab="${k}">${label}</button>`).join("")}</div>
      <div role="tabpanel">${panel(s)}</div>`;
  }

  function tOverview(s) {
    const t = today(), p = progress(s.id, t), note = studentNote(s.id, t);
    const helps = db.task_logs.filter((l) => l.student_id === s.id && l.status === "help" && l.log_date >= addDays(t, -6)).sort((a, b) => b.log_date.localeCompare(a.log_date));
    const title = (tid) => db.tasks.find((x) => x.id === tid)?.title || "Хасагдсан даалгавар";
    return `<div class="stack">
      <section class="card card-pad">
        <div class="row between" style="align-items:baseline"><h2 style="font-size:17px">Өнөөдөр</h2><p class="num muted" style="font-size:15px">${p.done}/${p.total} хийсэн · ${p.pct}% · зорилго ${s.goal_pct}%</p></div>
        <div style="margin-top:12px">${progressBar(p.pct, "Өнөөдрийн биелэлт")}</div>
        <div style="margin-top:20px">${categoryBars(s.id, t)}</div>
        ${note ? `<p class="note-box" style="margin-top:20px"><span class="muted">Сурагчийн тэмдэглэл: </span>${esc(note)}</p>` : ""}
        <p class="muted small" style="margin-top:16px">Оноо: <span class="num">${points(s.id).balance}</span></p>
      </section>
      <section class="card"><div class="card-head"><div><h2>Дэмжлэг хэрэгтэй гэж тэмдэглэсэн</h2><p>Сүүлийн 7 хоног</p></div></div>
        ${helps.length ? `<ul class="list card-body">${helps.map((h) => `<li class="list-row"><span class="grow">${esc(title(h.task_id))}</span><span class="num muted small">${formatShort(h.log_date)}</span></li>`).join("")}</ul>`
          : '<p class="muted" style="padding:8px 20px 20px;font-size:15px">Дэмжлэг хүссэн даалгавар алга.</p>'}</section>
      <section class="card"><div class="card-head"><div><h2>Долоо хоног</h2><p>Дэлгэц, хөдөлгөөнийг эцэг эх бөглөнө</p></div></div><div class="card-body">${weekTable(s)}</div></section>
      <section class="card"><div class="card-head"><div><h2>Гэрийн хуудас</h2><p>${formatLong(t)}</p></div></div><div style="margin-top:4px">${homeSummary(s, t)}</div></section>
    </div>`;
  }

  function taskForm(s, task) {
    const k = task ? task.id : "new", e = ui.errors["task:" + k] || {};
    const v = (name, fb) => esc(draft(`tf:${k}:${name}`, fb));
    const d = task || { title: "", description: "", category: "study", slot: "after", minutes: 10, points: 5 };
    return `<form class="form" data-form="task" data-id="${task ? task.id : ""}" data-sid="${s.id}" novalidate>
      <div class="row between"><h3 style="font-size:16px">${task ? "Даалгавар засах" : "Шинэ даалгавар"}</h3>
        <button type="button" class="icon-btn" data-action="cancel-edit" aria-label="Болих">${icon("x")}</button></div>
      ${field("Нэр", `tf-title-${k}`, `<input class="input" id="tf-title-${k}" name="title" data-draft="tf:${k}:title" maxlength="80" value="${v("title", d.title)}" ${e.title ? 'aria-invalid="true"' : ""}>`, { error: e.title })}
      ${field("Товч тайлбар", `tf-desc-${k}`, `<input class="input" id="tf-desc-${k}" name="description" data-draft="tf:${k}:description" maxlength="200" value="${v("description", d.description)}">`, { hint: "Хүүхдэд ойлгомжтой, богино өгүүлбэр" })}
      <div class="grid-2">
        ${field("Бүлэг", `tf-cat-${k}`, `<select class="input" id="tf-cat-${k}" name="category" data-draft="tf:${k}:category">${CATEGORIES.map((c) => `<option value="${c.id}" ${draft(`tf:${k}:category`, d.category) === c.id ? "selected" : ""}>${c.label}</option>`).join("")}</select>`)}
        ${field("Үе", `tf-slot-${k}`, `<select class="input" id="tf-slot-${k}" name="slot" data-draft="tf:${k}:slot">${Object.entries(SLOTS).map(([id, l]) => `<option value="${id}" ${draft(`tf:${k}:slot`, d.slot) === id ? "selected" : ""}>${l}</option>`).join("")}</select>`)}
        ${field("Хугацаа, минут", `tf-min-${k}`, `<input class="input" id="tf-min-${k}" name="minutes" data-draft="tf:${k}:minutes" type="number" inputmode="numeric" value="${v("minutes", d.minutes)}" ${e.minutes ? 'aria-invalid="true"' : ""}>`, { error: e.minutes, hint: "0 бол харуулахгүй" })}
        ${field("Оноо", `tf-pts-${k}`, `<input class="input" id="tf-pts-${k}" name="points" data-draft="tf:${k}:points" type="number" inputmode="numeric" value="${v("points", d.points)}" ${e.points ? 'aria-invalid="true"' : ""}>`, { error: e.points, hint: "«Хийсэн» гэж тэмдэглэхэд өгнө" })}
      </div>
      <div class="form-foot end"><button type="button" class="btn btn-secondary" data-action="cancel-edit">Болих</button><button type="submit" class="btn btn-primary">${task ? "Хадгалах" : "Нэмэх"}</button></div>
    </form>`;
  }
  function tTasks(s) {
    const all = tasksOf(s.id, true);
    return `<div class="stack">
      <div class="row between"><p class="muted" style="font-size:15px">Хасах оронд «Түр зогсоох» ашиглана. Өмнөх бүртгэл хадгалагдана.</p>
        <button type="button" class="btn btn-primary btn-sm" data-action="edit" data-key="task:new">${icon("plus", "sm")}Даалгавар нэмэх</button></div>
      ${ui.status.taskEdit && !ui.status.taskEdit.ok ? errorAlert(ui.status.taskEdit.text) : ""}
      ${ui.editing === "task:new" ? `<section class="card card-pad">${taskForm(s, null)}</section>` : ""}
      ${CATEGORIES.map((c) => {
        const items = all.filter((t) => t.category === c.id);
        if (!items.length) return "";
        return `<section class="card"><div class="card-head"><div><h2>${c.label}</h2><p>${items.filter((t) => t.active).length} идэвхтэй</p></div></div>
          <ul class="list card-body">${items.map((t) => `<li>${ui.editing === "task:" + t.id ? `<div class="card-pad">${taskForm(s, t)}</div>` : `
            <div class="list-row"${t.active ? "" : ' style="opacity:.6"'}>
              <div class="grow"><p class="strong">${esc(t.title)}${t.active ? "" : ' <span class="muted small" style="font-weight:400">· түр зогссон</span>'}</p>
                <p class="muted small">${SLOTS[t.slot]}${t.minutes ? ` · ${t.minutes} мин` : ""} · ${t.points} оноо</p></div>
              <button type="button" class="icon-btn" id="ed-${t.id}" data-action="edit" data-key="task:${t.id}" aria-label="${esc(t.title)} засах">${icon("pencil", "sm")}</button>
              <button type="button" class="btn btn-ghost btn-sm" data-action="toggle-task" data-id="${t.id}">${t.active ? "Түр зогсоох" : "Сэргээх"}</button>
            </div>`}</li>`).join("")}</ul></section>`;
      }).join("")}
    </div>`;
  }

  function tSchedule(s) {
    // Засварлах хуулбар: «Хадгалах» дарах хүртэл үндсэн өгөгдөлд нөлөөлөхгүй
    if (!ui.schedule || ui.schedule.sid !== s.id) ui.schedule = { sid: s.id, rows: db.schedule.filter((r) => r.student_id === s.id).sort((a, b) => a.sort - b.sort).map((r) => ({ ...r })), removed: [] };
    const rows = ui.schedule.rows, err = ui.errors.schedule;
    return `<section class="card">
      <div class="card-head"><div><h2>Өдрийн хуваарь</h2><p>Сургуулийн бодит хуваарь, замын хугацаа, нойрны хэрэгцээтэй уялдуулна</p></div></div>
      <form data-form="schedule" data-sid="${s.id}" novalidate class="card-body">
        ${rows.length ? "" : empty("Хуваарь хоосон", "Мөр нэмнэ үү.")}
        <ul class="list">${rows.map((r, i) => `<li class="sched-edit" data-row="${r.id}">
          <input class="input" type="time" name="time" aria-label="Мөр ${i + 1}: цаг" data-draft="sc:${r.id}:time" value="${esc(draft(`sc:${r.id}:time`, r.start_time || ""))}">
          <input class="input" name="period" aria-label="Мөр ${i + 1}: үе" placeholder="Үе" maxlength="80" data-draft="sc:${r.id}:period" value="${esc(draft(`sc:${r.id}:period`, r.period))}">
          <input class="input activity" name="activity" aria-label="Мөр ${i + 1}: үйл ажиллагаа" placeholder="Үйл ажиллагаа" maxlength="160" data-draft="sc:${r.id}:activity" value="${esc(draft(`sc:${r.id}:activity`, r.activity))}">
          <button type="button" class="icon-btn danger" data-action="sched-del" data-id="${r.id}" aria-label="Мөр ${i + 1} хасах">${icon("trash", "sm")}</button>
        </li>`).join("")}</ul>
        <div class="form-foot" style="padding:16px 20px;border-top:1px solid var(--line)">
          <button type="button" class="btn btn-secondary btn-sm" data-action="sched-add">${icon("plus", "sm")}Мөр нэмэх</button>
          <div class="row">${err ? `<p class="error-text" role="alert">${esc(err)}</p>` : saveStatus("schedule")}<button type="submit" class="btn btn-primary btn-sm">Хадгалах</button></div>
        </div>
      </form></section>`;
  }

  function rewardForm(s, r) {
    const k = r ? r.id : "new", e = ui.errors["reward:" + k] || {};
    const d = r || { title: "", description: "Эцэг эх/багштай тохиролцож авна.", icon: "gift", cost: 100 };
    const v = (name, fb) => esc(draft(`rf:${k}:${name}`, fb));
    return `<form class="form" data-form="reward" data-id="${r ? r.id : ""}" data-sid="${s.id}" novalidate>
      <div class="row between"><h3 style="font-size:16px">${r ? "Шагнал засах" : "Шинэ шагнал"}</h3>
        <button type="button" class="icon-btn" data-action="cancel-edit" aria-label="Болих">${icon("x")}</button></div>
      ${field("Нэр", `rf-title-${k}`, `<input class="input" id="rf-title-${k}" name="title" data-draft="rf:${k}:title" maxlength="60" value="${v("title", d.title)}" ${e.title ? 'aria-invalid="true"' : ""}>`, { error: e.title })}
      ${field("Тайлбар", `rf-desc-${k}`, `<input class="input" id="rf-desc-${k}" name="description" data-draft="rf:${k}:description" maxlength="160" value="${v("description", d.description)}">`)}
      <div class="grid-2">
        ${field("Дүрс", `rf-icon-${k}`, `<select class="input" id="rf-icon-${k}" name="icon" data-draft="rf:${k}:icon">${REWARD_ICONS.map(([id, l]) => `<option value="${id}" ${draft(`rf:${k}:icon`, d.icon) === id ? "selected" : ""}>${l}</option>`).join("")}</select>`)}
        ${field("Шаардлагатай оноо", `rf-cost-${k}`, `<input class="input" id="rf-cost-${k}" name="cost" data-draft="rf:${k}:cost" type="number" inputmode="numeric" value="${v("cost", d.cost)}" ${e.cost ? 'aria-invalid="true"' : ""}>`, { error: e.cost })}
      </div>
      <div class="form-foot end"><button type="button" class="btn btn-secondary" data-action="cancel-edit">Болих</button><button type="submit" class="btn btn-primary">${r ? "Хадгалах" : "Нэмэх"}</button></div>
    </form>`;
  }
  function tRewards(s) {
    const pts = points(s.id), list = db.rewards.filter((r) => r.student_id === s.id).sort((a, b) => a.cost - b.cost);
    const got = db.redemptions.filter((r) => r.student_id === s.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    return `<div class="stack">
      <section class="card card-pad balance"><div><p class="muted" style="font-size:15px">Сурагчийн оноо</p><p class="balance-num num" style="font-size:32px">${pts.balance}</p></div>
        <p class="num muted small">Цуглуулсан ${pts.earned} · Зарцуулсан ${pts.spent}</p></section>
      <div class="alert info">Даалгавар бүрийн оноог «Даалгавар» табаас засна. Шагнал бол эцэг эх, багштай тохиролцох урамшуулал бөгөөд сайт өөрөө юм худалдаж өгөхгүй.</div>
      <section class="card">
        <div class="card-head"><h2>Шагналын жагсаалт</h2><button type="button" class="btn btn-primary btn-sm" data-action="edit" data-key="reward:new">${icon("plus", "sm")}Шагнал нэмэх</button></div>
        <div class="card-body">
          ${ui.editing === "reward:new" ? `<div class="card-pad" style="border-bottom:1px solid var(--line)">${rewardForm(s, null)}</div>` : ""}
          <ul class="list">${list.map((r) => `<li>${ui.editing === "reward:" + r.id ? `<div class="card-pad">${rewardForm(s, r)}</div>` : `
            <div class="list-row"${r.active ? "" : ' style="opacity:.6"'}>
              <span class="reward-icon small">${icon(r.icon)}</span>
              <div class="grow"><p class="strong">${esc(r.title)}${r.active ? "" : ' <span class="muted small" style="font-weight:400">· нуусан</span>'}</p><p class="num muted small">${r.cost} оноо</p></div>
              <button type="button" class="icon-btn" id="er-${r.id}" data-action="edit" data-key="reward:${r.id}" aria-label="${esc(r.title)} засах">${icon("pencil", "sm")}</button>
              <button type="button" class="btn btn-ghost btn-sm" data-action="toggle-reward" data-id="${r.id}">${r.active ? "Нуух" : "Харуулах"}</button>
            </div>`}</li>`).join("")}</ul>
          ${list.length || ui.editing === "reward:new" ? "" : empty("Шагнал алга", "«Шагнал нэмэх» товчоор эхлүүлнэ үү.")}
        </div>
      </section>
      <section class="card"><div class="card-head"><h2>Сурагчийн авсан шагналууд</h2></div>
        ${got.length ? `<ul class="list card-body">${got.map((r) => `<li class="list-row"><span class="grow">${esc(r.title)}</span><span class="num muted small">${formatShort(r.created_at.slice(0, 10))} · −${r.cost}</span></li>`).join("")}</ul>`
          : '<p class="muted" style="padding:8px 20px 20px;font-size:15px">Одоогоор шагнал аваагүй.</p>'}</section>
    </div>`;
  }

  function tNotes(s) {
    const t = today(), tm = addDays(t, 1), u = me();
    const notes = db.teacher_notes.filter((n) => n.student_id === s.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    return `<div class="stack">
      <section class="card card-pad">
        <form class="form" data-form="goals" data-sid="${s.id}" novalidate>
          <div><h2 style="font-size:17px">Өдрийн жижиг зорилго</h2><p class="muted small" style="margin-top:2px">Сурагч болон эцэг эхийн нүүр хуудсанд харагдана.</p></div>
          ${field(`Өнөөдөр · ${formatShort(t)}`, "goal-t", `<input class="input" id="goal-t" name="today" data-draft="goal:${s.id}:${t}" maxlength="140" placeholder="Жишээ нь: Хоёр өгүүлбэр бие даан бичих" value="${esc(draft(`goal:${s.id}:${t}`, dayGoal(s.id, t)))}">`)}
          ${field(`Маргааш · ${formatShort(tm)}`, "goal-n", `<input class="input" id="goal-n" name="tomorrow" data-draft="goal:${s.id}:${tm}" maxlength="140" value="${esc(draft(`goal:${s.id}:${tm}`, dayGoal(s.id, tm)))}">`)}
          <div class="form-foot">${saveStatus("goals")}<button type="submit" class="btn btn-primary btn-sm">Зорилго хадгалах</button></div>
        </form>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>Багшийн тэмдэглэл</h2><p>Сурагч харахгүй. Хуваалцсан тэмдэглэлийг эцэг эх харна.</p></div></div>
        <form class="form card-pad" data-form="tnote" data-sid="${s.id}" novalidate>
          <label for="tn-body" class="sr-only">Шинэ тэмдэглэл</label>
          <textarea class="input" id="tn-body" name="body" data-draft="tn:${s.id}" maxlength="1000" placeholder="Ахиц, ажиглалт, дараагийн алхам">${esc(draft(`tn:${s.id}`, ""))}</textarea>
          <div class="form-foot">
            <label class="choice"><input type="checkbox" name="share" data-draft="tn:${s.id}:share" ${draft(`tn:${s.id}:share`, true) ? "checked" : ""}><span>Эцэг эхтэй хуваалцах</span></label>
            <div class="row">${saveStatus("tnote")}<button type="submit" class="btn btn-primary btn-sm">Нэмэх</button></div>
          </div>
        </form>
        ${notes.length ? `<ul class="list" style="border-top:1px solid var(--line)">${notes.map((n) => `
          <li class="list-row" style="align-items:flex-start">
            <div class="grow"><p style="white-space:pre-wrap;font-size:15px">${esc(n.body)}</p><p class="muted xs" style="margin-top:4px">${formatLong(n.log_date)} · ${n.share_with_guardian ? "Эцэг эхтэй хуваалцсан" : "Зөвхөн багш"}</p></div>
            ${n.author_id === u.id ? `<button type="button" class="icon-btn danger" data-action="del-note" data-id="${n.id}" aria-label="Тэмдэглэл устгах">${icon("trash", "sm")}</button>` : ""}
          </li>`).join("")}</ul>` : '<p class="muted" style="padding:16px 20px;border-top:1px solid var(--line);font-size:15px">Тэмдэглэл алга.</p>'}
      </section>
    </div>`;
  }

  function tSettings(s) {
    const e = ui.errors.settings || {};
    return `<section class="card card-pad">
      <h2 style="font-size:17px">Зорилго ба хязгаар</h2>
      <form class="form" data-form="settings" data-sid="${s.id}" novalidate style="margin-top:16px">
        <div class="grid-2">
          ${field("Өдрийн зорилго, %", "st-goal", `<input class="input" id="st-goal" name="goal" data-draft="st:${s.id}:goal" type="number" inputmode="numeric" value="${esc(draft(`st:${s.id}:goal`, s.goal_pct))}" ${e.goal ? 'aria-invalid="true"' : ""}>`, { error: e.goal, hint: "Эхэндээ бага зорилгоос эхэлж, аажмаар нэмнэ" })}
          ${field("Дэлгэцийн өдрийн хязгаар, минут", "st-lim", `<input class="input" id="st-lim" name="limit" data-draft="st:${s.id}:limit" type="number" inputmode="numeric" value="${esc(draft(`st:${s.id}:limit`, s.screen_limit_min))}" ${e.limit ? 'aria-invalid="true"' : ""}>`, { error: e.limit, hint: "Гэр бүлтэй тохирсон хэмжээ" })}
        </div>
        <div class="form-foot">${saveStatus("settings")}<button type="submit" class="btn btn-primary btn-sm">Хадгалах</button></div>
      </form>
    </section>`;
  }

  /* ---------- Эцэг эх ---------- */
  function childPicker(kids, child, base) {
    if (kids.length < 2) return "";
    return `<div class="pills" role="radiogroup" aria-label="Хүүхэд сонгох">${kids.map((k) =>
      `<a class="pill-btn outlined" role="radio" aria-checked="${k.id === child.id}" aria-pressed="${k.id === child.id}" href="#${base}?c=${k.id}">${esc(k.full_name)}</a>`).join("")}</div>`;
  }
  function viewParentToday(params) {
    const kids = myStudents(), child = kids.find((k) => k.id === params.get("c")) || kids[0];
    if (!child) return `<div class="card">${empty("Хүүхдийн бүртгэл холбогдоогүй байна", "Анги удирдсан багшид хандана уу.")}</div>`;
    const t = today(), date = params.get("d") === "y" ? addDays(t, -1) : t;
    const p = progress(child.id, date), goal = dayGoal(child.id, date), snote = studentNote(child.id, date);
    const notes = db.teacher_notes.filter((n) => n.student_id === child.id && n.share_with_guardian).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
    const q = (d) => `#/p?c=${child.id}${d ? "&d=y" : ""}`;
    return `${childPicker(kids, child, "/p")}
    <div class="stack">
      <header class="page-head" style="margin:0"><p class="eyebrow">${esc(child.full_name)}</p><h1>${date === t ? "Өнөөдрийн бүртгэл" : formatLong(date)}</h1>
        <div class="row" style="margin-top:10px">
          <a class="pill-btn outlined" href="${q(false)}" aria-pressed="${date === t}">Өнөөдөр</a>
          <a class="pill-btn outlined" href="${q(true)}" aria-pressed="${date !== t}">Өчигдөр</a>
        </div></header>
      <section class="card card-pad">
        <div class="row between" style="align-items:baseline"><p class="strong">Даалгаврын биелэлт</p><p class="num muted" style="font-size:15px">${p.done}/${p.total} · ${p.pct}%</p></div>
        <div style="margin-top:12px">${progressBar(p.pct, "Даалгаврын биелэлт")}</div>
        ${p.help ? `<p class="bad-text" style="margin-top:12px;font-size:15px">${p.help} даалгаварт дэмжлэг хэрэгтэй гэж тэмдэглэсэн.</p>` : ""}
        ${goal ? `<p class="row" style="margin-top:16px;align-items:flex-start;flex-wrap:nowrap;font-size:15px"><span class="group-icon">${icon("target")}</span><span><span class="muted">Жижиг зорилго: </span>${esc(goal)}</span></p>` : ""}
        ${snote ? `<p class="note-box" style="margin-top:16px"><span class="muted">Хүүхдийн тэмдэглэл: </span>${esc(snote)}</p>` : ""}
      </section>
      <section class="card"><div class="card-head"><div><h2>Даалгавар</h2><p>Хүүхэд өөрөө тэмдэглэнэ</p></div></div>
        <div class="card-body">${p.total ? taskGroups(child.id, date, false) : empty("Даалгавар оноогдоогүй байна")}</div></section>
      ${homeForm(child, date)}
      <section class="card"><div class="card-head"><h2>Багшийн тэмдэглэл</h2></div>
        ${notes.length ? `<ul class="list card-body">${notes.map((n) => `<li class="list-row" style="align-items:flex-start"><span class="muted">${icon("message")}</span>
          <div class="grow"><p style="white-space:pre-wrap;font-size:15px">${esc(n.body)}</p><p class="muted xs" style="margin-top:4px">${formatLong(n.log_date)}</p></div></li>`).join("")}</ul>`
          : '<p class="muted" style="padding:8px 20px 20px;font-size:15px">Одоогоор тэмдэглэл алга.</p>'}</section>
    </div>`;
  }
  function homeForm(child, date) {
    const h = homeLog(child.id, date) || {}, k = `hl:${child.id}:${date}`, e = ui.errors[k] || {}, editable = isEditable(date);
    const dv = (name, fb) => draft(`${k}:${name}`, fb);
    const scr = h.screen_minutes;
    return `<section class="card">
      <div class="card-head"><div><h2>Гэрийн хяналтын хуудас</h2><p>${formatShort(date)} · Дэлгэцийн хязгаар ${child.screen_limit_min} мин</p></div></div>
      <form class="form card-pad" data-form="home" data-sid="${child.id}" data-date="${date}" novalidate style="gap:20px">
        <fieldset ${editable ? "" : "disabled"} style="border:0;margin:0;padding:0;display:grid;gap:20px">
          <div class="field"><span class="label">Дэлгэцийн нийт хэрэглээ</span>
            <div class="row"><input class="input w-sm" aria-label="Цаг" name="h" data-draft="${k}:h" type="number" inputmode="numeric" value="${esc(dv("h", scr == null ? "" : Math.floor(scr / 60)))}" ${e.screen ? 'aria-invalid="true"' : ""}><span class="muted">цаг</span>
              <input class="input w-sm" aria-label="Минут" name="m" data-draft="${k}:m" type="number" inputmode="numeric" value="${esc(dv("m", scr == null ? "" : scr % 60))}" ${e.screen ? 'aria-invalid="true"' : ""}><span class="muted">минут</span></div>
            ${e.screen ? `<p class="error-text" role="alert">${e.screen}</p>` : '<p class="hint">Эхний долоо хоногт бодит хугацааг тэмдэглээд, дараа нь хамтдаа тохирно.</p>'}</div>
          <div class="field"><label for="hl-move">Хөдөлгөөн</label>
            <div class="row"><input class="input w-sm" id="hl-move" name="move" data-draft="${k}:move" type="number" inputmode="numeric" value="${esc(dv("move", h.movement_minutes ?? ""))}" ${e.move ? 'aria-invalid="true"' : ""}><span class="muted">минут</span></div>
            ${e.move ? `<p class="error-text" role="alert">${e.move}</p>` : ""}</div>
          <div class="field"><span class="label">Ариун цэвэр</span><div class="row">
            ${[["hm", "hygiene_morning", "Өглөө"], ["he", "hygiene_evening", "Орой"], ["hr", "hygiene_reminded", "Сануулгатай"]].map(([n, f, l]) =>
              `<label class="choice"><input type="checkbox" name="${n}" data-draft="${k}:${n}" ${dv(n, !!h[f]) ? "checked" : ""}><span>${l}</span></label>`).join("")}</div></div>
          <div class="field"><span class="label">Дэлгэцгүй үйл ажиллагаа</span><div class="row">
            ${OFFSCREEN.map(([id, l]) => `<label class="choice"><input type="checkbox" name="act" value="${id}" data-draft="${k}:act:${id}" ${dv("act:" + id, (h.offscreen || []).includes(id)) ? "checked" : ""}><span>${l}</span></label>`).join("")}</div></div>
          ${field("Гэрийн жижиг ажил", "hl-chore", `<input class="input" id="hl-chore" name="chore" data-draft="${k}:chore" maxlength="160" placeholder="Жишээ нь: аяга угаасан" value="${esc(dv("chore", h.chore || ""))}">`)}
          <div class="field"><span class="label" id="mood-l">Сэтгэл санаа</span><div class="row" role="radiogroup" aria-labelledby="mood-l">
            ${MOODS.map(([id, l]) => `<label class="choice"><input type="radio" name="mood" value="${id}" data-draft="${k}:mood:${id}" ${dv("mood:" + id, h.mood === id) ? "checked" : ""}><span>${l}</span></label>`).join("")}</div></div>
          ${field("Нойр, ажиглалт", "hl-sleep", `<textarea class="input" id="hl-sleep" name="sleep" data-draft="${k}:sleep" maxlength="500" placeholder="Жишээ нь: 21:30-д унтсан, өглөө эрч хүчтэй">${esc(dv("sleep", h.sleep_note || ""))}</textarea>`)}
        </fieldset>
        <div class="form-foot" style="border-top:1px solid var(--line);padding-top:16px">
          ${editable ? saveStatus(k) + '<button type="submit" class="btn btn-primary">Хадгалах</button>' : '<p class="muted small">7 хоногоос өмнөх хуудсыг засах боломжгүй.</p>'}
        </div>
      </form>
    </section>`;
  }
  function viewParentWeek(params) {
    const kids = myStudents(), child = kids.find((k) => k.id === params.get("c")) || kids[0];
    if (!child) return `<div class="card">${empty("Хүүхдийн бүртгэл холбогдоогүй байна")}</div>`;
    const t = today();
    const obs = db.home_logs.filter((h) => h.student_id === child.id && h.log_date >= addDays(t, -6) && (h.mood || h.sleep_note)).sort((a, b) => b.log_date.localeCompare(a.log_date));
    return `${childPicker(kids, child, "/p/week")}${pageHead("Сүүлийн 7 хоног", child.full_name)}
    <div class="stack">
      <section class="card" style="padding-top:8px">${weekTable(child)}</section>
      <section class="card"><div class="card-head"><h2>Нойр, сэтгэл санааны ажиглалт</h2></div>
        ${obs.length ? `<ul class="list card-body">${obs.map((h) => `<li style="padding:12px 20px;font-size:15px"><span class="muted">${formatShort(h.log_date)} · ${(MOODS.find((m) => m[0] === h.mood) || [0, "—"])[1]}</span>${h.sleep_note ? `<p>${esc(h.sleep_note)}</p>` : ""}</li>`).join("")}</ul>`
          : '<p class="muted" style="padding:8px 20px 20px;font-size:15px">Энэ долоо хоногт ажиглалт бичигдээгүй байна.</p>'}</section>
    </div>`;
  }

  /* ================= 8. ЧИГЛҮҮЛЭЛТ БА ҮЙЛДЛҮҮД ================= */

  const app = document.getElementById("app");

  function route() {
    const h = location.hash.replace(/^#/, "") || "/";
    const [path, query] = h.split("?");
    return { path, params: new URLSearchParams(query || "") };
  }
  function go(path) { if (location.hash === "#" + path) render(); else location.hash = "#" + path; }

  /** Бичиж буй утгуудыг дахин зурахаас өмнө хадгална (алдагдахгүй) */
  function captureDrafts() {
    app.querySelectorAll("[data-draft]").forEach((el) => {
      if (el.type === "checkbox" || el.type === "radio") ui.drafts[el.dataset.draft] = el.checked;
      else ui.drafts[el.dataset.draft] = el.value;
    });
  }

  function render() {
    const focusedId = document.activeElement && document.activeElement.id;
    const user = me();
    const { path, params } = route();

    if (!user) {
      if (path !== "/login") { history.replaceState(null, "", "#/login"); }
      app.innerHTML = viewLogin();
    } else {
      // Өөр role-ийн хуудас руу URL-аар орох гэвэл өөрийн нүүр рүү буцаана
      const home = ROLES[user.role].home;
      if (!(path === home || path.startsWith(home + "/"))) { history.replaceState(null, "", "#" + home); return render(); }
      let content;
      if (user.role === "student") {
        const m = path.match(/^\/s\/day\/(\d{4}-\d{2}-\d{2})$/);
        content = path === "/s/rewards" ? viewStudentRewards()
          : path === "/s/schedule" ? viewStudentSchedule()
          : path === "/s/history" ? viewStudentHistory()
          : viewStudentDay(m && m[1] <= today() ? m[1] : today());
      } else if (user.role === "teacher") {
        const m = path.match(/^\/t\/student\/([\w-]+)$/);
        content = m ? viewTeacherStudent(m[1], params.get("tab") || "overview") : viewTeacherHome();
      } else {
        content = path === "/p/week" ? viewParentWeek(params) : viewParentToday(params);
      }
      app.innerHTML = shell(user, path, content);
    }
    if (focusedId) { const el = document.getElementById(focusedId); if (el) el.focus({ preventScroll: true }); }
    const dlg = document.getElementById("dlg-cancel"); if (dlg) dlg.focus();
  }

  window.addEventListener("hashchange", () => {
    captureDrafts();
    // Хуудас солигдоход түр төлвийг цэвэрлэнэ
    ui.status = {}; ui.errors = {}; ui.editing = null; ui.pickReward = null;
    if (!location.hash.includes("tab=schedule")) ui.schedule = null;
    render();
    window.scrollTo(0, 0);
  });

  /* ---- товч дарах ---- */
  document.addEventListener("click", (ev) => {
    const el = ev.target.closest("[data-action]");
    if (!el || !app.contains(el)) return;
    captureDrafts();  // бичсэн утгуудыг санаад дараа нь үйлдлээ хийнэ
    const a = el.dataset.action, id = el.dataset.id;
    if (el.dataset.self && ev.target !== el) return;  // dialog-ийн дотор дарахад хаахгүй

    switch (a) {
      case "theme": setTheme(currentTheme() === "dark" ? "light" : "dark"); render(); break;
      case "pick-role": ui.loginRole = el.dataset.role; ui.loginError = ""; render(); break;
      case "toggle-pw": ui.showPw = !ui.showPw; render(); break;
      case "demo-login": {
        const acc = DEMO_ACCOUNTS.find((x) => x.role === ui.loginRole);
        if (acc) { ui.loginId = acc.username; ui.loginError = signIn(ui.loginRole, acc.username, acc.password) || ""; if (ui.loginError) render(); }
        break;
      }
      case "reset-ask": ui.resetConfirm = true; render(); break;
      case "reset-no": ui.resetConfirm = false; render(); break;
      case "reset-yes": resetDemo(); ui.resetConfirm = false; ui.resetDone = true; ui.drafts = {}; render(); break;
      case "logout": setSession(null); ui.loginRole = null; ui.loginId = ""; ui.drafts = {}; go("/login"); break;

      case "toggle-group": { const k = el.dataset.key; ui.open[k] = el.getAttribute("aria-expanded") !== "true"; render(); break; }
      case "task": {
        const s = myStudents()[0], { path } = route(), m = path.match(/\/s\/day\/(.+)$/), date = m ? m[1] : today();
        attempt("task", () => setTaskStatus(s.id, id, date, el.dataset.status || null));
        render(); break;
      }

      case "pick-reward": ui.pickReward = id; ui.status.reward = null; render(); break;
      case "close-dialog": ui.pickReward = null; render(); break;
      case "confirm-reward": {
        try { const r = redeem(id); ui.status.reward = { ok: true, text: `«${r.title}» шагналыг авлаа. Эцэг эх эсвэл багштайгаа тохиролцоорой.` }; }
        catch (e) { ui.status.reward = { ok: false, text: e.message }; }
        ui.pickReward = null; render(); break;
      }

      case "tab": {
        const { path } = route();
        location.hash = `#${path}?tab=${el.dataset.tab}`; break;
      }
      case "edit": ui.editing = el.dataset.key; ui.errors = {}; render(); break;
      case "cancel-edit": clearDrafts("tf:"); clearDrafts("rf:"); ui.editing = null; ui.errors = {}; render(); break;
      case "toggle-task":
        attempt("taskEdit", () => mutate((d) => { const t = d.tasks.find((x) => x.id === id); need(!!t && isTeacherOf(t.student_id)); t.active = !t.active; }));
        render(); break;
      case "toggle-reward":
        attempt("rewardEdit", () => mutate((d) => { const r = d.rewards.find((x) => x.id === id); need(!!r && isTeacherOf(r.student_id)); r.active = !r.active; }));
        render(); break;
      case "sched-add":
        ui.schedule.rows.push({ id: uid("new"), student_id: ui.schedule.sid, start_time: "", period: "", activity: "", sort: 999 });
        delete ui.status.schedule; render();
        { const rows = app.querySelectorAll(".sched-edit input[type=time]"); rows[rows.length - 1]?.focus(); }
        break;
      case "sched-del":
        ui.schedule.rows = ui.schedule.rows.filter((r) => r.id !== id);
        if (!id.startsWith("new-")) ui.schedule.removed.push(id);
        delete ui.status.schedule; render(); break;
      case "del-note":
        attempt("tnote", () => mutate((d) => { const n = d.teacher_notes.find((x) => x.id === id); need(!!n && n.author_id === me().id); d.teacher_notes = d.teacher_notes.filter((x) => x.id !== id); }));
        delete ui.status.tnote; render(); break;
    }
  });

  /* ---- форм илгээх ---- */
  document.addEventListener("submit", (ev) => {
    const f = ev.target;
    if (!app.contains(f)) return;
    ev.preventDefault();
    captureDrafts();
    const fd = new FormData(f), sid = f.dataset.sid;
    const int = (v) => (v === "" || v == null ? null : Number(v));
    const isInt = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;

    switch (f.dataset.form) {
      case "login":
        ui.loginId = fd.get("username"); ui.loginPw = fd.get("password");
        ui.loginError = signIn(ui.loginRole, ui.loginId, ui.loginPw) || "";
        if (ui.loginError) render();
        break;

      case "note": {
        const date = f.dataset.date, key = `note:${sid}:${date}`, text = f.querySelector("textarea").value.trim();
        if (attempt(key, () => mutate((d) => {
          need(isSelf(sid) && isEditable(date));
          upsert(d.student_notes, (n) => n.student_id === sid && n.log_date === date, { student_id: sid, log_date: date, note: text });
        }))) delete ui.drafts[key];
        render(); break;
      }

      case "home": {
        const date = f.dataset.date, k = `hl:${sid}:${date}`;
        const h = int(fd.get("h")), m = int(fd.get("m")), mv = int(fd.get("move")), err = {};
        if ((h != null && !isInt(h, 0, 16)) || (m != null && !isInt(m, 0, 59))) err.screen = "Цаг 0–16, минут 0–59 бүхэл тоо байна.";
        if (mv != null && !isInt(mv, 0, 600)) err.move = "0–600 минутын бүхэл тоо.";
        ui.errors[k] = err;
        if (!Object.keys(err).length) {
          const row = {
            student_id: sid, log_date: date,
            screen_minutes: h == null && m == null ? null : (h || 0) * 60 + (m || 0), movement_minutes: mv,
            offscreen: fd.getAll("act"), chore: String(fd.get("chore") || "").trim(),
            hygiene_morning: fd.get("hm") === "on", hygiene_evening: fd.get("he") === "on", hygiene_reminded: fd.get("hr") === "on",
            mood: fd.get("mood") || null, sleep_note: String(fd.get("sleep") || "").trim(),
          };
          if (attempt(k, () => mutate((d) => { need(isGuardianOf(sid) && isEditable(date)); upsert(d.home_logs, (x) => x.student_id === sid && x.log_date === date, row); }))) clearDrafts(k + ":");
        }
        render(); break;
      }

      case "task": {
        const id = f.dataset.id, k = id || "new", min = int(fd.get("minutes")), pts = int(fd.get("points")), title = String(fd.get("title") || "").trim(), err = {};
        if (!title) err.title = "Нэрийг бичнэ үү.";
        if (min == null || !isInt(min, 0, 180)) err.minutes = "0–180 минутын бүхэл тоо оруулна уу.";
        if (pts == null || !isInt(pts, 0, 100)) err.points = "0–100 хооронд бүхэл тоо.";
        ui.errors["task:" + k] = err;
        if (!Object.keys(err).length) {
          const v = { title, description: String(fd.get("description") || "").trim(), category: fd.get("category"), slot: fd.get("slot"), minutes: min, points: pts };
          const ok = attempt("taskEdit", () => mutate((d) => {
            need(isTeacherOf(sid));
            if (id) Object.assign(d.tasks.find((t) => t.id === id), v);
            else d.tasks.push({ id: uid("t"), student_id: sid, sort: 1000, active: true, ...v });
          }));
          if (ok) { ui.editing = null; clearDrafts(`tf:${k}:`); delete ui.status.taskEdit; }
        }
        render(); break;
      }

      case "reward": {
        const id = f.dataset.id, k = id || "new", cost = int(fd.get("cost")), title = String(fd.get("title") || "").trim(), err = {};
        if (!title) err.title = "Нэрийг бичнэ үү.";
        if (cost == null || !isInt(cost, 1, 10000)) err.cost = "1–10000 хооронд бүхэл тоо.";
        ui.errors["reward:" + k] = err;
        if (!Object.keys(err).length) {
          const v = { title, description: String(fd.get("description") || "").trim(), icon: fd.get("icon"), cost };
          const ok = attempt("rewardEdit", () => mutate((d) => {
            need(isTeacherOf(sid));
            if (id) Object.assign(d.rewards.find((r) => r.id === id), v);
            else d.rewards.push({ id: uid("w"), student_id: sid, active: true, sort: 100, ...v });
          }));
          if (ok) { ui.editing = null; clearDrafts(`rf:${k}:`); }
        }
        render(); break;
      }

      case "schedule": {
        const rows = ui.schedule.rows.map((r) => ({
          ...r, start_time: ui.drafts[`sc:${r.id}:time`] ?? r.start_time ?? "",
          period: String(ui.drafts[`sc:${r.id}:period`] ?? r.period).trim(), activity: String(ui.drafts[`sc:${r.id}:activity`] ?? r.activity).trim(),
        }));
        if (rows.some((r) => !r.activity)) { ui.errors.schedule = "Үйл ажиллагааны нүд хоосон мөр байна."; render(); break; }
        ui.errors.schedule = null;
        rows.sort((a, b) => (a.start_time || "99").localeCompare(b.start_time || "99")).forEach((r, i) => { r.sort = (i + 1) * 10; if (r.id.startsWith("new-")) r.id = uid("r"); });
        if (attempt("schedule", () => mutate((d) => { need(isTeacherOf(sid)); d.schedule = d.schedule.filter((r) => r.student_id !== sid).concat(rows); }))) {
          clearDrafts("sc:"); ui.schedule = null;
        }
        render(); break;
      }

      case "goals": {
        const t = today(), tm = addDays(t, 1);
        const set = (d, date, goal) => {
          d.day_goals = d.day_goals.filter((g) => !(g.student_id === sid && g.log_date === date));
          if (goal) d.day_goals.push({ student_id: sid, log_date: date, goal });
        };
        if (attempt("goals", () => mutate((d) => { need(isTeacherOf(sid)); set(d, t, String(fd.get("today")).trim()); set(d, tm, String(fd.get("tomorrow")).trim()); }))) clearDrafts(`goal:${sid}:`);
        render(); break;
      }

      case "tnote": {
        const body = String(fd.get("body") || "").trim();
        if (!body) break;
        if (attempt("tnote", () => mutate((d) => {
          need(isTeacherOf(sid));
          d.teacher_notes.push({ id: uid("n"), student_id: sid, author_id: me().id, log_date: today(), body, share_with_guardian: fd.get("share") === "on", created_at: new Date().toISOString() });
        }))) clearDrafts(`tn:${sid}`);
        render(); break;
      }

      case "settings": {
        const g = int(fd.get("goal")), l = int(fd.get("limit")), err = {};
        if (g == null || !isInt(g, 10, 100)) err.goal = "10–100 хооронд бүхэл тоо.";
        if (l == null || !isInt(l, 0, 600)) err.limit = "0–600 минутын хооронд.";
        ui.errors.settings = err;
        if (!Object.keys(err).length && attempt("settings", () => mutate((d) => { need(isTeacherOf(sid)); Object.assign(d.students.find((s) => s.id === sid), { goal_pct: g, screen_limit_min: l }); }))) clearDrafts(`st:${sid}:`);
        render(); break;
      }
    }
  });

  /* ---- нэвтрэх талбарт бичихэд утгыг санана ---- */
  document.addEventListener("input", (ev) => {
    if (ev.target.id === "login-id") ui.loginId = ev.target.value;
    if (ev.target.id === "login-pw") ui.loginPw = ev.target.value;
    // Утга өөрчлөгдвөл «Хадгалагдсан» гэсэн хуучин мэдэгдлийг арилгана
    const form = ev.target.closest("form");
    if (form && form.dataset.form === "note") { const k = `note:${form.dataset.sid}:${form.dataset.date}`; if (ui.status[k]?.ok) { delete ui.status[k]; const s = form.querySelector(".save-status"); if (s) { s.className = "save-status"; s.textContent = ""; } } }
  });

  /* ---- Esc дарахад dialog хаагдана ---- */
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && ui.pickReward) { ui.pickReward = null; render(); }
  });

  // Өдөр солигдоход (шөнө 00:00) дахин зурна
  let lastDay = today();
  setInterval(() => { if (today() !== lastDay) { lastDay = today(); render(); } }, 60000);

  render();
})();
