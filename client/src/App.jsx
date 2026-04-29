import React, { useState, useEffect, useCallback } from "react";
import InputForm from "./components/InputForm.jsx";
import BillResult from "./components/BillResult.jsx";
import History from "./components/History.jsx";
import { fetchLatest } from "./api.js";
import styles from "./App.module.css";

const DEFAULT_PREV = { room1Prev: 0, room2Prev: 0, motorPrev: 0 };

function parsePrev(data) {
  if (!data.exists) return DEFAULT_PREV;
  return {
    room1Prev: data.room1Previous,
    room2Prev: data.room2Previous,
    motorPrev: data.motorPrevious,
  };
}

export default function App() {
  const [tab, setTab] = useState("new");
  const [prevReadings, setPrevReadings] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPrev = useCallback(() => {
    setLoading(true);
    fetchLatest()
      .then(data => setPrevReadings(parsePrev(data)))
      .catch(() => setPrevReadings(DEFAULT_PREV))
      .finally(() => setLoading(false));
  }, []);

  // Fetch on mount AND every time user comes back to "new" tab
  useEffect(() => {
    if (tab === "new") loadPrev();
  }, [tab]);

  function handleNewBill() {
    setResult(null);
    loadPrev();
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <div className={styles.logo}>⚡ BIJLI BILL</div>
            <div className={styles.subtitle}>Meter Reading Calculator</div>
          </div>
          <nav className={styles.nav}>
            <button
              className={tab === "new" ? styles.navActive : styles.navBtn}
              onClick={() => { setTab("new"); setResult(null); }}
            >
              New Bill
            </button>
            <button
              className={tab === "history" ? styles.navActive : styles.navBtn}
              onClick={() => setTab("history")}
            >
              History
            </button>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {tab === "new" ? (
          loading ? (
            <div className={styles.loading}>Loading previous readings…</div>
          ) : result ? (
            <BillResult result={result} onNew={handleNewBill} />
          ) : (
            <InputForm
              prevReadings={prevReadings}
              setPrevReadings={setPrevReadings}
              onResult={setResult}
            />
          )
        ) : (
          <History />
        )}
      </main>
    </div>
  );
}
