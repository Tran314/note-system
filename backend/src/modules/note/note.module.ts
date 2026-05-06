import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { VersionService } from '../version/version.service';
import { TrashService } from '../trash/trash.service';
import { SearchService } from '../search/search.service';

@Module({
  controllers: [NoteController],
  providers: [NoteService, VersionService, TrashService, SearchService],
  exports: [NoteService, VersionService, TrashService, SearchService],
})
export class NoteModule {}