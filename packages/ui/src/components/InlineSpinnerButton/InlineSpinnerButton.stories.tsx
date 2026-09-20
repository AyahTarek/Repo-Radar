import type { Meta, StoryObj } from '@storybook/react-vite';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import { InlineSpinnerButton } from './index';

const meta = {
  title: 'UI/InlineSpinnerButton',
  component: InlineSpinnerButton,
  args: {
    label: 'Refresh',
    icon: <RefreshIcon />,
    onClick: () => {},
  },
} satisfies Meta<typeof InlineSpinnerButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Busy: Story = {
  args: { busy: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
