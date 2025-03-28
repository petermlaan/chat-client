import styles from "./rooms.module.css"

export default function Rooms() {
    return (
        <div className={styles.page}>
            <input type="text" />
            <button>New chat room</button>
            <button>Rum 1</button>
            <button>Rum 2</button>
            <button>Rum 3</button>
        </div>
    )
}