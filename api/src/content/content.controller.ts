import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { QueryContentDto } from './dto/query-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @ApiOperation({ summary: 'Create new content' })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  async create(
    @Body() createContentDto: CreateContentDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.contentService.create(createContentDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all content with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Content list with pagination metadata',
  })
  async findAll(
    @CurrentUser('id') userId: number,
    @Query() queryDto: QueryContentDto,
  ) {
    return this.contentService.findAll(userId, queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get content statistics' })
  @ApiResponse({
    status: 200,
    description: 'Content statistics by status',
  })
  async getStats(@CurrentUser('id') userId: number) {
    return this.contentService.getContentStats(userId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent content' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Recent content items',
  })
  async getRecent(
    @CurrentUser('id') userId: number,
    @Query('limit') limit?: number,
  ) {
    return this.contentService.getRecentContent(userId, limit || 4);
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Get scheduled content for date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Scheduled content for the specified date range',
  })
  async getScheduled(
    @CurrentUser('id') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.contentService.getScheduledContent(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiResponse({ status: 200, description: 'Content details' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.contentService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update content' })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    return this.contentService.update(id, userId, updateContentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content (soft delete)' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    await this.contentService.remove(id, userId);
    return { message: 'Content deleted successfully' };
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate content' })
  @ApiResponse({ status: 201, description: 'Content duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async duplicate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.contentService.duplicate(id, userId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish content immediately' })
  @ApiResponse({ status: 200, description: 'Content published successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.contentService.publish(id, userId);
  }

  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule content' })
  @ApiResponse({ status: 200, description: 'Content rescheduled successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async reschedule(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body('scheduledFor') scheduledFor: string,
  ) {
    return this.contentService.reschedule(
      id,
      userId,
      new Date(scheduledFor),
    );
  }
}
