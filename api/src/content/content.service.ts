import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, In, Between } from 'typeorm';
import { Content } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { QueryContentDto } from './dto/query-content.dto';
import { ContentStatus } from '../common/enums';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}

  async create(
    createContentDto: CreateContentDto,
    userId: string,
  ): Promise<Content> {
    const content = this.contentRepository.create({
      ...createContentDto,
      userId,
    });
    return this.contentRepository.save(content);
  }

  async findAll(
    userId: string,
    queryDto: QueryContentDto,
  ): Promise<{ data: Content[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      platforms,
      statuses,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const where: FindOptionsWhere<Content> = {
      userId,
    };

    // Search in caption
    if (search) {
      where.caption = ILike(`%${search}%`);
    }

    // Filter by platforms
    if (platforms && platforms.length > 0) {
      where.platform = In(platforms);
    }

    // Filter by statuses
    if (statuses && statuses.length > 0) {
      where.status = In(statuses);
    }

    // Date range filter
    if (dateFrom && dateTo) {
      where.createdAt = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      where.createdAt = Between(
        new Date(dateFrom),
        new Date('2099-12-31'),
      ) as any;
    } else if (dateTo) {
      where.createdAt = Between(
        new Date('2000-01-01'),
        new Date(dateTo),
      ) as any;
    }

    const [data, total] = await this.contentRepository.findAndCount({
      where,
      order: {
        [sortBy]: sortOrder,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id, userId },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return content;
  }

  async update(
    id: string,
    userId: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    const content = await this.findOne(id, userId);

    Object.assign(content, updateContentDto);

    return this.contentRepository.save(content);
  }

  async remove(id: string, userId: string): Promise<void> {
    const content = await this.findOne(id, userId);
    await this.contentRepository.softRemove(content);
  }

  async duplicate(id: string, userId: string): Promise<Content> {
    const original = await this.findOne(id, userId);

    const duplicate = this.contentRepository.create({
      ...original,
      id: undefined,
      status: ContentStatus.DRAFT,
      scheduledFor: null,
      publishedAt: null,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.contentRepository.save(duplicate);
  }

  async publish(id: string, userId: string): Promise<Content> {
    const content = await this.findOne(id, userId);

    content.status = ContentStatus.PUBLISHED;
    content.publishedAt = new Date();

    return this.contentRepository.save(content);
  }

  async reschedule(
    id: string,
    userId: string,
    scheduledFor: Date,
  ): Promise<Content> {
    const content = await this.findOne(id, userId);

    content.scheduledFor = scheduledFor;
    content.status = ContentStatus.SCHEDULED;

    return this.contentRepository.save(content);
  }

  async getRecentContent(userId: string, limit = 4): Promise<Content[]> {
    return this.contentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getScheduledContent(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Content[]> {
    return this.contentRepository.find({
      where: {
        userId,
        status: ContentStatus.SCHEDULED,
        scheduledFor: Between(startDate, endDate) as any,
      },
      order: { scheduledFor: 'ASC' },
    });
  }

  async getContentStats(userId: string): Promise<{
    total: number;
    draft: number;
    scheduled: number;
    published: number;
  }> {
    const [total, draft, scheduled, published] = await Promise.all([
      this.contentRepository.count({ where: { userId } }),
      this.contentRepository.count({
        where: { userId, status: ContentStatus.DRAFT },
      }),
      this.contentRepository.count({
        where: { userId, status: ContentStatus.SCHEDULED },
      }),
      this.contentRepository.count({
        where: { userId, status: ContentStatus.PUBLISHED },
      }),
    ]);

    return { total, draft, scheduled, published };
  }
}
