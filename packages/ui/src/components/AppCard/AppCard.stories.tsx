import type { Meta, StoryObj } from '@storybook/react-vite';
import Typography from '@mui/material/Typography';
import { AppCard } from './index';

const meta = {
  title: 'UI/AppCard',
  component: AppCard,
} satisfies Meta<typeof AppCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Typography variant="h3">Card title</Typography>
        <Typography variant="body2" color="text.secondary">
          The single card surface reused across search results, tracked repos, and the chart panel.
        </Typography>
      </>
    ),
  },
};
