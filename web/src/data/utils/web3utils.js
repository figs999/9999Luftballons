/* import moralis */

const axios = require('axios');

/* Moralis init code */
const serverUrl = "https://sbiqhzhzxwjq.usemoralis.com:2053/server";
const appId = "DzMrmJs7bp1l39yLtVOPFDrOPo2lKjOT9iosgS9X";

const erc20ContractABI = require('../../lib/erc20.abi.json');
const LuftballonsContractABI = require('../../lib/luftballons.abi.json');
const luftballonsAddress = '0x356e1363897033759181727e4bff12396c51a7e0';

export async function getERC20Contract(address, web3) {
    return new web3.eth.Contract(
        erc20ContractABI,
        address
    )
}

export async function getLuftballonsContract(web3) {
    return new web3.eth.Contract(
        LuftballonsContractABI,
        luftballonsAddress
    )
}

export async function Init() {
    const { Moralis } = useMoralis();
    await Moralis.start({ serverUrl, appId });
}

export async function ERC20_airdroppedQuantity(token_address, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .airdroppedQuantity(token_address)
            .call(
                {from: '0x0000000000000000000000000000000000000000'},
                (err, data) => {
                    if (err) {
                        reject(err)
                    }

                    resolve(data)
                }
            )
    })
}

export async function ERC20_availableAirdrops() {
    return new Promise(async(resolve, reject) => {
        let results = {}

        const EthTokenTransfers = Moralis.Object.extend("EthTokenTransfers");
        const query = new Moralis.Query(EthTokenTransfers);
        query.equalTo("to_address", "0x356e1363897033759181727e4bff12396c51a7e0");
        const found = await query.find();
        for (let i = 0; i < found.length; i++) {
            const row = found[i];
            const tok = await row.get("token_address");
            const val = await row.get("value");
            if(results[tok])
                results[tok].value += +val.value
            else
                results[tok] = {value: +val.value}
        }

        let _addresses = Object.keys(results)
        const options = {
            addresses: _addresses,
        };
        //API reference: https://docs.moralis.io/moralis-dapp/web3-api/token#gettokenmetadata
        const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(options);

        for(let i = 0; i < tokenMetadata.length; i++) {
            const metadata = tokenMetadata[i]
            results[metadata.address].value /= 10**+metadata.decimals
            results[metadata.address].metadata = metadata

            const options = {
                address: metadata.address
            };
            //API reference: https://docs.moralis.io/moralis-dapp/web3-api/token#gettokenprice
            results[metadata.address].price = await Moralis.Web3API.token.getTokenPrice(options)
        }

        resolve(results)
    })
}

export async function Luftballons_balanceOf(wallet_address, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .balanceOf(wallet_address)
            .call(
                {from: '0x0000000000000000000000000000000000000000'},
                (err, data) => {
                    if (err) {
                        reject(err)
                    }

                    resolve(data)
                }
            )
    })
}

export async function ERC20_claimableAirdrops(token_address, luftballonsID, web3) {
    return new Promise(async(resolve, reject) => {
        const options = {
            addresses: token_address,
        };
        const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(options);
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .claimableAirdrops(token_address, luftballonsID)
            .call(
                {from: '0x0000000000000000000000000000000000000000'},
                (err, data) => {
                    if (err) {
                        reject(err)
                    }

                    resolve(data / 10**tokenMetadata.decimals)
                }
            )
    })
}

export async function ERC20_claimableLuft(luftballonsIDs, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .claimableLuft(luftballonsIDs)
            .call(
                {from: '0x0000000000000000000000000000000000000000'},
                (err, data) => {
                    if (err) {
                        reject(err)
                    }

                    resolve(data/10**18)
                }
            )
    })
}

export async function NFT_LuftPerNFT(collection_address, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .LuftPerNFT(collection_address)
            .call(
                {from: '0x0000000000000000000000000000000000000000'},
                (err, data) => {
                    if (err) {
                        reject(err)
                    }

                    resolve(data/10**18)
                }
            )
    })
}

