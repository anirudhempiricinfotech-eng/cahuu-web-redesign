export interface MiniShopConfig {
  nodeEnv:'local'|'development'|'staging'|'production'; port:number; databaseUrl:string; redisUrl:string;
  jwt:{publicKey:string;privateKey:string}; paymentProviderApiKey:string; logLevel:'debug'|'info'|'warn'|'error';
}
export default ():MiniShopConfig => ({
  nodeEnv:(process.env.NODE_ENV as MiniShopConfig['nodeEnv']) ?? 'local',
  port:Number(process.env.PORT ?? 3100),
  databaseUrl:process.env.DATABASE_URL ?? '',
  redisUrl:process.env.REDIS_URL ?? '',
  jwt:{publicKey:process.env.JWT_PUBLIC_KEY ?? '',privateKey:process.env.JWT_PRIVATE_KEY ?? ''},
  paymentProviderApiKey:process.env.PAYMENT_PROVIDER_API_KEY ?? '',
  logLevel:(process.env.LOG_LEVEL as MiniShopConfig['logLevel']) ?? 'info'
});
