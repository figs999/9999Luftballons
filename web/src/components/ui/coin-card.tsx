import Image from '@/components/ui/image';
import { ArrowUp } from '@/components/icons/arrow-up';
import { Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { StaticImageData } from 'next/image';
import TopupButton from "@/components/ui/topup-button";
import {useContext} from "react";
import {WalletContext} from "@/lib/hooks/use-connect";
import Button from "@/components/ui/button";

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
  text
}: CoinCardProps) {

  const { claimableLuft, txERC20_claimLuft } = useContext(WalletContext);

  return (
    <div
      className="relative rounded-lg p-6 xl:p-8"
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
        {symbol == "LUFTBALLONS" ? (+balance).toFixed(0) : (+balance).toFixed(5)}
        <span className="uppercase"> {symbol}</span>
      </div>
      {symbol == "LUFT" ? (
          <div>
            <div className="mt-2 flex items-center justify-between text-xs font-medium 2xl:text-sm">
              <span className="tracking-wider text-gray-600">Harvestable: {claimableLuft.toFixed(1)}</span>
            </div>
          </div>
      ):(
          <div className="flex items-center justify-between text-xs font-medium 2xl:text-sm">
            <span className="tracking-wider text-gray-600">{(usdBalance*balance).toFixed(2)} ({(+usdBalance).toFixed(2)}) USD</span>
          </div>
      )}
      <br/>
      <div>
        {symbol != "LUFT" ? (
          <TopupButton link={link} text={text} />
            ) : (
          <Button
              onClick={() => txERC20_claimLuft()}
              className="shadow-main hover:shadow-large"
              disabled={claimableLuft < 0.1}
          >
            HARVEST LUFT!
          </Button>
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
            spaceBetween={24}
            slidesPerView={5}
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
        ):(<div/>)}
      </div>
  );
}
