import { Bitcoin } from '@/components/icons/bitcoin';
import { Ethereum } from '@/components/icons/ethereum';
import { Tether } from '@/components/icons/tether';
import { Bnb } from '@/components/icons/bnb';
import { Usdc } from '@/components/icons/usdc';
import { Cardano } from '@/components/icons/cardano';
import { Doge } from '@/components/icons/doge';
import {tokenData} from "@/lib/hooks/use-connect";

export type CoinList = 'BTC' | 'ETH' | 'USDT' | 'BNB' | 'USDC' | 'ADA' | 'DOGE';

export default function CurrencyIcons({
  metadata
}: tokenData) {
  return (
    <div className="flex items-center">
      <div className="flex items-center">
        <div className="relative">{metadata?.thumbnail}</div>
      </div>
      <div className="whitespace-nowrap text-sm font-medium uppercase text-black ltr:ml-3 rtl:mr-3 dark:text-white">
          <a href={`https://etherscan.io/token/${metadata?.address}`} target='_blank' rel="noreferrer">{metadata?.name}</a>
      </div>
    </div>
  );
}
