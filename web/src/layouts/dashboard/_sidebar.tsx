import cn from 'classnames';
import AuthorCard from '@/components/ui/author-card';
import Logo from '@/components/ui/logo';
import { MenuItem } from '@/components/ui/collapsible-menu';
import Scrollbar from '@/components/ui/scrollbar';
import Button from '@/components/ui/button';
import routes from '@/config/routes';
import { useDrawer } from '@/components/drawer-views/context';
import { HomeIcon } from '@/components/icons/home';
import { FarmIcon } from '@/components/icons/farm';
import { PoolIcon } from '@/components/icons/pool';
import { ProfileIcon } from '@/components/icons/profile';
import { DiskIcon } from '@/components/icons/disk';
import { ExchangeIcon } from '@/components/icons/exchange';
import { VoteIcon } from '@/components/icons/vote-icon';
import { Close } from '@/components/icons/close';
import { PlusCircle } from '@/components/icons/plus-circle';
import { CompassIcon } from '@/components/icons/compass';
import { InfoCircle } from '@/components/icons/info-circle';

//images
import AuthorImage from '@/assets/images/author.jpg';

const menuItems = [
  {
    name: 'Home',
    icon: <HomeIcon />,
    href: routes.home,
  },
  {
    name: 'Community',
    icon: <PoolIcon />,
    href: routes.home,
    dropdownItems: [
      {
        name: 'Discord',
        href: "https://discord.gg/9999Luftballons",
      },
      {
        name: '@9999Luftballons',
        href: "https://twitter.com/9999Luftballons",
      },
      {
        name: '@LuftBot',
        href: "https://twitter.com/LuftBot",
      },
    ],
  },
  {
    name: 'NFT Luftdrops',
    icon: <CompassIcon />,
    href: routes.search,
  },
  {
    name: 'ERC20 Luftdrops',
    icon: <PlusCircle />,
    href: routes.farms,
  },
  {
    name: 'Guide',
    icon: <DiskIcon />,
    href: "https://guide.9999luftballons.io/",
  },
  {
    name: 'Send Luftdrops',
    icon: <VoteIcon />,
    href: routes.vote,
    dropdownItems: [
      {
        name: 'Manage MY NFT Project',
        href: routes.vote,
      },
      {
        name: 'Manage ERC20 Luftdrop',
        href: routes.vote,
      },
      {
        name: 'How to Send?',
        href: "https://guide.9999luftballons.io/how-tos/airdrop-erc-20",
      },
    ],
  },
];

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { closeDrawer } = useDrawer();
  return (
    <aside
      className={cn(
        'top-0 z-40 h-full w-full max-w-full border-dashed border-gray-200 bg-body ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l dark:border-gray-700 dark:bg-dark xs:w-80 xl:fixed  xl:w-72 2xl:w-80',
        className
      )}
    >
      <div className="relative flex h-24 items-center justify-between overflow-hidden px-6 py-4 2xl:px-8">
        <Logo />
        <div className="md:hidden">
          <Button
            title="Close"
            color="white"
            shape="circle"
            variant="transparent"
            size="small"
            onClick={closeDrawer}
          >
            <Close className="h-auto w-2.5" />
          </Button>
        </div>
      </div>

      <Scrollbar style={{ height: 'calc(100% - 96px)' }}>
        <div className="px-6 pb-5 2xl:px-8">
           <div className="mt-12">
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                name={item.name}
                href={item.href}
                icon={item.icon}
                dropdownItems={item.dropdownItems}
              />
            ))}
          </div>
        </div>
      </Scrollbar>
    </aside>
  );
}
