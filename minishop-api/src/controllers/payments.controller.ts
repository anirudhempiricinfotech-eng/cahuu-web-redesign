import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RefundPaymentDto } from '../dto/commerce.dto';
import { UserRole } from '../common/enums';
import { JwtAuthGuard, RequirePermission, RoleGuard, Roles } from '../middleware/auth.middleware';
import { RateLimit } from '../middleware/rate-limit.decorator';
import { StoreService } from '../services/store.service';
@Controller('v1/payments') @UseGuards(JwtAuthGuard)
export class PaymentsController {
 constructor(private readonly store:StoreService){}
 @Get(':paymentId') get(@Param('paymentId') id:string){ return this.store.generic('payment',id,{orderId:'51426837-cb0c-4b56-85cf-a0ea7b62dc81',provider:'stripe',providerReference:'pi_3PZ9xN2eZvKYlo2C0fKbqYpA',amountPaise:1249800,status:'captured',capturedAt:'2026-06-29T14:27:52.000Z'}); }
 @Post(':paymentId/capture') @UseGuards(RoleGuard) @Roles(UserRole.MANAGER,UserRole.ADMIN) @RequirePermission('payments:capture') @RateLimit({limit:30,windowSeconds:3600,key:'user'})
 capture(@Param('paymentId') id:string){ return this.store.generic('payment',id,{status:'captured',capturedAt:new Date().toISOString()}); }
 @Post(':paymentId/refunds') @UseGuards(RoleGuard) @Roles(UserRole.ADMIN) @RequirePermission('payments:refund')
 refund(@Param('paymentId') id:string,@Body() body:RefundPaymentDto){ return this.store.generic('refund','rf_4Jc91pXzN6Qy2mLT',{paymentId:id,status:'submitted',...body}); }
}
