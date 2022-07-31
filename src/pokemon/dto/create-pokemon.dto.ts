import { IsInt, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CreatePokemonDto {
  // isInt, isPositive, min 1
  @IsInt({ message: `This no must be an Integer Number` })
  @IsPositive({ message: `Only positive number permitted` })
  @Min(1)
  no: number;

  // isString, MinLenght 1
  @IsString({ message: `Please, set a name for this Pokemon` })
  @MinLength(1)
  name: string;
}
