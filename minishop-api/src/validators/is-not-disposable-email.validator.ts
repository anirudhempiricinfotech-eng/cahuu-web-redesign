import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
const BLOCKED = ['mailinator.com','guerrillamail.com','10minutemail.com'];
export function IsNotDisposableEmail(options?:ValidationOptions) {
  return (object:object, propertyName:string) => registerDecorator({
    name:'isNotDisposableEmail', target:object.constructor, propertyName, options,
    validator:{ validate(value:string){ return typeof value === 'string' && !BLOCKED.includes(value.split('@')[1]?.toLowerCase()); },
      defaultMessage(args:ValidationArguments){ return `${args.property} must use a permanent email provider`; } }
  });
}
