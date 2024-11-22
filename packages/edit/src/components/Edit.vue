<template>
  <VForm
    ref="form"
    class="tce-drag-drop my-4"
    validate-on="submit"
    @submit.prevent="save"
  >
    <RichTextEditor
      v-model="elementData.question"
      :readonly="isDisabled"
      :rules="[requiredRule]"
      class="my-3"
      label="Question"
      variant="outlined"
    />
    <div class="text-subtitle-2 mb-2">Answer groups</div>
    <VSlideYTransition group>
      <VSheet
        v-for="(groupName, groupKey, index) in elementData.groups"
        :key="groupKey"
        class="pa-4 mb-4"
        rounded="lg"
        border
      >
        <div class="d-flex mb-4">
          <VChip
            class="font-weight-bold"
            color="primary-darken-3"
            size="small"
            variant="flat"
            label
          >
            {{ index + 1 }}
          </VChip>
          <VSpacer />
          <VBtn
            v-if="!isDisabled && groupCount > 2"
            class="ml-2"
            color="secondary-darken-1"
            prepend-icon="mdi-delete"
            size="small"
            variant="text"
            @click="removeGroup(groupKey)"
          >
            Delete answer group
          </VBtn>
        </div>
        <VTextField
          :model-value="groupName"
          :readonly="isDisabled"
          :rules="[requiredRule]"
          class="mt-2"
          label="Group name"
          variant="outlined"
          @update:model-value="updateGroupName(groupKey, $event)"
        />
        <VSlideYTransition group>
          <VTextField
            v-for="(answer, answerKey) in getAnswers(groupKey)"
            :key="answerKey"
            :model-value="answer"
            :readonly="isDisabled"
            :rules="[requiredRule]"
            class="mt-2"
            placeholder="Answer..."
            variant="outlined"
            @update:model-value="updateAnswer(answerKey, $event)"
          >
            <template v-if="!isDisabled && answerCount(groupKey) > 1" #append>
              <VBtn
                aria-label="Remove answer"
                color="primary-darken-4"
                density="comfortable"
                icon="mdi-close"
                variant="text"
                @click="removeAnswer(groupKey, answerKey)"
              />
            </template>
          </VTextField>
        </VSlideYTransition>
        <div v-if="!isDisabled" class="mb-4 d-flex justify-end">
          <VBtn
            color="primary-darken-4"
            prepend-icon="mdi-plus"
            variant="text"
            @click="addAnswer(groupKey)"
          >
            Add Answer
          </VBtn>
        </div>
      </VSheet>
    </VSlideYTransition>
    <div v-if="!isDisabled" class="d-flex justify-center mb-12">
      <VBtn
        color="primary-darken-4"
        prepend-icon="mdi-plus"
        variant="text"
        rounded
        @click="addGroup"
      >
        Add Answer Group
      </VBtn>
    </div>
    <VTextField
      v-model="elementData.hint"
      :clearable="!isDisabled"
      :readonly="isDisabled"
      placeholder="Optional hint..."
      variant="outlined"
    />
    <div v-if="!isDisabled" class="d-flex justify-end">
      <VBtn
        :disabled="isDirty"
        color="primary-darken-4"
        variant="text"
        @click="cancel"
      >
        Cancel
      </VBtn>
      <VBtn
        :disabled="isDirty"
        class="ml-2"
        color="primary-darken-3"
        type="submit"
        variant="tonal"
      >
        Save
      </VBtn>
    </div>
  </VForm>
</template>

<script lang="ts" setup>
import { computed, inject, reactive, ref, watch } from 'vue';
import { Element, ElementData } from '@tailor-cms/ce-drag-drop-manifest';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import pull from 'lodash/pull';
import { RichTextEditor } from '@tailor-cms/core-components';
import size from 'lodash/size';
import { v4 as uuid } from 'uuid';

const emit = defineEmits(['save']);
const props = defineProps<{
  element: Element;
  isFocused: boolean;
  isDisabled: boolean;
}>();

const eventBus = inject('$eventBus') as any;

const form = ref<HTMLFormElement>();
const elementData = reactive<ElementData>(cloneDeep(props.element.data));
const isDirty = computed(() => isEqual(elementData, props.element.data));
const groupCount = computed(() => size(elementData.groups));

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

const save = async () => {
  const { valid } = await form.value?.validate();
  if (valid) emit('save', elementData);
};

const cancel = () => {
  Object.assign(elementData, cloneDeep(props.element.data));
  form.value?.resetValidation();
};

const requiredRule = (val: string | boolean | number) => {
  return !!val || 'The field is required';
};

watch(
  () => props.element.data,
  (data) => Object.assign(elementData, cloneDeep(data)),
);
</script>

<style lang="scss" scoped>
.tce-drag-drop {
  text-align: left;
}
</style>
