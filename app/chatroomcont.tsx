import { Split } from "@/lib/interfaces";
import { ChatProvider } from "../components/chatcontext";
import ChatRoom from "./chatroom";

export default function ChatRoomCont({
  layout
}: {
  layout: Split | undefined
}) {
  return (
    <ChatProvider>
      <ChatRoom layout={layout} />
    </ChatProvider>
  )
}
