import React, { useEffect, useRef, useMemo } from 'react';
import gsap from "gsap";
import Confetti from 'react-confetti'; // Importar react-confetti

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Card, CardContent, CardActions, IconButton, Typography, Box, Chip, Avatar, Skeleton } from "@mui/material";
import { LazyLoadImage } from "react-lazy-load-image-component";
import type { PokemonCardProps } from '../../../types'; // Asegúrate que la ruta es correcta

const attackColors: Record<string, string> = {
    Tackle: "#b2bec3", Growl: "#fdcb6e", "Vine Whip": "#00b894",
    Scratch: "#636e72", Ember: "#d35400", Smokescreen: "#636e72",
};

// Componente interno para las estadísticas, memoizado
const StatItem: React.FC<{ label: string; value: number | undefined; color: string; index: number; pokemonId: number }> = React.memo(({ label, value = 0, color, index, pokemonId }) => {
    const valueRef = useRef<HTMLSpanElement>(null);
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (valueRef.current) {
            gsap.fromTo(
                valueRef.current,
                { scale: 0.6, y: 10, opacity: 0 },
                { scale: 1.2, y: 0, opacity: 1, duration: 0.5, delay: 0.2 + index * 0.13, ease: "back.out(2)" }
            );
            gsap.to(valueRef.current, {
                scale: 1, duration: 0.3, delay: 0.7 + index * 0.13, ease: "elastic.out(1,0.5)"
            });
        }
        if (barRef.current) {
            gsap.fromTo(
                barRef.current,
                { width: "0%" },
                { width: `${Math.min(value, 100)}%`, duration: 0.7, delay: 0.25 + index * 0.13, ease: "power2.out" }
            );
        }
    }, [value, color, index, pokemonId]); // Depende de pokemonId para re-animar si el Pokémon cambia

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 40 }}>
            <Typography ref={valueRef} sx={{ fontWeight: 700, color: color, fontSize: 18, textShadow: `0 1px 4px ${color}44`, mb: 0.2 }}>
                {value}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#636e72", letterSpacing: 1, fontWeight: 500 }}>
                {label}
            </Typography>
            <Box sx={{ width: 28, height: 4, borderRadius: 2, bgcolor: "#dfe6e9", mt: 0.3, overflow: "hidden" }}>
                <Box ref={barRef} sx={{ height: 1, bgcolor: color, borderRadius: 2 }} />
            </Box>
        </Box>
    );
});


