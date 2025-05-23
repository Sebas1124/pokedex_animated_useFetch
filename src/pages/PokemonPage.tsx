import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Grid, IconButton, Paper, Divider,
  useTheme, useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FastAverageColor } from 'fast-average-color';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import your types
import type {
  PokemonDetails, PokemonSpeciesDetails, EvolutionChainDetails, EvolutionLink, ProcessedEvolutionStage
} from '../types/pokemonDetailsType.interface';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useFetch } from '../hooks/useFetch';
import { LoaderComponent } from '../components/common';

gsap.registerPlugin(ScrollTrigger);

const fac = new FastAverageColor();


const getEnglishFlavorText = (entries: PokemonSpeciesDetails['flavor_text_entries']): string => {
  const entry = entries.find(e => e.language.name === 'en');
  return entry ? entry.flavor_text.replace(/[\n\f\r]/g, ' ') : 'No description available.';
};


const getEnglishGenus = (entries: PokemonSpeciesDetails['genera']): string => {
  const entry = entries.find(e => e.language.name === 'en');
  return entry ? entry.genus : '';
};


const processEvolutionChain = (chain: EvolutionLink, currentPokemonName: string): ProcessedEvolutionStage[] => {
  const stages: ProcessedEvolutionStage[] = [];
  let currentEvoLink: EvolutionLink | undefined = chain;

  function traverse(link: EvolutionLink, parentTrigger = "Base Form"): void {
    const speciesUrlParts = link.species.url.split('/');
    const id = speciesUrlParts[speciesUrlParts.length - 2];
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    
    let triggerText = parentTrigger;
    if (link.evolution_details && link.evolution_details.length > 0) {
        const detail = link.evolution_details[0]; // Simplified
        if (detail.min_level) triggerText = `Lvl ${detail.min_level}`;
        else if (detail.item) triggerText = `Use ${detail.item.name.replace(/-/g, ' ')}`;
        else if (detail.trigger) triggerText = detail.trigger.name.replace(/-/g, ' ');
        else triggerText = "Special";
    }

    stages.push({
      name: link.species.name,
      id: id,
      imageUrl: imageUrl,
      trigger: triggerText, // This describes how THIS stage was reached from previous OR its base form.
      isCurrent: link.species.name === currentPokemonName,
    });

    link.evolves_to.forEach(evo => traverse(evo, triggerText)); // Pass current stage's trigger as parentTrigger to next
  }

  traverse(currentEvoLink);
  // Make sure the trigger for the first pokemon is "Base Form" or similar
  if (stages.length > 0 && stages[0].name === chain.species.name) {
    stages[0].trigger = "Base Form";
  }
  return stages;
};


