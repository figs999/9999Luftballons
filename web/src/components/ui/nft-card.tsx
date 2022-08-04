import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';
import { Verified } from '@/components/icons/verified';
import Avatar from '@/components/ui/avatar';
import { StaticImageData } from 'next/image';
import {nft} from "@/lib/hooks/use-connect";
import Button from "@/components/ui/button";

export default function NFTGrid({
    id,
    image_url,
    name,
    collection,
    price,
    luft,
    thumbnail_url,
    collection_metadata
}: nft) {
  let claimNFT = async function(collection:string, token:number) {

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
          className="text-sm font-medium text-black dark:text-white"
        >
          {collection}
        </AnchorLink>
        <div className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
          Est. Value: {price}
        </div>
        {luft ? (
          <div className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
            Burn Fee: {luft} $LUFT
            <Button
                onClick={() => claimNFT(collection, id)}
                className="shadow-main hover:shadow-large"
            >
              Claim It!
            </Button>
          </div>
        ):(<div/>)}
      </div>
    </div>
  );
}
