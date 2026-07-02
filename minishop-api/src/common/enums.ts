export enum UserRole { CUSTOMER='customer', MANAGER='manager', ADMIN='admin' }
export enum OrderStatus { PENDING='pending', PAID='paid', FULFILLING='fulfilling', SHIPPED='shipped', DELIVERED='delivered', CANCELLED='cancelled' }
export enum PaymentProvider { STRIPE='stripe', ADYEN='adyen', PAYPAL='paypal' }
export enum PaymentStatus { REQUIRES_ACTION='requires_action', CAPTURED='captured', REFUNDED='refunded', FAILED='failed' }
export enum InventoryReason { RECEIPT='receipt', SALE='sale', RETURN='return', DAMAGE='damage', RECONCILIATION='reconciliation' }
