import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { Env } from '../../config/env';

export interface UploadTarget {
  storageKey: string;
  uploadUrl: string;
  publicUrl: string;
}

/**
 * Media never lives in Postgres. Only the storage key is persisted, so swapping
 * the driver for R2 or S3 later does not touch the domain modules.
 */
@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  buildKey(scope: string, filename: string): string {
    const extension = filename.includes('.') ? filename.split('.').pop() : 'bin';
    return `${scope}/${new Date().getFullYear()}/${randomUUID()}.${extension}`;
  }

  publicUrl(storageKey: string): string {
    const base = this.config.get('STORAGE_PUBLIC_URL', { infer: true });
    if (!base) {
      return `/media/${storageKey}`;
    }
    return `${base.replace(/\/$/, '')}/${storageKey}`;
  }
}
