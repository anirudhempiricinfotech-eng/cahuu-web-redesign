import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AddReviewDto } from '../dto/catalog.dto';
import { UserRole } from '../common/enums';
import { JwtAuthGuard, Public, RoleGuard, Roles } from '../middleware/auth.middleware';
import { StoreService } from '../services/store.service';
@Controller('v1')
export class ReviewsController {
 constructor(private readonly store:StoreService){}
 @Public() @Get('products/:productId/reviews') list(@Param('productId') id:string,@Query() query:{page?:number;limit?:number;rating?:number}){ return this.store.generic('reviews',undefined,{productId:id,filter:query,data:[{id:'9e1378a7-754d-4ece-b27e-ddb64d32d7cb',rating:5,comment:'The temperature hold stays accurate through a full brew cycle.',reviewerDisplayName:'Ananya Rao',createdAt:'2026-06-18T09:12:44.000Z'}]}); }
 @Post('products/:productId/reviews') @UseGuards(JwtAuthGuard)
 create(@Param('productId') id:string,@Body() body:AddReviewDto){ return this.store.generic('review','9e1378a7-754d-4ece-b27e-ddb64d32d7cb',{productId:id,approved:false,...body}); }
 @Delete('reviews/:reviewId') @UseGuards(JwtAuthGuard,RoleGuard) @Roles(UserRole.ADMIN)
 remove(@Param('reviewId') id:string){ return this.store.generic('review',id,{moderationState:'removed',removedAt:new Date().toISOString()}); }
}
