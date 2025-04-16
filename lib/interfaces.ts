
export interface Msg {
    id?: number;
    room_id: number;
    user: string; // user name
    message: string;
    type: number; // 0 = chat message, 1 = PM, 2 = system
    save: boolean; // not used on the client
}

export interface Split {
    // A binary tree that divides the screen into one or more chat windows

    // Node parts
    percent?: number,
    vertical?: boolean
    child1?: Split,
    child2?: Split,

    // Leaf parts
    roomId?: number,
}

export interface Layout {
    id: number,
    name: string,
    split?: Split,
}

export interface ChatRoom {
    id: number
    name: string
}
