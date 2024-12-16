<template>
  <QuestionContainer
    v-bind="{
      type: manifest.name,
      icon: manifest.ui.icon,
      embedTypes,
      elementData,
      isDirty,
      isDisabled,
    }"
    :show-feedback="false"
    @cancel="updateData(element.data)"
    @save="save"
    @update="updateData($event)"
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
            :readonly="isDisabled"
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
                :readonly="isDisabled"
                :rules="[(val: string) => !!val || 'Answer is required']"
                class="mt-2"
                placeholder="Answer..."
                variant="outlined"
                @update:model-value="updateAnswer(answerKey, $event)"
              >
                <template
                  v-if="!isDisabled && answerCount(groupKey) > 1"
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
            <div v-if="!isDisabled" class="d-flex justify-end">
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
    <div v-if="!isDisabled" class="d-flex justify-center mb-4">
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
import { computed, inject, reactive, watch } from 'vue';
import manifest, {
  Element,
  ElementData,
} from '@tailor-cms/ce-drag-drop-manifest';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import pull from 'lodash/pull';
import { QuestionContainer } from '@tailor-cms/core-components';
import size from 'lodash/size';
import { v4 as uuid } from 'uuid';

const emit = defineEmits(['save']);
const props = defineProps<{
  embedTypes: any[];
  element: Element;
  isFocused: boolean;
  isDisabled: boolean;
}>();

const eventBus = inject('$eventBus') as any;

const elementData = reactive<ElementData>(cloneDeep(props.element.data));
const isDirty = computed(() => !isEqual(elementData, props.element.data));
const groupCount = computed(() => size(elementData.groups));
const showDeleteGroup = computed(
  () => !props.isDisabled && groupCount.value > 2,
);

const getAnswers = (groupKey: string) => {
  const keys = elementData.correct[groupKey];
  return pick(elementData.answers, keys);
};

const answerCount = (groupKey: string) => size(elementData.correct[groupKey]);

const addAnswer = (groupKey: string) => {
  const answerKey = uuid();
  elementData.answers[answerKey] = '';
  elementData.correct[groupKey].push(answerKey);
};

const removeAnswer = (groupKey: string, answerKey: string) => {
  delete elementData.answers[groupKey];
  pull(elementData.correct[groupKey], answerKey);
};

const updateAnswer = (key: string, value: string) =>
  (elementData.answers[key] = value);

const addGroup = () => {
  const groupKey = uuid();
  const answerKey = uuid();
  elementData.groups[groupKey] = '';
  elementData.answers[answerKey] = '';
  elementData.correct[groupKey] = [answerKey];
};

const updateGroupName = (key: string, value: string) =>
  (elementData.groups[key] = value);

const removeGroup = (groupKey: string) => {
  return eventBus.channel('app').emit('showConfirmationModal', {
    title: 'Delete answer group',
    message: 'Are you sure you want to delete this answer group?',
    action: () => {
      elementData.correct[groupKey].forEach(
        (key: string) => delete elementData.answers[key],
      );
      delete elementData.groups[groupKey];
      delete elementData.correct[groupKey];
    },
  });
};

const save = () => emit('save', elementData);
const updateData = (data: ElementData) => {
  Object.assign(elementData, cloneDeep(data));
};

watch(() => props.element.data, updateData);
</script>

<style lang="scss" scoped>
.tce-drag-drop {
  text-align: left;
}
</style>
