
export function rnd(max: number) {
    // Returns a random integer between 0 and max
    // max should be an integer

    return Math.floor(Math.random() * (max + 1))
}
export function queryClosest(selector: string, node: HTMLElement, count = 0): HTMLElement | null {
    // Searches for selector by going up one step at a time.
    // Returns the element if found, null otherwise.
    // Maximum steps up is 20. 
    // Set count to a negative value to increase that limit.

    if (count > 20) // infinite loop protection
        return null
    const n = node.parentElement?.querySelector<HTMLElement>(selector)
    if (n)
        return n
    return node.parentElement ?
        queryClosest(selector, node.parentElement, count++) :
        null
}
export function logPerformance(start: number, str: string = "") {
    // Logs time taken to the console.
    // Usage:
    //   const start = performance.now()
    //   <code that you want to time>
    //   logPerformance(start, "<description of the code>")

    console.log(str + ": " + (performance.now() - start).toFixed(0) + " ms")
}
