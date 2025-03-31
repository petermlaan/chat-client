import "server-only"
import { createClient } from '@supabase/supabase-js'
import { logPerformance } from "../util"

const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "")

export interface ChatRoom {
    id: number,
    name: string
}

export async function dbGetChatRooms(): Promise<ChatRoom[]> {
    /*     const { userId } = await auth()
        if (!userId) {
            console.error("*** ERROR *** dbLoadCart: no userId")
            return []
        } */
    const start = performance.now()
    const { data, error } = await supabase
        .from("cmChatRoom")
        .select("id, name")
        .order("id")
    logPerformance(start, "dbGetChatRooms");
    if (error) {
        console.error("dbGetChatRooms", error);
        throw error;
    };
    if (!data || data.length === 0)
        return [];
    return data;
}

