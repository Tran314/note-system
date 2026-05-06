import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    let message: string;
    if (method === 'POST') {
      message = '创建成功';
    } else if (method === 'PUT' || method === 'PATCH') {
      message = '更新成功';
    } else if (method === 'DELETE') {
      message = '删除成功';
    } else {
      message = '请求成功';
    }

    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}