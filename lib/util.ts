// Returns a random integer between 0 and max
// max should be an integer
export function rnd(max: number) {
    return Math.floor(Math.random()*(max + 1))
}