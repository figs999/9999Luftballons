import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';
import { Verified } from '@/components/icons/verified';
import Avatar from '@/components/ui/avatar';
import { StaticImageData } from 'next/image';
import { nft, WalletContext } from '@/lib/hooks/use-connect';
import Button from '@/components/ui/button';
import { useContext } from 'react';

export default function NFTGrid({
  id,
  image_url,
  name,
  collection,
  price,
  luft,
  thumbnail_url,
  collection_metadata,
  date,
  ensState,
  harvestableLuft
}: nft) {
  const {
    txNFT_harvestERC721Airdrop,
    txNFT_harvestERC1155Airdrop,
    txNFT_SetPrimaryENS,
    txRegisterENS,
    address,
    userBalances,
  } = useContext(WalletContext);
  let claimNFT = async function (collection: string, token: number) {
    if (collection_metadata.schema_name == 'ERC721') {
      await txNFT_harvestERC721Airdrop(address, collection, token);
    } else {
      await txNFT_harvestERC1155Airdrop(address, collection, token, 1);
    }
  };

  const myLoader = (url: string) => {
    return `${url}`;
  };

  const nft_url = `https://opensea.io/assets/ethereum/${collection_metadata.address}/${id}`;

  return (
    <div className="custom-bordered relative rounded-lg bg-accent shadow-card transition-all duration-200 hover:shadow-large dark:bg-light-dark">
      <AnchorLink
        href={nft_url}
        target="_blank"
        className="relative block w-full pb-full"
      >
        <div className="nft-card-img-container">
          <Image
            className="rounded-xl -translate-y-1"
            src={image_url ?? ''}
            placeholder="blur"
            blurDataURL={thumbnail_url ?? ''}
            layout="fill"
            objectFit="cover"
            alt=""
          />
        </div>
      </AnchorLink>
      <div className="p-5">
        <AnchorLink
          href={nft_url}
          target="_blank"
          className="flex items-center text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <span className="overflow-hidden text-ellipsis">{name}</span>
        </AnchorLink>
        <AnchorLink
          href={nft_url}
          target="_blank"
          className="text-xs font-light text-black dark:text-white"
        >
          {collection}
        </AnchorLink>
        {luft ? (
          <div className="mt-3 rounded-lg p-2 text-center bg-accentinput custom-bordered text-lg font-black text-gray-900 dark:text-white">
            Claim NFT
            <div className="mt-2 text-center text-sm font-medium text-gray-900 dark:text-white">
              <Button
                onClick={() => claimNFT(collection_metadata.address, id)}
                className="shadow-main hover:shadow-large"
                disabled={userBalances[1] && userBalances[1].balance < luft}
                color="success"
              >
                Burn {luft} $LUFT
              </Button>
            </div>
          </div>
        ) : (
          <div />
        )}
        {ensState != undefined ? (
          <div
            className="flex-grow w-full mt-3 rounded-lg p-2 block text-center bg-accentinput custom-bordered font-black text-gray-900 dark:text-white"
          >
            <div className="text-sm font-black">
              {id}.THELUFTBALLONS.ETH
            </div>
            <div className="bottom-8 mt-2 text-center">
              <Button
                onClick={async () => {
                  if (ensState == 0) await txRegisterENS(id);
                  else if (ensState == 1) await txNFT_SetPrimaryENS(id);
                }}
                color={ensState < 1 ? 'success' : 'warning'}
                className="shadow-main hover:shadow-large"
                disabled={ensState > 1}
              >
                {ensState == 0
                  ? `CLAIM ENS DOMAIN!`
                  : ensState == 1
                  ? `SET AS PRIMARY ENS!`
                  : `PRIMARY ENS`}
              </Button>
            </div>
          </div>
        ) : (
          <div />
        )}
        {harvestableLuft ? (
            <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Harvestable Luft: {harvestableLuft}
            </div>
        ) : (
            <div/>
        )}
        <div className="mt-2 text-xs font-medium text-gray-900 dark:text-white">
          {price?.toString()}
        </div>
        {date ? (
          <div className="mt-2 text-xs font-extralight text-gray-900 dark:text-white">
            Dropped: {new Date(date).toLocaleString('en-US')}
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
