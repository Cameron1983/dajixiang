const RULES = {
  1: { title: "不剪", level: "bad", reason: "生命短" },
  2: { title: "不剪", level: "bad", reason: "病多、麻烦多" },
  3: { title: "宜剪", level: "good", reason: "变成富裕人家" },
  4: { title: "宜剪", level: "good", reason: "怀业增广、气色好" },
  5: { title: "宜剪", level: "good", reason: "增长财物" },
  6: { title: "不剪", level: "bad", reason: "气色转衰" },
  7: { title: "不剪", level: "bad", reason: "易招闲言、麻烦多" },
  8: { title: "大吉", level: "great", reason: "长寿" },
  9: { title: "慎择", level: "caution", reason: "易遇年轻女子" },
  10: { title: "宜剪", level: "good", reason: "增长快乐" },
  11: { title: "宜剪", level: "good", reason: "增长出世间智慧与世间聪明" },
  12: { title: "不剪", level: "bad", reason: "招病、生命危险" },
  13: { title: "大吉", level: "great", reason: "精进佛法，最好" },
  14: { title: "宜剪", level: "good", reason: "东西增多" },
  15: { title: "大吉", level: "great", reason: "增上福报" },
  16: { title: "不剪", level: "bad", reason: "得病" },
  17: { title: "不剪", level: "bad", reason: "容易失明、皮肤变绿" },
  18: { title: "不剪", level: "bad", reason: "丢失财物" },
  19: { title: "宜剪", level: "good", reason: "佛法增长" },
  20: { title: "不剪", level: "bad", reason: "容易挨饿，不好" },
  21: { title: "不剪", level: "bad", reason: "易招传染病" },
  22: { title: "不剪", level: "bad", reason: "病情加重" },
  23: { title: "宜剪", level: "good", reason: "家族富裕" },
  24: { title: "不剪", level: "bad", reason: "遇传染病" },
  25: { title: "不剪", level: "bad", reason: "得沙眼、出迎风泪" },
  26: { title: "宜剪", level: "good", reason: "得安乐" },
  27: { title: "大吉", level: "great", reason: "吉祥" },
  28: { title: "不剪", level: "bad", reason: "易发生打架" },
  29: { title: "不剪", level: "bad", reason: "掉魂、声音变哑" },
  30: { title: "不剪", level: "bad", reason: "预见争讼及死人" }
};

const DAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];
const CN_DAYS = [
  "", "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九", "三十"
];

const MONTH_NAMES = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

const MONTHLY_SPECIAL_DAYS = {
  8: ["药师佛日", "度母日"],
  10: ["莲师日", "荟供日"],
  15: ["阿弥陀佛日", "满月"],
  25: ["空行母日", "荟供日"],
  29: ["护法日"],
  30: ["释迦牟尼佛日", "新月"]
};

const ANNUAL_SPECIAL_DAYS = [
  { month: 1, from: 1, to: 15, title: "神变月" },
  { month: 1, day: 15, title: "神变节" },
  { month: 4, day: 15, title: "萨嘎达瓦节" },
  { month: 6, day: 4, title: "转法轮日" },
  { month: 9, day: 22, title: "天降日" },
  { month: 12, day: 29, title: "除障护法日" }
];

const state = {
  selectedDate: startOfDay(new Date()),
  visibleMonth: startOfMonth(new Date())
};

const $ = (selector) => document.querySelector(selector);

function gregorianToJD(year, month, day) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

function jdToGregorian(jd) {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = Math.floor(b - d - Math.floor(30.6001 * e) + f);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { year, month, day };
}

