import { Injectable } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './schemas/pokemon.schema';
import { Model } from 'mongoose';
import { ConflictException } from '@nestjs/common/exceptions';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

@Injectable()
export class PokemonService {
  private readonly pokeApiUrl = 'https://pokeapi.co/api/v2/pokemon';
  constructor(
    @InjectModel(Pokemon.name) private pokemonModel: Model<Pokemon>,
    private readonly httpService: HttpService,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    const existsPokemon = await this.pokemonModel.findOne({
      name: createPokemonDto.name,
    });

    if (existsPokemon) {
      throw new ConflictException(`Pokemon ${createPokemonDto.name} exists`);
    }

    const createdHero = new this.pokemonModel(createPokemonDto);
    return createdHero.save();
  }

  findAll() {
    return this.pokemonModel.find();
  }

  async findOne(id: string) {
    const existsPokemon = await this.pokemonModel.findById(id);

    if (!existsPokemon) {
      throw new ConflictException(`Pokemon no exists`);
    }

    return this.pokemonModel.findById(id);
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const existsPokemon = await this.pokemonModel.findById(id);

    if (!existsPokemon) {
      throw new ConflictException(`Pokemon no exists`);
    }

    if (updatePokemonDto.name) {
      const existsNewPokemon = await this.pokemonModel.findOne({
        name: updatePokemonDto.name,
      });
      if (existsNewPokemon) {
        throw new ConflictException(
          `Pokemon ${updatePokemonDto.name} exists and cannot be replaced`,
        );
      }
    }

    await this.pokemonModel.findByIdAndUpdate(id, updatePokemonDto);
    return this.pokemonModel.findById(id);
  }

  async remove(id: string) {
    const existsPokemon = await this.pokemonModel.findById(id);

    if (!existsPokemon) {
      throw new ConflictException(`Pokemon no exists`);
    }

    await this.pokemonModel.findByIdAndDelete(id);
    return existsPokemon;
  }

  async getAllPokemon(limit?: number, page?: number, search?: string) {
    if (limit !== undefined && page !== undefined && (limit <= 0 || page < 0)) {
      throw new Error('Invalid pagination parameters');
    }

    const url = new URL(this.pokeApiUrl);
    url.searchParams.set('limit', limit ? limit.toString() : '100000');
    url.searchParams.set('offset', page ? (limit * page).toString() : '0');

    try {
      const response = await axios.get(url.toString());
      let pokemonList = response.data.results;

      if (search) {
        const searchTerm = search.toLowerCase();
        pokemonList = pokemonList.filter((pokemon) =>
          pokemon.name.toLowerCase().includes(searchTerm),
        );
      }

      const sortedPokemonList = pokemonList.sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      return sortedPokemonList;
    } catch (error) {
      throw new Error('Failed to fetch Pokemon data');
    }
  }

  async getPokemonById(id: string) {
    try {
      const response = await axios.get(`${this.pokeApiUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
