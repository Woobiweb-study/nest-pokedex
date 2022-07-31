import {
  BadRequestException,
  Injectable,
  InternalServerErrorException, NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { v4 as uuid } from 'uuid';
import { isValidObjectId, Model } from 'mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokenModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    // Il try/catch e il resto servono a evitare multiple chiamate al DB
    try {
      const pokemon = await this.pokenModel.create(createPokemonDto);
      return pokemon;
    } catch (e) {
      this.handleExceptions(e);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokenModel.findOne({ no: term });
    }

    // MongoDB
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokenModel.findById(term);
    }
    // Name
    if (!pokemon) {
      pokemon = await this.pokenModel.findOne({ name: term.toLowerCase() })
    }

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id, name or no "${ term }" not found`,
      );
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (e) {
      this.handleExceptions(e);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // const result = await this.pokenModel.findByIdAndDelete(id);
    const { deletedCount } = await this.pokenModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with ${id} not found`)
    }
    return;
  }

  private handleExceptions(e: any) {
    if (e.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(e.keyValue)}`,
      );
    }
    console.log(e);
    throw new InternalServerErrorException(
      `Can't update Pokemon - Check server logs`
    );
  }
}
