// Returns a random integer between 0 and max
// max should be an integer
export function rnd(max: number) {
    return Math.floor(Math.random() * (max + 1))
}

export function query(selector: string, node: HTMLElement) {
    return node.parentElement?.parentElement?.querySelector(selector)
}

export function logPerformance(start: number, str: string) {
    console.log(str + (performance.now() - start).toFixed(0) + " ms");
}
