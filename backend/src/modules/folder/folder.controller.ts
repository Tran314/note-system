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
import { FolderService } from './folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { CurrentUser } from '../../common';

@ApiTags('文件夹')
@Controller('folders')
@ApiBearerAuth()
export class FolderController {
  constructor(private folderService: FolderService) {}

  @Post()
  @ApiOperation({ summary: '创建文件夹' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    return this.folderService.create(userId, createFolderDto);
  }

  @Get()
  @ApiOperation({ summary: '获取文件夹列表（树形结构）' })
  async findAll(@CurrentUser('sub') userId: string) {
    return this.folderService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文件夹详情' })
  @ApiParam({ name: 'id', description: '文件夹 ID' })
  async findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') folderId: string,
  ) {
    return this.folderService.findOne(userId, folderId);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新文件夹' })
  @ApiParam({ name: 'id', description: '文件夹 ID' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') folderId: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.folderService.update(userId, folderId, updateFolderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文件夹' })
  @ApiParam({ name: 'id', description: '文件夹 ID' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id') folderId: string,
  ) {
    return this.folderService.remove(userId, folderId);
  }
}