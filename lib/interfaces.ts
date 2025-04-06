export interface Msg {
    room_id: number;
    user: string;
    message: string;
    save: boolean; // not used on the client
}

export interface Split {
    percent?: number,
    vertical?: boolean
    roomId?: number,
    child1?: Split,
    child2?: Split
}

export interface Layout {
    id: number,
    name: string,
    layout?: Split,
}

export interface ChatRoom {
    id: number
    name: string
}
