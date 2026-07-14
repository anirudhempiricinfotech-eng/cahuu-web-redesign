import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { AddressDto } from './auth-user.dto';
import { OrderStatus, PaymentProvider } from '../common/enums';

export class CartItemDto { @IsUUID() productId!: string; @IsInt() @Min(1) @Max(20) quantity!: number; }
export class AddCartItemDto extends CartItemDto {}
export class UpdateCartItemDto { @IsInt() @Min(1) @Max(20) quantity!: number; }
export class CheckoutDto {
  @ValidateNested() @Type(() => AddressDto) shippingAddress!: AddressDto;
  @IsEnum(PaymentProvider) paymentProvider!: PaymentProvider;
  @IsOptional() @IsString() promotionCode?: string;
}
export class CreateOrderDto {
  @IsArray() @ValidateNested({ each:true }) @Type(() => CartItemDto) items!: CartItemDto[];
  @ValidateNested() @Type(() => AddressDto) shippingAddress!: AddressDto;
}
export class UpdateOrderStatusDto { @IsEnum(OrderStatus) status!: OrderStatus; }
export class RefundPaymentDto { @IsInt() @Min(100) amountPaise!: number; @IsString() reason!: string; }
export class OrderResponseDto { @IsUUID() id!: string; @IsString() orderNumber!: string; @IsEnum(OrderStatus) status!: OrderStatus; @IsInt() totalPaise!: number; }
