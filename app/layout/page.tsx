import styles from "./page.module.css"
import EditLayout from "../editlayout"

export default function LayoutPage() {
    return (
        <div className={styles.page}>
            <h2>Layout Editor</h2>
            <select>
                <option>Layouts...</option>
                <option>Layout 1</option>
                <option>Layout 2</option>
            </select>
            <div className="flexcent"><EditLayout /></div>
        </div>
    )
}