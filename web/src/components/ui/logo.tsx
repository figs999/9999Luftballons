import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';

const Logo = () => {
  return (
    <AnchorLink
      href="/"
      className="flex"
    >
      <span className="relative items-center">
        <Image src='https://lh3.googleusercontent.com/BhwoZ29AZz9g8GQf_bKPPd0quYatd-JuMNMCxp2deyyntdWyyCSyDaZ39yG2qbEimvZaM9GLW8d75xo5-YoqY7HDFKnQFAQ7g-ClyQ=w80' width='80' height='80' alt="9999 Luftballons" priority />
        {'  9999 Luftballons'}
      </span>
    </AnchorLink>
  );
};

export default Logo;
