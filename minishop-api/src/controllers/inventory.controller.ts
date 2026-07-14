import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AdjustInventoryDto } from '../dto/catalog.dto';
import { UserRole } from '../common/enums';
import { JwtAuthGuard, RequirePermission, RoleGuard, Roles } from '../middleware/auth.middleware';
import { StoreService } from '../services/store.service';
@Controller('v1/inventory') @UseGuards(JwtAuthGuard,RoleGuard) @Roles(UserRole.MANAGER,UserRole.ADMIN)
export class InventoryController {
 constructor(private readonly store:StoreService){}
 @Get() @RequirePermission('inventory:read') list(@Query() query:{lowStockOnly?:boolean;warehouseId?:string;page?:number;limit?:number}){ return this.store.generic('inventory',undefined,{filters:query,data:[{productId:'b51f34f6-daa3-4f1e-a573-f8b77db56027',sku:'AUR-48271',onHand:21,reserved:3,available:18,reorderLevel:8}]}); }
 @Get(':productId') @RequirePermission('inventory:read') get(@Param('productId') id:string){ return this.store.generic('inventory',id,{onHand:21,reserved:3,available:18,reorderLevel:8}); }
 @Post(':productId/adjustments') @RequirePermission('inventory:write')
 adjust(@Param('productId') id:string,@Body() body:AdjustInventoryDto){ return this.store.generic('inventory-adjustment','92b6e233-2047-4125-8381-f6a7d20e16d8',{productId:id,previousOnHand:21,newOnHand:body.delta+21,...body}); }
}
