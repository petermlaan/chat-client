import "server-only"
import { createClient } from '@supabase/supabase-js'
import { logPerformance } from "../util"
import { unstable_cache as cache } from "next/cache"

const supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "")

export const dbGetChatRooms = cache(
    async () => {
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
    },
    ['rooms'],
    { revalidate: 3600, tags: ['rooms'] }
)
