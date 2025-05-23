import React, { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import type { Pokemon } from "../types";
import { PokemonCard } from "../components/features/pokemons";
import { useFetch } from "../hooks/useFetch";
import { LoaderComponent } from "../components/common";
import {
  Alert,
  Box,
  Container,
  Divider,
  Grid,
  Pagination,
  Typography,
} from "@mui/material";
import type { PokemonResponse } from "../types/Pokemon-response.interface";

export const HomePage: React.FC = () => {
  const [pokemonList, setPokemonList] = React.useState<Pokemon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingFavorites, setLoadingFavorites] = useState<Set<number>>(
    new Set()
  );
  const [confettiPokemonId, setConfettiPokemonId] = useState<number | null>(
    null
  );

  const pageParams = new URLSearchParams(window.location.search);
  const initialPage = pageParams.get("page");

  useEffect(() => {
    // Para setear la página inicial desde URL params solo una vez
    if (initialPage) {
      const pageNumber = Number(initialPage);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        setCurrentPage(pageNumber);
      }
    }
  }, []);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const {
    error,
    loading,
    execute: fetchPokemons,
  } = useFetch<PokemonResponse>(
    "", 
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      manual: true,
    }
  );

  const handleToggleFavorite = async (id: number) => {
    setLoadingFavorites((prev) => new Set(prev).add(id));
    setConfettiPokemonId(null); // Limpia confetti anterior

    // Simula una llamada API para marcar/desmarcar favorito
    await new Promise((resolve) => setTimeout(resolve, 700)); // Simula delay de red

    setPokemonList((prevList) =>
      prevList.map((p) => {
        if (p.id === id) {
          const updatedPokemon = { ...p, isFavorite: !p.isFavorite };
          if (updatedPokemon.isFavorite) {
            setConfettiPokemonId(id);
            setTimeout(() => {
              setConfettiPokemonId(null);
            }, 3500); // Duración del confetti
          }
          return updatedPokemon;
        }
        return p;
      })
    );

    setLoadingFavorites((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    const url = `/pokemon?limit=25&offset=${(currentPage - 1) * 25}`;
    fetchPokemons({ url })
      .then(async (response) => {
        if (response?.data?.results) {
          const pokemonsWithDetails = await Promise.all(
            response.data.results.map(async (pokemon, index) => {
              try {
                const res = await fetch(pokemon.url);
                const details = await res.json();
                const attacks = details.moves
                  .slice(0, 3)
                  .map((move: any) => move.move.name);
                const stats = details.stats.reduce((acc: any, stat: any) => {
                  acc[stat.stat.name] = stat.base_stat;
                  return acc;
                }, {});
                const description = `Este Pokémon tiene ${stats.hp} HP, ${stats.attack} de ataque y ${stats.defense} de defensa.`;

                const isFavoriteInitially = false;

                return {
                  ...details,
                  name: pokemon.name,
                  id: details.id,
                  description,
                  image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${details.id}.png`,
                  attacks,
                  stats,
                  isFavorite: isFavoriteInitially,
                } as Pokemon;
              } catch (e) {
                console.error("Error fetching details for", pokemon.name, e);
                return {
                  id: index + 1 || (currentPage - 1) * 25 + index + 1,
                  name: pokemon.name,
                  description: "Descripción de " + pokemon.name,
                  image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${
                    index + 1 || (currentPage - 1) * 25 + index + 1
                  }.png`,
                  attacks: [],
                  stats: {},
                  isFavorite: false,
                  abilities: [],
                  types: [],
                } as unknown as Pokemon;
              }
            })
          );
          setPokemonList(pokemonsWithDetails);
        } else {
          setPokemonList([]); // Limpiar lista si no hay resultados
        }
      })
      .catch((err) => {
        console.error("Error fetching pokemons:", err);
      });
  }, [currentPage]);

  if (loading && pokemonList.length === 0) return <LoaderComponent size="large" />; 

  if (error)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Error al cargar los pokemons: {error || JSON.stringify(error)}
        </Alert>
      </Container>
    );

  return (
    <Container
      sx={{ py: 4, bgcolor: "grey.200", minHeight: "100vh", minWidth: "100vw" }}
      maxWidth={false}
    >
      <Typography
        variant="h3"
        component="h1"
        align="center"
        color="primary.main"
        gutterBottom
        sx={{ mb: 4 }}
      >
        SebCode Academy | Pokédex
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Pagination
          count={Math.ceil(898 / 25)} // Asumiendo 898 pokemons totales
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
      <Divider sx={{ my: 2 }} />
      {loading && pokemonList.length === 0 ? ( // Muestra loader si está cargando y no hay pokemons
        <LoaderComponent size="large" />
      ) : pokemonList.length > 0 ? (
        <Grid
          container
          spacing={2}
          justifyContent="center"
          sx={{ px: { xs: 1, sm: 2 } }}
        >
          {pokemonList.map((pokemon) => (
            // Corregido: Grid item en lugar de Grid size
            <Grid
              key={pokemon.id}
              size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <PokemonCard
                pokemon={pokemon}
                onToggleFavorite={handleToggleFavorite}
                isLoading={loadingFavorites.has(pokemon.id)}
                playConfetti={confettiPokemonId === pokemon.id}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        !loading && (
          <Typography align="center">No se encontraron Pokémon.</Typography>
        ) // Mensaje si no hay pokemons y no está cargando
      )}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 2 }}>
        <Pagination
          count={Math.ceil(898 / 25)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Container>
  );
};
