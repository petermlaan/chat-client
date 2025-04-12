"use client"
import { useGlobalContext } from "../components/globalcontext"
import Splitter from "./splitter"

export default function Page() {
    const gc = useGlobalContext()

    return (<main>
        <Splitter level={0} layout={gc.layout?.layout} key={gc.version} />
    </main>)
}
