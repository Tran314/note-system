import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('系统')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: '健康检查', description: '检查服务是否正常运行' })
  healthCheck() {
    return {
      status: 'ok',
      message: '自建笔记系统 API 服务正常运行',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('info')
  @ApiOperation({ summary: '获取系统信息' })
  getInfo() {
    return {
      name: '自建笔记系统',
      version: '1.0.0',
      description: '基于 NestJS + PostgreSQL 的笔记管理系统',
      features: [
        'JWT 双 Token 认证',
        '笔记版本控制',
        '文件夹嵌套管理',
        '标签系统',
        '附件上传',
        '全文搜索',
      ],
    };
  }
}