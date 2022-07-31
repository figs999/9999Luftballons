import { useEffect, useState, createContext, ReactNode } from 'react';
import Web3 from 'web3';
import {Contract, ethers } from 'ethers';
// @ts-ignore
import Web3Modal from "web3modal";
// @ts-ignore
import WalletConnect from "@walletconnect/web3-provider";
// @ts-ignore
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
// @ts-ignore
import { Web3Auth } from "@web3auth/web3auth";
import {MoralisProvider, useMoralis } from "react-moralis";
import axios from "axios";
import {operations} from "moralis/types/generated/web3Api";
import { AbiItem } from 'web3-utils';
import erc20ContractABI from '../erc20.abi.json';
import LuftballonsContractABI from '../luftballons.abi.json';
import Moralis from "moralis";

const supportedChains: IChainData[] = [
  {
    name: "Ethereum Mainnet",
    short_name: "eth",
    chain: "ETH",
    network: "mainnet",
    chain_id: 1,
    network_id: 1,
    rpc_url: "https://mainnet.infura.io/v3/%API_KEY%",
    native_currency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "Ethereum Ropsten",
    short_name: "rop",
    chain: "ETH",
    network: "ropsten",
    chain_id: 3,
    network_id: 3,
    rpc_url: "https://ropsten.infura.io/v3/%API_KEY%",
    native_currency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  },
  {
    name: "Ethereum Rinkeby",
    short_name: "rin",
    chain: "ETH",
    network: "rinkeby",
    chain_id: 4,
    network_id: 4,
    rpc_url: "https://rinkeby.infura.io/v3/%API_KEY%",
    native_currency: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: "18",
      contractAddress: "",
      balance: ""
    }
  }];

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

