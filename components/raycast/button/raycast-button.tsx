import styles from "./raycast-button.module.css";

export function RaycastButton() {
  return (
    <div className={styles.container}>
      <div className={`${styles.announcement} ${styles.animate}`}>
        <a href="#" rel="external" className={styles.announcementLink}>
          <span className="text-primary">Pretty cool?</span>
          <span className={`${styles.muted} flex`}>
            Click me and see
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 16"
              className="w-4"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.75 4.75 13.25 8m0 0-3.5 3.25M13.25 8H2.75"
              />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}
