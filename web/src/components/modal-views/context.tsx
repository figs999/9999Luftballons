import { atom, useAtom } from 'jotai';

export type MODAL_VIEW =
  | 'SEARCH_VIEW'
  | 'SHARE_VIEW'
  | 'WALLET_CONNECT_VIEW'
  | 'MANAGE_ERC20'
  | 'MANAGE_NFT';
const modalAtom = atom({ isOpen: false, view: 'SEARCH_VIEW' });

export function useModal() {
  const [state, setState] = useAtom(modalAtom);
  const openModal = (view: MODAL_VIEW) =>
    setState({ ...state, isOpen: true, view });
  const closeModal = () => setState({ ...state, isOpen: false });

  return {
    ...state,
    openModal,
    closeModal,
  };
}
