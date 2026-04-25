import type { AiConfig, ElementMocks } from '@tailor-cms/cek-common';
import { v4 as uuid } from 'uuid';

import type {
  DataInitializer,
  ElementData,
  ElementManifest,
} from './interfaces';

// Element unique id within the target system (e.g. Tailor)
export const type = 'DRAG_DROP';

// Display name (e.g. shown to the author)
export const name = 'Drag & Drop';

// Function which inits element state (data property on the Content Element
// entity)
export const initState: DataInitializer = (config): ElementData => {
  const isGradable = config?.isGradable ?? true;
  const [uuid1, uuid2, uuid3, uuid4] = Array.from({ length: 4 }, () => uuid());
  return {
    isGradable,
    embeds: {},
    question: [],
    groups: {
      [uuid1]: '',
      [uuid2]: '',
    },
    answers: {
      [uuid3]: '',
      [uuid4]: '',
    },
    hint: '',
    ...(isGradable && {
      correct: {
        [uuid1]: [uuid3],
        [uuid2]: [uuid4],
      },
    }),
  };
};

// Can be loaded from package.json
export const version = '1.0';

export const isEmpty = (data: ElementData): boolean =>
  !data.question?.length ||
  !Object.values(data.groups ?? {}).some((v) => !!v?.trim()) ||
  !Object.values(data.answers ?? {}).some((v) => !!v?.trim());

export const mocks: ElementMocks = {
  displayContexts: [
    { name: 'No answer', data: {} },
    {
      name: 'Correct answer',
      data: { response: 0, isCorrect: true, isSubmitted: true },
    },
    {
      name: 'Wrong answer',
      data: { response: 1, isCorrect: false, isSubmitted: true },
    },
  ],
};

// UI configuration for Tailor CMS
const ui = {
  // Display icon, https://pictogrammers.com/library/mdi/
  icon: 'mdi-cursor-move',
  // Does element support only full width or can be used within layouts
  // (e.g. 50/50 layout)
  forceFullWidth: true,
};

export const ai: AiConfig = {
  Schema: {
    type: 'json_schema',
    name: 'ce_drag_drop',
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        groups: {
          type: 'array',
          minItems: 2,
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              answers: {
                minItems: 2,
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['name', 'answers'],
            additionalProperties: false,
          },
        },
        hint: { type: 'string' },
      },
      required: ['question', 'hint', 'groups'],
      additionalProperties: false,
    },
  },
  getPrompt: () => `
    Generate a drag and drop question as an object with the following
    properties:
    {
      "question": "",
      "groups": [
        {
          "name": "",
          "answers": []
        },
      ],
      "hint": "",
    }
    where:
      - 'question' is the question prompt.
      - 'groups' is an array of group objects where:
        - 'name' is the group name.
        - 'answers' is an array of string answers for that group.
        Generate at least 2 groups with at least 2 answers each, but try to
        include even more answers if possible. Every group dosn't have to
        have the same number of answers.
      - 'hint' is an optional hint for the correct solution.
  `,
  processResponse: (val: any) => {
    const questionId = uuid();
    const question = {
      id: questionId,
      data: { content: val.question },
      embedded: true,
      position: 1,
      type: 'TIPTAP_HTML',
    };
    const answers = val.groups.reduce(
      (acc: Record<string, any>, { name, answers }: any) => {
        const groupId = uuid();
        acc.groups[groupId] = name;
        acc.correct[groupId] = [];
        answers.forEach((answer: string) => {
          const answerId = uuid();
          acc.answers[answerId] = answer;
          acc.correct[groupId].push(answerId);
        });
        return acc;
      },
      { groups: {}, answers: {}, correct: {} },
    );
    return {
      isGradable: true,
      hint: val.hint || '',
      ...answers,
      question: [questionId],
      embeds: { [questionId]: question },
    };
  },
};

const manifest: ElementManifest = {
  type,
  version,
  name,
  ssr: false,
  isQuestion: true,
  isComposite: true,
  isGradable: true,
  showFeedback: false,
  initState,
  isEmpty,
  ui,
  ai,
  mocks,
};

export default manifest;
export * from './interfaces';
