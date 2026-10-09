import { expect, type Locator, type Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export class Display extends pom.DisplayPanel {
  readonly page: Page;
  readonly root: Locator;
  readonly answerChips: Locator;
  readonly answersCard: Locator;
  readonly groupCards: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.root = this.editor.locator('.v-row').first();
    this.answerChips = this.editor.locator('.v-chip');
    this.answersCard = this.editor.locator('.answers');
    this.groupCards = this.editor.locator('.group');
  }

  chipByText(text: string): Locator {
    return this.editor.locator('.v-chip').filter({ hasText: text });
  }

  groupCardByText(text: string): Locator {
    return this.groupCards.filter({ hasText: text });
  }

  async dragChipToGroup(chipText: string, groupText: string) {
    const chip = this.chipByText(chipText);
    const group = this.groupCardByText(groupText);
    // SortableJS ignores a pointerdown on an item that is still running its
    // sort animation (`el.animated`), e.g. pool chips reflowing after the
    // previous drag, so wait for it to settle before grabbing the chip.
    await expect
      .poll(() => chip.evaluate((el: any) => !el.animated))
      .toBe(true);
    await chip.hover();
    await this.page.mouse.down();
    const box = await group.boundingBox();
    if (!box) throw new Error(`Group "${groupText}" has no bounding box`);
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 10,
    });
    await this.page.mouse.up();
    // Ensure the drop registered before the next interaction
    await expect(group.locator('.v-chip', { hasText: chipText })).toBeVisible();
  }
}
