
export interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

export interface PokemonStat {
  stat: { name: string; url: string };
  effort: number;
  base_stat: number;
}

export interface PokemonAbility {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonMove {
  move: { name: string; url: string };
}

export interface PokemonDetails {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
      dream_world?: {
        front_default: string | null;
      }
    };
    front_default: string | null;
  };
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  species: { name: string; url: string };
}

export interface PokemonSpeciesFlavorTextEntry {
  flavor_text: string;
  language: { name: string; url: string };
  version: { name: string; url: string };
}

export interface PokemonSpeciesGenera {
  genus: string;
  language: { name: string; url: string };
}

export interface PokemonSpeciesDetails {
  id: number;
  name: string;
  flavor_text_entries: PokemonSpeciesFlavorTextEntry[];
  evolution_chain: { url: string };
  genera: PokemonSpeciesGenera[];
}

export interface EvolutionLink {
  species: { name: string; url: string };
  evolves_to: EvolutionLink[];
  evolution_details: Array<{
    min_level?: number;
    item?: { name: string };
    trigger?: { name: string };
  }>;
}

export interface EvolutionChainDetails {
  id: number;
  chain: EvolutionLink;
}

// For our processed evolution data
export interface ProcessedEvolutionStage {
  name: string;
  id: string;
  imageUrl: string;
  trigger: string;
  isCurrent?: boolean;
}