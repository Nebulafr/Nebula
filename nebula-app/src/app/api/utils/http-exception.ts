import { RESPONSE_CODE } from "@/types";

export default class HttpException extends Error {
  public code: RESPONSE_CODE;
  public statusCode: number;
  constructor(code: RESPONSE_CODE, message: string, statusCode: number) {
    super();
    this.name = "HttpException";
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(RESPONSE_CODE.BAD_REQUEST, message, 400);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(RESPONSE_CODE.UNAUTHORIZED, message, 401);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string) {
    super(RESPONSE_CODE.FORBIDDEN, message, 403);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(RESPONSE_CODE.NOT_FOUND, message, 404);
  }
}

export class ValidationException extends HttpException {
  constructor(message: string) {
    super(RESPONSE_CODE.VALIDATION_ERROR, message, 400);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string) {
    super(RESPONSE_CODE.INTERNAL_SERVER_ERROR, message, 500);
  }
}
