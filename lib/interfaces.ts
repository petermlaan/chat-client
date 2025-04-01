export interface Msg {
    type: number;
    user: string;
    msg: string;
}

export interface Split {
    percent: number,
    vertical: boolean
    child1?: Split,
    child2?: Split
}

export interface Layout {
    id: number,
    name: string,
    layout: Split,
}