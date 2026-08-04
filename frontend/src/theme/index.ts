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
      800: '#1A2332',
      900: '#0F172A',
    },
  },
  semanticTokens: {
    colors: {
      'app-bg': { default: 'canvas.100', _dark: 'gray.900' },
      'app-surface': { default: 'white', _dark: 'gray.800' },
      'app-surface-muted': { default: 'canvas.50', _dark: 'whiteAlpha.100' },
      'app-border': { default: 'blackAlpha.100', _dark: 'whiteAlpha.200' },
      'app-text': { default: 'gray.800', _dark: 'gray.100' },
      'app-muted': { default: 'gray.500', _dark: 'gray.400' },
      'nav-hover-bg': { default: 'brand.50', _dark: 'whiteAlpha.100' },
      'nav-hover-color': { default: 'brand.600', _dark: 'brand.300' },
      'nav-active-bg': { default: 'brand.50', _dark: 'whiteAlpha.200' },
      'table-header-bg': { default: 'canvas.50', _dark: 'whiteAlpha.100' },
      'progress-track': { default: 'canvas.200', _dark: 'whiteAlpha.200' },
      'brand-soft-bg': { default: 'brand.50', _dark: 'whiteAlpha.100' },
      'brand-soft-fg': { default: 'brand.700', _dark: 'brand.200' },
    },
  },
  shadows,
  radii: {
    md: '10px',
    lg: '14px',
    xl: '20px',
  },
  styles: {
    global: (props: { colorMode: 'light' | 'dark' }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'canvas.100',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
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
    }),
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
            bg: 'app-surface',
            borderColor: 'app-border',
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
    FormLabel: {
      baseStyle: {
        color: 'app-text',
      },
    },
    Heading: {
      baseStyle: {
        color: 'app-text',
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'xl',
          shadow: 'lift',
          bg: 'app-surface',
          color: 'app-text',
        },
        header: {
          color: 'app-text',
        },
        body: {
          color: 'app-text',
        },
      },
    },
    Drawer: {
      baseStyle: {
        dialog: {
          bg: 'app-surface',
          color: 'app-text',
        },
        header: {
          color: 'app-text',
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
            color: 'app-muted',
            borderColor: 'app-border',
            bg: 'table-header-bg',
          },
          td: {
            borderColor: 'app-border',
            color: 'app-text',
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
    Divider: {
      baseStyle: {
        borderColor: 'app-border',
      },
    },
  },
})
