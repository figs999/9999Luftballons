import { tokenData } from '@/lib/hooks/use-connect';

export const tokenListSort = [
  {
    id: 1,
    name: 'Oldest',
    sort: (a: tokenData, b: tokenData) => {
      const date1 = new Date(a.metadata?.created_at || '');
      const date2 = new Date(b.metadata?.created_at || '');
      if (date1 > date2) {
        return 1;
      }
      if (date1 < date2) {
        return -1;
      }
    },
  },
  {
    id: 2,
    name: 'Newest',
    sort: (a: tokenData, b: tokenData) => {
      const date1 = new Date(a.metadata?.created_at || '');
      const date2 = new Date(b.metadata?.created_at || '');
      if (date1 < date2) {
        return 1;
      }
      if (date1 > date2) {
        return -1;
      }
    },
  },
  // { id: 2, name: 'APR' }
  // { id: 3, name: 'Earned' },
  // { id: 4, name: 'Total staked' },
  // { id: 5, name: 'Latest' },
];

export const tokenListStatuses = [
  { id: 1, name: 'Show All' },
  { id: 2, name: 'Hide Micro' },
];

export const microDropValue = 10000;
