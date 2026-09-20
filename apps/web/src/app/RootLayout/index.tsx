import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import { Outlet } from 'react-router';
import { Header } from '@/app/Header';
import { RateLimitBanner } from '@/components/RateLimitBanner';

export function RootLayout() {
  return (
    <Stack sx={{ minHeight: '100dvh' }}>
      <Header />
      <Container maxWidth="lg" component="main" sx={{ py: 3, flex: 1 }}>
        <Stack spacing={2.5}>
          <RateLimitBanner />
          <Outlet />
        </Stack>
      </Container>
    </Stack>
  );
}
