import {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import { atom, useAtom } from 'jotai';
import { NextSeo } from 'next-seo';
import type {GetServerSideProps, GetStaticProps, InferGetServerSidePropsType, InferGetStaticPropsType} from 'next';
import type { NextPageWithLayout } from '@/types';
import Slider from 'rc-slider';
import { motion } from 'framer-motion';
import DashboardLayout from '@/layouts/dashboard/_dashboard';
import { ChevronDown } from '@/components/icons/chevron-down';
import NFTGrid from '@/components/ui/nft-card';
import { RadioGroup } from '@/components/ui/radio-group';
import { Listbox } from '@/components/ui/listbox';
import Collapse from '@/components/ui/collapse';
import { Transition } from '@/components/ui/transition';
import { NormalGridIcon } from '@/components/icons/normal-grid';
import { CompactGridIcon } from '@/components/icons/compact-grid';
import CollectionSelect from '@/components/ui/collection-select-list';
import { useDrawer } from '@/components/drawer-views/context';
import Scrollbar from '@/components/ui/scrollbar';
import Button from '@/components/ui/button';
import { Close } from '@/components/icons/close';
import { NFTList } from '@/data/static/nft-list';
import {nft, WalletContext} from "@/lib/hooks/use-connect";
import Moralis from "moralis";

const gridCompactViewAtom = atom(false);
function useGridSwitcher() {
  const [isGridCompact, setIsGridCompact] = useAtom(gridCompactViewAtom);
  return {
    isGridCompact,
    setIsGridCompact,
  };
}

function GridSwitcher() {
  const { isGridCompact, setIsGridCompact } = useGridSwitcher();
  return (
    <div className="flex overflow-hidden rounded-lg">
      <button
        className={`relative flex h-11 w-11 items-center justify-center bg-gray-100 transition dark:bg-gray-800 ${
          !isGridCompact ? 'z-10 text-white' : 'text-brand dark:text-white'
        }`}
        onClick={() => setIsGridCompact(!isGridCompact)}
        aria-label="Normal Grid"
      >
        {!isGridCompact && (
          <motion.span
            className="absolute left-0 right-0 bottom-0 h-full w-full bg-brand shadow-large"
            layoutId="gridSwitchIndicator"
          />
        )}
        <NormalGridIcon className="relative" />
      </button>
      <button
        className={`relative flex h-11 w-11 items-center justify-center bg-gray-100 transition dark:bg-gray-800 ${
          isGridCompact ? 'z-10 text-white' : 'text-brand dark:text-white'
        }`}
        onClick={() => setIsGridCompact(!isGridCompact)}
        aria-label="Normal Grid"
      >
        {isGridCompact && (
          <motion.span
            className="absolute left-0 right-0 bottom-0 h-full w-full  bg-brand shadow-large"
            layoutId="gridSwitchIndicator"
          />
        )}
        <CompactGridIcon className="relative" />
      </button>
    </div>
  );
}

const sort = [
  { id: 1, name: 'LUFT$: Ascending', func: (a:nft,b:nft) => {return (a.luft&&b.luft) ? (a.luft - b.luft) : 0} },
  { id: 2, name: 'LUFT$: Descending', func: (a:nft,b:nft) => {return (a.luft&&b.luft) ? (b.luft - a.luft) : 0} },
  { id: 3, name: 'Date Listed: Newest', func: (a:nft,b:nft) => {return b?.date - a?.date} },
  { id: 4, name: 'Date Listed: Oldest', func: (a:nft,b:nft) => {return a?.date - b?.date} },
];

const sortAtom = atom(sort[0]);
function useSortSwitcher() {
  const [sortMethod, setSortMethod] = useAtom(sortAtom);
  return {
    sortMethod,
    setSortMethod,
  };
}

function SortList() {
  const {sortMethod, setSortMethod} = useSortSwitcher();

  return (
    <div className="relative">
      <Listbox value={sortMethod} onChange={setSortMethod}>
        <Listbox.Button className="flex h-10 w-auto items-center justify-between rounded-lg bg-gray-100 px-4 text-xs text-gray-900 dark:bg-gray-800 dark:text-white sm:w-56 sm:text-sm lg:h-11">
          {sortMethod.name}
          <ChevronDown className="ltr:ml-2 rtl:mr-2" />
        </Listbox.Button>
        <Transition
          enter="ease-out duration-200"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 -translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <Listbox.Options className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-white p-3 shadow-large dark:bg-light-dark sm:w-full">
            {sort.map((item) => (
              <Listbox.Option key={item.id} value={item}>
                {({ selected }) => (
                  <div
                    className={`block cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-gray-900 transition dark:text-white sm:text-sm  ${
                      selected
                        ? 'my-1 bg-gray-100 dark:bg-gray-800'
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

const rangeAtom = atom({ min: 0, max: 1000, most: 1000 });
function useFilterRange() {
  const [range, setRange] = useAtom(rangeAtom);
  return {
    range,
    setRange,
  };
}

function PriceRange() {
  let {range, setRange} = useFilterRange();

  function handleRangeChange(value: any) {
    setRange({
      min: value[0],
      max: value[1],
      most: range.most
    });
  }

  function handleMaxChange(max: number) {
    setRange({
      ...range,
      max: max || range.min,
    });
  }

  function handleMinChange(min: number) {
    setRange({
      ...range,
      min: min || 0,
    });
  }

  console.log(range);
  return (
    <div className="p-5">
      <div className="mb-4 grid grid-cols-2 gap-2">
        <input
          className="h-9 rounded-lg border-gray-200 text-sm text-gray-900 outline-none focus:border-gray-900 focus:outline-none focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-gray-500"
          type="number"
          value={range.min}
          onChange={(e) => handleMinChange(parseInt(e.target.value))}
          min="0"
          max={range.max}
        />
        <input
          className="h-9 rounded-lg border-gray-200 text-sm text-gray-900 outline-none focus:border-gray-900 focus:outline-none focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-gray-500"
          type="number"
          value={range.max}
          onChange={(e) => handleMaxChange(parseInt(e.target.value))}
          min={range.min}
        />
      </div>
      <Slider
        range
        min={0}
        max={range.most}
        value={[range.min, range.max]}
        allowCross={false}
        onChange={(value) => handleRangeChange(value)}
      />
    </div>
  );
}

const collectionAtom = atom<string|undefined>(undefined);
function useCollectionFilter() {
  const [collection, setCollection] = useAtom(collectionAtom);
  return {
    collection,
    setCollection,
  };
}

function Filters() {
  const {collection, setCollection} = useCollectionFilter();

  return (
    <>
      <Collapse label="Price Range" initialOpen>
        <PriceRange />
      </Collapse>
      <Collapse label="Collection" initialOpen>
        <CollectionSelect onSelect={(value) => setCollection(value)} />
      </Collapse>
    </>
  );
}

export function DrawerFilters() {
  const { closeDrawer } = useDrawer();
  return (
    <div className="relative w-full max-w-full bg-white dark:bg-dark xs:w-80">
      <div className="flex h-20 items-center justify-between overflow-hidden px-6 py-4">
        <h2 className="text-xl font-medium uppercase tracking-wider text-gray-900 dark:text-white">
          Filters
        </h2>
        <Button
          shape="circle"
          color="white"
          onClick={closeDrawer}
          className="dark:bg-light-dark"
        >
          <Close className="h-auto w-3" />
        </Button>
      </div>
      <Scrollbar style={{ height: 'calc(100% - 96px)' }}>
        <div className="px-6 pb-20 pt-1">
          <Filters />
        </div>
      </Scrollbar>
      <div className="absolute left-0 bottom-4 z-10 w-full px-6">
        <Button fullWidth onClick={closeDrawer}>
          DONE
        </Button>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: { }
  }
}

const NFTPage: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getStaticProps>
> = () => {
  const { isGridCompact } = useGridSwitcher();
  const { sortMethod } = useSortSwitcher();
  const { openDrawer } = useDrawer();
  const { availableNFTs, NFT_AvailableNFTs, address } = useContext(WalletContext);
  let {range, setRange} = useFilterRange();
  const {collection, setCollection} = useCollectionFilter();

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function getAvailableNFTs() {
      let available = await NFT_AvailableNFTs();
      setRange({
        min: 0,
        max: available.sort(sort[1].func)[0].luft,
        most: available.sort(sort[1].func)[0].luft})
    }

    if(address) getAvailableNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <>
      <NextSeo
        title="Explore NTF Drops"
        description="9999 Luftballons DApp Interface"
      />
      <div className="grid sm:pt-5 2xl:grid-cols-[280px_minmax(auto,_1fr)] 4xl:grid-cols-[320px_minmax(auto,_1fr)]">
        <div className="hidden border-dashed border-gray-200 ltr:border-r ltr:pr-8 rtl:border-l rtl:pl-8 dark:border-gray-700 2xl:block">
          <Filters />
        </div>

        <div className="2xl:ltr:pl-10 2xl:rtl:pr-10 4xl:ltr:pl-12 4xl:rtl:pr-12">
          <div className="relative z-10 mb-6 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
              {availableNFTs.length} items
            </span>

            <div className="flex gap-6 2xl:gap-8">
              <SortList />
              <div className="hidden 3xl:block">
                <GridSwitcher />
              </div>
              <div className="hidden sm:block 2xl:hidden">
                <Button
                  shape="rounded"
                  size="small"
                  color="gray"
                  onClick={() => openDrawer('DRAWER_SEARCH')}
                  className="dark:bg-gray-800"
                >
                  Filters
                </Button>
              </div>
            </div>
          </div>
          <div
            className={
              isGridCompact
                ? 'grid gap-5 sm:grid-cols-2 md:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5'
                : 'grid gap-6 sm:grid-cols-2 md:grid-cols-3 3xl:grid-cols-3 4xl:grid-cols-4'
            }
          >
            {availableNFTs.filter((element:nft) => {return (collection == undefined || collection.toLowerCase() == (element.collection?.toLowerCase()??"")) && (element.luft??0) <= range.max && (element.luft??0) >= range.min}).sort(sortMethod.func).map((_nft:nft) => (
              <NFTGrid
                key={_nft.collection_metadata.address + _nft.id}
                id={_nft.id}
                name={_nft.name}
                image_url={_nft.image_url}
                thumbnail_url={_nft.thumbnail_url}
                price={_nft.price}
                collection={_nft.collection}
                luft={_nft.luft}
                metadata={_nft.metadata}
                collection_metadata={_nft.collection_metadata}
                date={_nft.date}
              />
            ))}
          </div>
        </div>

        <div className="fixed bottom-6 left-1/2 z-10 w-full -translate-x-1/2 px-9 sm:hidden">
          <Button onClick={() => openDrawer('DRAWER_SEARCH')} fullWidth>
            Filters
          </Button>
        </div>
      </div>
    </>
  );
};

NFTPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default NFTPage;
