import { useEffect, useState, createContext, ReactNode } from 'react';
import Web3 from 'web3';
import { Contract, ContractReceipt, ethers } from 'ethers';
// @ts-ignore
import Web3Modal from 'web3modal';
// @ts-ignore
import WalletConnect from '@walletconnect/web3-provider';
// @ts-ignore
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
// @ts-ignore
import { Web3Auth } from '@web3auth/web3auth';
import { MoralisProvider, useMoralis } from 'react-moralis';
import axios, {AxiosResponse} from 'axios';
import {
  components,
  defaultResponse,
  operations,
} from 'moralis/types/generated/web3Api';
import { AbiItem } from 'web3-utils';
import erc20ContractABI from '../erc20.abi.json';
import LuftballonsContractABI from '../luftballons.abi.json';
import LuftRegistarABI from '../luftregistrar.abi.json';
import ENSReverseRegistrarABI from '../ensreverseregistrar.abi.json';
import NFTAbi from '../nft.abi.json';

import Moralis from 'moralis';

import LuftballonsImage from '@/assets/images/coin/balloon.svg';
import LUFTImage from '@/assets/images/coin/LUFT.svg';
import NFTxImage from '@/assets/images/coin/NFTXLUFT.svg';
import xLUFTImage from '@/assets/images/coin/xLUFT.svg';
import XLUFTWETH from '@/assets/images/coin/XLUFTWETH.svg';
import { StaticImageData } from "next/legacy/image";
import { forEach } from 'lodash';
import AuthorImage from '@/assets/images/author.jpg';
import NFT1 from '@/assets/images/nft/nft-1.jpg';
import { Runtime } from 'inspector';
import { ContractTransaction } from '@ethersproject/contracts/src.ts';

const luftballonsAddress = '0x356e1363897033759181727e4bff12396c51a7e0';
const luftRegistrarAddress = '0x2F1Fe020617a0898d44951625677CD4C040a3dB1';

const supportedChains: IChainData[] = [
  {
    name: 'Ethereum Mainnet',
    short_name: 'eth',
    chain: 'ETH',
    network: 'mainnet',
    chain_id: 1,
    network_id: 1,
    rpc_url: 'https://mainnet.infura.io/v3/%API_KEY%',
    native_currency: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: '18',
      contractAddress: '',
      balance: '',
    },
  },
  {
    name: 'Ethereum Ropsten',
    short_name: 'rop',
    chain: 'ETH',
    network: 'ropsten',
    chain_id: 3,
    network_id: 3,
    rpc_url: 'https://ropsten.infura.io/v3/%API_KEY%',
    native_currency: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: '18',
      contractAddress: '',
      balance: '',
    },
  },
  {
    name: 'Ethereum Rinkeby',
    short_name: 'rin',
    chain: 'ETH',
    network: 'rinkeby',
    chain_id: 4,
    network_id: 4,
    rpc_url: 'https://rinkeby.infura.io/v3/%API_KEY%',
    native_currency: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: '18',
      contractAddress: '',
      balance: '',
    },
  },
];

export const WalletContext = createContext<any>({});

export interface IAssetData {
  symbol: string;
  name: string;
  decimals: string;
  contractAddress: string;
  balance?: string;
}

export interface IChainData {
  name: string;
  short_name: string;
  chain: string;
  network: string;
  chain_id: number;
  network_id: number;
  rpc_url: string;
  native_currency: IAssetData;
}

export type CollectionMetadata = {
  schema_name: string;
  address: string;
  token_uri: string;
}

export type nft = {
  unique_id: string;
  id: number;
  thumbnail_url?: string;
  image_url?: string;
  name: string;
  collection: string;
  price?: string;
  luft?: number;
  metadata?: any;
  collection_metadata: CollectionMetadata;
  date: number;
  ensState?: number;
  harvestableLuft?: number;
  wrapperCollection?: string;
  wrapperID?: number;
};

export type tokenData = {
  value: number;
  price?: {
    nativePrice?: {
      value: string;
      decimals: number;
      name: string;
      symbol: string;
    };
    usdPrice: number;
    exchangeAddress?: string;
    exchangeName?: string;
  };
  metadata?: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
    created_at?: string | number | Date;
    logo?: string | undefined;
    logo_hash?: string | undefined;
    thumbnail?: string | undefined;
    block_number?: string | undefined;
    validated?: string | undefined;
  };
  claimable?: number;
  noticed?: number;
};

export type NFTOwnershipResults = {
  nfts: { [add_id: string]: nft };
  nftIDs: { [add_id: string]: { address: string; id: number; date: number } };
}

