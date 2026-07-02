import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AddCartItemDto, CheckoutDto, UpdateCartItemDto } from '../dto/commerce.dto';
import { JwtAuthGuard } from '../middleware/auth.middleware';
import { RateLimit } from '../middleware/rate-limit.decorator';
import { StoreService } from '../services/store.service';
@Controller('v1/cart') @UseGuards(JwtAuthGuard)
export class CartController {
 constructor(private readonly store:StoreService){}
 @Get() get(){ return this.store.generic('cart','a997ea50-bc16-4fe3-a4f1-a41bf991aa92',{items:[{id:'7ea64e33-5eea-4178-b26c-d67407cdf5f8',productId:'b51f34f6-daa3-4f1e-a573-f8b77db56027',quantity:1,unitPricePaise:749900}],subtotalPaise:749900}); }
 @Post('items') add(@Body() body:AddCartItemDto){ return this.store.generic('cart-item',undefined,body); }
 @Patch('items/:itemId') update(@Param('itemId') id:string,@Body() body:UpdateCartItemDto){ return this.store.generic('cart-item',id,body); }
 @Delete('items/:itemId') remove(@Param('itemId') id:string){ return this.store.generic('cart-item-removal',id,{removed:true}); }
 @Post('checkout') @RateLimit({limit:8,windowSeconds:900,key:'user'})
 checkout(@Body() body:CheckoutDto){ return this.store.generic('checkout','chk_9PZn7eVyR2G4wK8M',{orderId:'51426837-cb0c-4b56-85cf-a0ea7b62dc81',paymentStatus:'requires_action',clientAction:{type:'redirect',expiresAt:'2026-07-02T11:00:00.000Z'},...body}); }
}
