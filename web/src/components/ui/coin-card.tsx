import Image from '@/components/ui/image';
import { ArrowUp } from '@/components/icons/arrow-up';
import { Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { StaticImageData } from 'next/image';
import TopupButton from '@/components/ui/topup-button';
import {useContext, useEffect, useState} from 'react';
import { WalletContext } from '@/lib/hooks/use-connect';
import Button from '@/components/ui/button';
import Slider from "rc-slider";

type CoinCardProps = {
  id: string;
  name: string;
  symbol: string;
  logo: StaticImageData;
  balance: number;
  usdBalance: number;
  color?: string;
  link?: string;
  text?: string;
};

export function CoinCard({
  name,
  symbol,
  logo,
  balance,
  usdBalance,
  color = '#FDEDD4',
  link,
  text,
}: CoinCardProps) {
  const { claimableLuft, txERC20_claimLuft } = useContext(WalletContext);
  const [maxHarvest, setMaxHarvest] = useState<number>();

  useEffect(() => {
    setMaxHarvest(1);
  },[]);

  return (
    <div
      className="custom-bordered relative rounded-lg p-6 xl:p-8"
      style={{ backgroundColor: color }}
    >
      <h4 className="mb-8 text-sm font-medium uppercase tracking-wider text-gray-900">
        {name}
      </h4>
      <div className="relative h-20 lg:h-24 xl:h-28 3xl:h-36">
        <Image
            src={logo}
            alt={name}
            layout="fill"
            objectFit="contain"
            objectPosition={0}
        />
      </div>
      <div className="mt-8 mb-2 text-sm font-medium tracking-wider text-gray-900 lg:text-lg 2xl:text-xl 3xl:text-2xl">
        {symbol == 'LUFTBALLONS'
          ? (+balance).toFixed(0)
          : (+balance).toFixed(5)}
        <span className="uppercase"> {symbol}</span>
      </div>
      {symbol == 'LUFT' ? (
        <div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium 2xl:text-sm">
            <span className="tracking-wider text-gray-600">
              Harvestable: {claimableLuft.toFixed(1)}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs font-medium 2xl:text-sm">
          <span className="tracking-wider text-gray-600">
            {(usdBalance * balance).toFixed(2)} ({(+usdBalance).toFixed(2)}) USD
          </span>
        </div>
      )}
      <br />
      <div>
        {symbol != 'LUFT' ? (
            <div className="flex-1 rounded-lg p-2 text-center bg-accentinput custom-bordered text-lg font-black text-gray-900 dark:text-white">
            <a href={link} target="_blank" rel="noreferrer">
              <Button className="shadow-main hover:shadow-large">
                {text}
              </Button>
            </a>
            </div>
        ) : (
          <div className="flex-1 rounded-lg p-2 text-center bg-accentinput custom-bordered text-lg font-black text-gray-900 dark:text-white">
          <Button
            onClick={() => txERC20_claimLuft(maxHarvest)}
            className="shadow-main hover:shadow-large"
            disabled={claimableLuft < 0.1}
          >
            HARVEST LUFT!
          </Button>
            <div className="flex-0 mt-2 w-full flex-1 text-xs">
              Min. $LUFT
              <input
                  className="ml-2 mt-2 flex-grow w-1/2 h-2 "
                  placeholder="9999"
                  autoComplete="off"
                  type="number"
                  onChange={(event) => setMaxHarvest(+event.target.value)}
                  >
              </input>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CoinSliderProps {
  coins: CoinCardProps[];
}

export default function CoinSlider({ coins }: CoinSliderProps) {
  const sliderBreakPoints = {
    0: {
      slidesPerView: 1,
      spaceBetween: 20
    },
    480: {
      slidesPerView: 2,
      spaceBetween: 20
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
    1080: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
    1280: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
    1700: {
      slidesPerView: 5,
      spaceBetween: 24,
    },
    2200: {
      slidesPerView: 5,
      spaceBetween: 24,
    },
  };

  return (
    <div>
      {coins.length > 0 ? (
        <Swiper
          modules={[Scrollbar, A11y]}
          scrollbar={{ draggable: true }}
          breakpoints={sliderBreakPoints}
          observer={true}
          dir="ltr"
        >
          {coins.map((coin) => (
            <SwiperSlide key={coin.id}>
              <CoinCard
                id={coin.id}
                name={coin.name}
                symbol={coin.symbol}
                logo={coin.logo}
                balance={coin.balance}
                usdBalance={coin.usdBalance}
                color={coin.color}
                text={coin.text}
                link={coin.link}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div />
      )}
    </div>
  );
}
