import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Matches, Max, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() @Matches(/^[A-Z]{2,6}-[0-9]{4,8}$/) sku!: string;
  @IsString() @Length(3,120) name!: string;
  @IsString() @Length(20,2000) description!: string;
  @IsInt() @Min(50) @Max(50000000) pricePaise!: number;
  @IsUUID() categoryId!: string;
  @IsOptional() @IsArray() @IsString({ each:true }) tags?: string[];
  @IsOptional() @IsBoolean() active?: boolean;
}
export class UpdateProductDto {
  @IsOptional() @IsString() @Length(3,120) name?: string;
  @IsOptional() @IsString() @Length(20,2000) description?: string;
  @IsOptional() @IsInt() @Min(50) @Max(50000000) pricePaise?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class CreateCategoryDto { @IsString() @Length(2,80) name!: string; @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug!: string; }
export class AddReviewDto { @IsInt() @Min(1) @Max(5) rating!: number; @IsString() @Length(10,800) comment!: string; }
export class AdjustInventoryDto { @IsInt() @Min(-10000) @Max(10000) delta!: number; @IsString() @MaxLength(250) reasonDetail!: string; }
export class ProductResponseDto { @IsUUID() id!: string; @IsString() sku!: string; @IsString() name!: string; @IsInt() pricePaise!: number; @IsInt() availableQuantity!: number; @IsNumber() averageRating!: number; }
