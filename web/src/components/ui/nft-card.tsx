import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';
import { Verified } from '@/components/icons/verified';
import Avatar from '@/components/ui/avatar';
import { StaticImageData } from 'next/image';
import {nft, WalletContext} from "@/lib/hooks/use-connect";
import Button from "@/components/ui/button";
import {useContext} from "react";

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
    ensState
}: nft) {
    const { txNFT_harvestERC721Airdrop, txNFT_harvestERC1155Airdrop, txNFT_SetPrimaryENS, txRegisterENS, address, userBalances } = useContext(WalletContext);
    let claimNFT = async function(collection:string, token:number) {
        if(collection_metadata.schema_name == "ERC721") {
            await txNFT_harvestERC721Airdrop(address,collection,token);
        } else {
            await txNFT_harvestERC1155Airdrop(address,collection,token,1);
        }
    }

    const myLoader=(url:string)=>{
        return `${url}`;
    }

    const nft_url = `https://opensea.io/assets/ethereum/${collection_metadata.address}/${id}`;

  return (
    <div className="relative overflow-hidden rounded-lg bg-white shadow-card transition-all duration-200 hover:shadow-large dark:bg-light-dark">
      <AnchorLink href={nft_url} target="_blank" className="relative block w-full pb-full">
        <Image
          src={image_url??""}
          placeholder="blur"
          blurDataURL={thumbnail_url??""}
          layout="fill"
          objectFit="cover"
          alt=""
        />
      </AnchorLink>
      <div className="p-5">
        <AnchorLink
            href={nft_url} target="_blank"
            className="flex items-center text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <span className="overflow-hidden text-ellipsis">{name}</span>
        </AnchorLink>
        <AnchorLink
          href={nft_url} target="_blank"
          className="text-xs font-light text-black dark:text-white"
        >
          {collection}
        </AnchorLink>
        {luft ? (
            <div className="mt-8">Claim:
          <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white text-center">
            <Button
                onClick={() => claimNFT(collection_metadata.address, id)}
                className="shadow-main hover:shadow-large"
                disabled={userBalances[1] && userBalances[1].balance<luft}
                color="success"
            >
              Burn {luft} $LUFT
            </Button>
          </div>
            </div>
        ):(<div/>)}
        {ensState != undefined ? (
          <div className="mt-3 p-2 text-center text-lg font-black text-gray-900 dark:text-white rounded-lg"
               style={{ backgroundColor: "#d8f7bb" }}
          >
              {id}.THELUFTBALLONS.ETH DOMAIN
              <br />
              <div className="mt-2 bottom-8 text-center">
                  <Button
                      onClick={async () => {
                          if(ensState == 0)
                              await txRegisterENS(id);
                          else if(ensState == 1)
                              await txNFT_SetPrimaryENS(id);
                      }}
                      color={ensState < 1 ? "success":"warning"}
                      className="shadow-main hover:shadow-large"
                      disabled={ensState>1}>
                      {ensState == 0 ? `CLAIM ENS DOMAIN!` : ensState == 1 ? `SET AS PRIMARY ENS!` : `PRIMARY ENS`}
                  </Button>
              </div>
          </div>
        ):(<div/>)}
        <div className="mt-10 text-sm font-medium text-gray-900 dark:text-white">
          Last Sale: {price?.toString()}
        </div>
        {date ? (
          <div className="mt-2 text-xs font-extralight text-gray-900 dark:text-white">
              Dropped: {(new Date(date)).toLocaleString('en-US')}
          </div>
        ):(<div/>)}
      </div>
    </div>
  );
}
