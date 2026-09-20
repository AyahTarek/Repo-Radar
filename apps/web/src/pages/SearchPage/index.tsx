import Stack from '@mui/material/Stack';
import { SectionHeader } from '@repo-radar/ui';
import { SearchField } from '@/features/repo-search/components/SearchField';
import { SearchResults } from '@/features/repo-search/components/SearchResults';
import { useSearchQueryParam } from '@/features/repo-search/hooks/useSearchQueryParam';

export function SearchPage() {
  const { inputValue, debouncedQuery, sort, setInputValue, setSort } = useSearchQueryParam();

  return (
    <Stack spacing={2.5}>
      <SectionHeader
        title="Discover repositories"
        subtitle="Search GitHub and track the repositories you want to keep an eye on."
      />
      <SearchField
        value={inputValue}
        sort={sort}
        onValueChange={setInputValue}
        onSortChange={setSort}
      />
      <SearchResults query={debouncedQuery} sort={sort} />
    </Stack>
  );
}
