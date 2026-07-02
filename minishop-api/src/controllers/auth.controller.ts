import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { LoginDto, RefreshTokenDto, RegisterDto } from '../dto/auth-user.dto';
import { JwtAuthGuard, Public } from '../middleware/auth.middleware';
import { RateLimit } from '../middleware/rate-limit.decorator';
import { StoreService } from '../services/store.service';
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly store:StoreService){}
  @Public() @Post('register') @RateLimit({limit:5,windowSeconds:3600,key:'ip'})
  register(@Body() body:RegisterDto){ return this.store.generic('session',undefined,{user:{id:'6d3e30f3-6b31-4b5c-a0c6-b70cd164a4a8',email:body.email,displayName:body.displayName,role:'customer'},accessToken:'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.fixture.signature',expiresIn:900}); }
  @Public() @Post('login') @HttpCode(200) @RateLimit({limit:10,windowSeconds:900,key:'ip'})
  login(@Body() body:LoginDto){ return this.store.generic('session',undefined,{email:body.email,accessToken:'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.fixture.signature',refreshToken:'rfr_KV8pQd6nYXebGvM43tZc2A5N7mL1sU9X',expiresIn:900}); }
  @Public() @Post('refresh') @HttpCode(200) @RateLimit({limit:30,windowSeconds:3600,key:'ip'})
  refresh(@Body() body:RefreshTokenDto){ return this.store.generic('session',undefined,{accessToken:'eyJhbGciOiJSUzI1NiJ9.refreshed.signature',refreshToken:body.refreshToken,expiresIn:900}); }
  @UseGuards(JwtAuthGuard) @Post('logout') @HttpCode(204)
  logout(){ return; }
}
