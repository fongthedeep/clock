
"use client";

import { useEffect, useRef, useState } from "react";

type Tab = "clock" | "alarm" | "stopwatch" | "countdown" | "world";

type City = {
  name: string;
  city: string;
  zone: string;
};

type Alarm = {
  id: number;
  time: string;
  message: string;
  active: boolean;
  lastFired: string;
};

const worldOptions: City[] = [
  { name: "ประเทศไทย", city: "Bangkok", zone: "Asia/Bangkok" },
  { name: "ญี่ปุ่น", city: "Tokyo", zone: "Asia/Tokyo" },
  { name: "เกาหลีใต้", city: "Seoul", zone: "Asia/Seoul" },
  { name: "จีน", city: "Shanghai", zone: "Asia/Shanghai" },
  { name: "ฮ่องกง", city: "Hong Kong", zone: "Asia/Hong_Kong" },
  { name: "สิงคโปร์", city: "Singapore", zone: "Asia/Singapore" },
  { name: "อินเดีย", city: "New Delhi", zone: "Asia/Kolkata" },
  { name: "อังกฤษ", city: "London", zone: "Europe/London" },
  { name: "ฝรั่งเศส", city: "Paris", zone: "Europe/Paris" },
  { name: "เยอรมนี", city: "Berlin", zone: "Europe/Berlin" },
  { name: "รัสเซีย", city: "Moscow", zone: "Europe/Moscow" },
  { name: "สหรัฐอเมริกา", city: "New York", zone: "America/New_York" },
  { name: "สหรัฐอเมริกา", city: "Los Angeles", zone: "America/Los_Angeles" },
  { name: "สหรัฐอเมริกา", city: "Chicago", zone: "America/Chicago" },
  { name: "แคนาดา", city: "Toronto", zone: "America/Toronto" },
  { name: "ออสเตรเลีย", city: "Sydney", zone: "Australia/Sydney" },
  { name: "นิวซีแลนด์", city: "Auckland", zone: "Pacific/Auckland" },
  { name: "สหรัฐอาหรับเอมิเรตส์", city: "Dubai", zone: "Asia/Dubai" },
  { name: "ตุรกี", city: "Istanbul", zone: "Europe/Istanbul" },
  { name: "บราซิล", city: "Sao Paulo", zone: "America/Sao_Paulo" },
];

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "clock", label: "นาฬิกา", icon: "◷" },
  { id: "alarm", label: "นาฬิกาปลุก", icon: "⏰" },
  { id: "stopwatch", label: "จับเวลา", icon: "⏱" },
  { id: "countdown", label: "นับถอยหลัง", icon: "⌛" },
  { id: "world", label: "เวลาโลก", icon: "◎" },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return [h, m, s]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("clock");
  const [now, setNow] = useState<Date | null>(null);
  const [notice, setNotice] = useState("");

  // Alarm
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmTime, setAlarmTime] = useState("07:00");
  const [alarmMessage, setAlarmMessage] = useState("");

  // World Clock
  const [worldSearch, setWorldSearch] = useState("");
  const [selectedWorlds, setSelectedWorlds] = useState<City[]>([
    worldOptions[0],
    worldOptions[1],
    worldOptions[7],
  ]);

  const filteredWorlds = worldOptions.filter((city) => {
    const keyword = worldSearch.trim().toLowerCase();

    return (
      keyword.length > 0 &&
      (
        city.name.toLowerCase().includes(keyword) ||
        city.city.toLowerCase().includes(keyword) ||
        city.zone.toLowerCase().includes(keyword)
      ) &&
      !selectedWorlds.some((item) => item.zone === city.zone)
    );
  });

  function addWorld(city: City) {
    setSelectedWorlds((old) => {
      if (old.some((item) => item.zone === city.zone)) {
        return old;
      }
      return [...old, city];
    });

    setWorldSearch("");
    setNotice(`เพิ่ม ${city.city} เรียบร้อยแล้ว`);
  }

  function removeWorld(zone: string) {
    setSelectedWorlds((old) =>
      old.filter((city) => city.zone !== zone)
    );
  }

  // Stopwatch
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const stopwatchStart = useRef(0);
  const elapsedBeforeStart = useRef(0);

  // Countdown
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("01");
  const [seconds, setSeconds] = useState("00");
  const [remaining, setRemaining] = useState(0);
  const [counting, setCounting] = useState(false);
  const countdownEnd = useRef(0);

  // Clock update
  useEffect(() => {
    setNow(new Date());

    const id = window.setInterval(() => {
      setNow(new Date());
    }, 250);

    return () => window.clearInterval(id);
  }, []);

  // Stopwatch update
  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      setElapsed(
        elapsedBeforeStart.current +
        (Date.now() - stopwatchStart.current)
      );
    }, 30);

    return () => window.clearInterval(id);
  }, [running]);

  // Countdown update
  useEffect(() => {
    if (!counting) return;

    const update = () => {
      const left = Math.max(
        0,
        countdownEnd.current - Date.now()
      );

      setRemaining(left);

      if (left <= 0) {
        setCounting(false);
        setNotice("หมดเวลานับถอยหลังแล้ว!");
        window.alert("หมดเวลานับถอยหลังแล้ว!");
      }
    };

    update();

    const id = window.setInterval(update, 200);
    return () => window.clearInterval(id);
  }, [counting]);

  // Alarm checker
  useEffect(() => {
    const id = window.setInterval(() => {
      const current = new Date();

      const currentTime =
        `${String(current.getHours()).padStart(2, "0")}:` +
        `${String(current.getMinutes()).padStart(2, "0")}`;

      const today = current.toDateString();

      setAlarms((old) => {
        let fired: Alarm | undefined;

        const updated = old.map((alarm) => {
          if (
            alarm.active &&
            alarm.time === currentTime &&
            alarm.lastFired !== today
          ) {
            fired = alarm;
            return { ...alarm, lastFired: today };
          }

          return alarm;
        });

        if (fired) {
          const message =
            `ถึงเวลาปลุกแล้ว ${fired.time} ${fired.message || ""}`;

          setNotice(message);
          window.alert(message);
        }

        return updated;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  // Add alarm
  function addAlarm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setAlarms((old) => [
      ...old,
      {
        id: Date.now(),
        time: alarmTime,
        message: alarmMessage,
        active: true,
        lastFired: "",
      },
    ]);

    setAlarmMessage("");
    setNotice("เพิ่มนาฬิกาปลุกเรียบร้อย");
  }

  // Stopwatch functions
  function startStopwatch() {
    stopwatchStart.current = Date.now();
    elapsedBeforeStart.current = elapsed;
    setRunning(true);
  }

  function pauseStopwatch() {
    const value =
      elapsedBeforeStart.current +
      (Date.now() - stopwatchStart.current);

    setElapsed(value);
    elapsedBeforeStart.current = value;
    setRunning(false);
  }

  function resetStopwatch() {
    setRunning(false);
    setElapsed(0);
    elapsedBeforeStart.current = 0;
    setLaps([]);
  }

  // Countdown functions
  function startCountdown() {
    if (counting) return;

    if (remaining > 0) {
      countdownEnd.current = Date.now() + remaining;
      setCounting(true);
      return;
    }

    const h = Number(hours);
    const m = Number(minutes);
    const s = Number(seconds);

    if (
      !Number.isInteger(h) ||
      !Number.isInteger(m) ||
      !Number.isInteger(s) ||
      h < 0 || h > 99 ||
      m < 0 || m > 59 ||
      s < 0 || s > 59
    ) {
      setNotice("กรุณากรอกเวลาให้ถูกต้อง");
      return;
    }

    const total = (h * 3600 + m * 60 + s) * 1000;

    if (total <= 0) {
      setNotice("กรุณากำหนดเวลามากกว่า 0");
      return;
    }

    setNotice("");
    setRemaining(total);
    countdownEnd.current = Date.now() + total;
    setCounting(true);
  }

  function resetCountdown() {
    setCounting(false);
    setRemaining(0);
  }

  const angle = now
    ? {
        second: now.getSeconds() * 6 +
          now.getMilliseconds() * 0.006,
        minute: now.getMinutes() * 6 +
          now.getSeconds() * 0.1,
        hour: (now.getHours() % 12) * 30 +
          now.getMinutes() * 0.5,
      }
    : { second: 0, minute: 0, hour: 0 };

  return (
    <main className="app">

      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">◷</div>
          <div>
            <h1>DARK<span>TIME</span></h1>
            <p>YOUR TIME. YOUR CONTROL.</p>
          </div>
        </div>

        <div className="live">
          <i /> SYSTEM ONLINE
        </div>
      </header>

      <section className="welcome">
        <p className="eyebrow">WELCOME TO DARK TIME</p>
        <h2>
          จัดการเวลาของคุณ <span>อย่างอิสระ</span>
        </h2>
        <p className="sub">
          เว็บไซต์นาฬิกาดิจิทัลและเครื่องมือจัดการเวลา
        </p>
      </section>

      <nav className="navigation" aria-label="เมนูหลัก">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "nav-btn active" : "nav-btn"}
            onClick={() => setTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="ปิด">
            ×
          </button>
        </div>
      )}

      <section className="content">

        {/* DIGITAL CLOCK */}
        {tab === "clock" && (
          <div className="panel main-clock">
            <div className="panel-heading">
              <span>◷ DIGITAL CLOCK</span>
              <span className="live"><i /> LIVE</span>
            </div>

            <div className="digital-time">
              {now ? formatTime(now) : "--:--:--"}
            </div>

            <div className="date">
              ▦{" "}
              {now
                ? now.toLocaleDateString("th-TH", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "กำลังโหลดเวลา..."}
            </div>

            <div className="analog">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="tick"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-126px)`,
                  }}
                >
                  <span style={{ transform: `rotate(${-i * 30}deg)` }}>
                    {i === 0 ? 12 : i}
                  </span>
                </div>
              ))}

              <div
                className="hand hour-hand"
                style={{ transform: `rotate(${angle.hour}deg)` }}
              />

              <div
                className="hand minute-hand"
                style={{ transform: `rotate(${angle.minute}deg)` }}
              />

              <div
                className="hand second-hand"
                style={{ transform: `rotate(${angle.second}deg)` }}
              />

              <div className="center-dot" />
            </div>

            <p className="clock-caption">
              THAILAND STANDARD TIME
            </p>
          </div>
        )}

        {/* ALARM */}
        {tab === "alarm" && (
          <div className="panel tool-panel">
            <div className="panel-heading">
              <span>⏰ ALARM CLOCK</span>
              <span className="small-tag">
                {alarms.length} ALARMS
              </span>
            </div>

            <h2>ตั้งนาฬิกาปลุก</h2>
            <p className="sub">
              กำหนดเวลาที่ต้องการให้เว็บไซต์แจ้งเตือน
            </p>

            <form className="alarm-form" onSubmit={addAlarm}>
              <label htmlFor="alarm-time">เลือกเวลา</label>
              <input
                id="alarm-time"
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                required
              />

              <label htmlFor="alarm-message">
                ข้อความแจ้งเตือน
              </label>
              <input
                id="alarm-message"
                type="text"
                placeholder="เช่น ตื่นนอน / ทำการบ้าน"
                value={alarmMessage}
                onChange={(e) => setAlarmMessage(e.target.value)}
              />

              <button className="primary-btn" type="submit">
                ＋ เพิ่มนาฬิกาปลุก
              </button>
            </form>

            <div className="alarm-list">
              {alarms.length === 0 && (
                <p className="empty">ยังไม่มีรายการปลุก</p>
              )}

              {alarms.map((alarm) => (
                <div className="alarm-item" key={alarm.id}>
                  <div>
                    <strong>{alarm.time}</strong>
                    <p>{alarm.message || "ไม่มีข้อความ"}</p>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={alarm.active}
                      onChange={() =>
                        setAlarms((old) =>
                          old.map((a) =>
                            a.id === alarm.id
                              ? { ...a, active: !a.active }
                              : a
                          )
                        )
                      }
                    />
                    <span />
                  </label>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      setAlarms((old) =>
                        old.filter((a) => a.id !== alarm.id)
                      )
                    }
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>

            <p className="hint">
              หมายเหตุ: ต้องเปิดเว็บไซต์ค้างไว้เพื่อให้ระบบตรวจสอบเวลาปลุก
            </p>
          </div>
        )}

        {/* STOPWATCH */}
        {tab === "stopwatch" && (
          <div className="panel tool-panel center-panel">
            <div className="panel-heading">
              <span>⏱ STOPWATCH</span>
              <span className="small-tag">CHRONOMETER</span>
            </div>

            <h2>ระบบจับเวลา</h2>

            <div className="timer-display">
              {formatDuration(elapsed)}
            </div>

            <div className="timer-buttons">
              {!running ? (
                <button className="primary-btn" onClick={startStopwatch}>
                  ▶ เริ่ม
                </button>
              ) : (
                <button className="primary-btn" onClick={pauseStopwatch}>
                  Ⅱ หยุด
                </button>
              )}

              <button className="secondary-btn" onClick={resetStopwatch}>
                ↻ รีเซ็ต
              </button>

              <button
                className="secondary-btn"
                disabled={!running}
                onClick={() => setLaps((old) => [...old, elapsed])}
              >
                รอบ
              </button>
            </div>

            <div className="lap-list">
              {laps.map((lap, i) => (
                <div className="lap-item" key={i}>
                  <span>รอบที่ {i + 1}</span>
                  <strong>{formatDuration(lap)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COUNTDOWN */}
        {tab === "countdown" && (
          <div className="panel tool-panel center-panel">
            <div className="panel-heading">
              <span>⌛ COUNTDOWN</span>
              <span className="small-tag">TIMER</span>
            </div>

            <h2>นับถอยหลัง</h2>

            <div className="count-display">
              {formatDuration(remaining)}
            </div>

            <div className="count-inputs">
              <label>
                ชั่วโมง
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={hours}
                  disabled={counting || remaining > 0}
                  onChange={(e) => setHours(e.target.value)}
                />
              </label>

              <label>
                นาที
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  disabled={counting || remaining > 0}
                  onChange={(e) => setMinutes(e.target.value)}
                />
              </label>

              <label>
                วินาที
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  disabled={counting || remaining > 0}
                  onChange={(e) => setSeconds(e.target.value)}
                />
              </label>
            </div>

            <div className="timer-buttons">
              {!counting ? (
                <button className="primary-btn" onClick={startCountdown}>
                  ▶ เริ่มนับถอยหลัง
                </button>
              ) : (
                <button
                  className="primary-btn"
                  onClick={() => {
                    setRemaining(
                      Math.max(0, countdownEnd.current - Date.now())
                    );
                    setCounting(false);
                  }}
                >
                  Ⅱ หยุดชั่วคราว
                </button>
              )}

              <button
                className="secondary-btn"
                onClick={resetCountdown}
              >
                ↻ รีเซ็ต
              </button>
            </div>
          </div>
        )}

        {/* WORLD CLOCK: SEARCH, ADD, DELETE */}
        {tab === "world" && (
          <div className="panel tool-panel">
            <div className="panel-heading">
              <span>◎ WORLD CLOCK</span>
              <span className="small-tag">
                {selectedWorlds.length} CITIES
              </span>
            </div>

            <h2>นาฬิกาโลก</h2>
            <p className="sub">
              ค้นหาและเพิ่มเวลาของเมืองต่าง ๆ ทั่วโลก
            </p>

            <div className="world-search">
              <input
                type="text"
                placeholder="🔍 ค้นหาประเทศหรือเมือง เช่น Japan, Tokyo..."
                value={worldSearch}
                onChange={(e) => setWorldSearch(e.target.value)}
              />
            </div>

            {worldSearch.trim() !== "" && (
              <div className="search-results">
                {filteredWorlds.length > 0 ? (
                  filteredWorlds.map((city) => (
                    <div className="search-result" key={city.zone}>
                      <div>
                        <strong>{city.name}</strong>
                        <p>{city.city}</p>
                      </div>

                      <button
                        className="add-world-btn"
                        onClick={() => addWorld(city)}
                      >
                        ＋ เพิ่ม
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty">
                    ไม่พบเมืองที่ค้นหา หรือเมืองนี้ถูกเพิ่มแล้ว
                  </p>
                )}
              </div>
            )}

            <div className="world-list">
              <h3 className="world-title">
                รายการนาฬิกาของฉัน
              </h3>

              {selectedWorlds.length === 0 && (
                <p className="empty">
                  ยังไม่มีเมือง กรุณาค้นหาและเพิ่มเมือง
                </p>
              )}

              {selectedWorlds.map((city) => (
                <div className="world-item" key={city.zone}>
                  <div>
                    <strong>{city.name}</strong>
                    <p>{city.city}</p>
                  </div>

                  <div className="world-time">
                    {now
                      ? now.toLocaleTimeString("th-TH", {
                          timeZone: city.zone,
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                      : "--:--:--"}

                    <small>
                      {now
                        ? now.toLocaleDateString("th-TH", {
                            timeZone: city.zone,
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                    </small>
                  </div>

                  <button
                    className="delete-world-btn"
                    onClick={() => removeWorld(city.zone)}
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      <footer>
        <div className="footer-logo">
          DARK<span>TIME</span>
        </div>
        <p>© 2026 DARK TIME | Created with Next.js</p>
        <p>เว็บไซต์จัดการเวลาในชีวิตประจำวัน</p>
      </footer>

    </main>
  );
}
