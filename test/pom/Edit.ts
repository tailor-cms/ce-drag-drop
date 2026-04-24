import type { Locator, Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export class Edit extends pom.EditPanel {
  readonly form: pom.EditQuestionForm;
  readonly root: Locator;
  readonly groupNameInputs: Locator;
  readonly answerInputs: Locator;
  readonly addGroupBtn: Locator;
  readonly addAnswerBtns: Locator;
  readonly removeGroupBtns: Locator;
  readonly confirmationDialog: Locator;

  constructor(page: Page) {
    super(page);
    this.form = new pom.EditQuestionForm(this.el);
    this.root = this.form.el.locator('.tce-drag-drop');
    this.groupNameInputs = this.root.getByLabel('Group name');
    this.answerInputs = this.root.getByPlaceholder('Answer...');
    this.addGroupBtn = this.root.getByRole('button', {
      name: 'Add Answer Group',
    });
    this.addAnswerBtns = this.root.getByRole('button', { name: 'Add Answer' });
    this.removeGroupBtns = this.root.getByRole('button', {
      name: 'Remove group',
    });
    this.confirmationDialog = this.el
      .locator('.v-dialog')
      .filter({ hasText: 'Delete answer group' });
  }
}
