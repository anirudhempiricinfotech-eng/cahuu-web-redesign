import { SetMetadata } from '@nestjs/common';
export interface RateLimitPolicy { limit:number; windowSeconds:number; key:'ip'|'user'; }
export const RateLimit = (policy:RateLimitPolicy) => SetMetadata('rateLimit', policy);
