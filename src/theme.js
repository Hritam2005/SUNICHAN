import { createTheme } from '@mantine/core';

export const theme = createTheme({
  colors: {
    'ocean-blue': [
      '#7AD1DD',
      '#5FCCDB',
      '#44CADC',
      '#2AC9DE',
      '#1AC2D9',
      '#11B7CD',
      '#09ADC3',
      '#0E99AC',
      '#128797',
      '#147885'
    ],
    'deep-space': [
      '#E8E9EC',
      '#C5C8D0',
      '#A2A8B5',
      '#7F889A',
      '#5C687F',
      '#3A4864',
      '#18284A',
      '#051130',
      '#000018',
      '#000000'
    ]
  },
  primaryColor: 'ocean-blue',
  defaultGradient: {
    from: 'orange',
    to: 'red',
    deg: 45,
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Roboto, sans-serif',
    fontWeight: '700',
  },
});
