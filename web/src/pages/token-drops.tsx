import React, { useContext, useEffect, useMemo, useState } from 'react';
import type { NextPageWithLayout } from '@/types';
import { motion } from 'framer-motion';
import cn from 'classnames';
import { NextSeo } from 'next-seo';
import { Transition } from '@/components/ui/transition';
import DashboardLayout from '@/layouts/dashboard/_dashboard';
import { RadioGroup } from '@/components/ui/radio-group';
import { Listbox } from '@/components/ui/listbox';
import { Switch } from '@/components/ui/switch';
import { ChevronDown } from '@/components/icons/chevron-down';
import { SearchIcon } from '@/components/icons/search';
import AirdropList from '@/components/farms/list';
import { tokenData, WalletContext } from '@/lib/hooks/use-connect';
import {
  tokenListSort,
  tokenListStatuses,
} from '@/data/static/token-list-filters';
import { useTokenDropsFilters } from '@/lib/hooks/use-token-drops-filters';
import {
  listBoxOptionsClassNames,
  thinBorder,
  wideBorder,
} from '@/data/static/classNames';
import Input from '@/components/ui/forms/input';

interface IFilterProps {
  onChange: (event: any) => void;
  value: string | number;
}

function SortList({ onChange, value }: IFilterProps) {
  const selectedItem = useMemo(
    () => tokenListSort.find((e) => e.id == value),
    [value]
  );

  return (
    <div className="relative w-full md:w-auto">
      <Listbox value={selectedItem} onChange={onChange}>
        <Listbox.Button
          className={cn(
            'relative z-20 flex h-12 w-full items-center justify-between rounded-2xl bg-accentinput bg-gray-100 px-4 text-sm text-gray-900 dark:bg-light-dark dark:text-white md:w-36 lg:w-40 xl:w-56',
            thinBorder
          )}
        >
          {selectedItem ? selectedItem.name : 'Select'}
          <ChevronDown />
        </Listbox.Button>
        <Transition
          enter="ease-out duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={cn(
              'origin-top-right bg-accent p-3 pt-16 shadow-large dark:bg-light-dark',
              thinBorder,
              listBoxOptionsClassNames
            )}
          >
            {tokenListSort.map((item) => (
              <Listbox.Option key={item.id} value={item}>
                {({ selected }) => (
                  <div
                    className={`block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-white  ${
                      selected
                        ? 'my-1 bg-accentalt dark:bg-dark'
                        : 'hover:bg-accentalt dark:hover:bg-gray-700'
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

function Search({ onChange, value }: IFilterProps) {
  return (
    <form
      className="relative flex w-full rounded-full md:w-auto lg:w-64 xl:w-80"
      noValidate
      role="search"
    >
      <label className="flex w-full items-center">
        <Input
          placeholder="Search Token Drops"
          inputClassName="pr-5 pl-10"
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

const Status = ({ onChange, value }: IFilterProps) => (
  <RadioGroup
    value={value}
    onChange={onChange}
    className="flex items-center sm:gap-3"
  >
    {tokenListStatuses.map((status) => (
      <RadioGroup.Option value={status.name} key={status.name}>
        {({ checked }) => (
          <span
            className={`relative flex h-11 w-auto cursor-pointer items-center justify-center rounded-lg pl-4 pr-4 text-center text-xs font-medium tracking-wider sm:text-sm ${
              checked ? 'text-black' : 'text-accentalt'
            }`}
          >
            {checked && (
              <motion.span
                className={cn(
                  'absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-brand shadow-button',
                  wideBorder
                )}
                layoutId="statusIndicator"
              />
            )}
            <span className="relative">{status.name}</span>
          </span>
        )}
      </RadioGroup.Option>
    ))}
  </RadioGroup>
);

const TokensPage: NextPageWithLayout = () => {
  const { availableAirdrops, ERC20_availableAirdrops, address } =
    useContext(WalletContext);

  const { airdropsFilters, handleChangeFilters, filteredAirdrops } =
    useTokenDropsFilters(availableAirdrops);

  useEffect(() => {
    async function checkForAirdrops() {
      await ERC20_availableAirdrops();
    }

    if (address) checkForAirdrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <>
      <NextSeo
        title="Explore Token Drops"
        description="9999 Luftballons DApp Interface"
      />
      <div className="mx-auto w-full sm:pt-8">
        <div className="relative z-10 mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex items-center justify-between gap-4">
            <Status
              value={airdropsFilters.status}
              onChange={(e) => handleChangeFilters(e, 'status')}
            />
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <Search
              onChange={(e) =>
                handleChangeFilters(e.target.value, 'searchKeyword')
              }
              value={airdropsFilters.searchKeyword}
            />
            <SortList
              onChange={(e) => handleChangeFilters(e.id, 'sort')}
              value={airdropsFilters.sort}
            />
          </div>
        </div>
        <div className="custom-bordered mb-3 hidden grid-cols-5 gap-6 rounded-lg bg-accentalt dark:bg-light-dark sm:grid lg:grid-cols-5">
          <span className="px-8 py-6 text-sm tracking-wider dark:text-gray-300">
            Token Name
          </span>
          <span className="px-8 py-6 text-sm tracking-wider dark:text-gray-300">
            Airdrop/Balloon
          </span>
          <span className="px-8 py-6 text-sm tracking-wider dark:text-gray-300">
            USD/Balloon
          </span>
          <span className="px-8 py-6 text-sm tracking-wider dark:text-gray-300">
            Fully Noticed
          </span>
          <span className="px-8 py-6 text-sm tracking-wider dark:text-gray-300">
            Your Claim
          </span>
        </div>
        {filteredAirdrops.map((_tokenData: tokenData) => {
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
        })}
      </div>
    </>
  );
};

TokensPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default TokensPage;
