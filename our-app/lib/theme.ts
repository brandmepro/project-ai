'use client'

import { createTheme, MantineColorsTuple } from '@mantine/core'

const violet: MantineColorsTuple = [
  '#f5f0ff',
  '#e9deff',
  '#d1baff',
  '#b794ff',
  '#a174ff',
  '#9361ff',
  '#8b57ff',
  '#7747e6',
  '#6a3ecd',
  '#5c34b3',
]

const indigo: MantineColorsTuple = [
  '#eef2ff',
  '#e0e7ff',
  '#c7d2fe',
  '#a5b4fc',
  '#818cf8',
  '#6366f1',
  '#4f46e5',
  '#4338ca',
  '#3730a3',
  '#312e81',
]

export const theme = createTheme({
  fontFamily: 'Poppins, var(--font-poppins), sans-serif',
  primaryColor: 'violet',
  primaryShade: 6,
  colors: {
    violet,
    indigo,
  },
  radius: {
    xs: '0.5rem',
    sm: '0.625rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
  },
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  defaultRadius: 'lg',
  components: {
    Button: {
      defaultProps: {
        radius: 'lg',
      },
      styles: {
        root: {
          fontWeight: 500,
          transition: 'all 150ms ease',
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
      },
    },
    Input: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Select: {
      defaultProps: {
        radius: 'lg',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'lg',
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Drawer: {
      defaultProps: {
        radius: 'lg',
      },
    },
  },
  other: {
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
  },
})
