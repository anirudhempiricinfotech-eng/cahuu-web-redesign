import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
@Injectable()
export class StoreService {
  private readonly products=[{id:'b51f34f6-daa3-4f1e-a573-f8b77db56027',sku:'AUR-48271',name:'Aurora Pour-Over Kettle',description:'Stainless steel temperature-control kettle for precision brewing.',pricePaise:749900,categoryId:'14aeb17e-b1e0-4a70-a87d-0d841a4f95ec',availableQuantity:18,averageRating:4.7,active:true,tags:['coffee','kitchen']}];
  listProducts(q:any){ let items=this.products.filter(p=>!q.categoryId||p.categoryId===q.categoryId); if(q.search) items=items.filter(p=>p.name.toLowerCase().includes(String(q.search).toLowerCase())); if(q.sort==='price') items.sort((a,b)=>a.pricePaise-b.pricePaise); return {data:items,meta:{page:Number(q.page??1),limit:Number(q.limit??20),total:items.length}}; }
  getProduct(id:string){ const value=this.products.find(p=>p.id===id); if(!value) throw new NotFoundException({code:'PRODUCT_NOT_FOUND',message:`Product ${id} does not exist`}); return value; }
  createProduct(dto:any){ if(this.products.some(p=>p.sku===dto.sku)) throw new ConflictException({code:'SKU_EXISTS',message:'The submitted SKU is already assigned'}); const value={id:crypto.randomUUID(),availableQuantity:0,averageRating:0,...dto}; this.products.push(value); return value; }
  generic(resource:string,id?:string,body?:unknown){ return {data:{id:id??crypto.randomUUID(),resource,...(body as object)},meta:{traceId:crypto.randomUUID(),servedAt:new Date().toISOString()}}; }
}
