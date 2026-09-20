import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from '@mui/material/Button';
import InboxIcon from '@mui/icons-material/InboxOutlined';
import { StateBlock } from './index';

const meta = {
  title: 'UI/StateBlock',
  component: StateBlock,
} satisfies Meta<typeof StateBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    variant: 'empty',
    title: 'No tracked repositories yet',
    description: 'Search for a repository and track it to see its stats here.',
    icon: <InboxIcon sx={{ fontSize: 40 }} />,
  },
};

export const Loading: Story = {
  args: {
    variant: 'loading',
    title: 'Loading repositories…',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Something went wrong',
    description: 'The GitHub API request failed. Check your connection and try again.',
    action: <Button variant="outlined">Retry</Button>,
  },
};
