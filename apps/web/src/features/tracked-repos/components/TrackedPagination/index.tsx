import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export type TrackedPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function TrackedPagination({ page, totalPages, onPageChange }: TrackedPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Stack sx={{ alignItems: 'center', pt: 1 }}>
      <Pagination
        page={page}
        count={totalPages}
        onChange={(_event, nextPage) => onPageChange(nextPage)}
        color="primary"
        shape="rounded"
        getItemAriaLabel={(type, itemPage) =>
          type === 'page' ? `Go to page ${itemPage}` : `Go to ${type} page`
        }
      />
    </Stack>
  );
}
