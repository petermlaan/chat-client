export interface Msg {
    user: string;
    msg: string;
}

export interface Split {
    percent: number,
    vertical: boolean
    child1?: Split,
    child2?: Split
}