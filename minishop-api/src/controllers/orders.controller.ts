import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto/commerce.dto';
import { UserRole } from '../common/enums';
import { JwtAuthGuard, RequirePermission, RoleGuard, Roles } from '../middleware/auth.middleware';
import { RateLimit } from '../middleware/rate-limit.decorator';
import { StoreService } from '../services/store.service';
@Controller('v1/orders') @UseGuards(JwtAuthGuard)
export class OrdersController {
 constructor(private readonly store:StoreService){}
 @Post() @RateLimit({limit:20,windowSeconds:3600,key:'user'})
 create(@Body() body:CreateOrderDto){ return this.store.generic('order','51426837-cb0c-4b56-85cf-a0ea7b62dc81',{orderNumber:'MS-2026-008427',status:'pending',totalPaise:1249800,...body}); }
 @Get() list(@Query() query:{status?:string;page?:number;limit?:number;sort?:string}){ return this.store.generic('orders',undefined,{filters:query,data:[{id:'51426837-cb0c-4b56-85cf-a0ea7b62dc81',orderNumber:'MS-2026-008427',status:'paid',totalPaise:1249800,createdAt:'2026-06-29T14:23:18.000Z'}]}); }
 @Get(':orderId') get(@Param('orderId') id:string){ return this.store.generic('order',id,{orderNumber:'MS-2026-008427',status:'paid',totalPaise:1249800,estimatedDeliveryAt:'2026-07-05T18:30:00.000Z'}); }
 @Patch(':orderId/status') @UseGuards(RoleGuard) @Roles(UserRole.ADMIN,UserRole.MANAGER) @RequirePermission('orders:status:write')
 status(@Param('orderId') id:string,@Body() body:UpdateOrderStatusDto){ return this.store.generic('order',id,{status:body.status,updatedAt:new Date().toISOString()}); }
}
