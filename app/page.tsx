
"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  AlarmClock,
  Timer,
  Hourglass,
  Globe,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  CalendarDays,
} from "lucide-react";

type Tab = "clock" | "alarm" | "stopwatch" | "countdown" | "world";

type Alarm = {
  id: number;
  time: string;
  message: string;
  active: boolean;
  lastFired: string;
};

const tabs = [
  { id: "clock", label: "นาฬิกา", icon: Clock },
  { id: "alarm", label: "นาฬิกาปลุก", icon: AlarmClock },
  { id: "stopwatch", label: "จับเวลา", icon: Timer },
  { id: "countdown", label: "นับถอยหลัง", icon: Hourglass },
  { id: "world", label: "เวลาโลก", icon: Globe },
] as const;

const zones = [
  { name: "ประเทศไทย", city: "Bangkok", zone: "Asia/Bangkok" },
  { name: "ญี่ปุ่น", city: "Tokyo", zone: "Asia/Tokyo" },
  { name: "อังกฤษ", city: "London", zone: "Europe/London" },
  { name: "สหรัฐอเมริกา", city: "New York", zone: "America/New_York" },
  { name: "เกาหลีใต้", city: "Seoul", zone: "Asia/Seoul" },
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
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("clock");
  const [now, setNow] = useState(new Date());

  // Stopwatch
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [lapTimes, setLapTimes] = useState<number[]>([]);

  // Countdown
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("01");
  const [seconds, setSeconds] = useState("00");
  const [remaining, setRemaining] = useState(0);
  const [counting, setCounting] = useState(false);

  // Alarm
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmTime, setAlarmTime] = useState("07:00");
  const [alarmMessage, setAlarmMessage] = useState("");

  const [notice, setNotice] = useState("");

  // Update clock
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  // Stopwatch
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setElapsed((old) => old + 30);
    }, 30);

    return () => clearInterval(id);
  }, [running]);

  // Countdown
  useEffect(() => {
    if (!counting) return;

    const id = setInterval(() => {
      setRemaining((old) => {
        if (old <= 1000) {
          setCounting(false);
          setNotice("หมดเวลานับถอยหลังแล้ว!");
          return 0;
        }

        return old - 1000;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [counting]);

  // Alarm checker
  useEffect(() => {
    const id = setInterval(() => {
      const current = new Date();

      const currentTime =
        `${String(current.getHours()).padStart(2, "0")}:` +
        `${String(current.getMinutes()).padStart(2, "0")}`;

      const today = current.toDateString();

      setAlarms((old) =>
        old.map((alarm) => {
          if (
            alarm.active &&
            alarm.time === currentTime &&
            alarm.lastFired !== today
          ) {
            setNotice(
              `ถึงเวลาปลุกแล้ว! ${alarm.message || "ตื่นได้แล้ว"}`
            );

            return { ...alarm, lastFired: today };
          }

          return alarm;
        })
      );
    }, 1000);

    return () => clearInterval(id);
  }, []);

  // Add alarm
  function addAlarm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newAlarm: Alarm = {
      id: Date.now(),
      time: alarmTime,
      message: alarmMessage,
      active: true,
      lastFired: "",
    };

    setAlarms((old) => [...old, newAlarm]);
    setAlarmMessage("");
    setNotice("เพิ่มนาฬิกาปลุกเรียบร้อย");
  }

  // Start countdown
  function startCountdown() {
    if (remaining > 0) {
      setCounting(true);
      return;
    }

    const total =
      (Number(hours) * 3600 +
        Number(minutes) * 60 +
        Number(seconds)) * 1000;

    if (total <= 0) {
      setNotice("กรุณากำหนดเวลามากกว่า 0");
      return;
    }

    setRemaining(total);
    setCounting(true);
    setNotice("");
  }

  function resetCountdown() {
    setCounting(false);
    setRemaining(0);
  }

  function resetStopwatch() {
    setRunning(false);
    setElapsed(0);
    setLapTimes([]);
  }

  // Analog clock
  const angle = {
    second: now.getSeconds() * 6,
    minute: now.getMinutes() * 6 + now.getSeconds() * 0.1,
    hour: (now.getHours() % 12) * 30 + now.getMinutes() * 0.5,
  };

  return (
    <main className="app">

      {/* HEADER */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Clock size={25} />
          </div>

          <div>
            <h1>
              DARK<span>TIME</span>
            </h1>
            <p>YOUR TIME. YOUR CONTROL.</p>
          </div>
        </div>

        <div className="live">
          <span /> SYSTEM ONLINE
        </div>
      </header>

      {/* WELCOME */}
      <div className="welcome">
        <p>WELCOME TO DARK TIME</p>

        <h2>
          จัดการเวลาของคุณ <span>อย่างอิสระ</span>
        </h2>

        <p className="sub">
          เว็บไซต์นาฬิกาดิจิทัลและเครื่องมือจัดการเวลา
        </p>
      </div>

      {/* MENU */}
      <nav className="navigation">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={tab === id ? "nav-btn active" : "nav-btn"}
            onClick={() => setTab(id)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      {/* NOTICE */}
      {notice && (
        <div className="notice">
          <span>{notice}</span>

          <button onClick={() => setNotice("")}>
            ✕
          </button>
        </div>
      )}

      {/* CONTENT */}
      <section className="content">

        {/* DIGITAL CLOCK */}
        {tab === "clock" && (
          <div className="panel main-clock">

            <div className="panel-heading">
              <span>
                <Clock size={18} /> DIGITAL CLOCK
              </span>

              <span className="live">
                <span /> LIVE
              </span>
            </div>

            <div className="digital-time">
              {formatTime(now)}
            </div>

            <div className="date">
              <CalendarDays size={17} />

              {now.toLocaleDateString("th-TH", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>

            {/* ANALOG CLOCK */}
            <div className="analog">

              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="tick"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-128px)`,
                  }}
                >
                  <span
                    style={{
                      transform: `rotate(${-i * 30}deg)`,
                    }}
                  >
                    {i === 0 ? 12 : i}
                  </span>
                </div>
              ))}

              <div
                className="hand hour-hand"
                style={{
                  transform: `rotate(${angle.hour}deg)`,
                }}
              />

              <div
                className="hand minute-hand"
                style={{
                  transform: `rotate(${angle.minute}deg)`,
                }}
              />

              <div
                className="hand second-hand"
                style={{
                  transform: `rotate(${angle.second}deg)`,
                }}
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
              <span>
                <AlarmClock size={19} /> ALARM CLOCK
              </span>

              <span className="small-tag">
                {alarms.length} ALARMS
              </span>
            </div>

            <h2>ตั้งนาฬิกาปลุก</h2>

            <p className="sub">
              กำหนดเวลาที่ต้องการให้เว็บไซต์แจ้งเตือน
            </p>

            <form className="alarm-form" onSubmit={addAlarm}>

              <label>เลือกเวลา</label>

              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                required
              />

              <label>ข้อความแจ้งเตือน</label>

              <input
                type="text"
                placeholder="เช่น ตื่นนอน / ทำการบ้าน"
                value={alarmMessage}
                onChange={(e) => setAlarmMessage(e.target.value)}
              />

              <button className="primary-btn" type="submit">
                <Plus size={18} /> เพิ่มนาฬิกาปลุก
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
                    <Trash2 size={18} />
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
              <span>
                <Timer size={19} /> STOPWATCH
              </span>

              <span className="small-tag">
                CHRONOMETER
              </span>
            </div>

            <h2>ระบบจับเวลา</h2>

            <div className="timer-display">
              {formatDuration(elapsed)}
            </div>

            <div className="timer-buttons">

              {!running ? (
                <button
                  className="primary-btn"
                  onClick={() => setRunning(true)}
                >
                  <Play size={18} /> เริ่ม
                </button>
              ) : (
                <button
                  className="primary-btn"
                  onClick={() => setRunning(false)}
                >
                  <Pause size={18} /> หยุด
                </button>
              )}

              <button
                className="secondary-btn"
                onClick={resetStopwatch}
              >
                <RotateCcw size={18} /> รีเซ็ต
              </button>

              <button
                className="secondary-btn"
                disabled={!running}
                onClick={() =>
                  setLapTimes((old) => [...old, elapsed])
                }
              >
                รอบ
              </button>

            </div>

            <div className="lap-list">
              {lapTimes.map((lap, i) => (
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
              <span>
                <Hourglass size={19} /> COUNTDOWN
              </span>

              <span className="small-tag">
                TIMER
              </span>
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
                <button
                  className="primary-btn"
                  onClick={startCountdown}
                >
                  <Play size={18} /> เริ่มนับถอยหลัง
                </button>
              ) : (
                <button
                  className="primary-btn"
                  onClick={() => setCounting(false)}
                >
                  <Pause size={18} /> หยุดชั่วคราว
                </button>
              )}

              <button
                className="secondary-btn"
                onClick={resetCountdown}
              >
                <RotateCcw size={18} /> รีเซ็ต
              </button>

            </div>

          </div>
        )}

        {/* WORLD CLOCK */}
        {tab === "world" && (
          <div className="panel tool-panel">

            <div className="panel-heading">
              <span>
                <Globe size={19} /> WORLD CLOCK
              </span>

              <span className="small-tag">
                GLOBAL TIME
              </span>
            </div>

            <h2>เวลาทั่วโลก</h2>

            <p className="sub">
              เปรียบเทียบเวลาของแต่ละประเทศ
            </p>

            <div className="world-list">

              {zones.map((z) => (
                <div className="world-item" key={z.zone}>

                  <div>
                    <strong>{z.name}</strong>
                    <p>{z.city}</p>
                  </div>

                  <div className="world-time">

                    {now.toLocaleTimeString("th-TH", {
                      timeZone: z.zone,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}

                    <small>
                      {now.toLocaleDateString("th-TH", {
                        timeZone: z.zone,
                        day: "numeric",
                        month: "short",
                      })}
                    </small>

                  </div>

                </div>
              ))}

            </div>

          </div>
        )}

      </section>

      {/* FOOTER */}
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
