"use client"
import { useGlobalContext } from "../components/globalcontext"
import Splitter from "./splitter"

export default function Page() {
    const gc = useGlobalContext()

    return (<main>
        {gc.layout?.split &&
            <Splitter split={gc.layout?.split} key={gc.version} />}
    </main>)
}
