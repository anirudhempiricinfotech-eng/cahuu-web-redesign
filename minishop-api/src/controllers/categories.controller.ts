import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/catalog.dto';
import { UserRole } from '../common/enums';
import { JwtAuthGuard, Public, RoleGuard, Roles } from '../middleware/auth.middleware';
import { StoreService } from '../services/store.service';
@Controller('v2/categories')
export class CategoriesController {
 constructor(private readonly store:StoreService){}
 @Public() @Get() list(){ return {data:[{id:'14aeb17e-b1e0-4a70-a87d-0d841a4f95ec',name:'Specialty Kitchen',slug:'specialty-kitchen'}]}; }
 @Public() @Get(':categoryId/products') products(@Param('categoryId') id:string){ return this.store.generic('category-products',id,{data:this.store.listProducts({categoryId:id}).data}); }
 @Post() @UseGuards(JwtAuthGuard,RoleGuard) @Roles(UserRole.ADMIN)
 create(@Body() body:CreateCategoryDto){ return this.store.generic('category',undefined,body); }
}
