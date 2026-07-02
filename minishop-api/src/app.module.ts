import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { ProductsController } from './controllers/products.controller';
import { CategoriesController } from './controllers/categories.controller';
import { OrdersController } from './controllers/orders.controller';
import { CartController } from './controllers/cart.controller';
import { PaymentsController } from './controllers/payments.controller';
import { InventoryController } from './controllers/inventory.controller';
import { ReviewsController } from './controllers/reviews.controller';
import { LegacyController } from './controllers/legacy.controller';
import { StoreService } from './services/store.service';

@Module({
  controllers: [AuthController, UsersController, ProductsController, CategoriesController, OrdersController, CartController, PaymentsController, InventoryController, ReviewsController, LegacyController],
  providers: [StoreService],
})
export class AppModule {}
