import React, { useContext, useEffect, useState } from 'react';
import cn from 'classnames';
import { defaultResponse, operations } from 'moralis/types/generated/web3Api';
import { ContractTransaction } from 'ethers/lib/ethers';
import { ContractReceipt } from 'ethers';
import { toast } from 'react-hot-toast';
import { WalletContext } from '@/lib/hooks/use-connect';
import { Listbox } from '@/components/ui/listbox';
import { ChevronDown } from '@/components/icons/chevron-down';
import { Transition } from '@/components/ui/transition';
import { useModal } from '@/components/modal-views/context';
import Button from '@/components/ui/button';
import Input from '@/components/ui/forms/input';
import {
  thinBorder,
  wideBorder,
  listBoxOptionsClassNames,
} from '@/data/static/classNames';

export default function ManageERC20Modal() {
  const { closeModal } = useModal();
  const { userTokens } = useContext<{
    userTokens: operations['getTokenBalances']['responses']['200']['content']['application/json'];
  }>(WalletContext);
  const {
    ERC20_getUserTokens,
    address,
    ERC20_approvedAmount,
    txERC20_pullAirdrop,
    txERC20_approveForAirdropPull,
  } = useContext(WalletContext);
  const [selectedItem, setSelectedItem] = useState<{
    token_address?: string;
    name?: string;
    symbol?: string;
    logo?: string | undefined;
    thumbnail?: string | undefined;
    decimals?: number;
    balance?: string;
  }>({});

  const [approvedTokens, setApprovedTokens] = useState<number>();
  const [inputAmount, setInputAmount] = useState<number>();
  const [pendingTransaction, setPendingTransaction] =
    useState<ContractTransaction>();
  const [isLoading, setIsLoading] = useState(false);
  const [receipt, setReceipt] = useState<ContractReceipt>();

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function getAvailableTokens() {
      let available = await ERC20_getUserTokens();
    }

    if (address) getAvailableTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function awaitReceipt() {
      if (pendingTransaction) {
        try {
          let rpt = await pendingTransaction.wait(1);
          setReceipt(rpt);
        } catch (err: any) {
          toast.error(`Transaction Failed: ${JSON.stringify(err)}`);
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
        let approved =
          (await ERC20_approvedAmount(selectedItem.token_address)) /
          10 ** (selectedItem.decimals ?? 1);
        setApprovedTokens(approved);
        setPendingTransaction(undefined);
        toast.success('Transaction Successful!');
      }
    }

    console.log(JSON.stringify(receipt));
    receiptGet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt]);

  const awaitApproval = async function () {
    setIsLoading(true);
    let tx;
    try {
      tx = await txERC20_approveForAirdropPull(
        selectedItem.token_address,
        inputAmount,
        selectedItem.decimals
      );
      toast.success('Transaction Sent!');
    } catch (err) {
      setIsLoading(false);
    }
    setPendingTransaction(tx);
  };

  const sendLuftdrop = async function () {
    setIsLoading(true);
    let tx;
    try {
      tx = await txERC20_pullAirdrop(
        selectedItem.token_address,
        inputAmount,
        selectedItem.decimals
      );
      toast.success('Transaction Sent!');
    } catch (err) {
      setIsLoading(false);
    }
    setPendingTransaction(tx);
  };

  return (
    <div className={cn('bg-accent p-4 shadow-modal', wideBorder)}>
      <div
        className={cn(
          'bg-body px-5 pt-5 pb-7 sm:px-7 sm:pb-8 sm:pt-6',
          wideBorder
        )}
      >
        <div className="text-center text-lg font-medium -tracking-wide lg:text-3xl">
          Send ERC20 Luftdrop
        </div>
        <div className="mt-5 flex w-full items-center">
          <div className="w-16 whitespace-nowrap text-sm font-medium -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:text-white lg:text-sm">
            Token:
          </div>
          <div className="relative">
            <Listbox
              value={selectedItem}
              onChange={async (item) => {
                setSelectedItem(item);
                setApprovedTokens(0);
                let approved =
                  (await ERC20_approvedAmount(item.token_address)) /
                  10 ** (item.decimals ?? 1);
                setApprovedTokens(approved);
                console.log('APPROVED: ' + approved);
              }}
            >
              <Listbox.Button
                className={cn(
                  'relative z-20 flex h-12 w-96 items-center rounded-2xl bg-accentinput bg-gray-100 px-4 text-right text-sm',
                  thinBorder
                )}
                disabled={true}
              >
                <div className="w-full flex-grow text-left">
                  {selectedItem.name} (Balance:{' '}
                  {Number(selectedItem.balance ?? 0) /
                    10 ** Number(selectedItem.decimals ?? 1)}
                  )
                </div>
                <ChevronDown />
              </Listbox.Button>
              <Transition
                enter="ease-out duration-100"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  className={cn(
                    'origin-top-right bg-accent p-3 pt-16 text-right shadow-large dark:bg-light-dark',
                    thinBorder,
                    listBoxOptionsClassNames
                  )}
                >
                  {userTokens.map((item) => (
                    <Listbox.Option key={item.token_address} value={item}>
                      {({ selected }) => (
                        <div
                          className={`block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-white  ${
                            selected
                              ? 'my-1 bg-accentalt dark:bg-dark'
                              : 'hover:bg-accentalt dark:hover:bg-gray-700'
                          }`}
                        >
                          {item.name}
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </Listbox>
          </div>
        </div>
        <div className="mt-5 flex w-full items-center">
          <div className="w-16 whitespace-nowrap text-sm font-medium -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:text-white lg:text-sm">
            Qty:
          </div>
          <Input
            inputClassName="w-96"
            placeholder="How Many?"
            autoComplete="off"
            type="number"
            onChange={(event) => setInputAmount(+event.target.value)}
          />
        </div>
        <div className="mt-7 flex w-full items-center">
          <Button
            onClick={
              (inputAmount ?? 0) <= (approvedTokens ?? 0)
                ? sendLuftdrop
                : awaitApproval
            }
            className="m-auto w-52 shadow-main hover:shadow-large"
            isLoading={isLoading}
            color={
              (inputAmount ?? 0) <= (approvedTokens ?? 0)
                ? 'success'
                : 'warning'
            }
            disabled={pendingTransaction != undefined || isLoading}
          >
            {`${
              (inputAmount ?? 0) <= (approvedTokens ?? 0)
                ? 'Send Luftdrop'
                : 'Approve Luftdrop'
            }`}
          </Button>
        </div>
      </div>
    </div>
  );
}
