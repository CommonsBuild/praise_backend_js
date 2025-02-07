import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';
import { Error } from 'mongoose';
import ValidationError = Error.ValidationError;

@Catch(ValidationError)
export class MongoValidationErrorFilter implements RpcExceptionFilter {
  catch(exception: ValidationError, host: ArgumentsHost): any {
    const ctx = host.switchToHttp(),
      response = ctx.getResponse();

    // Save exception response object for logging purposes
    (response as any).exception = exception;

    return response.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      errors: exception.errors,
    });
  }
}
