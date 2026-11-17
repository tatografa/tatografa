import { createContext, useContext } from "react";

export const NVIDIA_GREEN = "#76B900";
export const BITCOIN_ORANGE = "#F7931A";

const AccentContext = createContext<string>(NVIDIA_GREEN);

/** Cor de destaque da série atual (verde NVIDIA, laranja Bitcoin, …). */
export const useAccent = () => useContext(AccentContext);

export const AccentProvider: React.FC<{
  accent?: string;
  children: React.ReactNode;
}> = ({ accent = NVIDIA_GREEN, children }) => (
  <AccentContext.Provider value={accent}>{children}</AccentContext.Provider>
);
