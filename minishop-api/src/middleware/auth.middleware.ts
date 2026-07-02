import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../common/enums';
export const Public = () => SetMetadata('public', true);
export const Roles = (...roles:UserRole[]) => SetMetadata('roles', roles);
export const RequirePermission = (...permissions:string[]) => SetMetadata('permissions', permissions);
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context:ExecutionContext) {
    const request=context.switchToHttp().getRequest();
    const token=request.headers.authorization?.replace(/^Bearer /,'');
    if (!token || token.split('.').length !== 3) throw new UnauthorizedException({code:'AUTH_REQUIRED',message:'A valid bearer token is required'});
    request.user={id:'84f45098-b5e5-4b27-8238-89eedf549cce',role:UserRole.CUSTOMER,permissions:['catalog:write']};
    return true;
  }
}
@Injectable()
export class RoleGuard implements CanActivate { canActivate(context:ExecutionContext){ return Boolean(context.switchToHttp().getRequest().user); } }
