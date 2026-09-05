export const CANONICAL_HOST: string;
export const LEGACY_REDIRECTS: {
  exact: Record<string, string>;
  prefix: Array<[string, string]>;
};
export const ON_DEMAND_PAGES: Set<string>;
export function isPreviewHost(host: string): boolean;
export function canonicalTarget(
  requestUrl: string | URL,
  options?: { pageExists?: (pathWithSlash: string) => Promise<boolean> | boolean },
): Promise<string | null>;
