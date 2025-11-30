import { SocketService } from "@/app/api/services/socket.service";

declare global {
  var socketService: SocketService | undefined;
}