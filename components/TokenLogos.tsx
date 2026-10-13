"use client";

import React from "react";
import { VeilMark } from "./VeilLogo";

export interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Ethereum Diamond Mark SVG
 */
export const EthLogo: React.FC<LogoProps> = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 256 417"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
  >
    <path d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z" fill="#343434" />
    <path d="M127.962 0L0 212.32L127.962 287.958V157.252V0Z" fill="#8C8C8C" />
    <path d="M127.962 312.187L126.386 314.106V413.404L127.962 417L255.998 236.593L127.962 312.187Z" fill="#3C3C3B" />
    <path d="M127.962 417V312.187L0 236.593L127.962 417Z" fill="#8C8C8C" />
    <path d="M127.961 287.958L255.922 212.32L127.961 157.253V287.958Z" fill="#141414" />
    <path d="M0 212.32L127.962 287.958V157.253L0 212.32Z" fill="#393939" />
  </svg>
);

/**
 * Official Veil Protocol Token Glyph SVG (Halftone "V" Mark from application)
 */
export const VeilLogoMark: React.FC<LogoProps> = ({
  size = 16,
  className = "",
  color = "currentColor",
}) => (
  <VeilMark
    size={size}
    className={className}
    color={color}
    accentColor="#FF8A00"
  />
);

/**
 * Official Robinhood Logo (Wordmark + Feather from hero section)
 */
export const RobinhoodLogo: React.FC<{
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ height = 24, className = "", style = {} }) => (
  <img
    src="/assets/logo/robinhood.svg"
    alt="Robinhood"
    style={{
      height: typeof height === "number" ? `${height}px` : height,
      width: "auto",
      display: "block",
      ...style,
    }}
    className={className}
  />
);

/**
 * Robinhood Feather Icon SVG
 */
export const RobinhoodLogoMark: React.FC<LogoProps> = ({
  size = 16,
  className = "",
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="705 0 130 165"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
  >
    <path
      d="M760.45 127.968L759.368 128.323C752.408 130.629 742.115 134.191 732.874 138.433C732.385 138.669 732.059 139.32 732.059 139.32C731.882 139.719 731.674 140.207 731.437 140.754L731.408 140.827C730.371 143.178 728.949 146.71 728.327 148.159L727.853 149.297C727.779 149.474 727.824 149.681 727.972 149.814C728.061 149.903 728.164 149.947 728.283 149.947C728.342 149.947 728.416 149.932 728.49 149.903L729.601 149.371C732.133 148.173 735.332 146.355 738.679 144.759L738.798 144.7C745.181 141.685 752.378 138.27 756.717 136.201C756.717 136.201 757.414 135.832 757.769 135.137L761.012 128.634C761.101 128.471 761.072 128.264 760.953 128.116C760.82 127.968 760.627 127.909 760.45 127.968Z"
      fill={color}
    />
    <path
      d="M734.503 117.903C734.962 117.016 737.065 112.966 737.539 112.064L737.628 111.902C751.727 85.371 768.906 60.333 788.677 37.5121L789.225 36.8765C789.388 36.6844 789.418 36.3887 789.299 36.167C789.166 35.9305 788.914 35.8123 788.662 35.8419L787.833 35.9601C774.86 37.7485 761.723 40.2169 748.78 43.306C747.491 43.6607 746.662 44.5032 746.484 44.6953C736.798 56.2684 727.631 68.4475 719.219 80.9369C718.805 81.5725 718.656 82.4002 718.76 83.0801C718.849 83.7452 720.878 99.3385 723.958 111.311C716.317 133.26 709.489 162.185 709.489 162.185C709.43 162.377 709.474 162.569 709.578 162.732C709.697 162.894 709.874 162.983 710.082 162.983H714.436C714.717 162.983 714.954 162.82 715.058 162.569L715.354 161.756C719.797 149.666 724.862 137.723 730.46 126.076C731.748 123.371 734.503 117.903 734.503 117.903Z"
      fill={color}
    />
    <path
      d="M795.06 42.2568L795.045 41.4291C795.03 41.1631 794.867 40.9413 794.63 40.8527C794.393 40.764 794.112 40.8379 793.934 41.03L793.386 41.6508C770.328 68.2703 750.942 97.8016 735.777 129.446L735.421 130.186C735.303 130.422 735.347 130.703 735.525 130.895C735.643 131.013 735.806 131.087 735.969 131.087C736.043 131.087 736.132 131.072 736.221 131.043L736.976 130.732C749.935 125.382 763.16 120.741 776.296 116.942C777.081 116.721 777.747 116.159 778.117 115.435C783.878 104.231 797.251 82.5334 797.251 82.5334C797.592 82.0457 797.503 81.3214 797.503 81.3214C797.503 81.3214 795.208 55.3818 795.06 42.2568Z"
      fill={color}
    />
    <path
      d="M824.872 4.83263C821.599 1.99479 816.845 0.664557 809.47 0.501972C802.776 0.354168 794.823 1.80265 785.804 4.75873C784.456 5.23171 783.375 5.98551 782.412 6.91667C773.245 15.5041 764.33 24.6236 755.903 34.024L755.251 34.7334C755.074 34.9403 755.044 35.236 755.177 35.4577C755.311 35.6941 755.592 35.8124 755.858 35.7533L756.806 35.5463C770.387 32.6494 784.101 30.4323 797.563 28.9691C798.451 28.8656 799.37 29.1612 800.021 29.7672C800.688 30.3732 801.058 31.2452 801.043 32.1468C800.821 45.4788 801.31 58.8698 802.494 71.9505L802.568 72.8078C802.598 73.0738 802.776 73.2807 803.042 73.3547C803.087 73.3694 803.131 73.3694 803.19 73.3842C803.383 73.3842 803.59 73.2955 803.724 73.1182L804.212 72.4235C811.795 61.6338 820.044 51.1397 828.722 41.2072C829.7 40.0987 829.952 39.404 830.129 38.399C832.854 20.9876 828.648 8.09911 824.872 4.83263Z"
      fill={color}
    />
  </svg>
);

/**
 * Dynamic token logo by asset / symbol
 */
export const TokenIcon: React.FC<{
  symbol?: string;
  asset?: string;
  size?: number;
  className?: string;
}> = ({ symbol, asset, size = 16, className = "" }) => {
  const sym = (symbol || "").toUpperCase();
  const isEth =
    sym === "ETH" ||
    sym === "WETH" ||
    asset === "0x0000000000000000000000000000000000000000" ||
    (asset && asset.toLowerCase() === "0x0bd7d308f8e1639fab988df18a8011f41eacad73"); // mainnet WETH

  const isVeil =
    sym === "VEIL" ||
    (asset && asset.toLowerCase() === "0x019086f63407fadf0ccb89516e465baef5031aa9") || // testnet VEIL
    (asset && asset.toLowerCase() === "0xe0e11ec0d62eda12de796d025d6334fadfe5ab2a"); // mainnet temp VEIL (canonical added at Pons cutover)

  if (isEth) return <EthLogo size={size} className={className} />;
  if (isVeil) return <VeilLogoMark size={size} className={className} />;
  return null;
};

/**
 * Official X (formerly Twitter) Logo Mark SVG
 */
export const XLogo: React.FC<LogoProps> = ({
  size = 16,
  className = "",
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);
