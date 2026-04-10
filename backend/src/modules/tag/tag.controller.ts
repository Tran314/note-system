import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { CurrentUser } from '../../common';

@ApiTags('标签')
@Controller('tags')
@ApiBearerAuth()
export class TagController {
  constructor(private tagService: TagService) {}

  @Post()
  @ApiOperation({ summary: '创建标签' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createTagDto: CreateTagDto,
  ) {
    return this.tagService.create(userId, createTagDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有标签' })
  async findAll(@CurrentUser('sub') userId: string) {
    return this.tagService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取标签详情' })
  @ApiParam({ name: 'id', description: '标签 ID' })
  async findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') tagId: string,
  ) {
    return this.tagService.findOne(userId, tagId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新标签' })
  @ApiParam({ name: 'id', description: '标签 ID' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') tagId: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagService.update(userId, tagId, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除标签' })
  @ApiParam({ name: 'id', description: '标签 ID' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id') tagId: string,
  ) {
    return this.tagService.remove(userId, tagId);
  }

  @Post('note/:noteId/:tagId')
  @ApiOperation({ summary: '为笔记添加标签' })
  @ApiParam({ name: 'noteId', description: '笔记 ID' })
  @ApiParam({ name: 'tagId', description: '标签 ID' })
  async addToNote(
    @CurrentUser('sub') userId: string,
    @Param('noteId') noteId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tagService.addToNote(userId, noteId, tagId);
  }

  @Delete('note/:noteId/:tagId')
  @ApiOperation({ summary: '从笔记移除标签' })
  @ApiParam({ name: 'noteId', description: '笔记 ID' })
  @ApiParam({ name: 'tagId', description: '标签 ID' })
  async removeFromNote(
    @CurrentUser('sub') userId: string,
    @Param('noteId') noteId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tagService.removeFromNote(userId, noteId, tagId);
  }
}