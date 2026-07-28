import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const shadows = {
  soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)',
  lift: '0 4px 12px rgba(15, 23, 42, 0.08), 0 16px 40px rgba(13, 148, 136, 0.08)',
  auth: '0 24px 64px rgba(4, 47, 46, 0.35)',
}

export const theme = extendTheme({
  config,
  fonts: {
    heading: `'Poppins', system-ui, sans-serif`,
    body: `'Poppins', system-ui, sans-serif`,
  },
  colors: {
    brand: {
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#0D9488',
      600: '#0F766E',
      700: '#115E59',
      800: '#134E4A',
      900: '#042F2E',
    },
    canvas: {
      50: '#F8FAF9',
      100: '#F4F7F6',
      200: '#E8EEEC',
    },
  },
  shadows,
  radii: {
    md: '10px',
    lg: '14px',
    xl: '20px',
  },
  styles: {
    global: {
      body: {
        bg: 'canvas.100',
        color: 'gray.800',
        fontFamily: 'body',
        letterSpacing: '0.005em',
        lineHeight: '1.55',
      },
      'h1, h2, h3, h4, h5, h6': {
        fontFamily: 'heading',
      },
      '*:focus-visible': {
        outline: '2px solid',
        outlineColor: 'brand.500',
        outlineOffset: '2px',
      },
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
        },
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
      variants: {
        solid: {
          shadow: 'sm',
          _hover: { transform: 'translateY(-1px)', shadow: 'md' },
          _active: { transform: 'translateY(0)' },
        },
      },
    },
    Input: {
      defaultProps: { focusBorderColor: 'brand.500' },
      variants: {
        outline: {
          field: {
            bg: 'white',
            borderColor: 'gray.200',
            borderRadius: 'md',
            _hover: { borderColor: 'gray.300' },
          },
        },
      },
    },
    Select: {
      defaultProps: { focusBorderColor: 'brand.500' },
    },
    Textarea: {
      defaultProps: { focusBorderColor: 'brand.500' },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'xl',
          shadow: 'lift',
        },
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            fontFamily: 'body',
            fontSize: 'xs',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'gray.500',
            borderColor: 'gray.100',
            bg: 'canvas.50',
          },
          td: {
            borderColor: 'gray.100',
            py: 3.5,
          },
        },
      },
    },
    Link: {
      baseStyle: {
        color: 'brand.600',
      },
    },
  },
})
