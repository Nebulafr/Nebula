import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { prisma } from '@nebula/database';
import { AuthenticatedSocket, JwtPayload } from '../../types/index.js';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: AuthenticatedSocket = context.switchToWs().getClient();
    let token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.headers?.authorization as string);

    // Handle Bearer prefix if present
    if (token && typeof token === 'string' && token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    if (!token) {
      this.logger.debug(`Socket ${socket.id} connection without token`);
      socket.data = { ...socket.data, isAuthenticated: false };
      return true; // Allow connection, handlers can check isAuthenticated
    }

    try {
      const secret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
      if (!secret) {
        throw new Error('ACCESS_TOKEN_SECRET not configured');
      }

      const decoded = jwt.verify(token, secret) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, fullName: true, role: true, status: true },
      });

      if (user && user.status === 'ACTIVE') {
        socket.data = {
          ...socket.data,
          userId: user.id,
          user,
          isAuthenticated: true,
        };
      } else {
        this.logger.warn(`User ${decoded.userId} not found or inactive`);
        socket.data = { ...socket.data, isAuthenticated: false };
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Socket authentication error for ${socket.id}: ${message}`,
      );
      socket.data = { ...socket.data, isAuthenticated: false };
    }

    return true;
  }
}
