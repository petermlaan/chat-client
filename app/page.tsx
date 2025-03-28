import styles from "./page.module.css"
import PageC from "./pagec";
import Rooms from "./rooms";

export default function Page() {
  return (
    <div className={styles.page}>
      <Rooms />
      <PageC />
    </div>
  )
}
