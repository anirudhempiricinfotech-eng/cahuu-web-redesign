import { Injectable, NestMiddleware } from '@nestjs/common';
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req:any,res:any,next:()=>void) {
    const started=Date.now(); const correlationId=req.headers['x-correlation-id'] ?? crypto.randomUUID();
    res.setHeader('x-correlation-id',correlationId);
    res.on('finish',()=>console.info(JSON.stringify({method:req.method,path:req.originalUrl,status:res.statusCode,durationMs:Date.now()-started,correlationId})));
    next();
  }
}
