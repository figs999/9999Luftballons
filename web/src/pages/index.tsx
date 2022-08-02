import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { NextSeo } from 'next-seo';
import type { NextPageWithLayout } from '@/types';
import {MoralisProvider, useMoralis} from "react-moralis";

import DashboardLayout from '@/layouts/dashboard/_dashboard';
import CoinSlider from '@/components/ui/coin-card';
import OverviewChart from '@/components/ui/chats/overview-chart';
import LiquidityChart from '@/components/ui/chats/liquidity-chart';
import VolumeChart from '@/components/ui/chats/volume-chart';
import TopPools from '@/components/ui/top-pools';
import LuftballonsTable from '@/components/nft/luftballons-table';
import TopCurrencyTable from '@/components/top-currency/currency-table';
import Avatar from '@/components/ui/avatar';
import TopupButton from '@/components/ui/topup-button';
//images
import AuthorImage from '@/assets/images/author.jpg';
import {useContext, useEffect, useState} from "react";
import {WalletContext} from "@/lib/hooks/use-connect";

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

const HomePage: NextPageWithLayout<
  InferGetStaticPropsType<typeof getStaticProps>
> = () => {
  const { userBalances, ERC20_userBalances } = useContext(WalletContext);
  return (
    <>
      <NextSeo
        title="9999Luftballons"
        description="9999Luftballons - DApp Interface"
      />
      <div className="flex flex-wrap">
        <div className="mb-8 w-full sm:mb-0 sm:ltr:pr-6 sm:rtl:pl-6">
          <CoinSlider coins={userBalances} />
        </div>
      </div>

      <div className="flex flex-wrap">
        <div className="w-full">
          <LuftballonsTable />
        </div>
      </div>
    </>
  );
};

HomePage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>
};

export default HomePage;
