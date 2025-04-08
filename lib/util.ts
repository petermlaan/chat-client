// Returns a random integer between 0 and max
// max should be an integer
export function rnd(max: number) {
    return Math.floor(Math.random() * (max + 1))
}

export function queryClosest(selector: string, node: HTMLElement, count = 0): HTMLElement | null {
    if (count > 20) // infinite loop protection
        return null
    const n = node.parentElement?.querySelector<HTMLElement>(selector)
    if (n)
        return n
    return node.parentElement ? queryClosest(selector, node.parentElement, count++) : null
}

export function queryInput(selector: string, node: HTMLElement) {
    const input = queryClosest(selector, node) as HTMLInputElement
    return input.value
}

export function queryTextArea(selector: string, node: HTMLElement) {
    const input = queryClosest(selector, node) as HTMLTextAreaElement
    return input.value
}

export function logPerformance(start: number, str: string) {
    console.log(str + ": " + (performance.now() - start).toFixed(0) + " ms");
}
