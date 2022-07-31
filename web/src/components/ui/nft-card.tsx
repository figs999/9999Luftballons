import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';
import { Verified } from '@/components/icons/verified';
import Avatar from '@/components/ui/avatar';
import { StaticImageData } from 'next/image';

type NFTGridProps = {
  author: string;
  authorImage: StaticImageData;
  image: StaticImageData;
  name: string;
  collection: string;
  price: string;
};

export default function NFTGrid({
  author,
  authorImage,
  image,
  name,
  collection,
  price,
}: NFTGridProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white shadow-card transition-all duration-200 hover:shadow-large dark:bg-light-dark">
      <AnchorLink href="/nft-details" className="relative block w-full pb-full">
        <Image
          src={image}
          placeholder="blur"
          layout="fill"
          objectFit="cover"
          alt=""
        />
      </AnchorLink>
      <div className="p-5">
        <AnchorLink
            href="/nft-details"
            className="flex items-center text-sm font-medium text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <span className="overflow-hidden text-ellipsis">{name}</span>
        </AnchorLink>
        <AnchorLink
          href="/nft-details"
          className="text-sm font-medium text-black dark:text-white"
        >
          {collection}
        </AnchorLink>
        <div className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
          Est. Value: {price}
        </div>
        <div className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
          $LUFT Fee: {price} (ADD CLAIMBUTTON)
        </div>
      </div>
    </div>
  );
}
