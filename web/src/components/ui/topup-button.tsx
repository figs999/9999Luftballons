import cn from 'classnames';
import { Plus } from '@/components/icons/plus';
import { ChevronForward } from '@/components/icons/chevron-forward';

export default function TopupButton(
    {
        className,
        link,
        text
    }: React.PropsWithChildren<{ link?: string, text?: string, className?: string }>,
    ) {
  return (
      <a href={link} target="_blank" rel="noreferrer">
        <button
          className="shadow-main hover:shadow-large"
        >
          <span className="mr-3.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white lg:h-6 lg:w-6">
            <Plus className="h-auto w-2.5 lg:w-auto" />
          </span>
          <span className="mr-3.5 flex-grow text-justify text-xs lg:text-sm">
            {text}
          </span>
          <ChevronForward className="rtl:rotate-180" />
        </button>
      </a>
  );
}
