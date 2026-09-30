import styles from "./VendorLoading.module.css";

export default function VendorLoading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <p className={styles.label}>Loading vendors…</p>
      <div className={styles.preview} aria-hidden="true">
        <div className={styles.hero} />
        <div className={styles.bar} />
        <div className={styles.rows}>
          {Array.from({ length: 6 }, (_, i) => <div className={styles.row} key={i} />)}
        </div>
      </div>
    </div>
  );
}
