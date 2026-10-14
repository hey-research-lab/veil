"use client";

import React from "react";

export interface StockLogoProps {
  size?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Official NVIDIA Logo (loaded from /assets/logo/nvidia.svg)
 */
export const NvidiaLogo: React.FC<StockLogoProps> = ({ size = 20, className = "", style = {} }) => (
  <img
    src="/assets/logo/nvidia.svg"
    alt="NVIDIA"
    width={size}
    height={size}
    className={className}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      display: "inline-block",
      verticalAlign: "middle",
      flexShrink: 0,
      objectFit: "contain",
      ...style,
    }}
  />
);

/**
 * Official Tesla Logo (loaded from /assets/logo/tesla.svg)
 */
export const TeslaLogo: React.FC<StockLogoProps> = ({ size = 20, className = "", style = {} }) => (
  <img
    src="/assets/logo/tesla.svg"
    alt="Tesla"
    height={size}
    className={className}
    style={{
      height: `${size}px`,
      width: "auto",
      maxWidth: `${size * 3.5}px`,
      display: "inline-block",
      verticalAlign: "middle",
      flexShrink: 0,
      objectFit: "contain",
      ...style,
    }}
  />
);

/**
 * Official Apple Logo (loaded from /assets/logo/apple.svg)
 */
export const AppleLogo: React.FC<StockLogoProps> = ({ size = 20, className = "", style = {} }) => (
  <img
    src="/assets/logo/apple.svg"
    alt="Apple"
    width={size}
    height={size}
    className={className}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      display: "inline-block",
      verticalAlign: "middle",
      flexShrink: 0,
      objectFit: "contain",
      ...style,
    }}
  />
);

/**
 * Official Microsoft Logo (loaded from /assets/logo/microsoft.svg)
 */
export const MicrosoftLogo: React.FC<StockLogoProps> = ({ size = 20, className = "", style = {} }) => (
  <img
    src="/assets/logo/microsoft.svg"
    alt="Microsoft"
    width={size}
    height={size}
    className={className}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      display: "inline-block",
      verticalAlign: "middle",
      flexShrink: 0,
      objectFit: "contain",
      ...style,
    }}
  />
);

/**
 * Official SPDR / S&P 500 ETF Trust Logo (loaded from /assets/logo/spy.svg)
 */
export const SpyLogo: React.FC<StockLogoProps> = ({ size = 20, className = "", style = {} }) => (
  <img
    src="/assets/logo/spy.svg"
    alt="SPDR S&P 500"
    width={size}
    height={size}
    className={className}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      display: "inline-block",
      verticalAlign: "middle",
      flexShrink: 0,
      objectFit: "contain",
      ...style,
    }}
  />
);

export const STOCK_LOGOS: Record<string, React.FC<StockLogoProps>> = {
  NVDA: NvidiaLogo,
  SPY: SpyLogo,
  TSLA: TeslaLogo,
  AAPL: AppleLogo,
  MSFT: MicrosoftLogo,
};

export const getStockLogo = (symbol: string): React.FC<StockLogoProps> => {
  return STOCK_LOGOS[symbol.toUpperCase()] || SpyLogo;
};