export function getChainData(chainId: number): IChainData | undefined {
  const chainData = supportedChains.filter(
    (chain: any) => chain.chain_id === chainId
  )[0];

  if (!chainData) {
    return undefined;
  }

  const API_KEY = process.env.REACT_APP_INFURA_ID;

  if (
    chainData.rpc_url.includes('infura.io') &&
    chainData.rpc_url.includes('%API_KEY%') &&
    API_KEY
  ) {
    const rpcUrl = chainData.rpc_url.replace('%API_KEY%', API_KEY);

    return {
      ...chainData,
      rpc_url: rpcUrl,
    };
  }

  return chainData;
}

export async function ServerSide_AvailableAirdrops(): Promise<{
  [address: string]: tokenData;
}> {
  return {};
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);
  let [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number>(1);
  const [networkId, setNetworkID] = useState<number>(1);
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  let [provider, setProvider] = useState<
    ethers.providers.Web3Provider | undefined
  >(undefined);

  const getNetwork = () => getChainData(chainId)?.network;

  const getProviderOptions = () => {
    const infuraId = process.env.REACT_APP_INFURA_ID;
    const providerOptions = {
      walletconnect: {
        package: WalletConnect,
        options: {
          infuraId,
          rpc: {
            1: getChainData(1)?.rpc_url,
          },
        },
      },
      coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
          appName: 'Web3Modal Example App',
          infuraId,
        },
      },
    };
    return providerOptions;
  };

  const web3Modal =
    typeof window !== 'undefined' &&
    new Web3Modal({
      network: getNetwork(),
      cacheProvider: true,
      providerOptions: getProviderOptions(),
    });

  web3Modal &&
    web3Modal.on('select', (provider_id) => {
      if (loading) {
        console.log('selected');
        loading = false;
        web3Modal && web3Modal.toggleModal();
      }
    });

  web3Modal &&
    web3Modal.on('connect', (connection) => {
      console.log(connection);

      async function connected() {
        console.log('connected');
        let web3 = initWeb3(connection);
        let networkId = await web3.eth.net.getId();
        let chainId = web3.utils.hexToNumber(networkId);
        setWeb3(web3);

        if (chainId > 1 || networkId > 1) {
          await switchNetwork();
        } else {
          setChainId(chainId);
          setNetworkID(networkId);
        }

        provider = await subscribeProvider(connection);
        await setWalletAddress();
        console.log('Connected');
        await setLoading(false);
      }

      connected();
    });

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function checkConnection() {
      if (web3Modal && web3Modal.cachedProvider) {
        await connectToWallet();
      }
    }

    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setWalletAddress = async () => {
    if (chainId > 1 || networkId > 1) return;

    try {
      const signer = provider?.getSigner();
      console.log('Signer ' + signer);
      if (signer) {
        const web3Address = await signer.getAddress();
        if(web3Address != address) {
          setAddress(web3Address);
          console.log('Logged In Moralis');
          await getBalance(web3Address);
        }
      }
    } catch (error) {
      console.log(
        'Account not connected; logged from setWalletAddress function: ' + error
      );
    }
  };

  const getBalance = async (walletAddress: string) => {
    const walletBalance = (await provider?.getBalance(walletAddress)) ?? 0;
    const balanceInEth = ethers.utils.formatEther(walletBalance);
    console.log(walletBalance);
    setBalance(balanceInEth.toString());
    NFT_UserLuftballons(walletAddress);
    ERC20_userBalances(walletAddress);
  };

  const disconnectWallet = () => {
    setAddress(undefined);
    setChainId(1);
    setNetworkID(1);
    web3Modal && web3Modal.clearCachedProvider();
  };

  const connectToWallet = async () => {
    try {
      setLoading(true);
      const connection = web3Modal && (await web3Modal.connect());
    } catch (error) {
      //setLoading(false);
      console.log(
        error,
        'got this error on connectToWallet catch block while connecting the wallet'
      );
    }
  };

  function initWeb3(provider: any): Web3 {
    const web3: Web3 = new Web3(provider);

    web3.eth.extend({
      methods: [
        {
          name: 'chainId',
          call: 'eth_chainId',
          //outputFormatter: web3.utils.hexToNumber
        },
      ],
    });

    return web3;
  }

  const switchNetwork = async () => {
    try {
      if (provider?.provider.request) {
        await provider?.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }],
        });
      }
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          if (provider?.provider.request) {
            await provider?.provider.request({
              method: 'wallet_addEthereumChain',
              params: [getChainData(1)],
            });
          }
        } catch (error: any) {
          setError(error);
        }
      }
    }
  };

  const subscribeProvider = async (connection: any) => {
    const p = new ethers.providers.Web3Provider(connection);
    setProvider(p);

    connection.on('close', () => {
      disconnectWallet();
    });
    connection.on('accountsChanged', async (accounts: string[]) => {
      if (accounts?.length) {
        await setWalletAddress();
      } else {
        disconnectWallet();
      }
    });
    connection.on('chainChanged', async (chainId: number) => {
      setChainId(chainId);
      if (chainId != 1) await switchNetwork();
      //await setWalletAddress();
    });

    connection.on('networkChanged', async (networkId: number) => {
      setNetworkID(networkId);
      if (networkId != 1) await switchNetwork();
      //await setWalletAddress();
    });

    return p;
  };

  const getERC20Contract = function (address: string) {
    return new Contract(address, erc20ContractABI, provider?.getSigner());
  };

  const getLuftballonsContract = function () {
    return new Contract(
      luftballonsAddress,
      LuftballonsContractABI,
      provider?.getSigner()
    );
  };

  const getLuftRegistrarContract = function () {
    return new Contract(
      luftRegistrarAddress,
      LuftRegistarABI,
      provider?.getSigner()
    );
  };

  const getENSReverseRegistrarContract = function () {
    return new Contract(
      '0x084b1c3C81545d370f3634392De611CaaBFf8148',
      ENSReverseRegistrarABI,
      provider?.getSigner()
    );
  };

  type CoinCardProps = {
    id: string;
    name: string;
    symbol: string;
    logo: StaticImageData;
    balance: string;
    usdBalance: string;
    color?: string;
    link?: string;
    text?: string;
  };

  const ERC20_airdroppedQuantity = async function (
    token_address: string
  ): Promise<number> {
    const LuftballonsContract = getLuftballonsContract();
    return await LuftballonsContract.airdroppedQuantity(token_address);
  };

  const ERC20_tokenMetadata = async function (tokens: {
    [address: string]: tokenData;
  }): Promise<{ [address: string]: tokenData }> {
    let _addresses = Object.keys(tokens);
    const options = {
      addresses: _addresses,
    };
    //API reference: https://docs.moralis.io/moralis-dapp/web3-api/token#gettokenmetadata
    const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(options);

    for (let i = 0; i < tokenMetadata.length; i++) {
      const metadata = tokenMetadata[i];
      console.log(`Metadata Results: ${tokens[metadata.address]}`);

      tokens[metadata.address].value /= 10 ** +metadata.decimals;
      tokens[metadata.address].metadata = metadata;

      const options = {
        address: metadata.address,
      };
      try {
        //API reference: https://docs.moralis.io/moralis-dapp/web3-api/token#gettokenprice
        tokens[metadata.address].price =
          await Moralis.Web3API.token.getTokenPrice(options);
      } catch (err) {
        tokens[metadata.address].price = {
          nativePrice: {
            value: '0',
            decimals: 18,
            name: 'Ether',
            symbol: 'ETH',
          },
          usdPrice: 0,
        };
      }
    }
    return tokens;
  };

  const [availableAirdrops, setAvailableAirdrops] = useState<{
    [address: string]: tokenData;
  }>({});
  const ERC20_availableAirdrops = async function () {
    let results: { [address: string]: tokenData } = {};

    const EthTokenTransfers = Moralis.Object.extend('EthTokenTransfers');
    const query = new Moralis.Query(EthTokenTransfers);
    query.equalTo('to_address', luftballonsAddress);
    const found = await query.find();

    for (let row of found) {
      const tok = await row?.get('token_address');
      const val = await row?.get('value');
      console.log('!!!!!!!!!!!!!!!!!!!!' + tok);
      if (results[tok]) results[tok].value += Number.parseInt(val);
      else results[tok] = { value: Number.parseInt(val) };
    }

    results = await ERC20_tokenMetadata(results);
    await setAvailableAirdrops(results);

    for (let address of Object.keys(results)) {
      let decimals =
        10 ** Number.parseInt(results[address]?.metadata?.decimals ?? '18');
      const erc20Contract = getERC20Contract(address);
      results[address].value =
        +(await erc20Contract.balanceOf(luftballonsAddress)) / decimals;
      await setAvailableAirdrops(results);
      results[address].noticed =
        +(await ERC20_airdroppedQuantity(address)) / decimals;
      await setAvailableAirdrops(results);

      for (let balloon of userLuftballons) {
        results[address].claimable =
          +(await ERC20_claimableTokenQuantity(address, balloon.id)) /
            decimals +
          +(results[address].claimable ?? 0);
        if (results[address].claimable ?? 0 > 0)
          await setAvailableAirdrops(results);
      }
    }

    return results;
  };

  const [userBalances, setUserBalances] = useState<CoinCardProps[]>([]);
  const ERC20_userBalances = async function (
    user_address: string
  ): Promise<CoinCardProps[]> {
    let addresses = [
      '0xb9f7dba05880100083278156ab24d5fc036c3bb8', //LUFT
      '0x6e946833aa67eaf849927817f25f0d2f04064499', //NFTx LUFT
      '0x411f84b9d1d2f8deae83d20b51386deb2b244268', //xLUFTWETH
      '0x46bffbcc49bab96345717a7b83edc75c82a814bf', //xLUFT
    ];
    let results: { [address: string]: tokenData } = {};

    for (let address of addresses) {
      const erc20Contract = getERC20Contract(address);
      results[address] = {
        value: await erc20Contract.balanceOf(user_address),
      };
    }

    results = await ERC20_tokenMetadata(results);

    const price = await NFT_getFloorPrice('9999-luftballons');

    results[luftballonsAddress] = {
      value: await Luftballons_balanceOf(user_address),
      metadata: {
        address: luftballonsAddress,
        name: '9999 Luftballons',
        decimals: '1',
        symbol: 'LUFTBALLONS',
      },
      price: {
        usdPrice: price.usd,
        nativePrice: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
          value: price.ether.toString(),
        },
      },
    };

    results['0x46bffbcc49bab96345717a7b83edc75c82a814bf'].price!.usdPrice =
      results['0x6e946833aa67eaf849927817f25f0d2f04064499'].price!.usdPrice;
    results['0x411f84b9d1d2f8deae83d20b51386deb2b244268'].price!.usdPrice =
      results['0x6e946833aa67eaf849927817f25f0d2f04064499'].price!.usdPrice * 2;

    let data: {
      [contract: string]: {
        link: string;
        text: string;
        color: string;
        logo: any;
      };
    } = {
      '0x356e1363897033759181727e4bff12396c51a7e0': {
        color: '#FD7474',
        logo: LuftballonsImage,
        text: 'Buy on Opensea',
        link: 'https://opensea.io/collection/9999-luftballons',
      },
      '0xb9f7dba05880100083278156ab24d5fc036c3bb8': {
        color: '#8199e1',
        logo: LUFTImage,
        text: 'Harvest Luft',
        link: '',
      },
      '0x411f84b9d1d2f8deae83d20b51386deb2b244268': {
        color: '#dad94c',
        logo: XLUFTWETH,
        text: 'Manage NFTx LP',
        link: 'https://nftx.io/vault/0x6e946833aa67eaf849927817f25f0d2f04064499/stake/',
      },
      '0x46bffbcc49bab96345717a7b83edc75c82a814bf': {
        color: '#aD84f4',
        logo: xLUFTImage,
        text: 'Un-Stake on NFTx',
        link: 'https://nftx.io/vault/0x6e946833aa67eaf849927817f25f0d2f04064499/stake/',
      },
      '0x6e946833aa67eaf849927817f25f0d2f04064499': {
        color: '#6cd581',
        logo: NFTxImage,
        text: 'Redeem on NFTx',
        link: 'https://nftx.io/vault/0x6e946833aa67eaf849927817f25f0d2f04064499/stake/',
      },
    };

    addresses = addresses.reverse();
    addresses.push(luftballonsAddress);
    addresses = addresses.reverse();

    let cards: CoinCardProps[] = [];
    for (let contract of addresses) {
      let result = results[contract];
      cards.push({
        id: contract,
        name: result.metadata?.name ?? '',
        symbol: result.metadata?.symbol ?? '',
        balance: (+result.value).toFixed(5),
        usdBalance: (result.price?.usdPrice ?? 0 * result.value).toString(),
        logo: data[contract].logo,
        color: data[contract].color,
        text: data[contract].text,
        link: data[contract].link,
      });

      if (contract == '0x6e946833aa67eaf849927817f25f0d2f04064499') {
        cards[cards.length - 1].name = 'NFTx LUFTBALLOONS';
        cards[cards.length - 1].symbol = 'NFTxLUFT';
      } else if (contract == '0x46bffbcc49bab96345717a7b83edc75c82a814bf') {
        cards[cards.length - 1].name = 'NFTx Luftballons Stake';
      } else if (contract == '0x411f84b9d1d2f8deae83d20b51386deb2b244268') {
        cards[cards.length - 1].name = 'NFTx LP';
      }
    }

    setUserBalances(cards);
    return cards;
  };

  const [userTokens, setUserTokens] = useState<
    operations['getTokenBalances']['responses']['200']['content']['application/json'] &
      defaultResponse<
        operations['getTokenBalances']['responses']['200']['content']['application/json']
      >
  >([]);
  const ERC20_getUserTokens = async function () {
    const options: operations['getTokenBalances']['parameters']['path'] = {
      address: (await provider?.getSigner().getAddress()) ?? '',
    };

    //API reference: https://docs.moralis.io/moralis-dapp/web3-api/account#gettokenbalances
    let tokens = await Moralis.Web3API.account.getTokenBalances(options);

    await setUserTokens(tokens);
    return tokens;
  };

  const NFT_getFloorPrice = async function (collection_slug: string) {
    let os_url = 'https://api.opensea.io/api/v1/collection/' + collection_slug;
    let result = await axios.get(os_url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.OPEN_SEA ?? '',
      },
    });

    let collection = result.data.collection;

    return {
      ether: +collection.stats.floor_price * 10 ** 18,
      usd:
        (collection.stats.floor_price /
          collection.payment_tokens[0].eth_price) *
        collection.payment_tokens[0].usd_price,
    };
  };

  const Luftballons_balanceOf = async function (
    wallet_address: string
  ): Promise<number> {
    const LuftballonsContract = getLuftballonsContract();
    let result = await LuftballonsContract.balanceOf(wallet_address);
    return result;
  };

  const ERC20_claimableTokenQuantity = async function (
    token_address: string,
    luftballonsID: number
  ): Promise<number> {
    const LuftballonsContract = getLuftballonsContract();
    return await LuftballonsContract.claimableAirdrops(
      token_address,
      luftballonsID
    );
  };

  const [claimableLuft, setClaimableLuft] = useState<number>(0);
  const ERC20_claimableLuft = async function (
    luftballonsIDs: number[]
  ): Promise<number> {
    const LuftballonsContract = getLuftballonsContract();
    let result = await LuftballonsContract.claimableLuft(luftballonsIDs);
    return result / 10 ** 18;
  };

  const ERC20_luftTotalSupply = async function (): Promise<number> {
    const LuftContract = getERC20Contract("0xb9f7dba05880100083278156ab24d5fc036c3bb8");
    return (await LuftContract.totalSupply()) / 10**18;
  };

  const NFT_LuftPerNFT = async function (
    collection_address: string
  ): Promise<number> {
    const LuftballonsContract = getLuftballonsContract();
    let result = await LuftballonsContract.LuftPerNFT(collection_address);
    return result / 10 ** 18;
  };

  const NFT_LuftballonENSClaimed = async function (
    luftballons: nft[]
  ): Promise<void> {
    const LuftRegistrarContract = getLuftRegistrarContract();
    let results: number[] = await LuftRegistrarContract.isRegistered(
      luftballons.map((b) => b.id)
    );

    for (let i = 0; i < luftballons.length; i++) {
      luftballons[i].ensState = Number(results[i]);
    }

    await setUserLuftballons(luftballons);
  };

  const [availableNFTs, setAvailableNFTs] = useState<nft[]>([]);
  const NFT_AvailableNFTs = async function (): Promise<nft[]> {
    let owned = await OwnedNFTs(luftballonsAddress);

    let moralisQuery = NFT_GetReceivedDates(owned.nftIDs);

    setAvailableNFTs(Object.values(owned.nfts));

    let moralisResult = await moralisQuery;

    for (let add_id of Object.keys(moralisResult)) {
      owned.nfts[add_id].date = moralisResult[add_id].date;
    }

    setAvailableNFTs(Object.values(owned.nfts));

    owned.nfts = await FixWrappedNFTs("0xe3e79802fdbcbb8e69e91d737b1a0bc0410e0633", owned.nfts);
    owned.nfts = await FixWrappedNFTs("0x566437bcc0a184567a7aece3e95d845f08bc4d06", owned.nfts);
    owned.nfts = await FixWrappedNFTs("0xa4d8cbc21435795ef6351454e017090166ea0060", owned.nfts);

    setAvailableNFTs(Object.values(owned.nfts));

    for(let _nft of Object.values(owned.nfts)) {
      if(!_nft.metadata || _nft.collection == "Unknown") {
        let url = `https://api.opensea.io/api/v1/asset/${_nft.collection_metadata.address}/${_nft.id}/?format=json&include_orders=false`;
        let result:AxiosResponse = await new Promise( (resolve,err) =>
            axios.get(url, {
              headers: {
                'Content-Type': 'application/json'
              },
            }).then(result =>
                resolve(result)
            )
        );

        if(result) {
          if(!_nft.metadata) {
            _nft.name = result?.data?.name;
            _nft.thumbnail_url = result?.data?.image_url;
            _nft.image_url = result?.data?.image_thumbnail_url;
            _nft.metadata = result?.data?.traits;
          }
          if(_nft.collection == "Unknown") {
            _nft.collection = result?.data?.collection?.name;
          }
        }
      }
    }

    setAvailableNFTs(Object.values(owned.nfts));

    for (let _nft of Object.values(owned.nfts)) {
      _nft.luft = await NFT_LuftPerNFT(_nft.wrapperCollection ?? _nft.collection_metadata.address);
      setAvailableNFTs(Object.values(owned.nfts));
    }

    return Object.values(owned.nfts);
  };

  const FixWrappedNFTs = async function (wrapper: string, nfts: { [add_id: string]: nft }) : Promise<{ [add_id: string]: nft }> {
    let luftWrappedTax = await OwnedNFTs(wrapper);
    for (let _wrappedNFT of Object.values(luftWrappedTax.nfts)) {
      for(let _nft of Object.values(nfts)) {
        if( _nft.collection_metadata.address == wrapper &&
            _nft.collection_metadata.token_uri == _wrappedNFT.collection_metadata.token_uri) {
          _wrappedNFT.wrapperCollection = wrapper;
          _wrappedNFT.wrapperID = _nft.id;
          _wrappedNFT.date = _nft.date;
          _wrappedNFT.luft = _nft.luft;
          _wrappedNFT.collection_metadata.schema_name = _nft.collection_metadata.schema_name
          _wrappedNFT.unique_id = _nft.unique_id;
          nfts[_wrappedNFT.unique_id] = _wrappedNFT;
        }
      }
    }
    return nfts;
  }

  const OwnedNFTs = async function (owner: string): Promise<NFTOwnershipResults> {
    let rawResults = [];
    let next = "";
    while(true) {
      let url = `https://deep-index.moralis.io/api/v2/${owner}/nft?chain=eth&format=decimal`;
      if(next?.length > 0)
        url += "&cursor="+next;

      let result:AxiosResponse = await new Promise( (resolve,err) =>
          axios.get(url, {
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': 'GdIYAl2neFgjhFm8HPVsSLoevMVPKGjhwV7e2SnCXIOc9iqIf4ZFuVl3c12jVL28',
            },
          }).then(result =>
              resolve(result)
          ).catch(error => err(error))
      );

      for (let i = 0; i < result.data?.result?.length; i++) {
        rawResults.push(result.data.result[i]);
      }

      if(result.data?.cursor == null)
        break;
      else
        next = result.data?.cursor;
    }

    let nfts: { [add_id: string]: nft } = {};
    let nftIDs: {
      [add_id: string]: { address: string; id: number; date: number };
    } = {};

    for (let i = 0; i < rawResults.length; i++) {
      let nft = rawResults[i];
      let add_id = nft.token_address + nft.token_id;
      let metadata = JSON.parse(nft.metadata);
      let img = metadata?.image_url ?? metadata?.image;
      if(img?.startsWith("ipfs://")) {
        img = img.replace("ipfs://", "https://ipfs.io/ipfs/")
      }
      nfts[add_id] = {
        unique_id: add_id,
        name: metadata?.name ?? `${nft.name} #${nft.token_id}`,
        id: nft.token_id,
        collection: nft.name ?? "Unknown",
        thumbnail_url: img,
        image_url: img,
        metadata: metadata?.attributes ?? metadata?.traits,
        collection_metadata: {
          schema_name: nft.contract_type,
          address: nft.token_address,
          token_uri: nft.token_uri
        },
        date: 0,
      };

      nftIDs[add_id] = {
        address: nft.token_address,
        id: nft.token_id,
        date: 0,
      };
    }

    return {nfts, nftIDs};
  }

  const NFT_GetReceivedDates = async function (nftIDs: {
    [add_id: string]: { address: string; id: number; date: number };
  }): Promise<{
    [add_id: string]: { address: string; id: number; date: number };
  }> {
    const EthTokenTransfers = Moralis.Object.extend('EthNFTTransfers');
    const query = new Moralis.Query(EthTokenTransfers);
    query.equalTo('to_address', luftballonsAddress);
    query.containedIn(
      'token_address',
      Object.values(nftIDs).map((id) => id.address)
    );
    query.containedIn(
      'token_id',
      Object.values(nftIDs).map((id) => id.id)
    );
    const found = await query.find();
    for (let row of found) {
      let address = await row.get('token_address');
      let id = await row.get('token_id');
      let add_id = address + id;
      let date = Date.parse(await row.get('block_timestamp'));
      if (nftIDs[add_id] && nftIDs[add_id].date < date) {
        nftIDs[add_id].date = date;
      }
    }
    return nftIDs;
  };

  const NFT_GetLastSalePrice = async function (
    token_address: string,
    token_id: string
  ) {
    let os_url =
      'https://api.opensea.io/api/v1/asset/token_address/token_id/?include_orders=false';
    os_url = os_url.replaceAll('token_address', token_address);
    os_url = os_url.replaceAll('token_id', token_id);

    let result = await axios.get(os_url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.OPEN_SEA ?? '',
      },
    });

    let nft = JSON.parse(result.data);

    let last_price = 0;
    try {
      last_price =
        nft.last_sale.total_price / 10 ** nft.last_sale.payment_token.decimals;
      last_price = last_price * nft.last_sale.payment_token.eth_price;
    } catch {}

    return last_price;
  };

  function timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const [userLuftballons, setUserLuftballons] = useState<nft[]>([]);
  const NFT_UserLuftballons = async function (
    user_address: string
  ): Promise<nft[]> {
    let rawResults = [];
    let next = "";
    while(true) {
      let os_url = `https://api.opensea.io/api/v1/assets?owner=${user_address}&collection=9999-luftballons`;
      if(next?.length > 0)
        os_url += "&cursor="+next;

      let result:AxiosResponse = await new Promise( (resolve,err) =>
          axios.get(os_url, {
            headers: {
              'Content-Type': 'application/json',
              'X-API-KEY': process.env.OPEN_SEA ?? '',
            },
          }).then(result =>
              resolve(result)
          ).catch(error => err(error))
      );

      for (let i = 0; i < result.data?.assets?.length; i++) {
        rawResults.push(result.data.assets[i]);
      }

      if(result.data?.next == null)
        break;
      else
        next = result.data?.next;
    }

    let results: nft[] = [];
    let ids: number[] = [];

    let { ether } = await NFT_getFloorPrice('9999-luftballons');
    let harvestable = 0;
    for (let i = 0; i < rawResults.length; i++) {
      let nft = rawResults[i];
      ids.push(nft.token_id);
      let luft = await ERC20_claimableLuft([nft.token_id]);
      results.push({
        unique_id: nft.token_id,
        name: nft.name,
        id: nft.token_id,
        collection: nft.collection.name,
        thumbnail_url: nft.image_thumbnail_url,
        image_url: nft.image_url,
        metadata: nft.traits,
        collection_metadata: nft.asset_contract,
        price:
          (nft.last_sale ? 'Last Sale: ' : 'Floor Price: ') +
          (nft.last_sale ? nft.last_sale.total_price : ether) / 10 ** 18 +
          'e',
        date: 0,
        harvestableLuft: luft
      });
      harvestable += luft;
      setUserLuftballons(results);
    }

    setUserLuftballons(results);

    NFT_LuftballonENSClaimed(results);
    setClaimableLuft(harvestable);
    return results;
  };

  const NFT_CollectionName = async function (collection_address: string) {
    let collection = new Contract(
        collection_address,
        NFTAbi,
        provider?.getSigner()
    );

    return await collection.name();
  }

  const NFT_IsOwnerOfCollection = async function (collection_address: string) {
    let ownable = new Contract(
        collection_address,
        NFTAbi,
        provider?.getSigner()
    );

    let owner = await ownable.owner();
    return owner == address;
  }

  const txERC20_harvestAirdrops = async function (token_address: string) {
    const LuftballonsContract = getLuftballonsContract();
    let receipt: ContractTransaction =
      await LuftballonsContract.harvestAirdrops(
        [token_address],
        userLuftballons.map((b) => b.id)
      );
    await receipt.wait(1);
    availableAirdrops[token_address].claimable = 0;
    setAvailableAirdrops(availableAirdrops);
  };

  const txERC20_claimLuft = async function (minLuft:number) {
    const LuftballonsContract = getLuftballonsContract();
    let filteredBalloons = userLuftballons.filter(element => {return (element.harvestableLuft??0) > minLuft});
    if(filteredBalloons.length == 0) return;

    let receipt: ContractTransaction = await LuftballonsContract.claimLuft(
        filteredBalloons.map((b) => b.id)
    );
    await receipt.wait(1);
    await setClaimableLuft(0);
  };

  const txNFT_harvestERC1155Airdrop = async function (
    user_address: string,
    collection_address: string,
    token_id: number,
    quantity: number
  ) {
    const LuftballonsContract = getLuftballonsContract();
    let receipt: ContractTransaction =
      await LuftballonsContract.harvestERC1155Airdrop(
        collection_address,
        token_id,
        quantity
      );
    await receipt.wait(1);
    await setAvailableNFTs(
      availableNFTs.filter((element) => {
        return !(
          element.id == token_id &&
          element.collection_metadata.address == collection_address
        );
      })
    );
  };

  const txNFT_harvestERC721Airdrop = async function (
    user_address: string,
    collection_address: string,
    token_id: number
  ) {
    const LuftballonsContract = getLuftballonsContract();
    let receipt: ContractTransaction =
      await LuftballonsContract.harvestERC721Airdrop(
        collection_address,
        token_id
      );
    await receipt.wait(1);

    await setAvailableNFTs(
      availableNFTs.filter((element) => {
        return !(
          element.id == token_id &&
          element.collection_metadata.address == collection_address
        );
      })
    );
  };

  const txERC20_noticeAirdrop = async function (token_address: string) {
    const LuftballonsContract = getLuftballonsContract();
    let receipt: ContractTransaction = await LuftballonsContract.noticeAirdrop(
      token_address
    );
    await receipt.wait(1);

    availableAirdrops[token_address].claimable = 0;
    for (let balloon of userLuftballons.map((b) => b.id)) {
      let decimals =
        10 ** +(availableAirdrops[token_address]?.metadata?.decimals ?? '18');
      let available =
        +(await ERC20_claimableTokenQuantity(token_address, balloon)) /
        decimals;
      let current = availableAirdrops[token_address].claimable ?? 0;
      availableAirdrops[token_address].claimable = current + available;
      if (current + available > 0)
        await setAvailableAirdrops(availableAirdrops);
    }
  };

  const ERC20_approvedAmount = async function (token_address: string) {
    const erc20Contract = getERC20Contract(token_address);
    return await erc20Contract.allowance(address, luftballonsAddress);
  };

  const txERC20_approveForAirdropPull = async function (
    token_address: string,
    quantity: number,
    decimals: number
  ) {
    const erc20Contract = getERC20Contract(token_address);
    let number = Number(quantity * 10 ** decimals);
    let tx = await erc20Contract.approve(luftballonsAddress, number.toString());
    return tx;
  };

  const txERC20_pullAirdrop = async function (
    token_address: string,
    quantity: number,
    decimals: number
  ) {
    const LuftballonsContract = getLuftballonsContract();
    return await LuftballonsContract.pullAirdrop(
      token_address,
      Number(quantity * 10 ** decimals).toString()
    );
  };

  const txNFT_setCustomNFTPrice = async function (
    collection_address: string,
    burn_price: number
  ) {
    const LuftballonsContract = getLuftballonsContract();
    return await LuftballonsContract.setCustomNFTPrice(
      collection_address,
        (burn_price * 10 ** 18).toString()
    );
  };

  const txRegisterENS = async function (balloonID: number) {
    const LuftRegistrarContract = getLuftRegistrarContract();
    return LuftRegistrarContract.register(balloonID);
  };

  const txNFT_SetPrimaryENS = async function (
    luftballonsID: number
  ): Promise<void> {
    const RegistrarContract = getENSReverseRegistrarContract();
    let tx = await RegistrarContract.setName(
      `${luftballonsID}.theluftballons.eth`
    );
    let receipt = tx.wait();
    await NFT_LuftballonENSClaimed(userLuftballons);
  };

  return (
    <MoralisProvider
      serverUrl="https://sbiqhzhzxwjq.usemoralis.com:2053/server"
      appId="DzMrmJs7bp1l39yLtVOPFDrOPo2lKjOT9iosgS9X"
    >
      <WalletContext.Provider
        value={{
          address,
          balance,
          loading,
          error,
          userBalances,
          availableAirdrops,
          claimableLuft,
          availableNFTs,
          userLuftballons,
          userTokens,
          connectToWallet,
          disconnectWallet,
          Luftballons_balanceOf,
          ERC20_claimableTokenQuantity,
          ERC20_claimableLuft,
          ERC20_userBalances,
          ERC20_availableAirdrops,
          ERC20_airdroppedQuantity,
          ERC20_getUserTokens,
          ERC20_luftTotalSupply,
          NFT_LuftPerNFT,
          NFT_AvailableNFTs,
          NFT_GetLastSalePrice,
          NFT_UserLuftballons,
          NFT_IsOwnerOfCollection,
          NFT_CollectionName,
          txERC20_harvestAirdrops,
          txERC20_claimLuft,
          txNFT_harvestERC1155Airdrop,
          txNFT_harvestERC721Airdrop,
          txERC20_noticeAirdrop,
          ERC20_approvedAmount,
          txERC20_approveForAirdropPull,
          txERC20_pullAirdrop,
          txNFT_setCustomNFTPrice,
          txNFT_SetPrimaryENS,
          txRegisterENS,
        }}
      >
        {children}
      </WalletContext.Provider>
    </MoralisProvider>
  );
};