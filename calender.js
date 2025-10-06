import React, { useMemo, useState } from "react";
import dayjs from "dayjs";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS = ["#f6be23", "#f6501e", "#2ecc71", "#3498db", "#9b59b6", "#e74c3c", "#1abc9c"];

export default function Calendar() {
  const todayStr = dayjs().format("YYYY-MM-DD");
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", startTime: "09:00", endTime: "10:00", color: "#f6be23" });
  const [events, setEvents] = useState([
    { id: 1, date: todayStr, startTime: "10:00", endTime: "11:30", color: "#f6be23", title: "Daily Standup" },
    { id: 2, date: dayjs().add(2, "day").format("YYYY-MM-DD"), startTime: "14:30", endTime: "15:30", color: "#f6501e", title: "Weekly catchup" },
    { id: 3, date: dayjs().add(5, "day").format("YYYY-MM-DD"), startTime: "16:00", endTime: "17:00", color: "#2ecc71", title: "Team Meeting" }
  ]);

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    for (const key in map) {
      map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [events]);

  const monthDays = useMemo(() => {
    const startOfMonth = currentDate.startOf("month");
    const pad = startOfMonth.day();
    const total = currentDate.daysInMonth();
    const cells = Array.from({ length: pad }, () => null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }, [currentDate]);

  const nextMonth = () => setCurrentDate((d) => d.add(1, "month"));
  const prevMonth = () => setCurrentDate((d) => d.subtract(1, "month"));
  const goToToday = () => {
    const t = dayjs();
    setCurrentDate(t);
    setSelectedDate(t.format("YYYY-MM-DD"));
  };

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    const s = newEvent.startTime;
    const e = newEvent.endTime;
    if (e <= s) return;
    const ev = { id: Date.now(), date: selectedDate, ...newEvent };
    setEvents((arr) => [...arr, ev]);
    setNewEvent({ title: "", startTime: "09:00", endTime: "10:00", color: "#f6be23" });
    setShowForm(false);
  };

  const deleteEvent = (id) => setEvents((arr) => arr.filter((e) => e.id !== id));
  const hasOverlap = (date) => (eventsByDate[date]?.length || 0) > 2;

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt; Previous</button>
        <div className="calendar-title">
          <h2>{currentDate.format("MMMM YYYY")}</h2>
          <button onClick={goToToday} className="today-btn">Today</button>
        </div>
        <button onClick={nextMonth}>Next &gt;</button>
      </div>

      {showForm && (
        <div className="event-form-overlay">
          <div className="event-form">
            <h3>Add Event for {dayjs(selectedDate).format("MMM D, YYYY")}</h3>
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="event-input"
            />
            <div className="time-inputs">
              <label>
                Start Time:
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </label>
              <label>
                End Time:
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </label>
            </div>
            <div className="color-picker">
              <span>Color:</span>
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-option ${newEvent.color === c ? "selected" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewEvent({ ...newEvent, color: c })}
                />
              ))}
            </div>
            <div className="form-buttons">
              <button onClick={addEvent} className="save-btn">Save Event</button>
              <button onClick={() => setShowForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="calendar-grid">
        {WEEKDAYS.map((d) => (
          <div key={d} className="week-day">{d}</div>
        ))}
        {monthDays.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} className="calendar-day empty" />;
          const dateStr = currentDate.date(d).format("YYYY-MM-DD");
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const overlap = hasOverlap(dateStr);
          return (
            <div
              key={d}
              className={`calendar-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedDate(dateStr)}
              onDoubleClick={() => setShowForm(true)}
            >
              <div className="day-header">
                <span className="day-number">{d}</span>
                {overlap && <span className="overlap-indicator">⚡</span>}
              </div>
              <div className="events-list">
                {dayEvents.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    className="event"
                    style={{ backgroundColor: ev.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${ev.title}"?`)) deleteEvent(ev.id);
                    }}
                  >
                    <span className="event-time">{ev.startTime}</span>
                    <span className="event-title">{ev.title}</span>
                  </div>
                ))}
                {dayEvents.length > 2 && <div className="more-events">+{dayEvents.length - 2} more</div>}
              </div>
              {dayEvents.length === 0 && <div className="add-event-hint">Double click to add event</div>}
            </div>
          );
        })}
      </div>

      <div className="calendar-stats">
        <div className="stat">
          <span className="stat-number">{events.length}</span>
          <span className="stat-label">Total Events</span>
        </div>
        <div className="stat">
          <span className="stat-number">{eventsByDate[todayStr]?.length || 0}</span>
          <span className="stat-label">Today's Events</span>
        </div>
        <div className="stat">
          <span className="stat-number">{Object.keys(eventsByDate).length}</span>
          <span className="stat-label">Busy Days</span>
        </div>
      </div>
    </div>
  );
}