export async function NFT_AvailableNFTs() {
    return new Promise(async(resolve, reject) => {
        const options = {
            address: "0x75e3e9c92162e62000425c98769965a76c2e387a",
        };
        //API reference: https://docs.moralis.io/moralis-dapp/web3-api/account#getnfts
        const NFTs = await Moralis.Web3API.account.getNFTs(options);
        resolve(NFTs)
    })
}

export async function NFT_GetLastSalePrice() {
    return new Promise(async(resolve, reject) => {
        let os_url = 'https://api.opensea.io/api/v1/asset/token_address/token_id/?include_orders=false'
        os_url = os_url.replaceAll("token_address",await request.object.get("token_address"))
        os_url = os_url.replaceAll("token_id",await request.object.get("token_id"))

        let result = await axios.get(os_url, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': "9998067c6abf45fbb2ab4c57e49a150e"
            }
        });

        let nft = JSON.parse(result.body)

        let last_price = 0;
        try {
            last_price = nft.last_sale.total_price / 10**nft.last_sale.payment_token.decimals
            last_price = last_price*nft.last_sale.payment_token.eth_price
        } catch {}

        resolve(last_price)
    })
}

export async function NFT_UserLuftballons() {
    return new Promise(async(resolve, reject) => {
        const options = {
            address: "0x75e3e9c92162e62000425c98769965a76c2e387a",
            token_address: luftballonsAddress
        };
        //API reference: https://docs.moralis.io/moralis-dapp/web3-api/account#getnftsforcontract
        const NFTs = await Moralis.Web3API.account.getNFTsForContract(options);
        resolve(NFTs.result)
    })
}

export function txERC20_harvestAirdrops(user_address, airdrop_token_addresses, luftballons_ids, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .harvestAirdrops(airdrop_token_addresses, luftballons_ids)
            .send({ from: user_address }, (err, data) => {
                if (err) {
                    reject(err)
                }

                resolve(data)
            })
    })
}

export function txERC20_claimLuft(user_address, luftballons_ids, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .claimLuft(luftballons_ids)
            .send({ from: user_address }, (err, data) => {
                if (err) {
                    reject(err)
                }

                resolve(data)
            })
    })
}

export function txNFT_harvestERC1155Airdrop(user_address, collection_address, token_id, quantity, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .harvestERC1155Airdrop(collection_address, token_id, quantity)
            .send({ from: user_address }, (err, data) => {
                if (err) {
                    reject(err)
                }

                resolve(data)
            })
    })
}

export function txNFT_harvestERC721Airdrop(user_address, collection_address, token_id, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .harvestERC721Airdrop(collection_address, token_id)
            .send({ from: user_address }, (err, data) => {
                if (err) {
                    reject(err)
                }

                resolve(data)
            })
    })
}

export function txERC20_noticeAirdrop(user_address, token_address, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .noticeAirdrop(token_address)
            .send({ from: user_address }, (err, data) => {
                if (err) {
                    reject(err)
                }

                resolve(data)
            })
    })
}

export function txERC20_approveForAirdropPull(user_address, token_address, quantity, decimals, web3) {
    return new Promise(async(resolve, reject) => {
        const erc20Contract = getERC20Contract(token_address, web3)
        await erc20Contract.methods
            .approve(luftballonsAddress, quantity*(10**decimals))
            .send({ from: user_address }, (err, data) => {
                if (err) {
                    reject(err)
                }

                resolve(data)
            })
    })
}

export function txERC20_pullAirdrop(user_address, token_address, quantity, decimals, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .pullAirdrop(token_address, quantity*(10**decimals))
            .send({ from: user_address }, (err, data) => {
                if (err) {
                    reject(err)
                }

                resolve(data)
            })
    })
}

export function txNFT_setCustomNFTPrice(user_address, collection_address, burn_price, web3) {
    return new Promise(async(resolve, reject) => {
        const LuftballonsContract = getLuftballonsContract(web3)
        await LuftballonsContract.methods
            .setCustomNFTPrice(collection_address, burn_price*(10**18))
            .send({ from: user_address }, (err, data) => {
                if (err) {
                    reject(err)
                }

                resolve(data)
            })
    })
}
