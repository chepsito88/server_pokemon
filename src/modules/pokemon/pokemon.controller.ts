import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Controller('api/v1/pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get('pokedex/all')
  async getAllPokemons(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('search') search?: string,
  ) {
    try {
      const pokemons = await this.pokemonService.getAllPokemon(
        limit,
        page - 1,
        search,
      );
      return pokemons;
    } catch (error) {
      throw new BadRequestException('Invalid query parameters');
    }
  }

  @Get('pokedex/:id')
  async getPokemonById(@Param('id') id: string) {
    try {
      const pokemon = await this.pokemonService.getPokemonById(id);
      return pokemon;
    } catch (error) {
      throw new BadRequestException('Invalid Pokemon ID');
    }
  }

  @Post()
  create(@Body() createPokemonDto: CreatePokemonDto) {
    return this.pokemonService.create(createPokemonDto);
  }

  @Get()
  findAll() {
    return this.pokemonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pokemonService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePokemonDto: UpdatePokemonDto) {
    return this.pokemonService.update(id, updatePokemonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pokemonService.remove(id);
  }
}
