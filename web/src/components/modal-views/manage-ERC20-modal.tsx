import Button from '@/components/ui/button';
import { useModal } from '@/components/modal-views/context';
import React, {useContext, useEffect, useState} from "react";
import {WalletContext} from "@/lib/hooks/use-connect";
import {Listbox} from "@/components/ui/listbox";
import {ChevronDown} from "@/components/icons/chevron-down";
import {Transition} from "@/components/ui/transition";
import {tokenListSort} from "@/data/static/token-list-filters";
import {defaultResponse, operations} from "moralis/types/generated/web3Api";
import {ContractTransaction} from "ethers/lib/ethers";
import {ContractReceipt} from "ethers";

export default function ManageERC20Modal() {
  const { closeModal } = useModal();
  const {userTokens} = useContext<{userTokens:operations["getTokenBalances"]["responses"]["200"]["content"]["application/json"]}>(WalletContext);
  const {ERC20_getUserTokens, address, ERC20_approvedAmount, txERC20_pullAirdrop, txERC20_approveForAirdropPull } = useContext(WalletContext);
  const [selectedItem, setSelectedItem] = useState<{
    token_address?: string;
    name?: string;
    symbol?: string;
    logo?: string | undefined;
    thumbnail?: string | undefined;
    decimals?: number;
    balance?: string;}>({});

  const [approvedTokens, setApprovedTokens] = useState<number>();
  const [inputAmount, setInputAmount] = useState<number>();
  const [pendingTransaction, setPendingTransaction] = useState<ContractTransaction>();
  const [receipt, setReceipt] = useState<ContractReceipt>();

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function getAvailableTokens() {
      let available = await ERC20_getUserTokens();
    }

    if(address) getAvailableTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function awaitReceipt() {
      if(pendingTransaction) {
        let rpt = await pendingTransaction.wait(1);
        setReceipt(rpt);
      }
    }

    console.log(JSON.stringify(pendingTransaction));
    awaitReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTransaction]);

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function receiptGet() {
      if(receipt) {
        let approved = await ERC20_approvedAmount(selectedItem.token_address) / 10**(selectedItem.decimals??1);
        setApprovedTokens(approved);
        setPendingTransaction(undefined);
      }
    }

    console.log(JSON.stringify(receipt));
    receiptGet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt]);

  const awaitApproval = async function() {
    let tx = await txERC20_approveForAirdropPull(selectedItem.token_address, inputAmount, selectedItem.decimals)
    setPendingTransaction(tx);
  }

  const sendLuftdrop = async function() {
    let tx = await txERC20_pullAirdrop(selectedItem.token_address, inputAmount, selectedItem.decimals);
    setPendingTransaction(tx);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-7 dark:border-gray-700 dark:bg-light-dark sm:px-7 sm:pb-8 sm:pt-6">
      <div className="text-center text-lg font-medium -tracking-wide text-gray-900 dark:text-white lg:text-xl">
        Send ERC20 Luftdrop
      </div>
        <label className="mt-5 flex w-full items-center">
          <div className="w-1/4 whitespace-nowrap text-sm font-medium -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:text-white lg:text-sm">
            Token:
          </div>
          <Listbox value={selectedItem} onChange={async item => {
            setSelectedItem(item)
            setApprovedTokens(0);
            let approved = await ERC20_approvedAmount(item.token_address) / 10**(item.decimals??1);
            setApprovedTokens(approved);
            console.log("APPROVED: " + approved);
          }}>
            <Listbox.Button className="flex h-12 ml-8 w-full items-center text-right rounded-lg bg-gray-100 px-4 text-sm text-gray-900 dark:bg-light-dark dark:text-white">
              <div className="flex-grow w-full text-left">
                {selectedItem.name} (Balance: {Number(selectedItem.balance??0) / 10**Number(selectedItem.decimals??1)})
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
              <Listbox.Options className="absolute right-0 text-right z-10 mt-2 ml-12 left-20 origin-top-right rounded-lg bg-white p-3 shadow-large dark:bg-light-dark">
                {userTokens.map((item) => (
                    <Listbox.Option key={item.token_address} value={item}>
                      {({ selected }) => (
                          <div
                              className={`block cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition dark:text-white  ${
                                  selected
                                      ? 'my-1 bg-gray-100 dark:bg-dark'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
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
        </label>
        <label className="mt-5 flex w-full items-center">
          <div className="w-32 whitespace-nowrap text-sm font-medium -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:text-white lg:text-sm">
            Qty:
          </div>
          <input
            className="ml-5 mr-5 h-12 w-64 appearance-none rounded-full border-2 border-gray-200 py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-5 rtl:pl-5 rtl:pr-11 dark:border-gray-600 dark:bg-light-dark dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
            placeholder="How Many?"
            autoComplete="off"
            type="number"
            onChange={event => setInputAmount(+event.target.value)}
          />
          <Button
            onClick={(inputAmount??0) <= (approvedTokens??0) ? sendLuftdrop : awaitApproval }
            className="m-auto w-52 shadow-main hover:shadow-large"
            color={(inputAmount??0) <= (approvedTokens??0) ? "success" : "warning"}
            disabled={pendingTransaction != undefined}
          >
            {`${(inputAmount??0) <= (approvedTokens??0) ? "Send Luftdrop" : "Approve Luftdrop"}`}
          </Button>
        </label>
        {/*<div className="mt-10 flex justify-center">*/}
        {/*  <Button*/}
        {/*    onClick={closeModal}*/}
        {/*    className="m-auto shadow-main hover:shadow-large"*/}
        {/*  >*/}
        {/*    Submit Transaction*/}
        {/*  </Button>*/}
        {/*</div>*/}
    </div>
  );
}
