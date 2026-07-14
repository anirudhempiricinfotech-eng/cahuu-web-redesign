import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Public } from '../middleware/auth.middleware';
import { StoreService } from '../services/store.service';
@Controller('v1')
export class LegacyController {
 constructor(private readonly store:StoreService){}
 /** @deprecated Use GET /api/v2/products/:productId. Kept callable until 2026-09-30. */
 @Public() @Get('product/:id') product(@Param('id') id:string){ return this.store.getProduct(id); }
 /** Intentionally duplicates CartController POST /api/v1/cart/items to exercise route-collision detection. */
 @UseGuards(JwtAuthGuard) @Post('cart/items') duplicateCartAdd(@Body() body:any){ return this.store.generic('legacy-cart-item',undefined,body); }
}
