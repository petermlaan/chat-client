"use client"
import { useGlobalContext } from "../components/globalcontext"
import Splitter from "./splitter"

export default function PageC() {
    const gc = useGlobalContext()

    return (<main>
            <Splitter layout={gc.layout?.layout} />
    </main>)
}
