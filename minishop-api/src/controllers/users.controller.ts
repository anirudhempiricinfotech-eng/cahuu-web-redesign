import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ChangeRoleDto, UpdateUserDto } from '../dto/auth-user.dto';
import { JwtAuthGuard, RequirePermission, RoleGuard, Roles } from '../middleware/auth.middleware';
import { UserRole } from '../common/enums';
import { StoreService } from '../services/store.service';
@Controller('v1/users') @UseGuards(JwtAuthGuard)
export class UsersController {
 constructor(private readonly store:StoreService){}
 @Get('me') me(){ return this.store.generic('user','84f45098-b5e5-4b27-8238-89eedf549cce',{email:'meera.iyer@northwindatelier.in',displayName:'Meera Iyer',phone:'+919821476530',role:'customer',marketingOptIn:false}); }
 @Patch('me') updateMe(@Body() body:UpdateUserDto){ return this.store.generic('user','84f45098-b5e5-4b27-8238-89eedf549cce',body); }
 @Patch(':userId/role') @UseGuards(RoleGuard) @Roles(UserRole.ADMIN) @RequirePermission('users:roles:write')
 changeRole(@Param('userId') id:string,@Body() body:ChangeRoleDto){ return this.store.generic('user',id,{role:body.role,roleChangedAt:new Date().toISOString()}); }
 @Delete(':userId') @UseGuards(RoleGuard) @Roles(UserRole.ADMIN) @RequirePermission('users:delete')
 remove(@Param('userId') id:string){ return this.store.generic('user-deletion',id,{deletionScheduledAt:'2026-07-09T08:30:00.000Z'}); }
}
