import { v4 as uuid } from 'uuid';

import type {
  DataInitializer,
  ElementData,
  ElementManifest,
} from './interfaces';

const [uuid1, uuid2, uuid3, uuid4] = Array.from({ length: 4 }, () => uuid());

// Element unique id within the target system (e.g. Tailor)
export const type = 'CE_DRAG_DROP';

// Display name (e.g. shown to the author)
export const name = 'Drag & Drop';

// Function which inits element state (data property on the Content Element
// entity)
export const initState: DataInitializer = (): ElementData => ({
  question: '',
  groups: {
    [uuid1]: '',
    [uuid2]: '',
  },
  answers: {
    [uuid3]: '',
    [uuid4]: '',
  },
  correct: {
    [uuid1]: [uuid3],
    [uuid2]: [uuid4],
  },
});

// Can be loaded from package.json
export const version = '1.0';

// UI configuration for Tailor CMS
const ui = {
  // Display icon, https://pictogrammers.com/library/mdi/
  icon: 'mdi-format-columns',
  // Does element support only full width or can be used within layouts
  // (e.g. 50/50 layout)
  forceFullWidth: true,
};

export const mocks = {
  displayContexts: [{ name: 'No selection', data: {} }],
};

const manifest: ElementManifest = {
  type,
  version: '1.0',
  name,
  ssr: false,
  initState,
  ui,
  mocks,
};

export default manifest;
export * from './interfaces';
