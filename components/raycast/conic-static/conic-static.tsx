import styles from "./ConicStatic.module.css";

export function ConicStatic() {
  return (
    <div className="flex w-full items-center justify-center py-20">
      <div className={`${styles.linkContainer} my-20 relative`}>
        <div className={`${styles.announcement} absolute w-full h-full`} />
      </div>
    </div>
  );
}
