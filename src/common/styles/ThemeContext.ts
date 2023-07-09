import { createTheme, responsiveFontSizes } from '@mui/material/styles'

const theme = responsiveFontSizes(
  createTheme({
    typography: {
      fontFamily: "'Open Sans', sans-serif",
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 700,
      fontWeightBold: 900,
    },
    palette: {
      mode: 'dark',
      primary: { light: '#c0fdfb', main: '#6efafb', dark: '#0091ad' },
      secondary: { light: '#ffffff', main: '#b6b6bb', dark: '#85858e' },
      background: { default: '#121222', paper: '#020414' },
    },
    components: {
      MuiInputBase: {
        styleOverrides: {
          input: {
            '&:-webkit-autofill': {
              transitionDelay: '9999s',
              transitionProperty: 'background-color, color',
            },
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          input: {
            '&:-webkit-autofill': {
              WebkitBoxShadow: 'inherit',
              WebkitTextFillColor: 'inherit',
              caretColor: 'inherit',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          input: {
            '&:-webkit-autofill': {
              WebkitBoxShadow: 'inherit',
              WebkitTextFillColor: 'inherit',
              caretColor: 'inherit',
            },
          },
        },
      },
    },
  })
)

export default theme
