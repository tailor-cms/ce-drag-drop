import { elementClient, pom } from '@tailor-cms/cek-e2e';
import { expect, test } from '@playwright/test';

import { Display } from '../pom';

const ELEMENT_ID = 'test-drag-drop-display';

const SEED = {
  isGradable: true,
  embeds: {
    prompt: {
      id: 'prompt',
      type: 'TIPTAP_HTML',
      position: 1,
      embedded: true,
      data: { content: 'Sort into the correct groups.' },
    },
  },
  question: ['prompt'],
  hint: '',
  groups: {
    g1: 'Fruits',
    g2: 'Vegetables',
  },
  answers: {
    a1: 'Apple',
    a2: 'Banana',
    a3: 'Carrot',
    a4: 'Potato',
  },
  correct: {
    g1: ['a1', 'a2'],
    g2: ['a3', 'a4'],
  },
};

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await elementClient.resetState(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('Empty state', () => {
  test('Renders placeholder when no groups are set', async ({ page }) => {
    const display = new Display(page);
    await expect(display.placeholder).toBeVisible();
  });
});

test.describe('With groups and answers set', () => {
  test.beforeEach(async ({ page }) => {
    await elementClient.update(ELEMENT_ID, SEED);
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Renders answers card and one card per group', async ({ page }) => {
    const display = new Display(page);
    await expect(display.answersCard).toBeVisible();
    await expect(display.groupCards).toHaveCount(2);
    await expect(display.editor).toContainText('Fruits');
    await expect(display.editor).toContainText('Vegetables');
  });

  test('Renders all answer chips', async ({ page }) => {
    const display = new Display(page);
    await expect(display.answerChips).toHaveCount(4);
  });

  test('Submitting without using all answers shows validation error', async ({
    page,
  }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.dragChipToGroup('Apple', 'Fruits');
    await form.submit();
    await expect(
      display.editor.getByText('All the answers must be used'),
    ).toBeVisible();
  });

  test('Submitting correct placements shows success icons', async ({
    page,
  }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.dragChipToGroup('Apple', 'Fruits');
    await display.dragChipToGroup('Banana', 'Fruits');
    await display.dragChipToGroup('Carrot', 'Vegetables');
    await display.dragChipToGroup('Potato', 'Vegetables');
    await form.submit();
    await expect(
      display.editor.locator('.v-chip .mdi-check-circle'),
    ).toHaveCount(4);
  });

  test('Submitting wrong placements shows error icons', async ({ page }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.dragChipToGroup('Apple', 'Vegetables');
    await display.dragChipToGroup('Banana', 'Vegetables');
    await display.dragChipToGroup('Carrot', 'Fruits');
    await display.dragChipToGroup('Potato', 'Fruits');
    await form.submit();
    await expect(
      display.editor.locator('.v-chip .mdi-close-circle'),
    ).toHaveCount(4);
  });

  test('Submitting correct placements marks feedback as success', async ({
    page,
  }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.dragChipToGroup('Apple', 'Fruits');
    await display.dragChipToGroup('Banana', 'Fruits');
    await display.dragChipToGroup('Carrot', 'Vegetables');
    await display.dragChipToGroup('Potato', 'Vegetables');
    await form.submit();
    await expect(form.feedback).toHaveClass(/success/);
  });

  test('Submitting wrong placements marks feedback as error', async ({
    page,
  }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.dragChipToGroup('Apple', 'Vegetables');
    await display.dragChipToGroup('Banana', 'Vegetables');
    await display.dragChipToGroup('Carrot', 'Fruits');
    await display.dragChipToGroup('Potato', 'Fruits');
    await form.submit();
    await expect(form.feedback).toHaveClass(/error/);
  });
});
