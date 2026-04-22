import { ai, initState, mocks, type } from '@tailor-cms/ce-drag-drop-manifest';
import type {
  BeforeDisplayHook,
  ElementHook,
  HookMap,
  OnUserInteractionHook,
  ServerModule,
} from '@tailor-cms/cek-common';
import { every, omit, xor } from 'lodash-es';
import type { Element } from '@tailor-cms/ce-drag-drop-manifest';

// Detect if hooks are running in CEK (used for mocking end-system runtime)
const IS_CEK = process.env.CEK_RUNTIME;
// Don't use in production, use only when IS_CEK=true
const USER_STATE: any = {};

export const afterLoaded: ElementHook<Element> = (
  element,
  _services,
  runtime,
) => {
  if (runtime === 'delivery') {
    const data = omit(element.data, ['correct']) as Element['data'];
    return Object.assign(element, { data });
  }
  return element;
};

export const beforeDisplay: BeforeDisplayHook<Element> = (element, context) => {
  if (IS_CEK) USER_STATE.correct = element.data.correct;
  return { ...context, ...USER_STATE };
};

export const onUserInteraction: OnUserInteractionHook<Element> = (
  element,
  context,
  payload,
) => {
  const isCorrect = every(element.data.correct, (it, id) => {
    return xor(it, payload.response[id]).length === 0;
  });
  // Simulate user state update within CEK
  if (IS_CEK) {
    // Can be reset to initial / mocked state via UI
    Object.assign(context, {
      response: payload.response,
      isCorrect,
      isSubmitted: true,
    });
  }
  return { isCorrect, updateDisplayState: true };
};

export const hookMap: HookMap<Element> = new Map(
  Object.entries({
    afterLoaded,
    onUserInteraction,
    beforeDisplay,
  }),
);

const serverModule: ServerModule<Element> = {
  type,
  initState,
  hookMap,
  afterLoaded,
  onUserInteraction,
  beforeDisplay,
  mocks,
  ai,
};

export default serverModule;

export { type, initState, mocks, ai };
