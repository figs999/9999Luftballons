import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';

const Logo = () => {
  return (
    <AnchorLink
      href="/"
      className="flex"
    >
      <span className="flex relative items-center align-middle">
        <div className="flex text-left rounded-full border-4 border-gray-600">
          <Image className="flex text-left rounded-full"
              src='https://lh3.googleusercontent.com/BhwoZ29AZz9g8GQf_bKPPd0quYatd-JuMNMCxp2deyyntdWyyCSyDaZ39yG2qbEimvZaM9GLW8d75xo5-YoqY7HDFKnQFAQ7g-ClyQ=w80' width='80' height='80' alt="9999 Luftballons" priority />
        </div>
        <div className="ml-3 flex-grow font-black text-xl text-left align-middle text-gray-700">
          9999 Luftballons
        </div>
      </span>
    </AnchorLink>
  );
};

export default Logo;
