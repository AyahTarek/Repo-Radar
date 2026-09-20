import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { ThemeProvider } from '@mui/material/styles';
import type { Preview } from '@storybook/react-vite';
import { createAppTheme, DEFAULT_THEME_MODE, THEME_MODES, type ThemeMode } from '@repo-radar/ui';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  globalTypes: {
    theme: {
      description: 'Theme mode',
      toolbar: {
        icon: 'mirror',
        items: THEME_MODES.map((mode) => ({ value: mode, title: mode })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: DEFAULT_THEME_MODE,
  },
  decorators: [
    (Story, context) => {
      const mode = (context.globals.theme as ThemeMode | undefined) ?? DEFAULT_THEME_MODE;

      return (
        <ThemeProvider theme={createAppTheme(mode)}>
          <CssBaseline enableColorScheme />
          <Box sx={{ p: 2 }}>
            <Story />
          </Box>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
