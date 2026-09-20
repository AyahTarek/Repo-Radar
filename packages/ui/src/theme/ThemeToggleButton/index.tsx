import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useThemeMode } from '../useThemeMode';

/**
 * Zero-prop toggle: it reads the context published by ThemeModeProvider, so
 * consumers can drop it anywhere without threading theme state through props.
 */
export function ThemeToggleButton() {
  const { mode, toggleMode } = useThemeMode();
  const label = mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Tooltip title={label}>
      <IconButton onClick={toggleMode} aria-label={label} color="inherit">
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