// Local, self-contained Phugpa Tibetan calendar conversion adapted from
// @hnw/date-tibetan (MIT), based on Svante Janson's Tibetan calendar mathematics.
class CalendarTibetan {
  constructor(cycle, year, month, leapMonth, day, leapDay) {
    this._M0 = 2015501 + 4783 / 5656;
    this._M1 = 167025 / 5656;
    this._M2 = 11135 / 11312;
    this._S0 = 743 / 804;
    this._S1 = 65 / 804;
    this._S2 = 13 / 4824;
    this._A0 = 475 / 3528;
    this._A1 = 253 / 3528;
    this._A2 = 1 / 28;
    this._P0 = 139 / 180;
    this._EPOCH_YEAR = 806;
    this._JD_OFFSET_STD_TIME = (6 + 4 / 60) / 24;
    this._JD_OFFSET_DAY_START = 7 / 24;
    this._IS_BHUTAN_LEAP = false;
    this._EPOCH_RAB_BYUNG = 1027;
    this._moon_tab_values = [0, 5, 10, 15, 19, 22, 24, 25];
    this._sun_tab_values = [0, 6, 10, 11];
    this.set(cycle, year, month, leapMonth, day, leapDay);
  }

  set(cycle, year, month, leapMonth, day, leapDay) {
    if (Array.isArray(cycle)) {
      [this.cycle, this.year, this.month, this.leapMonth, this.day, this.leapDay] = cycle;
      this.leapMonth = !!this.leapMonth;
      this.leapDay = !!this.leapDay;
    } else {
      this.cycle = cycle;
      this.year = year;
      this.month = month;
      this.leapMonth = !!leapMonth;
      this.day = day;
      this.leapDay = !!leapDay;
    }
    return this;
  }

  get() {
    return [this.cycle, this.year, this.month, this.leapMonth, this.day, this.leapDay];
  }

  _jdToJdLocal(jd) {
    return jd + this._JD_OFFSET_STD_TIME + this._JD_OFFSET_DAY_START;
  }

  _jdLocalToJd(jdLocal) {
    return jdLocal - this._JD_OFFSET_STD_TIME - this._JD_OFFSET_DAY_START;
  }

  _getAlpha() {
    return 12 * (this._S0 - this._P0);
  }

  _getBeta() {
    return Math.ceil(67 * this._getAlpha()) - (this._IS_BHUTAN_LEAP ? 2 : 0);
  }

  _getGregorianYear() {
    return this._EPOCH_RAB_BYUNG + (this.cycle - 1) * 60 + (this.year - 1);
  }

  epochCycleFromYear(gyear) {
    return {
      cycle: Math.floor((gyear - this._EPOCH_RAB_BYUNG) / 60) + 1,
      year: ((gyear - this._EPOCH_RAB_BYUNG) % 60) + 1
    };
  }

  _isLeapMonthFromYearAndMonth(year, month) {
    const mPrime = 12 * (year - this._EPOCH_YEAR) + month;
    const mod = (mPrime * 2 - this._getBeta()) % 65;
    return mod === 0 || mod === 1;
  }

  _getTrueMonthCount(gyear) {
    const year = gyear || this._getGregorianYear();
    const mPrime = 12 * (year - this._EPOCH_YEAR) + this.month;
    const n = Math.floor((67 * (mPrime - this._getAlpha())) / 65);
    if (this._isLeapMonthFromYearAndMonth(year, this.month) && this.leapMonth) {
      return n + (this._IS_BHUTAN_LEAP ? 1 : -1);
    }
    return n;
  }

  _getTibetanMonthFromTrueMonthCount(trueMonthCount) {
    const x = Math.ceil((65 * trueMonthCount + this._getBeta()) / 67);
    let month = x % 12;
    if (month === 0) month = 12;
    const year = (x - month) / 12 + this._EPOCH_YEAR;
    const leapX = Math.ceil((65 * (this._IS_BHUTAN_LEAP ? trueMonthCount - 1 : trueMonthCount + 1) + this._getBeta()) / 67);
    const { cycle, year: rabYear } = this.epochCycleFromYear(year);
    return { cycle, year: rabYear, month, leapMonth: x === leapX };
  }

