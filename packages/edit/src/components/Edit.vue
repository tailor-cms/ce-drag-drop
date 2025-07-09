<template>
  <QuestionContainer
    v-bind="{ elementData, embedElementConfig, isReadonly }"
    :show-feedback="false"
    @update="emit('update', $event)"
  >
    <div class="text-left text-subtitle-2 mb-2">Answer groups</div>
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
                color="primary-darken-3"
                size="small"
              >
                {{ index + 1 }}
              </VAvatar>
            </template>
            <template v-if="showDeleteGroup" #append>
              <VBtn
                color="secondary-lighten-1"
                size="x-small"
                variant="tonal"
                icon
                @click="removeGroup(groupKey)"
              >
                <VIcon icon="mdi-delete-outline" size="large" />
              </VBtn>
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
                    color="primary-darken-4"
                    size="x-small"
                    variant="text"
                    icon
                    @click="removeAnswer(groupKey, answerKey)"
                  >
                    <VIcon icon="mdi-close" size="large" />
                  </VBtn>
                </template>
              </VTextField>
            </VSlideYTransition>
            <div v-if="!isReadonly" class="d-flex justify-end">
              <VBtn
                color="primary-darken-4"
                prepend-icon="mdi-plus"
                variant="text"
                @click="addAnswer(groupKey)"
              >
                Add Answer
              </VBtn>
            </div>
          </div>
        </div>
      </VSlideYTransition>
    </div>
    <div v-if="!isReadonly" class="d-flex justify-center mb-4">
      <VBtn
        color="primary-darken-4"
        prepend-icon="mdi-folder-plus"
        variant="text"
        rounded
        @click="addGroup"
      >
        Add Answer Group
      </VBtn>
    </div>
  </QuestionContainer>
</template>

<script lang="ts" setup>
import { cloneDeep, pick, pull, size } from 'lodash-es';
import { computed, inject } from 'vue';
import { Element } from '@tailor-cms/ce-drag-drop-manifest';
import { QuestionContainer } from '@tailor-cms/core-components';
import { v4 as uuid } from 'uuid';

const props = defineProps<{
  element: Element;
  embedElementConfig: any[];
  isDragged: boolean;
  isFocused: boolean;
  isReadonly: boolean;
}>();
const emit = defineEmits(['save', 'update']);

const eventBus = inject('$eventBus') as any;

const elementData = computed(() => props.element.data);
const groupCount = computed(() => size(elementData.value.groups));
const showDeleteGroup = computed(
  () => !props.isReadonly && groupCount.value > 2,
);

const getAnswers = (groupKey: string) => {
  const keys = elementData.value.correct[groupKey];
  return pick(elementData.value.answers, keys);
};

const answerCount = (groupKey: string) =>
  size(elementData.value.correct[groupKey]);

const addAnswer = (groupKey: string) => {
  const { answers, correct } = cloneDeep(elementData.value);
  const answerKey = uuid();
  answers[answerKey] = '';
  correct[groupKey].push(answerKey);
  emit('update', { answers, correct });
};

const removeAnswer = (groupKey: string, answerKey: string) => {
  const { answers, correct } = cloneDeep(elementData.value);
  delete answers[answerKey];
  pull(correct[groupKey], answerKey);
  emit('update', { answers, correct });
};

const updateAnswer = (key: string, value: string) => {
  const answers = cloneDeep(elementData.value.answers);
  answers[key] = value;
  emit('update', { answers });
};

const addGroup = () => {
  const { groups, answers, correct } = cloneDeep(elementData.value);
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
      const { groups, answers, correct } = cloneDeep(elementData.value);
      correct[groupKey].forEach((key: string) => delete answers[key]);
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
