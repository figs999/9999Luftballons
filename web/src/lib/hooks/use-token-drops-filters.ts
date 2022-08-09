import { tokenData } from '@/lib/hooks/use-connect';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  microDropValue,
  tokenListStatuses,
} from '@/data/static/token-list-filters';

export const useTokenDropsFilters = (availableAirdrops: {
  [address: string]: tokenData;
}) => {
  let [airdropsFilters, setAirdropsFilters] = useState({
    searchKeyword: '',
    sort: '',
    status: tokenListStatuses[0].name,
  });

  const [filtersDebounced] = useDebounce(airdropsFilters, 600);

  const filteredAirdrops = useMemo(
    () =>
      Object.keys(availableAirdrops).reduce((acc, currentKey) => {
        let filtered = { ...acc };
        const currentAirdrop = availableAirdrops[currentKey];
        if (
          currentAirdrop?.metadata?.name
            .toLowerCase()
            .includes(filtersDebounced.searchKeyword.toLowerCase()) ||
          currentAirdrop?.metadata?.symbol
            .toLowerCase()
            .includes(filtersDebounced.searchKeyword.toLowerCase())
        ) {
          filtered = {
            ...filtered,
            [currentKey]: availableAirdrops[currentKey],
          };
        }

        if (filtersDebounced.status == 'hideMicro') {
          const value =
            (currentAirdrop?.price?.usdPrice * currentAirdrop?.value) / 9999;
          if (value < microDropValue) {
            delete filtered[currentKey];
          }
        }

        return filtered;
      }, {}),
    [availableAirdrops, filtersDebounced]
  );

  const handleChangeFilters = (value: string, name: string) => {
    setAirdropsFilters({
      ...airdropsFilters,
      [name]: value,
    });
  };

  return {
    setAirdropsFilters,
    airdropsFilters,
    handleChangeFilters,
    filteredAirdrops,
  };
};
