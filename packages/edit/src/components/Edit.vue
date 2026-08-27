<template>
  <div class="tce-drag-drop mb-6">
    <VExpansionPanels :model-value="expanded" flat multiple rounded>
      <VExpandTransition group>
        <VExpansionPanel
          v-for="(groupName, groupKey) in elementData.groups"
          :key="groupKey"
          :value="groupKey"
          class="group-card"
        >
          <VExpansionPanelTitle
            class="py-0 pl-0 pr-4"
            min-height="50"
            readonly
            @click="onTitleClick($event, groupKey)"
          >
            <div class="d-flex align-center w-100 ga-2">
              <VTextField
                :model-value="groupName"
                :readonly="isReadonly"
                :rules="[(val: string) => !!val || 'Group name is required']"
                bg-color="transparent"
                class="group-name px-1"
                density="compact"
                label="Answer group"
                placeholder="Group name..."
                variant="solo"
                flat
                hide-details
                @update:model-value="updateGroupName(groupKey, $event)"
              />
              <VBtn
                v-if="!isReadonly && groupCount > 2"
                aria-label="Remove group"
                class="mr-2"
                color="error"
                density="comfortable"
                icon="mdi-trash-can-outline"
                size="small"
                variant="text"
                @click.stop="removeGroup(groupKey)"
              />
            </div>
          </VExpansionPanelTitle>
          <VExpansionPanelText class="border-t-thin">
            <VSlideYTransition group>
              <VTextField
                v-for="(answer, answerKey, index) in getAnswers(groupKey)"
                :key="answerKey"
                :model-value="answer"
                :readonly="isReadonly"
                :rules="[(val: string) => !!val || 'Answer is required']"
                class="my-2"
                density="comfortable"
                placeholder="Answer..."
                variant="outlined"
                hide-details
                @update:model-value="updateAnswer(answerKey, $event)"
              >
                <template #prepend>
                  <VAvatar
                    :text="String(index + 1)"
                    class="text-label-medium font-weight-semibold"
                    color="surface-container-highest"
                    rounded="lg"
                    size="small"
                  />
                </template>
                <template v-if="!isReadonly" #append>
                  <VBtn
                    :disabled="answerCount(groupKey) <= 1"
                    aria-label="Remove answer"
                    density="comfortable"
                    icon="mdi-close"
                    size="small"
                    variant="text"
                    @click="removeAnswer(groupKey, answerKey)"
                  />
                </template>
              </VTextField>
            </VSlideYTransition>
            <div v-if="!isReadonly" class="d-flex justify-center mt-2">
              <VBtn
                prepend-icon="mdi-plus"
                text="Add Answer"
                variant="text"
                @click="addAnswer(groupKey)"
              />
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpandTransition>
    </VExpansionPanels>
    <VInput
      :rules="groupsValidation"
      :validation-value="[elementData.groups, elementData.answers]"
      hide-details="auto"
    />
    <div v-if="!isReadonly" class="d-flex justify-center mt-3">
      <VBtn
        prepend-icon="mdi-folder-plus"
        text="Add Answer Group"
        variant="text"
        rounded
        @click="addGroup"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { cloneDeep, pick, pull, size, without } from 'lodash-es';
import { computed, inject, ref } from 'vue';
import type { Element, ElementData } from '@tailor-cms/ce-drag-drop-manifest';
import { v4 as uuid } from 'uuid';

const props = defineProps<{
  element: Element;
  embedElementConfig: any[];
  isDragged: boolean;
  isFocused: boolean;
  isReadonly: boolean;
}>();

const emit = defineEmits<{
  update: [data: Partial<ElementData>];
}>();

const eventBus = inject('$eventBus') as any;

const elementData = computed(() => props.element.data);
const groupCount = computed(() => size(elementData.value.groups));

const collapsed = ref<string[]>([]);
const expanded = computed(() =>
  without(Object.keys(elementData.value.groups), ...collapsed.value),
);

const onTitleClick = ({ target }: MouseEvent, groupKey: string) => {
  if ((target as HTMLElement).closest('.v-input, .v-btn')) return;
  if (collapsed.value.includes(groupKey)) pull(collapsed.value, groupKey);
  else collapsed.value.push(groupKey);
};

const groupsValidation = [
  () => {
    const { groups, answers } = elementData.value;
    const values = [...Object.values(groups), ...Object.values(answers)];
    return values.every(Boolean) || 'All group names and answers are required';
  },
];

const getAnswers = (groupKey: string) => {
  const keys = elementData.value.correct?.[groupKey] ?? [];
  return pick(elementData.value.answers, keys);
};

const answerCount = (groupKey: string) =>
  size(elementData.value.correct?.[groupKey] ?? []);

const addAnswer = (groupKey: string) => {
  const { answers, correct = {} } = cloneDeep(elementData.value);
  const answerKey = uuid();
  answers[answerKey] = '';
  correct[groupKey] = [...(correct[groupKey] ?? []), answerKey];
  emit('update', { answers, correct });
};

const removeAnswer = (groupKey: string, answerKey: string) => {
  const { answers, correct = {} } = cloneDeep(elementData.value);
  delete answers[answerKey];
  if (correct[groupKey]) pull(correct[groupKey], answerKey);
  emit('update', { answers, correct });
};

const updateAnswer = (key: string, value: string) => {
  const answers = cloneDeep(elementData.value.answers);
  answers[key] = value;
  emit('update', { answers });
};

const addGroup = () => {
  const { groups, answers, correct = {} } = cloneDeep(elementData.value);
  const groupKey = uuid();
  const answerKey = uuid();
  groups[groupKey] = '';
  answers[answerKey] = '';
  correct[groupKey] = [answerKey];
  emit('update', { groups, answers, correct });
};

const updateGroupName = (key: string, value: string) => {
  const groups = cloneDeep(elementData.value.groups);
  groups[key] = value;
  emit('update', { groups });
};

const removeGroup = (groupKey: string) => {
  return eventBus.channel('app').emit('showConfirmationModal', {
    title: 'Delete answer group',
    message: 'Are you sure you want to delete this answer group?',
    action: () => {
      const { groups, answers, correct = {} } = cloneDeep(elementData.value);
      (correct[groupKey] ?? []).forEach((key: string) => delete answers[key]);
      delete groups[groupKey];
      delete correct[groupKey];
      emit('update', { groups, answers, correct });
    },
  });
};
</script>

<style lang="scss" scoped>
.tce-drag-drop {
  text-align: left;
}

.group-card {
  border: thin solid rgba(0, 0, 0, 0.12);
}

:deep(.v-btn) {
  --v-hover-opacity: 0.12;
}
</style>
