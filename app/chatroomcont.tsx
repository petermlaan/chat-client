import { ChatProvider } from "./chatcontext";
import ChatRoom from "./chatroom";

export default function ChatRoomCont() {
  return (
    <ChatProvider>
      <ChatRoom />
    </ChatProvider>
  )
}
