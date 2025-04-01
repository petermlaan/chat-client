import { ChatProvider } from "../components/chatcontext";
import ChatRoom from "./chatroom";

export default function ChatRoomCont() {
  return (
    <ChatProvider>
      <ChatRoom />
    </ChatProvider>
  )
}
