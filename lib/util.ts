
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
