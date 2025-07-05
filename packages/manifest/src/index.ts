import { OpenAISchema } from '@tailor-cms/cek-common';
import { v4 as uuid } from 'uuid';

import type {
  DataInitializer,
  ElementData,
  ElementManifest,
} from './interfaces';

const [uuid1, uuid2, uuid3, uuid4] = Array.from({ length: 4 }, () => uuid());

// Element unique id within the target system (e.g. Tailor)
export const type = 'DRAG_DROP';

// Display name (e.g. shown to the author)
export const name = 'Drag & Drop';

// Function which inits element state (data property on the Content Element
// entity)
export const initState: DataInitializer = (): ElementData => ({
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
  correct: {
    [uuid1]: [uuid3],
    [uuid2]: [uuid4],
  },
  hint: '',
});

// Can be loaded from package.json
export const version = '1.0';

// UI configuration for Tailor CMS
const ui = {
  // Display icon, https://pictogrammers.com/library/mdi/
  icon: 'mdi-cursor-move',
  // Does element support only full width or can be used within layouts
  // (e.g. 50/50 layout)
  forceFullWidth: true,
};

export const ai = {
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
  } as OpenAISchema,
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
  processResponse: (data: any) => {
    const questionId = uuid();
    const answers = data.groups.reduce(
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
      question: [questionId],
      hint: data.hint || '',
      ...answers,
      embeds: {
        [questionId]: {
          id: questionId,
          data: { content: data.question },
          embedded: true,
          position: 1,
          type: 'TIPTAP_HTML',
        },
      },
    };
  },
};

const manifest: ElementManifest = {
  type,
  version: '1.0',
  name,
  ssr: false,
  isQuestion: true,
  isComposite: true,
  isGradable: true,
  initState,
  ui,
  ai,
};

export default manifest;
export * from './interfaces';
