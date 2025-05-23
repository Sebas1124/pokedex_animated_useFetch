import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'; // MUI Provider

// Fuente
import '@fontsource/montserrat-alternates/400.css'; // Regular
import '@fontsource/montserrat-alternates/700.css'; // Bold
import { getTheme } from './styles/theme';
import { AppRouter } from './routes/AppRouter';


export const App = () => {

  const theme = getTheme('light'); // Cambia a 'dark' para el tema oscuro

  return (
    <BrowserRouter>
        <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
        </MuiThemeProvider>
    </BrowserRouter>
  )
}
