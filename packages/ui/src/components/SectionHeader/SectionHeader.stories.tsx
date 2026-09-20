import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from '@mui/material/Button';
import { SectionHeader } from './index';

const meta = {
  title: 'UI/SectionHeader',
  component: SectionHeader,
  args: {
    title: 'Tracked repositories',
    subtitle: '12 repositories',
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: <Button variant="outlined">Refresh all</Button>,
  },
};
