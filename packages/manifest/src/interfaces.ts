import type * as common from '@tailor-cms/cek-common';

export interface ElementData extends common.ElementConfig {
  isGradable?: boolean;
  embeds: Record<string, any>;
  question: string[];
  groups: Record<string, string>;
  answers: Record<string, string>;
  correct?: Record<string, string[]>;
  hint: string;
}

export type DataInitializer = common.DataInitializer<ElementData>;
export type Element = common.Element<ElementData>;
export type ElementManifest = common.ElementManifest<ElementData>;
