import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { ListingSearchRepository } from './listings.repository';

@Module({
  controllers: [ListingsController],
  providers: [ListingsService, ListingSearchRepository],
  exports: [ListingsService],
})
export class ListingsModule {}
