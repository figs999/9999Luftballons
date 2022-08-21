import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';

const Logo = () => {
  return (
    <AnchorLink
      href="/"
      className="flex"
    >
      <span className="flex relative items-center align-middle">
        <div className="flex text-left rounded-xl custom-bordered border-gray-600">
          <Image className="flex text-left rounded-xl"
              src='https://lh3.googleusercontent.com/BhwoZ29AZz9g8GQf_bKPPd0quYatd-JuMNMCxp2deyyntdWyyCSyDaZ39yG2qbEimvZaM9GLW8d75xo5-YoqY7HDFKnQFAQ7g-ClyQ=w80' width='80' height='80' alt="9999 Luftballons" priority />
        </div>
        <div className="ml-3 flex-grow font-bold text-2xl text-left align-middle text-black font-sans">
          9999 Luftballons
        </div>
      </span>
    </AnchorLink>
  );
};

export default Logo;
