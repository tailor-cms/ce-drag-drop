<template>
  <div class="tce-drag-drop">
    <div class="text-title-small text-left mb-2">Answer groups</div>
    <div class="d-flex flex-column ga-6">
      <VSlideYTransition group>
        <div
          v-for="(groupName, groupKey, index) in elementData.groups"
          :key="groupKey"
        >
          <VTextField
            :model-value="groupName"
            :readonly="isReadonly"
            :rules="[(val: string) => !!val || 'Group name is required']"
            class="mt-2"
            label="Group name"
            variant="outlined"
            @update:model-value="updateGroupName(groupKey, $event)"
          >
            <template #prepend>
              <VAvatar
                class="font-weight-bold"
                color="surface-container-highest"
                size="small"
              >
                {{ index + 1 }}
              </VAvatar>
            </template>
            <template v-if="showDeleteGroup" #append>
              <VBtn
                aria-label="Remove group"
                color="error"
                icon="mdi-delete-outline"
                size="x-small"
                variant="tonal"
                @click="removeGroup(groupKey)"
              />
            </template>
          </VTextField>
          <div :class="{ 'mr-12': showDeleteGroup }" class="ml-12">
            <VSlideYTransition group>
              <VTextField
                v-for="(answer, answerKey) in getAnswers(groupKey)"
                :key="answerKey"
                :model-value="answer"
                :readonly="isReadonly"
                :rules="[(val: string) => !!val || 'Answer is required']"
                class="mt-2"
                placeholder="Answer..."
                variant="outlined"
                @update:model-value="updateAnswer(answerKey, $event)"
              >
                <template
                  v-if="!isReadonly && answerCount(groupKey) > 1"
                  #append
                >
                  <VBtn
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
            <div v-if="!isReadonly" class="d-flex justify-end">
              <VBtn
                prepend-icon="mdi-plus"
                text="Add Answer"
                variant="text"
                @click="addAnswer(groupKey)"
              />
            </div>
          </div>
        </div>
      </VSlideYTransition>
    </div>
    <div v-if="!isReadonly" class="d-flex justify-center mb-4">
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
import { cloneDeep, pick, pull, size } from 'lodash-es';
import { computed, inject } from 'vue';
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
const showDeleteGroup = computed(
  () => !props.isReadonly && groupCount.value > 2,
);

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
</style>
