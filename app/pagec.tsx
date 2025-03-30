"use client"
import { useLayoutContext } from "./layoutcontext"
import Splitter from "./splitter"

export default function PageC() {
    const lc = useLayoutContext()

    return (<>
            <Splitter layout={lc.layout} />
    </>)
}