  _linearInterpolate(value, table, half, period) {
    let x = value % period;
    if (x < 0) x += period;
    let sign = 1;
    const symmetry = half * 2;
    if (x >= symmetry) {
      sign = -1;
      x -= symmetry;
    }
    if (x > half) x = symmetry - x;
    const i = Math.floor(x);
    const fraction = x - i;
    const next = Math.min(i + 1, table.length - 1);
    return sign * (table[i] * (1 - fraction) + table[next] * fraction);
  }

  getTrueDate(trueMonthCount, lunarDay) {
    const meanDate = trueMonthCount * this._M1 + lunarDay * this._M2 + this._M0;
    let meanSun = trueMonthCount * this._S1 + lunarDay * this._S2 + this._S0;
    meanSun -= Math.floor(meanSun);
    let moonAnomaly = trueMonthCount * this._A1 + lunarDay * this._A2 + this._A0;
    moonAnomaly -= Math.floor(moonAnomaly);
    let sunAnomaly = meanSun - 1 / 4;
    sunAnomaly -= Math.floor(sunAnomaly);
    const moonEquation = this._linearInterpolate(28 * moonAnomaly, this._moon_tab_values, 7, 28);
    const sunEquation = this._linearInterpolate(12 * sunAnomaly, this._sun_tab_values, 3, 12);
    return meanDate + moonEquation / 60 - sunEquation / 60;
  }

  _from(jd) {
    const jdn = Math.trunc(parseFloat(jd.toFixed(7), 10));
    const solarDaysFromEpoch = jdn - this._M0;
    let trueMonthCount = Math.floor(solarDaysFromEpoch / this._M1);
    let day = Math.floor((solarDaysFromEpoch - trueMonthCount * this._M1) / this._M2);
    let leapDay = false;
    for (let i = 0; i < 3; i += 1) {
      const trueDate = this.getTrueDate(trueMonthCount, day);
      if (trueDate > jdn + 1) {
        leapDay = true;
        break;
      }
      if (trueDate > jdn) break;
      day += 1;
    }
    if (day === 0) {
      trueMonthCount -= 1;
      day = 30;
    }
    if (day > 30) {
      trueMonthCount += 1;
      day -= 30;
    }
    const { cycle, year, month, leapMonth } = this._getTibetanMonthFromTrueMonthCount(trueMonthCount);
    this.set(cycle, year, month, leapMonth, day, leapDay);
  }

  fromGregorian(year, month, day) {
    this._from(gregorianToJD(year, month, day) + 0.5);
    return this;
  }

  toJDN(gyear) {
    const trueMonthCount = this._getTrueMonthCount(gyear);
    const trueDate = this.getTrueDate(trueMonthCount, this.day);
    let jdn = Math.floor(trueDate);
    const prevJdn = Math.floor(this.getTrueDate(trueMonthCount, this.day - 1));
    if (jdn === prevJdn + 2 && this.leapDay) jdn -= 1;
    if (jdn === prevJdn) jdn += 1;
    return jdn;
  }

