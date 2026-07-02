import { InventoryReason, OrderStatus, PaymentProvider, PaymentStatus, UserRole } from '../common/enums';
export class User { id!:string; email!:string; passwordHash!:string; displayName!:string; role!:UserRole; phone?:string; createdAt!:Date; addresses!:Address[]; }
export class Address { id!:string; userId!:string; recipient!:string; line1!:string; line2?:string; postalCode!:string; city!:string; state!:string; countryCode!:string; }
export class Category { id!:string; name!:string; slug!:string; products!:Product[]; }
export class Product { id!:string; sku!:string; name!:string; description!:string; pricePaise!:number; categoryId!:string; category!:Category; inventory!:Inventory; active!:boolean; tags!:string[]; createdAt!:Date; }
export class Inventory { productId!:string; onHand!:number; reserved!:number; reorderLevel!:number; adjustments!:InventoryAdjustment[]; }
export class InventoryAdjustment { id!:string; productId!:string; delta!:number; reason!:InventoryReason; reasonDetail!:string; actorId!:string; createdAt!:Date; }
export class Cart { id!:string; userId!:string; items!:CartItem[]; updatedAt!:Date; }
export class CartItem { id!:string; cartId!:string; productId!:string; quantity!:number; unitPricePaise!:number; product!:Product; }
export class Order { id!:string; orderNumber!:string; userId!:string; items!:OrderItem[]; shippingAddress!:Address; status!:OrderStatus; totalPaise!:number; payment?:Payment; createdAt!:Date; }
export class OrderItem { id!:string; orderId!:string; productId!:string; quantity!:number; unitPricePaise!:number; productNameSnapshot!:string; }
export class Payment { id!:string; orderId!:string; provider!:PaymentProvider; providerReference!:string; amountPaise!:number; status!:PaymentStatus; capturedAt?:Date; }
export class Review { id!:string; userId!:string; productId!:string; rating!:number; comment!:string; approved!:boolean; createdAt!:Date; }
