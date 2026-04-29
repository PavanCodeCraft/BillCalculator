import React, { useRef } from "react";
import html2canvas from "html2canvas";
import styles from "./BillResult.module.css";

function fmt(n) {
  return Number(n).toFixed(2);
}

function BillCard({ room, roomNum, motor, date }) {
  const motorPerRoom = motor.perRoomShare;

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>ROOM {roomNum} — ELECTRICITY BILL</div>
        <div className={styles.cardDate}>{date}</div>
      </div>

      {/* Meter readings */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Room {roomNum} Meter Reading</div>
        <div className={styles.row}>
          <span>Previous Reading</span>
          <span className={styles.mono}>{room.previousReading} units</span>
        </div>
        <div className={styles.row}>
          <span>Current Reading</span>
          <span className={styles.mono}>{room.currentReading} units</span>
        </div>
        <div className={`${styles.row} ${styles.rowResult}`}>
          <span>Units Used <span className={styles.formula}>(current − previous)</span></span>
          <span className={styles.mono}>{room.currentReading} − {room.previousReading} = <strong>{fmt(room.unitsUsed)} units</strong></span>
        </div>
      </div>

      {/* Motor section */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Motor Pump — Shared Contribution</div>
        <div className={styles.row}>
          <span>Motor Previous Reading</span>
          <span className={styles.mono}>{motor.previousReading} units</span>
        </div>
        <div className={styles.row}>
          <span>Motor Current Reading</span>
          <span className={styles.mono}>{motor.currentReading} units</span>
        </div>
        <div className={styles.row}>
          <span>Motor Total Used <span className={styles.formula}>(current − previous)</span></span>
          <span className={styles.mono}>{motor.currentReading} − {motor.previousReading} = <strong>{fmt(motor.unitsUsed)} units</strong></span>
        </div>
        <div className={styles.dividerSmall} />
        <div className={styles.row}>
          <span>Owner's Share <span className={styles.formula}>(total ÷ 2)</span></span>
          <span className={styles.mono}>{fmt(motor.unitsUsed)} ÷ 2 = {fmt(motor.ownerShare)} units</span>
        </div>
        <div className={styles.row}>
          <span>Tenants' Share <span className={styles.formula}>(total ÷ 2)</span></span>
          <span className={styles.mono}>{fmt(motor.unitsUsed)} ÷ 2 = {fmt(motor.tenantsShare)} units</span>
        </div>
        <div className={`${styles.row} ${styles.rowResult}`}>
          <span>Room {roomNum}'s Share <span className={styles.formula}>(tenants' ÷ 2)</span></span>
          <span className={styles.mono}>{fmt(motor.tenantsShare)} ÷ 2 = <strong>{fmt(motorPerRoom)} units</strong></span>
        </div>
      </div>

      {/* Final calculation */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Final Calculation</div>
        <div className={styles.row}>
          <span>Room Units Used</span>
          <span className={styles.mono}>{fmt(room.unitsUsed)} units</span>
        </div>
        <div className={styles.row}>
          <span>Motor Share</span>
          <span className={styles.mono}>+ {fmt(motorPerRoom)} units</span>
        </div>
        <div className={`${styles.row} ${styles.rowResult}`}>
          <span>Total Units</span>
          <span className={styles.mono}><strong>{fmt(room.totalUnits)} units</strong></span>
        </div>
        <div className={styles.row}>
          <span>Rate</span>
          <span className={styles.mono}>₹10 / unit</span>
        </div>
      </div>

      {/* Amount */}
      <div className={styles.amountBox}>
        <span>Room {roomNum} Total Amount</span>
        <span className={styles.amount}>₹{fmt(room.amount)}</span>
      </div>

      <div className={styles.footer}>
        Rate: ₹10/unit • Motor split: 50% owner, 25% each room
      </div>
    </div>
  );
}

export default function BillResult({ result, onNew }) {
  const card1Ref = useRef();
  const card2Ref = useRef();

  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  async function downloadCard(ref, filename) {
    const canvas = await html2canvas(ref.current, {
      scale: 2.5,
      backgroundColor: "#fffef9",
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.actions}>
        <button className={styles.newBtn} onClick={onNew}>← New Bill</button>
      </div>

      <div ref={card1Ref}>
        <BillCard room={result.room1} roomNum={1} motor={result.motor} date={date} />
      </div>
      <button
        className={styles.dlBtn}
        onClick={() => downloadCard(card1Ref, `Room1-Bill-${date}.png`)}
      >
        ↓ Download Room 1 Bill
      </button>

      <div className={styles.spacer} />

      <div ref={card2Ref}>
        <BillCard room={result.room2} roomNum={2} motor={result.motor} date={date} />
      </div>
      <button
        className={styles.dlBtn}
        onClick={() => downloadCard(card2Ref, `Room2-Bill-${date}.png`)}
      >
        ↓ Download Room 2 Bill
      </button>
    </div>
  );
}