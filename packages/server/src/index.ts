import type { HookServices, ServerRuntime } from '@tailor-cms/cek-common';
import { initState, type } from '@tailor-cms/ce-drag-drop-manifest';
import type { Element } from '@tailor-cms/ce-drag-drop-manifest';
import every from 'lodash/every.js';
import omit from 'lodash/omit.js';
import xor from 'lodash/xor.js';

// Detect if hooks are running in CEK (used for mocking end-system runtime)
const IS_CEK = process.env.CEK_RUNTIME;
// Don't use in production, use only when IS_CEK=true
const USER_STATE: any = {};

/* eslint-disable @typescript-eslint/no-unused-vars */
export function beforeSave(element: Element, services: HookServices) {
  return element;
}

export function afterSave(element: Element, services: HookServices) {
  return element;
}

export function afterLoaded(
  element: Element,
  services: HookServices,
  runtime: ServerRuntime,
) {
  if (runtime === 'delivery') {
    const data = omit(element.data, ['correct']);
    return Object.assign(element, { data });
  }
  return element;
}

export function afterRetrieve(
  element: Element,
  services: HookServices,
  runtime: ServerRuntime,
) {
  return element;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function beforeDisplay(element: Element, context: any) {
  if (IS_CEK) USER_STATE.correct = element.data.correct;
  return { ...context, ...USER_STATE };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onUserInteraction(
  element: Element,
  context: any,
  payload: any,
): any {
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
  // Can have arbitrary return value (interpreted by target system)
  // FE is updated if updateDisplayState is true
  return { isCorrect, updateDisplayState: true };
}

export const hookMap = new Map(
  Object.entries({
    beforeSave,
    afterSave,
    afterLoaded,
    afterRetrieve,
    onUserInteraction,
    beforeDisplay,
  }),
);

export default {
  type,
  hookMap,
  initState,
  beforeSave,
  afterSave,
  afterLoaded,
  afterRetrieve,
  onUserInteraction,
  beforeDisplay,
};

export { type, initState };
