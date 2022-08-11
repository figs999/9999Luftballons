import { tokenData } from '@/lib/hooks/use-connect';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  microDropValue,
  tokenListSort,
  tokenListStatuses,
} from '@/data/static/token-list-filters';

export const useTokenDropsFilters = (availableAirdrops: {
  [address: string]: tokenData;
}) => {
  let [airdropsFilters, setAirdropsFilters] = useState({
    searchKeyword: '',
    sort: tokenListSort[0].id,
    status: tokenListStatuses[0].name,
  });
  const [filtersDebounced] = useDebounce(airdropsFilters, 600);
  const selectedSortFunction = useMemo(
    () => tokenListSort.find((e) => e.id == airdropsFilters.sort),
    [airdropsFilters.sort]
  );

  const filteredAirdrops = useMemo(() => {
    const data = Object.keys(availableAirdrops).reduce((acc, currentKey) => {
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

      if (filtersDebounced.status == tokenListStatuses[1].name) {
        const value =
          (currentAirdrop?.price?.usdPrice * currentAirdrop?.value) / 9999;
        if (value < microDropValue) {
          delete filtered[currentKey];
        }
      }

      return filtered;
    }, {});
    if (selectedSortFunction) {
      return Object.values<tokenData>(data).sort(selectedSortFunction.sort);
    }
    return Object.values<tokenData>(data);
  }, [availableAirdrops, filtersDebounced]);

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
