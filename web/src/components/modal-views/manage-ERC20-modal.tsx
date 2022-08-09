import Button from '@/components/ui/button';
import { useModal } from '@/components/modal-views/context';

export default function ManageERC20Modal() {
  const { closeModal } = useModal();
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-7 dark:border-gray-700 dark:bg-light-dark sm:px-7 sm:pb-8 sm:pt-6">
      <div className="text-center text-lg font-medium -tracking-wide text-gray-900 dark:text-white lg:text-xl">
        Manage ERC20 Luftdrop
      </div>
      <form
        className="relative mt-10 w-full rounded-full"
        noValidate
        role="search"
      >
        <label className="mt-5 flex w-full items-center">
          <div className="w-28 whitespace-nowrap text-sm font-medium -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:text-white lg:text-sm">
            Token Address:
          </div>
          <input
            className="ml-5 mr-5 h-12 w-64 appearance-none rounded-full border-2 border-gray-200 py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-5 rtl:pl-5 rtl:pr-11 dark:border-gray-600 dark:bg-light-dark dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
            placeholder="Type address"
            autoComplete="off"
          />
          <Button
            onClick={closeModal}
            className="m-auto w-52 shadow-main hover:shadow-large"
          >
            Notice Luftdrop
          </Button>
        </label>
        <label className="mt-5 flex w-full items-center">
          <div className="w-28 whitespace-nowrap text-sm font-medium -tracking-wide text-gray-900 ltr:text-left rtl:text-right dark:text-white lg:text-sm">
            Qty:
          </div>
          <input
            className="ml-5 mr-5 h-12 w-64 appearance-none rounded-full border-2 border-gray-200 py-1 text-sm tracking-tighter text-gray-900 outline-none transition-all placeholder:text-gray-600 focus:border-gray-900 ltr:pr-5 ltr:pl-5 rtl:pl-5 rtl:pr-11 dark:border-gray-600 dark:bg-light-dark dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
            placeholder="Type qty"
            autoComplete="off"
          />
          <Button
            onClick={closeModal}
            className="m-auto w-52 shadow-main hover:shadow-large"
          >
            Send Luftdrop
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
      </form>
    </div>
  );
}
