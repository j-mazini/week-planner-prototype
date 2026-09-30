import styles from "./HomeLoading.module.css";

export default function HomeLoading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <p className={styles.label}>Loading dashboard…</p>
      <div className={styles.preview} aria-hidden="true">
        <div className={styles.hero} />
        <div className={styles.panel}>
          <div className={styles.panelbar} />
          <div className={styles.row}>
            {Array.from({ length: 4 }, (_, i) => <div className={styles.card} key={i} />)}
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelbar} />
          <div className={styles.row}>
            {Array.from({ length: 3 }, (_, i) => <div className={styles.card} key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
