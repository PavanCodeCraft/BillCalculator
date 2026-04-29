import React, { useEffect, useState, useRef } from "react";
import { fetchAllBills } from "../api.js";
import html2canvas from "html2canvas";
import styles from "./History.module.css";

function fmt(n) { return Number(n).toFixed(2); }

// Full detailed card — same as BillResult's BillCard
function BillCard({ room, roomNum, motor, date }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>ROOM {roomNum} — ELECTRICITY BILL</div>
        <div className={styles.cardDate}>{date}</div>
      </div>
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
          <span className={styles.mono}>{fmt(motor.tenantsShare)} ÷ 2 = <strong>{fmt(motor.perRoomShare)} units</strong></span>
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Final Calculation</div>
        <div className={styles.row}>
          <span>Room Units Used</span>
          <span className={styles.mono}>{fmt(room.unitsUsed)} units</span>
        </div>
        <div className={styles.row}>
          <span>Motor Share</span>
          <span className={styles.mono}>+ {fmt(motor.perRoomShare)} units</span>
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
      <div className={styles.amountBox}>
        <span>Room {roomNum} Total Amount</span>
        <span className={styles.amount}>₹{fmt(room.amount)}</span>
      </div>
      <div className={styles.cardFooter}>Rate: ₹10/unit • Motor split: 50% owner, 25% each room</div>
    </div>
  );
}

export default function History() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const cardRefs = useRef({});

  useEffect(() => {
    fetchAllBills()
      .then(setBills)
      .catch(() => setBills([]))
      .finally(() => setLoading(false));
  }, []);

  async function downloadBill(bill, roomNum) {
    const key = `${bill._id}-${roomNum}`;
    const ref = cardRefs.current[key];
    if (!ref) return;
    const date = new Date(bill.date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const canvas = await html2canvas(ref, { scale: 2.5, backgroundColor: "#fffef9", useCORS: true });
    const link = document.createElement("a");
    link.download = `Room${roomNum}-Bill-${date}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  if (loading) return <div className={styles.empty}>Loading history…</div>;
  if (!bills.length) return <div className={styles.empty}>Koi purana bill nahi mila. Pehla bill generate karo!</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.title}>Previous Bills</div>
      {bills.map((bill) => {
        const date = new Date(bill.date).toLocaleDateString("en-IN", {
          day: "2-digit", month: "long", year: "numeric",
        });
        const isOpen = expanded === bill._id;
        return (
          <div key={bill._id} className={styles.billItem}>
            <button className={styles.billRow} onClick={() => setExpanded(isOpen ? null : bill._id)}>
              <div>
                <div className={styles.billDate}>{date}</div>
                <div className={styles.billAmounts}>
                  Room 1: ₹{fmt(bill.room1?.amount)} &nbsp;|&nbsp; Room 2: ₹{fmt(bill.room2?.amount)}
                </div>
              </div>
              <span className={styles.chevron}>{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
              <div className={styles.billDetail}>
                {[1, 2].map(rn => {
                  const room = rn === 1 ? bill.room1 : bill.room2;
                  const key = `${bill._id}-${rn}`;
                  return (
                    <div key={rn} className={styles.cardWrap}>
                      <div ref={el => (cardRefs.current[key] = el)}>
                        <BillCard room={room} roomNum={rn} motor={bill.motor} date={date} />
                      </div>
                      <button className={styles.dlBtn} onClick={() => downloadBill(bill, rn)}>
                        ↓ Download Room {rn} Bill
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
