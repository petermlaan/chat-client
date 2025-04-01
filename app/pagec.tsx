"use client"
import { useGlobalContext } from "../components/layoutcontext"
import Splitter from "./splitter"

export default function PageC() {
    const lc = useGlobalContext()

    return (<main>
            <Splitter layout={lc.layout?.layout} />
    </main>)
}
