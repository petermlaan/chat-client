export interface Msg {
    chatroom_id: number;
    type: number; // 0 - message, 1 - user joined, 2  - user left
    user: string;
    msg: string;
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
