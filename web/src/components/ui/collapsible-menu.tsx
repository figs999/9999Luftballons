import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import cn from 'classnames';
import { useMeasure } from '@/lib/hooks/use-measure';
import ActiveLink from '@/components/ui/links/active-link';
import { ChevronDown } from '@/components/icons/chevron-down';
import { MODAL_VIEW, useModal } from '@/components/modal-views/context';

export type MenuItemProps = {
  name: string;
  icon: React.ReactNode;
  href: string;
  dropdownItems?: DropdownItemProps[];
};

export type DropdownItemProps = {
  name: string;
  href?: string;
  modal?: MODAL_VIEW;
};

export function MenuItem({ name, icon, href, dropdownItems }: MenuItemProps) {
  let [isOpen, setIsOpen] = useState(false);
  const { openModal } = useModal();
  let [ref, { height }] = useMeasure<HTMLUListElement>();
  let { pathname } = useRouter();

  let isChildrenActive =
    dropdownItems && dropdownItems.some((item) => item.href === pathname);

  useEffect(() => {
    if (isChildrenActive) {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative mb-2 min-h-[48px] list-none last:mb-0">
      {dropdownItems?.length ? (
        <>
          <div
            className={cn(
              'flex h-12 cursor-pointer items-center justify-between whitespace-nowrap  rounded-lg px-4 text-sm transition-all',
              isChildrenActive
                ? 'text-white'
                : 'hover:text-white dark:hover:text-white'
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="custom-bordered absolute bottom-0 left-0 right-0 z-0 h-full w-full rounded-lg bg-body" />
            <span className="z-[1] flex items-center ltr:mr-3 rtl:ml-3">
              <span className="ltr:mr-3 rtl:ml-3">{icon}</span>
              {name}
            </span>
            <span
              className={`z-[1] transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            >
              <ChevronDown />
            </span>

            {isChildrenActive && (
              <span className="absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-body shadow-large" />
            )}
          </div>

          <div
            style={{
              height: isOpen ? height : 0,
            }}
            className="ease-[cubic-bezier(0.33, 1, 0.68, 1)] relative z-10 overflow-hidden transition-all duration-[350ms]"
          >
            <ul ref={ref}>
              {dropdownItems.map((item, index) => (
                <li className="last:pb-2" key={index}>
                  {item.href ? (
                    <ActiveLink
                      href={item.href}
                      target={item.href.startsWith('/') ? '' : '_blank'}
                      rel={item.href.startsWith('/') ? '' : 'noreferrer'}
                      className="flex items-center rounded-lg p-3 text-sm font-black transition-all before:h-1 before:w-1 before:rounded-full before:bg-gray-600 hover:text-white ltr:pl-6 before:ltr:mr-5 rtl:pr-6 before:rtl:ml-5 dark:hover:text-white"
                      activeClassName="!text-brand dark:!text-white dark:before:!bg-white before:!bg-brand before:!w-2 before:!h-2 before:-ml-0.5 before:ltr:!mr-[18px] before:rtl:!ml-[18px] !font-medium"
                    >
                      {item.name}
                    </ActiveLink>
                  ) : (
                    <div
                      onClick={() =>
                        item.modal ? openModal(item.modal) : null
                      }
                      className="flex cursor-pointer font-black items-center rounded-lg p-3 text-sm transition-all before:h-1 before:w-1 before:rounded-full before:bg-gray-600 hover:text-white ltr:pl-6 before:ltr:mr-5 rtl:pr-6 before:rtl:ml-5 dark:hover:text-white"
                    >
                      {item.name}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <ActiveLink
          href={href}
          target={href.startsWith('/') ? '' : '_blank'}
          rel={href.startsWith('/') ? '' : 'noreferrer'}
          className="relative flex h-12 items-center whitespace-nowrap rounded-lg px-4 text-sm transition-all hover:text-white dark:hover:text-white"
        >
          <span className="relative z-[1] ltr:mr-3 rtl:ml-3">{icon}</span>
          <span className="relative z-[1]"> {name}</span>

          {href === pathname ? (
            <span className="custom-bordered absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-accentalt" />
          ) : (
            <span className="custom-bordered absolute bottom-0 left-0 right-0 h-full w-full rounded-lg bg-body" />
          )}
        </ActiveLink>
      )}
    </div>
  );
}