  toGregorian(gyear) {
    return jdToGregorian(this.toJDN(gyear) - 0.5);
  }
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateValue(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatSolar(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 周${DAY_NAMES[date.getDay()]}`;
}

function formatLunar(date) {
  try {
    const parts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).formatToParts(date);
    const yearName = parts.find((part) => part.type === "yearName")?.value || "";
    const month = parts.find((part) => part.type === "month")?.value || "";
    const day = Number(parts.find((part) => part.type === "day")?.value);
    return `农历${yearName ? `${yearName}年` : ""}${month}${CN_DAYS[day] || ""}`;
  } catch (error) {
    return "农历暂不可用";
  }
}

function getTibetanInfo(date) {
  const tibetan = new CalendarTibetan().fromGregorian(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const [cycle, year, month, leapMonth, day, leapDay] = tibetan.get();
  const rule = RULES[day];
  return { cycle, year, month, leapMonth, day, leapDay, rule };
}

function getSpecialDays(info) {
  const monthly = MONTHLY_SPECIAL_DAYS[info.day] || [];
  const annual = ANNUAL_SPECIAL_DAYS
    .filter((item) => {
      if (item.month !== info.month) return false;
      if (item.day) return item.day === info.day;
      return info.day >= item.from && info.day <= item.to;
    })
    .map((item) => item.title);
  return [...new Set([...annual, ...monthly])];
}

function formatTibetan(info) {
  const leapMonthText = info.leapMonth ? "闰" : "";
  const leapDayText = info.leapDay ? "（重日）" : "";
  return `藏历${leapMonthText}${info.month}月${CN_DAYS[info.day]}${leapDayText}`;
}

function updateTodayPanel() {
  const info = getTibetanInfo(state.selectedDate);
  const specialDays = getSpecialDays(info);
  const selected = toDateValue(state.selectedDate);
  $("#dateInput").value = selected;
  $("#solarDate").textContent = formatSolar(state.selectedDate);
  $("#tibetanDate").textContent = formatTibetan(info);
  $("#lunarDate").textContent = formatLunar(state.selectedDate);
  $("#verdictLabel").textContent = info.rule.title;
  $("#reasonText").textContent = info.rule.reason;
  $("#verdictBadge").textContent = info.rule.level === "bad" ? "避开" : info.rule.level === "caution" ? "谨慎" : "可剪";
  $("#todayPanel").dataset.level = info.rule.level;
  $("#specialDays").innerHTML = specialDays.length
    ? specialDays.map((item) => `<span>${item}</span>`).join("")
    : "<span>未逢常见殊胜日</span>";
}

function renderMonthGrid() {
  const grid = $("#monthGrid");
  const monthStart = state.visibleMonth;
  const start = addDays(monthStart, -monthStart.getDay());
  const todayValue = toDateValue(new Date());

  $("#monthTitle").textContent = `${monthStart.getFullYear()}年${monthStart.getMonth() + 1}月`;
  grid.innerHTML = "";

  for (let i = 0; i < 42; i += 1) {
    const date = addDays(start, i);
    const info = getTibetanInfo(date);
    const specialDays = getSpecialDays(info);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `calendar-day ${info.rule.level}`;
    button.dataset.date = toDateValue(date);
    if (specialDays.length) button.classList.add("special");
    if (date.getMonth() !== monthStart.getMonth()) button.classList.add("muted-day");
    if (toDateValue(date) === todayValue) button.classList.add("today");
    if (toDateValue(date) === toDateValue(state.selectedDate)) button.classList.add("active");
    button.innerHTML = `
      <strong>${date.getDate()}</strong>
      <span>${CN_DAYS[info.day]}</span>
      <em>${info.rule.title}</em>
      ${specialDays.length ? `<i>殊胜</i>` : ""}
    `;
    button.addEventListener("click", () => {
      state.selectedDate = startOfDay(date);
      state.visibleMonth = startOfMonth(date);
      render();
    });
    grid.appendChild(button);
  }

  renderMonthSpecials(monthStart);
}

function renderMonthSpecials(monthStart) {
  const holder = $("#monthSpecials");
  const items = [];

  for (let day = 1; day <= 31; day += 1) {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    if (date.getMonth() !== monthStart.getMonth()) break;
    const info = getTibetanInfo(date);
    const specialDays = getSpecialDays(info);
    if (!specialDays.length) continue;
    items.push({
      date,
      info,
      specialDays
    });
  }

  holder.innerHTML = `
    <p>本月殊胜日</p>
    <div>
      ${items.length
        ? items.map((item) => `
          <button type="button" data-date="${toDateValue(item.date)}">
            <strong>${item.date.getMonth() + 1}/${item.date.getDate()}</strong>
            <span>${CN_DAYS[item.info.day]} ${item.specialDays.join("、")}</span>
          </button>
        `).join("")
        : "<span>本月未标出常见殊胜日</span>"}
    </div>
  `;

  holder.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDate = fromDateValue(button.dataset.date);
      state.visibleMonth = startOfMonth(state.selectedDate);
      render();
    });
  });
}

function summaryForDate(date) {
  const info = getTibetanInfo(date);
  const special = getSpecialDays(info);
  const specialText = special.length ? `殊胜日：${special.join("、")}。` : "普通修持日。";
  return `${formatSolar(date)}，${formatLunar(date)}，${formatTibetan(info)}：${info.rule.title}理头发。缘起：${info.rule.reason}。${specialText}`;
}

function icsDate(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

function icsStamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(text) {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function makeEvent(date, info) {
  const end = addDays(date, 1);
  const special = getSpecialDays(info);
  const title = `${info.rule.title}理头发：${formatTibetan(info)}`;
  const desc = `${formatLunar(date)}。${info.rule.reason}。${special.length ? `殊胜日：${special.join("、")}。` : ""}理下的头发可置于净水中、火中焚烧，或高山随风。`;
  return [
    "BEGIN:VEVENT",
    `UID:haircut-${icsDate(date)}-${info.day}@litoufa-calendar`,
    `DTSTAMP:${icsStamp()}`,
    `DTSTART;VALUE=DATE:${icsDate(date)}`,
    `DTEND;VALUE=DATE:${icsDate(end)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(desc)}`,
    "END:VEVENT"
  ].join("\r\n");
}

function makeCalendar(events) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Litoufa Calendar//Haircut Days//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:理头发吉日",
    ...events,
    "END:VCALENDAR"
  ].join("\r\n");
}

async function shareOrDownload(filename, text) {
  const file = new File([text], filename, { type: "text/calendar;charset=utf-8" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: filename });
    return;
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function writeClipboardText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.inset = "0 auto auto 0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  }
}

async function exportGoodDays() {
  const events = [];
  for (let i = 0; i < 370; i += 1) {
    const date = addDays(new Date(), i);
    const info = getTibetanInfo(date);
    if (info.rule.level === "great" || info.rule.level === "good") {
      events.push(makeEvent(date, info));
    }
  }
  await shareOrDownload("理头发吉日.ics", makeCalendar(events));
}

async function exportSelectedDate() {
  const info = getTibetanInfo(state.selectedDate);
  await shareOrDownload(`理头发-${toDateValue(state.selectedDate)}.ics`, makeCalendar([makeEvent(state.selectedDate, info)]));
}

async function copySummary() {
  const copied = await writeClipboardText(summaryForDate(state.selectedDate));
  $("#copySummaryButton").textContent = copied ? "已复制" : "复制受限";
  window.setTimeout(() => {
    $("#copySummaryButton").textContent = "复制今日结果";
  }, 1200);
}

function render() {
  updateTodayPanel();
  renderMonthGrid();
}

function bindEvents() {
  $("#dateInput").addEventListener("change", (event) => {
    state.selectedDate = fromDateValue(event.target.value);
    state.visibleMonth = startOfMonth(state.selectedDate);
    render();
  });
  $("#todayButton").addEventListener("click", () => {
    state.selectedDate = startOfDay(new Date());
    state.visibleMonth = startOfMonth(state.selectedDate);
    render();
  });
  $("#prevMonthButton").addEventListener("click", () => {
    state.visibleMonth = addMonths(state.visibleMonth, -1);
    render();
  });
  $("#nextMonthButton").addEventListener("click", () => {
    state.visibleMonth = addMonths(state.visibleMonth, 1);
    render();
  });
  $("#exportGoodDaysButton").addEventListener("click", exportGoodDays);
  $("#addSelectedButton").addEventListener("click", exportSelectedDate);
  $("#copySummaryButton").addEventListener("click", copySummary);
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

$("#dateInput").value = toDateValue(state.selectedDate);
bindEvents();
render();
