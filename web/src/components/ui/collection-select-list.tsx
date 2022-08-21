import React, { useContext, useState } from 'react';
import { StaticImageData } from 'next/image';
import { SearchIcon } from '@/components/icons/search';
import Avatar from '@/components/ui/avatar';
import CollectionImage1 from '@/assets/images/collection/collection-1.jpg';
import CollectionImage2 from '@/assets/images/collection/collection-2.jpg';
import CollectionImage3 from '@/assets/images/collection/collection-3.jpg';
import CollectionImage4 from '@/assets/images/collection/collection-4.jpg';
import { nft, WalletContext } from '@/lib/hooks/use-connect';
import Input from '@/components/ui/forms/input';

export const collectionList = [
  {
    icon: CollectionImage1,
    name: 'Iron flower',
    value: 'iron-flower',
  },
  {
    icon: CollectionImage2,
    name: 'Creative web',
    value: 'creative-web',
  },
  {
    icon: CollectionImage3,
    name: 'Art in binary',
    value: 'art-in-binary',
  },
  {
    icon: CollectionImage4,
    name: 'Sound of wave',
    value: 'sound-of-wave',
  },
  {
    icon: CollectionImage2,
    name: 'Pixel art',
    value: 'pixel-art',
  },
];

interface CollectionSelectTypes {
  onSelect: (value: string) => void;
}

export default function CollectionSelect({ onSelect }: CollectionSelectTypes) {
  let [searchKeyword, setSearchKeyword] = useState('');
  const { availableNFTs } = useContext(WalletContext);

  let coinListData: string[] =
    availableNFTs
      ?.map((item: nft) => item.collection)
      .filter(
        (value: any, index: any, self: string | any[]) =>
          self.indexOf(value) === index
      ) ?? [];

  if (coinListData.length > 0) {
    if (searchKeyword.length > 0) {
      coinListData = coinListData.filter(function (collection) {
        return (
          collection.match(searchKeyword) ||
          (collection.toLowerCase().match(searchKeyword) && collection)
        );
      });
    }
  }

  function handleSelectedCoin(value: string) {
    onSelect(value);
  }

  return (
    <div className="mt-4 w-full rounded-lg bg-accent text-sm shadow-large dark:bg-light-dark">
      <div className="relative">
        <label className="relative flex w-full items-center">
          <Input
            type="search"
            autoFocus={true}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search..."
            className="w-full px-4"
            inputClassName="pl-10"
          />
          <span className="pointer-events-none absolute flex h-full w-8 cursor-pointer items-center justify-center text-gray-600 hover:text-gray-900 ltr:left-4 ltr:pl-2 rtl:right-0 rtl:pr-2 dark:text-gray-500 sm:ltr:pl-3 sm:rtl:pr-3">
            <SearchIcon className="h-4 w-4" />
          </span>
        </label>
      </div>
      <ul role="listbox" className="py-3">
        {coinListData ? (
          coinListData.map((collection) => (
            <li
              key={collection}
              role="listitem"
              tabIndex={availableNFTs
                .map((item: nft) => item.collection)
                .indexOf(collection)}
              onClick={() => handleSelectedCoin(collection)}
              className="mb-1 flex cursor-pointer items-center gap-3 py-1.5 px-6 text-black outline-none hover:bg-body hover:text-white focus:bg-body focus:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-600"
            >
              <span className="text-sm tracking-tight dark:text-white">
                {collection}
              </span>
            </li>
          ))
        ) : (
          // FIXME: need coin not found svg from designer
          <li className="px-6 py-5 text-center">
            <h3 className="mb-2 text-sm text-gray-600 dark:text-white">
              Ops! not found
            </h3>
          </li>
        )}
      </ul>
    </div>
  );
}
