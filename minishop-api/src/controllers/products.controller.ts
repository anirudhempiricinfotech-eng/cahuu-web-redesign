import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from '../dto/catalog.dto';
import { JwtAuthGuard, Public, RequirePermission, RoleGuard, Roles } from '../middleware/auth.middleware';
import { UserRole } from '../common/enums';
import { StoreService } from '../services/store.service';
@Controller('v2/products')
export class ProductsController {
 constructor(private readonly store:StoreService){}
 @Public() @Get() list(@Query() query:{page?:number;limit?:number;categoryId?:string;search?:string;sort?:'price'|'name'|'rating'}){ return this.store.listProducts(query); }
 @Public() @Get(':productId') get(@Param('productId') id:string){ return this.store.getProduct(id); }
 @Post() @UseGuards(JwtAuthGuard,RoleGuard) @Roles(UserRole.ADMIN,UserRole.MANAGER) @RequirePermission('catalog:write')
 create(@Body() body:CreateProductDto){ return this.store.createProduct(body); }
 @Patch(':productId') @UseGuards(JwtAuthGuard,RoleGuard) @Roles(UserRole.ADMIN,UserRole.MANAGER) @RequirePermission('catalog:write')
 update(@Param('productId') id:string,@Body() body:UpdateProductDto){ return this.store.generic('product',id,body); }
 @Delete(':productId') @UseGuards(JwtAuthGuard,RoleGuard) @Roles(UserRole.ADMIN) @RequirePermission('catalog:delete')
 archive(@Param('productId') id:string){ return this.store.generic('product',id,{active:false,archivedAt:'2026-07-02T10:45:12.000Z'}); }
}
