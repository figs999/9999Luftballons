import Button from '@/components/ui/button';
import { useModal } from '@/components/modal-views/context';
import React, { useContext, useEffect, useState } from 'react';
import { WalletContext } from '@/lib/hooks/use-connect';
import { ContractTransaction } from 'ethers/lib/ethers';
import { ContractReceipt } from 'ethers';
import { toast } from 'react-hot-toast';

export default function ManageNFTModal() {
  const { closeModal } = useModal();
  const {
    NFT_IsOwnerOfCollection,
    txNFT_setCustomNFTPrice,
    NFT_CollectionName,
    NFT_LuftPerNFT,
    ERC20_luftTotalSupply,
  } = useContext(WalletContext);
  const [isOwner, setIsOwner] = useState(false);
  const [collection, setCollection] = useState('');
  const [burnFee, setBurnFee] = useState(0);
  const [collectionName, setCollectionName] = useState('NONE SELECTED');
  const [collectionBurnFee, setCollectionBurnFee] = useState(0.0);
  const [pendingTransaction, setPendingTransaction] =
    useState<ContractTransaction>();
  const [isLoading, setIsLoading] = useState(false);
  const [receipt, setReceipt] = useState<ContractReceipt>();
  const [luftSupply, setLuftSupply] = useState(0);

  useEffect(() => {
    async function getLuftSupply() {
      setLuftSupply(await ERC20_luftTotalSupply());
    }
    getLuftSupply();
  }, []);

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function awaitReceipt() {
      if (pendingTransaction) {
        try {
          let rpt = await pendingTransaction.wait(1);
          setReceipt(rpt);
        } catch (err: any) {
          toast.error(`Transaction Failed: ${JSON.stringify(err)}`);
          setIsLoading(false);
        }
        setIsLoading(false);
      }
    }

    console.log(JSON.stringify(pendingTransaction));
    awaitReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTransaction]);

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function receiptGet() {
      if (receipt) {
        toast.success('Burn Fee Set Successfully!');
        setPendingTransaction(undefined);
      }
    }

    console.log(JSON.stringify(receipt));
    receiptGet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt]);

  const sendTransaction = async function () {
    setIsLoading(true);
    let tx;
    try {
      tx = await txNFT_setCustomNFTPrice(collection, burnFee);
      toast.success('Transaction Sent!');
    } catch (err) {
      toast.error(`Transaction Failed: ${JSON.stringify(err)}`);
      setIsLoading(false);
    }
    setPendingTransaction(tx);
  };

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function getIsOwner() {
      if (
        Number.isInteger(+collection) &&
        collection.length == 42 &&
        collection.startsWith('0x')
      ) {
        try {
          setIsOwner(await NFT_IsOwnerOfCollection(collection));
          setCollectionName(await NFT_CollectionName(collection));
          setCollectionBurnFee(await NFT_LuftPerNFT(collection));
        } catch {
          setIsOwner(false);
          setCollectionName('UNKNOWN CONTRACT');
          setCollectionBurnFee(1);
        }
      }
    }

    getIsOwner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  return (
    <div className="border-3 border-black bg-accent p-4 shadow-modal">
      <div className="border-3 border-black bg-body px-5 pt-5 pb-7 sm:px-7 sm:pb-8 sm:pt-6">
        <div className="text-center text-lg font-medium -tracking-wide text-gray-900 dark:text-white lg:text-xl">
          Manage Collection's $LUFT Burn Fee
        </div>
        <label className="mt-2 flex w-full items-center">
          <div className="mr-0 flex-grow text-center text-xs font-medium text-gray-900">
            ($LUFT Total Supply: {luftSupply})
          </div>
        </label>
        <label className="mt-5 mb-8 flex w-full items-center">
          <div className="w-44 whitespace-nowrap text-sm font-medium -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:text-white lg:text-sm">
            Collection Address:
          </div>
          <input
            className="ml-5 h-12 w-64 appearance-none rounded-full border-2 border-gray-200 py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-5 rtl:pl-5 rtl:pr-11 dark:border-gray-600 dark:bg-light-dark dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
            placeholder="Type address"
            autoComplete="off"
            onChange={(event) => {
              if (
                Number.isInteger(+event.target.value) &&
                event.target.value.length == 42 &&
                event.target.value.startsWith('0x')
              ) {
                setCollection(event.target.value);
              } else {
                setCollection('');
                setCollectionName('NONE SELECTED');
                setCollectionBurnFee(0);
              }
            }}
          />
        </label>
        {!isOwner && collection != '' ? (
          <div className="mt-3 flex-grow text-right text-xs text-red-600">
            NOT OWNER OF COLLECTION!
          </div>
        ) : (
          <div />
        )}
        <label className="mt-1 flex w-full items-center">
          <div className="mr-0 flex-grow text-left text-xs font-medium text-gray-700">
            Collection Name:
          </div>
          <div className="ml-0 flex-grow text-right text-xs font-black text-gray-700">
            {collectionName}
          </div>
        </label>
        <label className="mt-1 flex w-full items-center">
          <div className="flex-grow  text-left text-xs font-medium text-gray-700">
            Current $LUFT Burn Fee:
          </div>
          <div className="flex-grow  text-right text-xs font-black text-gray-700">
            {collectionBurnFee}
          </div>
        </label>
        <label className="mt-8 flex w-full items-center">
          <div className="w-44 whitespace-nowrap text-sm font-medium -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:text-white lg:text-sm">
            Desired $LUFT Burn Fee:
          </div>
          <input
            className="ml-5 h-12 w-64 appearance-none rounded-full border-2 border-gray-200 py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-5 rtl:pl-5 rtl:pr-11 dark:border-gray-600 dark:bg-light-dark dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
            placeholder="Type fee amount"
            autoComplete="off"
            type="number"
            onChange={(event) => {
              setBurnFee(+event.target.value);
            }}
          />
        </label>
        <div className="mt-10 flex justify-center">
          <Button
            onClick={async () => await sendTransaction()}
            className="m-auto shadow-main hover:shadow-large"
            isLoading={isLoading}
            disabled={!isOwner || isLoading || collectionBurnFee == burnFee}
            color={'success'}
          >
            Set Burn Fee
          </Button>
        </div>
      </div>
    </div>
  );
}
