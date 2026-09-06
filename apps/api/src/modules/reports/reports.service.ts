import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { paginate, type PaginationQueryDto } from '../../common/dto/pagination.dto';
import type { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, dto: CreateReportDto) {
    if (dto.targetType === 'USER' && dto.targetId === reporterId) {
      throw new BadRequestException('You cannot report yourself');
    }

    await this.assertTargetExists(dto);

    const report = await this.prisma.report.upsert({
      where: {
        reporterId_targetType_targetId: {
          reporterId,
          targetType: dto.targetType,
          targetId: dto.targetId,
        },
      },
      create: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
        comment: dto.comment ?? null,
      },
      update: { reason: dto.reason, comment: dto.comment ?? null },
    });

    return { id: report.id, status: report.status, createdAt: report.createdAt.toISOString() };
  }

  async list(query: PaginationQueryDto) {
    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: query.skip,
        take: query.pageSize,
      }),
      this.prisma.report.count(),
    ]);

    return paginate(reports, total, query);
  }

  async review(id: string, moderatorId: string, status: 'RESOLVED' | 'DISMISSED') {
    return this.prisma.report.update({
      where: { id },
      data: { status, reviewedAt: new Date(), reviewedBy: moderatorId },
    });
  }

  private async assertTargetExists(dto: CreateReportDto): Promise<void> {
    const exists =
      dto.targetType === 'USER'
        ? await this.prisma.user.count({ where: { id: dto.targetId } })
        : await this.prisma.listing.count({ where: { id: dto.targetId } });

    if (exists === 0) {
      throw new NotFoundException('Reported resource not found');
    }
  }
}
