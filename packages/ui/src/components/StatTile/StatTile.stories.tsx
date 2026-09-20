import type { Meta, StoryObj } from '@storybook/react-vite';
import StarIcon from '@mui/icons-material/StarOutlined';
import { StatTile } from './index';

const meta = {
  title: 'UI/StatTile',
  component: StatTile,
  args: {
    icon: <StarIcon />,
    label: 'stars',
    value: '1.2k',
  },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTooltip: Story = {
  args: {
    tooltip: 'Updated 3 days ago',
  },
};
