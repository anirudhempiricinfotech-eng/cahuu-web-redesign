import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
@Catch()
export class ErrorResponseFilter implements ExceptionFilter {
  catch(error:unknown, host:ArgumentsHost){
    const response=host.switchToHttp().getResponse(); const request=host.switchToHttp().getRequest();
    const status=error instanceof HttpException?error.getStatus():HttpStatus.INTERNAL_SERVER_ERROR;
    const raw=error instanceof HttpException?error.getResponse():undefined;
    const value=typeof raw==='object'&&raw?raw as any:{code:'INTERNAL_ERROR',message:'An unexpected error occurred'};
    response.status(status).json({code:value.code??'REQUEST_FAILED',message:value.message??'The request could not be completed',details:value.details,traceId:request.headers['x-correlation-id']});
  }
}
