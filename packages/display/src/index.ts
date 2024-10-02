import baseManifest from '@tailor-cms/ce-drag-drop-manifest';
import type { ElementManifest } from '@tailor-cms/ce-drag-drop-manifest';

import Display from './components/Display.vue';

const manifest: ElementManifest = {
  ...baseManifest,
  Display,
};

export default manifest;
export { Display };
