import { SocketService } from "@/app/api/services/socket.service";

declare module "*.css" {
  const content: any;
  export default content;
}
declare global {
  var socketService: SocketService | undefined;
}