export const PokemonCard: React.FC<PokemonCardProps> = React.memo(({
    pokemon,
    onToggleFavorite,
    isLoading = false,
    playConfetti = false
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const pokeballRef = useRef<HTMLDivElement>(null);

    // Animación de entrada de la tarjeta y pokebola (solo al montar)
    useEffect(() => {
        if (cardRef.current) {
            gsap.fromTo(
                cardRef.current,
                { opacity: 0, y: 50, scale: 0.95, /*rotateY: 90*/ }, // rotateY puede ser mucho si ScrollTrigger lo re-activa
                {
                    opacity: 1, y: 0, scale: 1, /*rotateY: 0,*/ duration: 0.8, ease: "elastic.out(1, 0.5)",
                    scrollTrigger: {
                        trigger: cardRef.current,
                        start: "top 90%", // Un poco antes para que se vea la animación
                        toggleActions: "play none none none", // "play none none reset" si quieres que re-anime al scrollear fuera y dentro
                    },
                }
            );
        }
        if (pokeballRef.current) {
            gsap.to(pokeballRef.current, {
                rotate: 360, repeat: -1, duration: 8, ease: "linear", transformOrigin: "50% 50%",
            });
        }
    }, []); // Dependencias vacías para que se ejecute solo una vez al montar la tarjeta

    const memoizedStats = useMemo(() => [
        { label: "HP", value: pokemon.stats?.hp, color: "#00b894" },
        { label: "ATK", value: pokemon.stats?.attack, color: "#d35400" },
        { label: "DEF", value: pokemon.stats?.defense, color: "#0984e3" },
        { label: "SPD", value: pokemon.stats?.speed, color: "#fdcb6e" },
    ], [pokemon.stats]);

    if (isLoading) {
        return (
            <Card sx={{ width: { xs: '90%', sm: 260 }, minHeight: 370, borderRadius: 3, boxShadow: 3, position: "relative", overflow: "visible", mx: "auto", my: 1, p: 0 }}>
                <Skeleton variant="rectangular" width="100%" height={140} sx={{mt: 2}} />
                <CardContent sx={{ pt: 0, pb: 1, px: 2, textAlign: "center" }}>
                    <Skeleton variant="text" width="80%" height={40} sx={{ mb: 0.5, mx: 'auto' }} />
                    <Skeleton variant="text" width="100%" height={50} sx={{ mb: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 1, mt: 0.5 }}>
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" width={40} height={60} />)}
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", mb: 1 }}>
                        <Skeleton variant="rounded" width={70} height={24} />
                        <Skeleton variant="rounded" width={70} height={24} />
                        <Skeleton variant="rounded" width={70} height={24} />
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            ref={cardRef}
            sx={{
                width: { xs: '90%', sm: 260 }, // Ajusta el ancho para consistencia
                minHeight: 370, // Para que todas las cards tengan altura similar
                borderRadius: 3,
                boxShadow: "0 10px 20px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.08)",
                position: "relative",
                overflow: "hidden", // Cambiado a hidden para contener el confetti visualmente
                mx: "auto",
                my: 1,
                p: 0,
                bgcolor: "background.paper",
            }}
        >
            {playConfetti && cardRef.current && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20, pointerEvents: 'none' }}>
                    <Confetti
                        width={cardRef.current.offsetWidth}
                        height={cardRef.current.offsetHeight}
                        recycle={false}
                        numberOfPieces={playConfetti ? 200 : 0}
                        gravity={0.12}
                        run={playConfetti} // Controla la ejecución
                        initialVelocityX={{ min: -7, max: 7 }}
                        initialVelocityY={{ min: -15, max: 5 }}
                        tweenDuration={2000}
                    />
                </div>
            )}
            <Box
                ref={pokeballRef}
                sx={{ position: "absolute", top: 12, right: 12, width: 64, height: 64, opacity: 0.07, zIndex: 0, pointerEvents: "none" }}
            >
                <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="38" stroke="#000" strokeWidth="4" fill="#ff7675" />
                    <path d="M2 40h76" stroke="#000" strokeWidth="4" />
                    <circle cx="40" cy="40" r="14" stroke="#000" strokeWidth="4" fill="white" />
                    <circle cx="40" cy="40" r="7" fill="#fff" stroke="#000" strokeWidth="2"/>
                </svg>
            </Box>
            <CardActions sx={{ position: "absolute", top: 4, left: 4, zIndex: 2, p: 0 }}>
                <IconButton
                    onClick={() => onToggleFavorite(pokemon.id)}
                    aria-label={pokemon.isFavorite ? "Quitar de Favoritos" : "Añadir a Favoritos"}
                    sx={{ bgcolor: "rgba(255,255,255,0.85)", borderRadius: "50%", boxShadow: 1, "&:hover": { bgcolor: "rgba(255,255,255,1)" }, p: 0.5 }}
                >
                    {pokemon.isFavorite ? (
                        <FavoriteIcon sx={{ color: "#e17055" }} fontSize="medium" />
                    ) : (
                        <FavoriteBorderIcon sx={{ color: "#636e72" }} fontSize="medium" />
                    )}
                </IconButton>
            </CardActions>
            <Box 
                sx={{ mt: 5, mb: 1, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                component={'a'}
                href={`/pokemon/${pokemon.name}`}
            >
                <Avatar 
                    sx={{ width: 90, height: 90, bgcolor: "rgba(255,255,255,0.6)", boxShadow: "0 0 15px rgba(0,0,0,0.2)", filter: "drop-shadow(0 2px 8px #b2bec3)" }} variant="circular"
                >
                    <LazyLoadImage
                        src={pokemon.image} alt={pokemon.name} width={90} height={90} effect="blur"
                        style={{ objectFit: "contain", width: 90, height: 90 }}
                        placeholder={<Skeleton variant="circular" width={90} height={90} />}
                    />
                </Avatar>
            </Box>
            <CardContent sx={{ pt: 0, pb: 1, px: 2, textAlign: "center", zIndex: 1, position: "relative" }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 700, fontSize: 22, letterSpacing: 1, color: "#222f3e", mb: 0.5, textTransform: 'capitalize' }}>
                    {pokemon.name}
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: "italic", color: "#636e72", fontSize: 13, minHeight: 36, mb: 1 }}>
                    {pokemon.description}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: {xs: 1, sm: 2}, mb: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    {memoizedStats.map((stat, idx) => (
                        <StatItem
                            key={`${pokemon.id}-${stat.label}`} // Key única si el pokemonId puede cambiar
                            label={stat.label}
                            value={stat.value}
                            color={stat.color}
                            index={idx}
                            pokemonId={pokemon.id}
                        />
                    ))}
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", mb: 1, minHeight: 24 }}>
                    {pokemon.attacks.slice(0, 3).map((atk) => ( // Limitar a 3 ataques para consistencia visual
                        <Chip
                            key={atk} label={atk} size="small"
                            sx={{
                                bgcolor: attackColors[atk] || "#dfe6e9",
                                color: theme => theme.palette.getContrastText(attackColors[atk] || "#dfe6e9"),
                                fontWeight: 500, fontSize: 11, px: 1.2, py: 0.3, borderRadius: 1.5, textTransform: 'capitalize'
                            }}
                        />
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
});