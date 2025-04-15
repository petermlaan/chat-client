import { Split } from "@/lib/interfaces";
import { ChatProvider } from "../components/chatcontext";
import ChatRoom from "./chatroom";

export default function ChatRoomCont({
  split
}: {
  split: Split | undefined
}) {
  return (
    <ChatProvider>
      <ChatRoom split={split} />
    </ChatProvider>
  )
}
