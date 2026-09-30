import styles from "./BoardLoading.module.css";

export default function BoardLoading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <p className={styles.label}>Loading board…</p>
      <div className={styles.preview} aria-hidden="true">
        <div className={styles.toolbar} />
        <div className={styles.grid}>
          {Array.from({ length: 5 }, (_, day) => (
            <div className={styles.day} key={day}>
              <div className={styles.heading} />
              {Array.from({ length: 6 }, (_, row) => (
                <div className={styles.card} key={row}>
                  <span className={styles.plate} />
                  <span className={styles.driver} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
