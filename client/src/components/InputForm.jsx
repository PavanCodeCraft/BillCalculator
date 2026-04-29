import React, { useState } from "react";
import { calculate } from "../calc.js";
import { saveBill, updateLatestReadings } from "../api.js";
import styles from "./InputForm.module.css";

export default function InputForm({ prevReadings, setPrevReadings, onResult }) {
  const { room1Prev, room2Prev, motorPrev } = prevReadings;

  const [room1Cur, setRoom1Cur] = useState("");
  const [room2Cur, setRoom2Cur] = useState("");
  const [motorCur, setMotorCur] = useState("");
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);

  const [editing, setEditing]   = useState(null);
  const [editVal, setEditVal]   = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const fields = [
    { label: "Room 1", key: "room1", prev: room1Prev, cur: room1Cur, setCur: setRoom1Cur },
    { label: "Room 2", key: "room2", prev: room2Prev, cur: room2Cur, setCur: setRoom2Cur },
    { label: "Motor Pump", key: "motor", prev: motorPrev, cur: motorCur, setCur: setMotorCur },
  ];

  function validate() {
    const e = {};
    const r1 = parseFloat(room1Cur);
    const r2 = parseFloat(room2Cur);
    const m  = parseFloat(motorCur);
    if (!room1Cur || isNaN(r1)) e.room1 = "Reading daalo";
    else if (r1 < room1Prev)   e.room1 = `Previous (${room1Prev}) se kam nahi ho sakta`;
    if (!room2Cur || isNaN(r2)) e.room2 = "Reading daalo";
    else if (r2 < room2Prev)   e.room2 = `Previous (${room2Prev}) se kam nahi ho sakta`;
    if (!motorCur || isNaN(m)) e.motor = "Reading daalo";
    else if (m < motorPrev)    e.motor = `Previous (${motorPrev}) se kam nahi ho sakta`;
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const data = calculate({
      room1Cur: parseFloat(room1Cur),
      room2Cur: parseFloat(room2Cur),
      motorCur: parseFloat(motorCur),
      room1Prev, room2Prev, motorPrev,
    });
    setSaving(true);
    try { await saveBill({ ...data, date: new Date().toISOString() }); } catch {}
    setSaving(false);
    onResult(data);
  }

  async function saveEdit(key) {
    const val = parseFloat(editVal);
    if (isNaN(val) || val < 0) return;
    setEditSaving(true);
    try {
      await updateLatestReadings({ [key]: val });
      setPrevReadings(prev => ({ ...prev, [`${key}Prev`]: val }));
    } catch {}
    setEditSaving(false);
    setEditing(null);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topNote}>
        Previous readings auto-loaded from last bill. Sirf current reading daalo.
      </div>

      {fields.map(({ label, key, prev, cur, setCur }) => (
        <div key={key} className={styles.fieldGroup}>
          <label className={styles.label}>{label} — Current Meter Reading</label>
          <div className={styles.prevRow}>
            {editing === key ? (
              <>
                <span className={styles.prevLabel}>Previous:</span>
                <input
                  className={styles.editInput}
                  type="number"
                  inputMode="numeric"
                  value={editVal}
                  onChange={ev => setEditVal(ev.target.value)}
                  autoFocus
                />
                <button className={styles.editSave} onClick={() => saveEdit(key)} disabled={editSaving}>
                  {editSaving ? "…" : "✓"}
                </button>
                <button className={styles.editCancel} onClick={() => setEditing(null)}>✕</button>
              </>
            ) : (
              <>
                <span className={styles.prevTag}>Previous: <strong>{prev}</strong> units</span>
                <button className={styles.editBtn} onClick={() => { setEditing(key); setEditVal(String(prev)); }} title="Edit">✎</button>
              </>
            )}
          </div>
          <input
            className={`${styles.input} ${errors[key] ? styles.inputError : ""}`}
            type="number"
            inputMode="numeric"
            placeholder="Current reading..."
            value={cur}
            onChange={ev => { setCur(ev.target.value); setErrors(p => ({ ...p, [key]: "" })); }}
          />
          {errors[key] && <div className={styles.error}>{errors[key]}</div>}
        </div>
      ))}

      <button className={styles.btn} onClick={handleSubmit} disabled={saving}>
        {saving ? "Saving..." : "Calculate & Save Bill →"}
      </button>
    </div>
  );
}
