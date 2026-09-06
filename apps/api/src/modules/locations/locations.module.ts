import { Global, Module } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Global()
@Module({
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