export const PokemonPage: React.FC = () => {
  const { searchTerm }  = useParams<{ searchTerm: string }>();
  const navigate        = useNavigate();
  const theme           = useTheme();
  const isMobile        = useMediaQuery(theme.breakpoints.down('sm'));

  const [pokemon, setPokemon]               = useState<PokemonDetails | null>(null);
  const [species, setSpecies]               = useState<PokemonSpeciesDetails | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<ProcessedEvolutionStage[] | null>(null);
  const [dominantColor, setDominantColor]   = useState<string>(theme.palette.grey[200]);
  const [textColor, setTextColor]           = useState<string>(theme.palette.text.primary);


  const mainContainerRef  = useRef<HTMLDivElement>(null);
  const pokemonImageRef   = useRef<HTMLImageElement>(null);
  const heroContentRef    = useRef<HTMLDivElement>(null);
  const sectionsRef       = useRef<HTMLDivElement[]>([]);

  const addToRefs = (el: HTMLDivElement) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const { execute: fetchResource, loading, error } = useFetch<any>(
    "",
    {
      manual: true,
      method: 'GET',
    }
  );

  useEffect(() => {
    const fetchAllPokemonData = async () => {
      if (!searchTerm) {
        return;
      }

      setPokemon(null);
      setSpecies(null);
      setEvolutionChain(null);
      sectionsRef.current = [];

      try {
        // 1. Fetch Basic Pokemon Data
        const pokemonResponse = await fetchResource({ url: `/pokemon/${searchTerm.toLowerCase()}` });
        if (!pokemonResponse || !pokemonResponse.data) {
          throw new Error(`Pokémon "${searchTerm}" not found or data could not be fetched.`);
        }
        const pokeData: PokemonDetails = pokemonResponse.data;
        setPokemon(pokeData);

        // 2. Fetch Species Data
        const speciesResponse = await fetchResource({ url: pokeData.species.url });
        if (!speciesResponse || !speciesResponse.data) {
          throw new Error(`Species data for "${pokeData.name}" not found.`);
        }
        const speciesData: PokemonSpeciesDetails = speciesResponse.data;
        setSpecies(speciesData);

        // 3. Fetch Evolution Chain Data
        if (speciesData.evolution_chain.url) {
          const evoChainResponse = await fetchResource({ url: speciesData.evolution_chain.url });
          if (!evoChainResponse || !evoChainResponse.data) {
            throw new Error(`Evolution chain for "${pokeData.name}" not found.`);
          }
          const evoChainData: EvolutionChainDetails = evoChainResponse.data;
          setEvolutionChain(processEvolutionChain(evoChainData.chain, pokeData.name));
        }

        // 4. Extract Dominant Color
        const imageUrl = pokeData.sprites.other?.['official-artwork']?.front_default || pokeData.sprites.front_default;
        if (imageUrl) {
          try {
            const color = await fac.getColorAsync(imageUrl, { crossOrigin: 'anonymous' });
            setDominantColor(color.rgba);
            setTextColor(color.isDark ? '#FFFFFF' : '#000000');
          } catch (colorError) {
            console.warn("Could not extract dominant color:", colorError);
            setDominantColor(theme.palette.grey[300]); // Fallback
            setTextColor(theme.palette.text.primary);
          }
        } else {
          setDominantColor(theme.palette.grey[300]);
          setTextColor(theme.palette.text.primary);
        }

      } catch (err: any) {
        console.error("Error fetching Pokémon data sequence:", err);
        setPokemon(null);
        setSpecies(null);
        setEvolutionChain(null);
      }
    };

    fetchAllPokemonData();
  }, [searchTerm, theme.palette.grey, theme.palette.text.primary]);


  // GSAP Animations
  useEffect(() => {
    if (loading || !pokemon || !mainContainerRef.current) return;

    const tl = gsap.timeline();

    document.querySelectorAll('.stat-bar').forEach(bar => {
      const value = parseInt(bar.getAttribute('data-value') || '0', 10);
      const maxWidth = 255; // A common max for base stats, adjust if needed

      gsap.to(bar, {
        width: `${(value / maxWidth) * 100}%`,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bar.closest('div[class*="MuiBox-root"]'), // Trigger when the stat's parent Box is in view
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      });
    });

    // Hero Section Animation
    tl.fromTo(heroContentRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    );
    tl.fromTo(pokemonImageRef.current,
      { opacity: 0, scale: 0.5, y: 100 },
      { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'elastic.out(1, 0.5)' },
      "-=0.5" // Overlap with previous animation
    );

    // Parallax for Pokemon Image
    gsap.to(pokemonImageRef.current, {
      yPercent: -25, // Move image up 25% of its height as user scrolls down
      ease: 'none',
      scrollTrigger: {
        trigger: mainContainerRef.current,
        start: 'top top',
        end: 'bottom top', // End when bottom of trigger hits top of viewport
        scrub: 1, // Smooth scrubbing
        // markers: true, // For debugging
      },
    });
    
    // Staggered animation for subsequent sections
    sectionsRef.current.forEach((section) => {
      gsap.fromTo(section,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%', // Start animation when section is 85% from top
            toggleActions: 'play none none none', // Play once
            // markers: true,
          }
        }
      );
    });

    // Cleanup ScrollTriggers on component unmount or when searchTerm changes
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      tl.kill();
    };
  }, [loading, pokemon]);

  const pokemonImageUrl = pokemon?.sprites.other?.['official-artwork']?.front_default ||
                          pokemon?.sprites.other?.dream_world?.front_default ||
                          pokemon?.sprites.front_default ||
                          '';


  const flavorText = useMemo(() => species ? getEnglishFlavorText(species.flavor_text_entries) : '', [species]);
  const genus = useMemo(() => species ? getEnglishGenus(species.genera) : '', [species]);

  if (loading) {
    return (
      <LoaderComponent
        size='large'
        sx={{
          color: dominantColor,
        }}
      />
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
        <Typography variant="h4" color="error" gutterBottom>Error</Typography>
        <Typography>{error}</Typography>
        <IconButton onClick={() => navigate(-1)} sx={{ mt: 2 }} color="primary">
          <ArrowBackIcon />
          <Typography sx={{ ml: 1 }}>Volver</Typography>
        </IconButton>
      </Box>
    );
  }

  if (!pokemon) {
    return ( 
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
             <Typography>No se pudo cargar el pokemon</Typography>
        </Box>
    );
  }

  return (
    <Box
      ref={mainContainerRef}
      sx={{
        minHeight: '100vh',
        backgroundColor: dominantColor,
        color: textColor,
        transition: 'background-color 0.7s ease, color 0.7s ease',
        overflowX: 'hidden', 
        position: 'relative',
      }}
    >

      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 24 },
          left: { xs: 16, sm: 24 },
          zIndex: 10,
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: textColor,
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.4)' }
        }}
        aria-label="go back"
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Hero Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: '80vh', sm: '90vh' },
          pt: { xs: 12, sm: 8 },
          pb: 4,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Box ref={heroContentRef} sx={{ zIndex: 2, mb: { xs: -8, sm: -12, md: -16 }}}>
          <Typography variant="caption" sx={{ fontSize: '1.2rem', opacity: 0.8 }}>
            #{pokemon.id.toString().padStart(3, '0')}
          </Typography>
          <Typography
            variant={isMobile ? "h2" : "h1"}
            component="h1"
            sx={{ fontWeight: 'bold', textTransform: 'capitalize', letterSpacing: '1px',
                 textShadow: `2px 2px 4px ${dominantColor === '#FFFFFF' || dominantColor === theme.palette.grey[200] ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}`}}
          >
            {pokemon.name}
          </Typography>
          {genus && <Typography variant="h6" sx={{ opacity: 0.9, fontStyle: 'italic', mt: 0.5 }}>{genus}</Typography>}
          <Box sx={{ mt: 1.5, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {pokemon.types.map(typeInfo => (
              <Chip
                key={typeInfo.type.name}
                label={typeInfo.type.name}
                size="medium"
                sx={{
                  textTransform: 'capitalize',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  backgroundColor: `rgba(255,255,255,0.2)`,
                  color: textColor,
                  border: `1px solid ${textColor === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'}`
                }}
              />
            ))}
          </Box>
        </Box>
        {pokemonImageUrl && (
          <Box
            component="img"
            ref={pokemonImageRef}
            src={pokemonImageUrl}
            alt={pokemon.name}
            sx={{
              width: { xs: '65%', sm: '50%', md: '450px' },
              maxWidth: '500px',
              maxHeight: { xs: '300px', sm: '400px', md: '500px'},
              height: 'auto',
              objectFit: 'contain',
              zIndex: 1,
              filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))',
            }}
          />
        )}
      </Box>

      {/* Content Sections Wrapper */}
      <Paper
        elevation={4}
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderTopLeftRadius: { xs: '30px', sm: '50px' }, 
          borderTopRightRadius: { xs: '30px', sm: '50px' },
          padding: { xs: 2, sm: 3, md: 5 },
          mt: -5,
          position: 'relative',
          zIndex: 3,
        }}
      >
        {/* About Section */}
        <Box ref={addToRefs} sx={{ mb: 4, py: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>About</Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            {flavorText}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={{ xs: 6, sm: 3 }}><Typography><strong>Height:</strong> {(pokemon.height / 10).toFixed(1)} m</Typography></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><Typography><strong>Weight:</strong> {(pokemon.weight / 10).toFixed(1)} kg</Typography></Grid>
          </Grid>
        </Box>
        <Divider sx={{my: 3}}/>

        {/* Abilities Section */}
        <Box ref={addToRefs} sx={{ mb: 4, py: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Abilities</Typography>
            {pokemon.abilities.map(abilityInfo => (
                <Box key={abilityInfo.ability.name} sx={{mb: 1}}>
                    <Typography variant="h6" component="span" sx={{textTransform: 'capitalize', fontWeight: 500}}>
                        {abilityInfo.ability.name.replace(/-/g, ' ')}
                    </Typography>
                    {abilityInfo.is_hidden && <Chip label="Hidden" size="small" sx={{ml: 1, opacity: 0.7}}/>}
                   
                </Box>
            ))}
        </Box>
        <Divider sx={{my: 3}}/>

        {/* Stats Section */}
        <Box ref={addToRefs} sx={{ mb: 4, py: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Base Stats</Typography>
          {pokemon.stats.map(statInfo => (
            <Box key={statInfo.stat.name} sx={{ mb: 1.5 }}>
              <Typography sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                {statInfo.stat.name.replace(/-/g, ' ')}: {statInfo.base_stat}
              </Typography>
              <Box sx={{ height: '12px', backgroundColor: theme.palette.grey[300], borderRadius: '6px', overflow: 'hidden', mt: 0.5 }}>
                <Box
                  className="stat-bar"
                  data-value={statInfo.base_stat}
                  sx={{
                    height: '100%',
                    width: '0%',
                    backgroundColor: theme.palette.primary.main, 
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
        <Divider sx={{my: 3}}/>
        
        {/* Evolution Chain Section (Simplified) */}
        {evolutionChain && evolutionChain.length > 0 && (
          <Box ref={addToRefs} sx={{ mb: 4, py: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Evolution Chain</Typography>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              {evolutionChain.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  {index > 0 && (
                     <Grid size={{ xs: 12, sm: "auto" }} sx={{textAlign: 'center'}}>
                        <Typography variant="caption" sx={{display: 'block', mb: 0.5}}>{stage.trigger || 'Evolves'}</Typography>
                        <ArrowForwardIcon sx={{ transform: { xs: 'rotate(90deg)', sm: 'none' } }} />
                     </Grid>
                  )}
                  <Grid size={{ xs:12, sm: "auto" }} sx={{textAlign: 'center'}}>
                    <Paper
                      elevation={stage.isCurrent ? 6 : 2}
                      sx={{
                        p: 2,
                        border: stage.isCurrent ? `2px solid ${theme.palette.primary.main}` : 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': { transform: 'scale(1.05)', boxShadow: theme.shadows[8] }
                      }}
                      onClick={() => !stage.isCurrent && navigate(`/pokemon/${stage.name}`)}
                    >
                      <Box component="img" src={stage.imageUrl} alt={stage.name} sx={{ width: 80, height: 80, mb: 1 }} />
                      <Typography sx={{ textTransform: 'capitalize', fontWeight: 500 }}>{stage.name}</Typography>
                    </Paper>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Box>
        )}
        <Divider sx={{my: 3}}/>

        {/* Moves Section (Placeholder) */}
        <Box ref={addToRefs} sx={{ mb: 4, py: 2 }}>
             <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Moves</Typography>
             <Typography>
                {pokemon.moves.slice(0, 10).map(m => m.move.name).join(', ')}... (and {pokemon.moves.length - 10} more)
             </Typography>
        </Box>

      </Paper>
    </Box>
  );
};
