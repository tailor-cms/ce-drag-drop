import { expect, test } from '@playwright/test';
import { elementClient } from '@tailor-cms/cek-e2e';

import { Edit } from '../pom';

const ELEMENT_ID = 'test-drag-drop-edit';

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('Initial render', () => {
  test('Renders default groups and controls', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.groupNameInputs).toHaveCount(2);
    await expect(edit.addGroupBtn).toBeVisible();
  });
});

test.describe('Group management', () => {
  test('Adds a new group', async ({ page }) => {
    const edit = new Edit(page);
    await edit.addGroupBtn.click();
    await expect(edit.groupNameInputs).toHaveCount(3);
  });

  test('Removes a group via confirmation dialog when > 2 exist', async ({
    page,
  }) => {
    const edit = new Edit(page);
    await edit.addGroupBtn.click();
    await expect(edit.removeGroupBtns.first()).toBeVisible();
    await edit.removeGroupBtns.first().click();
    await expect(edit.confirmationDialog).toBeVisible();
    await edit.confirmationDialog
      .getByRole('button', { name: 'Confirm' })
      .click();
    await expect(edit.groupNameInputs).toHaveCount(2);
  });

  test('Adds an answer to a group', async ({ page }) => {
    const edit = new Edit(page);
    const initialCount = await edit.answerInputs.count();
    await edit.addAnswerBtns.first().click();
    await expect(edit.answerInputs).toHaveCount(initialCount + 1);
  });

  test('Persists custom group names and answers', async ({ page }) => {
    const edit = new Edit(page);
    await edit.groupNameInputs.nth(0).fill('Fruits');
    await edit.groupNameInputs.nth(1).fill('Vegetables');
    await edit.answerInputs.nth(0).fill('Apple');
    await edit.answerInputs.nth(1).fill('Carrot');
    await edit.form.saveBtn.click();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(edit.groupNameInputs.nth(0)).toHaveValue('Fruits');
    await expect(edit.groupNameInputs.nth(1)).toHaveValue('Vegetables');
    await expect(edit.answerInputs.nth(0)).toHaveValue('Apple');
    await expect(edit.answerInputs.nth(1)).toHaveValue('Carrot');
  });
});

test.describe('Readonly mode', () => {
  test('Hides add/remove controls', async ({ page }) => {
    const edit = new Edit(page);
    await edit.setReadonly();
    await expect(edit.addGroupBtn).not.toBeVisible();
    await expect(edit.addAnswerBtns.first()).not.toBeVisible();
  });
});
