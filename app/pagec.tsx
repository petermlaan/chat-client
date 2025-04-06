"use client"
import { useGlobalContext } from "../components/globalcontext"
import Splitter from "./splitter"

export default function PageC() {
    const lc = useGlobalContext()

    return (<main>
            <Splitter layout={lc.layout?.layout} />
    </main>)
}
