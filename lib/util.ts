export function calcPercentage(
    vertical: boolean,
    rect: DOMRect,
    x: number,
    y: number,
) {
    // Returns the percentage from the top or left to y or x
    const res = (vertical ?
        ((y - rect.top) / rect.height) :
        ((x - rect.left) / rect.width))
    const newPercent = Math.min(95, Math.max(5, Math.floor(res * 1000) / 10))
    return newPercent
}
export function rnd(max: number) {
    // Returns a random integer between 0 and max
    // max should be an integer

    return Math.floor(Math.random() * (max + 1))
}
export function logPerformance(start: number, str: string = "") {
    // Logs time taken to the console.
    // Usage:
    //   const start = performance.now()
    //   <code that you want to time>
    //   logPerformance(start, "<description of the code>")

    console.log(str + ": " + (performance.now() - start).toFixed(0) + " ms")
}