export function getChainData(chainId: number): IChainData | undefined {
  const chainData = supportedChains.filter(
      (chain: any) => chain.chain_id === chainId
  )[0];

  if (!chainData) {
   return undefined
  }

  const API_KEY = process.env.REACT_APP_INFURA_ID;

  if (
      chainData.rpc_url.includes("infura.io") &&
      chainData.rpc_url.includes("%API_KEY%") &&
      API_KEY
  ) {
    const rpcUrl = chainData.rpc_url.replace("%API_KEY%", API_KEY);

    return {
      ...chainData,
      rpc_url: rpcUrl
    };
  }

  return chainData;
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);
  let   [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [chainId, setChainId] = useState<number>(1);
  const [networkId, setNetworkID] = useState<number>(1);
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | undefined>(undefined);
  const luftballonsAddress = '0x356e1363897033759181727e4bff12396c51a7e0';

  const getNetwork = () => getChainData(chainId)?.network;

  const getProviderOptions = () => {
    const infuraId = process.env.REACT_APP_INFURA_ID;
    const providerOptions = {
      walletconnect: {
        package: WalletConnect,
        options: {
          infuraId,
          rpc: {
            1: getChainData(1)?.rpc_url
          }
        }
      },
      coinbasewallet: {
        package: CoinbaseWalletSDK,
        options: {
          appName: "Web3Modal Example App",
          infuraId
        }
      }
    };
    return providerOptions;
  };

  const web3Modal =
    typeof window !== 'undefined' && new Web3Modal({
        network: getNetwork(),
        cacheProvider: true,
        providerOptions: getProviderOptions() });

  web3Modal && web3Modal.on("select", provider_id => {
    if(loading) {
      console.log("selected");
      loading = false;
      web3Modal && web3Modal.toggleModal();
    }
  });

  web3Modal && web3Modal.on("connect", connection => {
    console.log(connection);
    async function connected() {
        console.log("connected");
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

        await subscribeProvider(connection);
        await setWalletAddress();
        console.log("Connected");
        await setLoading(false);
    }
    connected();
  });

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function checkConnection() {
      if ((web3Modal && web3Modal.cachedProvider)) {
        await connectToWallet();
      }
    }
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setWalletAddress = async () => {
    if(chainId > 1 || networkId > 1) return;

    try {
      const signer = provider?.getSigner();
      console.log("Signer " + signer)
      if (signer) {
        const web3Address = await signer.getAddress();
        setAddress(web3Address);
        await getBalance(web3Address);
      }
    } catch (error) {
      console.log(
        'Account not connected; logged from setWalletAddress function: ' + error
      );
    }
  };

  const getBalance = async (walletAddress: string) => {
    const walletBalance = await Luftballons_balanceOf(walletAddress);
    const balanceInEth = ethers.utils.formatEther(walletBalance);
    console.log(walletBalance);
    setBalance(walletBalance.toString());
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

  function initWeb3(provider: any):Web3 {
    const web3: Web3 = new Web3(provider);

    web3.eth.extend({
      methods: [
        {
          name: "chainId",
          call: "eth_chainId",
          //outputFormatter: web3.utils.hexToNumber
        }
      ]
    });

    return web3;
  }

  const switchNetwork = async () => {
    try {
      if (provider?.provider.request) {
        await provider?.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{"chainId": "0x1"}]
        });
      }
    } catch (switchError:any) {
      if (switchError.code === 4902) {
        try {
          if (provider?.provider.request) {
            await provider?.provider.request({
              method: "wallet_addEthereumChain",
              params: [getChainData(1)]
            });
          }
        } catch (error:any) {
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
    connection.on("chainChanged", async (chainId: number) => {
      setChainId(chainId);
      if(chainId != 1)
        await switchNetwork();
      await setWalletAddress();
    });

    connection.on("networkChanged", async (networkId: number) => {
      setNetworkID(networkId);
      if(networkId != 1)
        await switchNetwork();
      await setWalletAddress();
    });
  };

  const getERC20Contract = function(address:string) {
    return new Contract(
        address,
        erc20ContractABI,
        provider
    )
  }

  const getLuftballonsContract = function () {
    return new Contract(
        luftballonsAddress,
        LuftballonsContractABI,
        provider
    )
  }

  const ERC20_airdroppedQuantity = async function(token_address:string, web3:Web3): Promise<number> {
    const LuftballonsContract = getLuftballonsContract()
    return await LuftballonsContract
        .airdroppedQuantity(token_address)
  }

  const ERC20_availableAirdrops = async function() {
    let results:{[address:string]:
          {
            value:number,
            price:{nativePrice?: { value:string,decimals:number,name:string,symbol:string} , usdPrice: number, exchangeAddress?: string, exchangeName?: string},
            metadata:{address: string, name: string, symbol: string, decimals: string, logo?: string | undefined, logo_hash?: string | undefined, thumbnail?: string | undefined, block_number?: string | undefined, validated?: string | undefined}
          }} = {}

    const EthTokenTransfers = Moralis.Object.extend("EthTokenTransfers");
    const query = new Moralis.Query(EthTokenTransfers);
    query.equalTo("to_address", "0x356e1363897033759181727e4bff12396c51a7e0");
    const found = await query.find();
    for (let i = 0; i < found.length; i++) {
      const row = found[i];
      const tok = await row.get("token_address");
      const val = await row.get("decimal");
      if(results[tok])
        results[tok].value += val.value
      else
        results[tok].value = +val.value
    }

    let _addresses = Object.keys(results)
    const options = {
      addresses: _addresses,
    };
    //API reference: https://docs.moralis.io/moralis-dapp/web3-api/token#gettokenmetadata
    const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(options);

    for(let i = 0; i < tokenMetadata.length; i++) {
      const metadata = tokenMetadata[i]
      results[metadata["address"]].value /= 10**(+metadata.decimals)
      results[metadata["address"]].metadata = metadata

      const options = {
        address: metadata.address
      };
      //API reference: https://docs.moralis.io/moralis-dapp/web3-api/token#gettokenprice
      results[metadata.address].price = await Moralis.Web3API.token.getTokenPrice(options)
    }

    return results;
  }

  const Luftballons_balanceOf = async function (wallet_address:string): Promise<number> {
    const LuftballonsContract = getLuftballonsContract()
    return await LuftballonsContract
        .balanceOf(wallet_address)
  }

  const ERC20_claimableTokenQuantity = async function (token_address:string, luftballonsID:number, web3:Web3): Promise<number[]> {
    const LuftballonsContract = getLuftballonsContract()
    return await LuftballonsContract
        .claimableAirdrops(token_address, luftballonsID);
  }

  const ERC20_claimableLuft = async function (luftballonsIDs:number[], web3:Web3):Promise<number> {
    const LuftballonsContract = getLuftballonsContract()
    let result = await LuftballonsContract
        .claimableLuft(luftballonsIDs)
    return result /10**18
  }

  const NFT_LuftPerNFT = async function (collection_address:string, web3:Web3):Promise<number> {
    const LuftballonsContract = getLuftballonsContract()
    let result = await LuftballonsContract
        .LuftPerNFT(collection_address)
    return result /10**18
  }

  const NFT_AvailableNFTs = async function () {
    const options = {
      address: "0x75e3e9c92162e62000425c98769965a76c2e387a",
    };
    //API reference: https://docs.moralis.io/moralis-dapp/web3-api/account#getnfts
    const NFTs = await Moralis.Web3API.account.getNFTs(options);
    return NFTs
  }

  const NFT_GetLastSalePrice = async function (token_address:string, token_id:string) {
    let os_url = 'https://api.opensea.io/api/v1/asset/token_address/token_id/?include_orders=false'
    os_url = os_url.replaceAll("token_address",token_address)
    os_url = os_url.replaceAll("token_id",token_id)

    let result = await axios.get(os_url, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': "9998067c6abf45fbb2ab4c57e49a150e"
      }
    });

    let nft = JSON.parse(result.data)

    let last_price = 0;
    try {
      last_price = nft.last_sale.total_price / 10**nft.last_sale.payment_token.decimals
      last_price = last_price*nft.last_sale.payment_token.eth_price
    } catch {}

    return last_price
  }

  const NFT_UserLuftballons = async function(user_address:string) {
    const options: operations["getNFTsForContract"]["parameters"]["query"]  & operations["getNFTsForContract"]["parameters"]["path"] = {
      chain:"eth",
      address:user_address,
      token_address: luftballonsAddress
    };
    //API reference: https://docs.moralis.io/moralis-dapp/web3-api/account#getnftsforcontract
    const NFTs = await Moralis.Web3API.account.getNFTsForContract(options);
    return NFTs.result
  }

  const txERC20_harvestAirdrops = async function (user_address:string, airdrop_token_addresses:string[], luftballons_ids:number[], web3:Web3) {
    const LuftballonsContract = getLuftballonsContract()
    await LuftballonsContract
        .harvestAirdrops(airdrop_token_addresses, luftballons_ids)
  }

  const txERC20_claimLuft = async function (user_address:string, luftballons_ids:string, web3:Web3) {
    const LuftballonsContract = getLuftballonsContract()
    await LuftballonsContract
        .claimLuft(luftballons_ids)
  }

  const txNFT_harvestERC1155Airdrop = async function (user_address:string, collection_address:string, token_id:number, quantity:number, web3:Web3) {
    return new Promise<void>(async(resolve, reject) => {
      const LuftballonsContract = getLuftballonsContract()
      await LuftballonsContract
          .harvestERC1155Airdrop(collection_address, token_id, quantity)
    })
  }

  const txNFT_harvestERC721Airdrop = async function (user_address:string, collection_address:string, token_id:number, web3:Web3) {
    const LuftballonsContract = getLuftballonsContract()
    await LuftballonsContract
        .harvestERC721Airdrop(collection_address, token_id)
  }

  const txERC20_noticeAirdrop = async function (user_address:string, token_address:string, web3:Web3) {
    const LuftballonsContract = getLuftballonsContract()
    await LuftballonsContract
        .noticeAirdrop(token_address)
  }

  const txERC20_approveForAirdropPull = async function (user_address:string, token_address:string, quantity:number, decimals:number, web3:Web3) {
    const erc20Contract = getERC20Contract(token_address)
    await erc20Contract.methods
        .approve(luftballonsAddress, quantity*(10**decimals))
  }

  const txERC20_pullAirdrop = async function(user_address:string, token_address:string, quantity:number, decimals:number, web3:Web3) {
    const LuftballonsContract = getLuftballonsContract()
    await LuftballonsContract
        .pullAirdrop(token_address, quantity*(10**decimals))
  }

  const txNFT_setCustomNFTPrice = async function (user_address:string, collection_address:string, burn_price:number, web3:Web3) {
    const LuftballonsContract = getLuftballonsContract()
    await LuftballonsContract
        .setCustomNFTPrice(collection_address, burn_price*(10**18))
  }



  return (
      <MoralisProvider serverUrl="https://sbiqhzhzxwjq.usemoralis.com:2053/server" appId="DzMrmJs7bp1l39yLtVOPFDrOPo2lKjOT9iosgS9X">
        <WalletContext.Provider
          value={{
            address,
            balance,
            loading,
            error,
            connectToWallet,
            disconnectWallet,
          }}
        >
          {children}
        </WalletContext.Provider>
      </MoralisProvider>
  );
};
