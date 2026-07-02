export type Access='public'|'customer'|'manager'|'admin';
export interface RouteCatalogEntry { method:'GET'|'POST'|'PATCH'|'DELETE'; path:string; resource:string; access:Access; version:'v1'|'v2'; deprecated?:boolean; }
export const routeCatalog:RouteCatalogEntry[]=[
['POST','/api/v1/auth/register','Authentication','public','v1'],['POST','/api/v1/auth/login','Authentication','public','v1'],['POST','/api/v1/auth/refresh','Authentication','public','v1'],['POST','/api/v1/auth/logout','Authentication','customer','v1'],
['GET','/api/v1/users/me','Users','customer','v1'],['PATCH','/api/v1/users/me','Users','customer','v1'],['PATCH','/api/v1/users/:userId/role','Users','admin','v1'],['DELETE','/api/v1/users/:userId','Users','admin','v1'],
['GET','/api/v2/products','Products','public','v2'],['GET','/api/v2/products/:productId','Products','public','v2'],['POST','/api/v2/products','Products','manager','v2'],['PATCH','/api/v2/products/:productId','Products','manager','v2'],['DELETE','/api/v2/products/:productId','Products','admin','v2'],
['GET','/api/v2/categories','Categories','public','v2'],['GET','/api/v2/categories/:categoryId/products','Categories','public','v2'],['POST','/api/v2/categories','Categories','admin','v2'],
['POST','/api/v1/orders','Orders','customer','v1'],['GET','/api/v1/orders','Orders','customer','v1'],['GET','/api/v1/orders/:orderId','Orders','customer','v1'],['PATCH','/api/v1/orders/:orderId/status','Orders','manager','v1'],
['GET','/api/v1/cart','Cart','customer','v1'],['POST','/api/v1/cart/items','Cart','customer','v1'],['PATCH','/api/v1/cart/items/:itemId','Cart','customer','v1'],['DELETE','/api/v1/cart/items/:itemId','Cart','customer','v1'],['POST','/api/v1/cart/checkout','Cart','customer','v1'],
['GET','/api/v1/payments/:paymentId','Payments','customer','v1'],['POST','/api/v1/payments/:paymentId/capture','Payments','manager','v1'],['POST','/api/v1/payments/:paymentId/refunds','Payments','admin','v1'],
['GET','/api/v1/inventory','Inventory','manager','v1'],['GET','/api/v1/inventory/:productId','Inventory','manager','v1'],['POST','/api/v1/inventory/:productId/adjustments','Inventory','manager','v1'],
['GET','/api/v1/products/:productId/reviews','Reviews','public','v1'],['POST','/api/v1/products/:productId/reviews','Reviews','customer','v1'],['DELETE','/api/v1/reviews/:reviewId','Reviews','admin','v1'],
['GET','/api/v1/product/:id','Products','public','v1',true],
].map(([method,path,resource,access,version,deprecated])=>({method,path,resource,access,version,deprecated})) as RouteCatalogEntry[];
