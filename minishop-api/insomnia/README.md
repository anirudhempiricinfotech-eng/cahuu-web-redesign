# Insomnia generator assertion fixture

There is intentionally no current Insomnia export in this source tree. The audit workflow should create one from source-discovered operations, use `{{ _.base_url }}` and `{{ _.bearer_token }}`, produce resource groups for Auth, Users, Products, Categories, Orders, Cart, Payments, Inventory, Reviews, and Legacy, include the 35 unique implemented operations, flag `GET /api/v1/product/:id` as deprecated, and collapse the duplicate `POST /api/v1/cart/items` handlers into one request plus an audit warning.
