import { createTheme } from '@mantine/core';

export const theme = createTheme({
  colors: {
    'ocean-blue': [
      '#e0f2fe',
      '#bae6fd',
      '#7dd3fc',
      '#38bdf8',
      '#0ea5e9',
      '#0284c7',
      '#0369a1',
      '#075985',
      '#0c4a6e',
      '#082f49'
    ],
    'deep-space': [
      '#f8fafc',
      '#f1f5f9',
      '#e2e8f0',
      '#cbd5e1',
      '#94a3b8',
      '#64748b',
      '#475569',
      '#334155',
      '#1e293b',
      '#0f172a'
    ]
  },
  primaryColor: 'ocean-blue',
  defaultGradient: {
    from: 'ocean-blue',
    to: 'cyan',
    deg: 45,
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  components: {
    AppShell: {
      styles: {
        root: {
          backgroundColor: 'transparent',
        }
      }
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      }
    }
  }
});
