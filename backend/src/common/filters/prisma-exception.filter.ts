import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '数据库操作失败';

    // Prisma 错误码映射
    switch (exception.code) {
      case 'P2002':
        // 唯一约束违反
        status = HttpStatus.CONFLICT;
        const field = (exception.meta?.target as string[])?.[0] || '字段';
        message = `${field}已存在`;
        break;
      case 'P2025':
        // 记录不存在
        status = HttpStatus.NOT_FOUND;
        message = '记录不存在';
        break;
      case 'P2003':
        // 外键约束违反
        status = HttpStatus.BAD_REQUEST;
        message = '关联记录不存在';
        break;
      case 'P2014':
        // 关联不正确
        status = HttpStatus.BAD_REQUEST;
        message = '无效的关联关系';
        break;
      case 'P2016':
        // 查询结果为空
        status = HttpStatus.NOT_FOUND;
        message = '查询结果为空';
        break;
      default:
        console.error('Prisma 错误:', exception);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      code: exception.code,
    };

    response.status(status).json(errorResponse);
  }
}