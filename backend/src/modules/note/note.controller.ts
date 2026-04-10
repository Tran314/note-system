import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { CurrentUser } from '../../common';

@ApiTags('笔记')
@Controller('notes')
@ApiBearerAuth()
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Post()
  @ApiOperation({ summary: '创建笔记' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    return this.noteService.create(userId, createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: '获取笔记列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryNotesDto,
  ) {
    return this.noteService.findAll(userId, query);
  }

  @Get('trash')
  @ApiOperation({ summary: '获取回收站笔记' })
  async getTrash(@CurrentUser('sub') userId: string) {
    return this.noteService.getTrash(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取笔记详情' })
  @ApiParam({ name: 'id', description: '笔记 ID' })
  async findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') noteId: string,
  ) {
    return this.noteService.findOne(userId, noteId);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: '获取笔记历史版本' })
  @ApiParam({ name: 'id', description: '笔记 ID' })
  async getVersions(
    @CurrentUser('sub') userId: string,
    @Param('id') noteId: string,
  ) {
    return this.noteService.getVersions(userId, noteId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新笔记' })
  @ApiParam({ name: 'id', description: '笔记 ID' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') noteId: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.noteService.update(userId, noteId, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除笔记（软删除）' })
  @ApiParam({ name: 'id', description: '笔记 ID' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id') noteId: string,
  ) {
    return this.noteService.remove(userId, noteId);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: '恢复已删除笔记' })
  @ApiParam({ name: 'id', description: '笔记 ID' })
  async restore(
    @CurrentUser('sub') userId: string,
    @Param('id') noteId: string,
  ) {
    return this.noteService.restore(userId, noteId);
  }
}