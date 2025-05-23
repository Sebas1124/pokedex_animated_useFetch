import { createTheme, alpha } from '@mui/material/styles';

import type { ThemeOptions } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';


import '@fontsource/montserrat-alternates/400.css'; // Regular
import '@fontsource/montserrat-alternates/700.css'; // Bold
// Importa otros pesos si los necesitas


// Paleta de colores
const backgroundDark = '#2B2D42'; // Fondo oscuro
const backgroundLight = '#EDF2F4'; // Fondo claro
const primaryColor = '#E34A6F';
const secondaryColor = '#7389AE';
const thirdColor = '#0F7173';

const sharedPalette = {
  primary: {
    main: primaryColor,
    light: alpha(primaryColor, 0.8), // Genera light/dark automáticamente o defínelos
    dark: alpha(primaryColor, 0.9), // Ajusta alpha o usa colores específicos
    contrastText: '#ffffff', // Texto blanco sobre el morado principal
  },
  secondary: {
    main: secondaryColor,
    light: alpha(secondaryColor, 0.8),
    dark: alpha(secondaryColor, 0.9),
    contrastText: '#000000', // Texto negro sobre el amarillo principal (ajusta si es necesario)
  },
  error: {
    main: '#f44336',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ffa726',
    contrastText: '#000000',
  },
  info: {
    main: '#29b6f6',
    contrastText: '#000000',
  },
  success: {
    main: '#66bb6a',
    contrastText: '#000000',
  },
};

// --- Opciones Comunes ---
const sharedThemeOptions: ThemeOptions = {
  // Paleta se definirá por modo
  typography: {
    fontFamily: '"Montserrat Alternates", "Helvetica", "Arial", sans-serif',
    // Define otros estilos globales de tipografía aquí si es necesario
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 700, fontSize: '1.75rem' },
    // ...etc
    button: {
      textTransform: 'none', // Botones sin mayúsculas por defecto
      fontWeight: 600,       // Ligeramente más gruesos
    }
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    // --- Sobrescrituras Globales de Componentes ---
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Asegura que el texto dentro del AppBar use el color primario del tema de texto
          // Esto es importante para el estado transparente inicial
          color: theme.palette.text.primary,
        }),
        // Puedes añadir estilos específicos para color='primary', etc., si los usas
        // colorPrimary: {
        //     backgroundColor: sharedPalette.primary.main,
        //     color: sharedPalette.primary.contrastText, // Usa el contrastText definido
        // },
      },
    },
    MuiButton: {
      // Ya no se necesita 'textTransform: none' aquí si está en typography.button
      // Puedes añadir otras sobrescrituras globales para botones
      // styleOverrides: {
      //     containedPrimary: { // Estilo para <Button variant="contained" color="primary">
      //          color: sharedPalette.primary.contrastText,
      //     }
      // }
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main, // Links usan color primario
          textDecoration: 'none', // Sin subrayado por defecto
          '&:hover': {
            textDecoration: 'underline', // Subrayado en hover
            color: theme.palette.primary.dark,
          },
        }),
      },
    },
    MuiFab: { // Estilos para el Floating Action Button (ScrollToTop)
      styleOverrides: {
        primary: ({ theme }) => ({ // <Fab color="primary">
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          }
        }),
      },
    },
    // Añade más sobrescrituras globales aquí si es necesario
  }
};

// --- Tema Claro ---
export const lightTheme = createTheme({
  ...sharedThemeOptions, // Hereda opciones comunes
  palette: {
    mode: 'light',
    ...sharedPalette, // Hereda colores base (primary, secondary, etc.)
    background: {
      default: '#FFFAFA', // Fondo general muy claro
      paper: backgroundLight,   // Fondo de elementos como Cards, Menus, Navbar (cuando tiene scroll)
    },
    text: {
      primary: '#212121',   // Negro un poco más suave que #121212 para mejor lectura
      secondary: '#5f6368', // Gris oscuro estándar de Google para texto secundario
      disabled: alpha('#000000', 0.38), // Color estándar para texto deshabilitado
    },
    divider: alpha('#000000', 0.12), // Color estándar para divisores
  },
});

// --- Tema Oscuro ---
export const darkTheme = createTheme({
  ...sharedThemeOptions, // Hereda opciones comunes (¡Importante!)
  palette: {
    mode: 'dark',
    ...sharedPalette, // Hereda colores base
    // Sobrescribe colores específicos si quieres que sean diferentes en modo oscuro
    background: {
      default: '#151922',
      paper: backgroundDark,
    },
    primary: {
      main: primaryColor, // Un morado un poco más brillante para dark mode
      light: '#df78ef',
      dark: '#790e8b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: thirdColor, // Amarillo un poco más brillante
      light: '#fffd61',
      dark: '#c79a00',
      contrastText: '#000000',
    },
    text: {
      primary: '#e1e1e1',   // Blanco suave principal
      secondary: '#a2a2a2', // Gris más claro para texto secundario
      disabled: alpha('#ffffff', 0.5), // Color estándar para texto deshabilitado
    },
    divider: alpha('#ffffff', 0.12), // Color estándar para divisores
  },
  // NO dupliques typography aquí, ya está en sharedThemeOptions
});

// --- Función Exportada ---
// (La función getTheme sigue igual)
export const getTheme = (mode: PaletteMode) => (mode === 'light' ? lightTheme : darkTheme);

// Drawer del dashboard
export const drawerWidth = 240;