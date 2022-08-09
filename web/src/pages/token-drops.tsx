import React, { useContext, useEffect, useMemo, useState } from 'react';
import type { NextPageWithLayout } from '@/types';
import { useDebounce } from 'use-debounce';
import { motion } from 'framer-motion';
import cn from 'classnames';
import { NextSeo } from 'next-seo';
import { Transition } from '@/components/ui/transition';
import DashboardLayout from '@/layouts/dashboard/_dashboard';
import { RadioGroup } from '@/components/ui/radio-group';
import { Listbox } from '@/components/ui/listbox';
import Button from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronDown } from '@/components/icons/chevron-down';
import { SearchIcon } from '@/components/icons/search';
import AirdropList from '@/components/farms/list';
import ActiveLink from '@/components/ui/links/active-link';
import { FarmsData } from '@/data/static/farms-data';
import { tokenData, WalletContext } from '@/lib/hooks/use-connect';

const sort = [
  { id: 1, name: 'Hot' },
  { id: 2, name: 'APR' },
  { id: 3, name: 'Earned' },
  { id: 4, name: 'Total staked' },
  { id: 5, name: 'Latest' },
];

function SortList() {
  const [selectedItem, setSelectedItem] = useState(sort[0]);

  return (
    <div className="relative w-full md:w-auto">
      <Listbox value={selectedItem} onChange={setSelectedItem}>
        <Listbox.Button className="flex h-11 w-full items-center justify-between rounded-lg bg-gray-100 px-4 text-sm text-gray-900 dark:bg-light-dark dark:text-white md:w-36 lg:w-40 xl:w-56">
          {selectedItem.name}
          <ChevronDown />
        </Listbox.Button>
        <Transition
          enter="ease-out duration-200"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 -translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <Listbox.Options className="absolute left-0 z-10 mt-2 w-full origin-top-right rounded-lg bg-white p-3 shadow-large dark:bg-light-dark">
            {sort.map((item) => (
              <Listbox.Option key={item.id} value={item}>
                {({ selected }) => (
                  <div
                    className={`block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-white  ${
                      selected
                        ? 'my-1 bg-gray-100 dark:bg-dark'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.name}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
}

interface ISearchProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

function Search({ onChange, value }: ISearchProps) {
  return (
    <form
      className="relative flex w-full rounded-full md:w-auto lg:w-64 xl:w-80"
      noValidate
      role="search"
    >
      <label className="flex w-full items-center">
        <input
          className="h-11 w-full appearance-none rounded-lg border-2 border-gray-200 bg-transparent py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-10 rtl:pr-10 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
          placeholder="Search Token Drops"
          autoComplete="off"
          value={value}
          onChange={onChange}
        />
        <span className="pointer-events-none absolute flex h-full w-8 cursor-pointer items-center justify-center text-gray-600 hover:text-gray-900 ltr:left-0 ltr:pl-2 rtl:right-0 rtl:pr-2 dark:text-gray-500 sm:ltr:pl-3 sm:rtl:pr-3">
          <SearchIcon className="h-4 w-4" />
        </span>
      </label>
    </form>
  );
}

function StackedSwitch() {
  let [isStacked, setIsStacked] = useState(false);
  return (
    <Switch
      checked={isStacked}
      onChange={setIsStacked}
      className="flex items-center gap-2 text-gray-400 sm:gap-3"
    >
      <div
        className={cn(
          isStacked ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-500',
          'relative inline-flex h-[22px] w-10 items-center rounded-full transition-colors duration-300'
        )}
      >
        <span
          className={cn(
            isStacked
              ? 'bg-white ltr:translate-x-5 rtl:-translate-x-5 dark:bg-light-dark'
              : 'bg-white ltr:translate-x-0.5 rtl:-translate-x-0.5 dark:bg-light-dark',
            'inline-block h-[18px] w-[18px] transform rounded-full bg-white transition-transform duration-200'
          )}
        />
      </div>
      <span className="inline-flex text-xs font-medium uppercase tracking-wider text-gray-900 dark:text-white sm:text-sm">
        Stacked only
      </span>
    </Switch>
  );
}

function Status() {
  let [status, setStatus] = useState('live');

  return (
    <RadioGroup
      value={status}
      onChange={setStatus}
      className="flex items-center sm:gap-3"
    >
      <RadioGroup.Option value="live">
        {({ checked }) => (
          <span
            className={`relative flex h-11 w-20 cursor-pointer items-center justify-center rounded-lg text-center text-xs font-medium tracking-wider sm:w-24 sm:text-sm ${
              checked ? 'text-white' : 'text-brand'
            }`}
          >
            {checked && (
              <motion.span
                className="absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-brand shadow-large"
                layoutId="statusIndicator"
              />
            )}
            <span className="relative">SHOW ALL DROPS</span>
          </span>
        )}
      </RadioGroup.Option>
      <RadioGroup.Option value="finished">
        {({ checked }) => (
          <span
            className={`relative flex h-11 w-20 cursor-pointer items-center justify-center rounded-lg text-center text-xs font-medium tracking-wider sm:w-24 sm:text-sm ${
              checked ? 'text-white' : 'text-brand'
            }`}
          >
            {checked && (
              <motion.span
                className="absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-brand shadow-large"
                layoutId="statusIndicator"
              />
            )}
            <span className="relative">HIDE MICRO DROPS</span>
          </span>
        )}
      </RadioGroup.Option>
    </RadioGroup>
  );
}

const TokensPage: NextPageWithLayout = () => {
  let [searchKeyword, setSearchKeyword] = useState('');
  const [searchKeywordDebounced] = useDebounce(searchKeyword, 600);
  const { availableAirdrops, ERC20_availableAirdrops, address } =
    useContext(WalletContext);

  useEffect(() => {
    async function checkForAirdrops() {
      await ERC20_availableAirdrops();
    }

    if (address) checkForAirdrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const filteredAirdrops = useMemo(
    () =>
      Object.keys(availableAirdrops).reduce((acc, currentKey) => {
        if (
          availableAirdrops[currentKey].metadata.name
            .toLowerCase()
            .includes(searchKeywordDebounced.toLowerCase()) ||
          availableAirdrops[currentKey].metadata.symbol
            .toLowerCase()
            .includes(searchKeywordDebounced.toLowerCase())
        ) {
          return {
            ...acc,
            [currentKey]: availableAirdrops[currentKey],
          };
        }
        return acc;
      }, {}),
    [availableAirdrops, searchKeywordDebounced]
  );

  return (
    <>
      <NextSeo
        title="Explore Token Drops"
        description="9999 Luftballons DApp Interface"
      />
      <div className="mx-auto w-full sm:pt-8">
        <div className="relative z-10 mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center justify-between gap-4">
            <Status />
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <Search
              onChange={(e) => setSearchKeyword(e.target.value)}
              value={searchKeyword}
            />
            <SortList />
          </div>
        </div>
        <div className="mb-3 hidden grid-cols-5 gap-6 rounded-lg bg-white shadow-card dark:bg-light-dark sm:grid lg:grid-cols-5">
          <span className="px-8 py-6 text-sm tracking-wider text-gray-500 dark:text-gray-300">
            Token Name
          </span>
          <span className="px-8 py-6 text-sm tracking-wider text-gray-500 dark:text-gray-300">
            Airdrop/Balloon
          </span>
          <span className="px-8 py-6 text-sm tracking-wider text-gray-500 dark:text-gray-300">
            USD/Balloon
          </span>
          <span className="px-8 py-6 text-sm tracking-wider text-gray-500 dark:text-gray-300">
            Fully Noticed
          </span>
          <span className="px-8 py-6 text-sm tracking-wider text-gray-500 dark:text-gray-300">
            Your Claim
          </span>
        </div>
        {Object.values<tokenData>(filteredAirdrops).map(
          (_tokenData: tokenData) => {
            return (
              <AirdropList
                key={_tokenData.metadata?.address}
                airdrop={_tokenData}
              >
                <div className="mb-4 grid grid-cols-2 gap-4 sm:mb-6 sm:gap-6">
                  <input
                    type="number"
                    placeholder="0.0"
                    className="spin-button-hidden h-11 appearance-none rounded-lg border-solid border-gray-200 bg-body px-4 text-sm tracking-tighter text-gray-900 placeholder:text-gray-600 focus:border-gray-900 focus:shadow-none focus:outline-none focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-600 sm:h-13"
                  />
                  <input
                    type="number"
                    placeholder="0.0"
                    className="spin-button-hidden h-11 appearance-none rounded-lg border-solid border-gray-200 bg-body px-4 text-sm tracking-tighter text-gray-900 placeholder:text-gray-600 focus:border-gray-900 focus:shadow-none focus:outline-none focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-600 sm:h-13"
                  />
                </div>
              </AirdropList>
            );
          }
        )}
      </div>
    </>
  );
};

TokensPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default TokensPage;
