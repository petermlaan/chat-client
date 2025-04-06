import { ChatProvider } from "../components/chatcontext";
import ChatRoom from "./chatroom";

export default function ChatRoomCont({
  roomId
}: {
  roomId: number
}) {
  return (
    <ChatProvider>
      <ChatRoom roomId={roomId} />
    </ChatProvider>
  )
}
