<template>
  <QuestionContainer
    :data="element.data"
    :is-correct="userState.isCorrect"
    :is-submitted="isSubmitted"
    allowed-retake
    is-graded
    @retry="retry"
    @submit="submit"
  >
    <VRow class="mb-2" dense>
      <VCol cols="12">
        <VInput
          :model-value="answers"
          :rules="[answersRule]"
          hide-details="auto"
          validate-on="submit"
        >
          <VCard
            class="answers d-flex flex-grow-1 flex-column w-100"
            min-height="160"
            variant="flat"
            border
          >
            <VCardTitle class="text-subtitle-2">Answers</VCardTitle>
            <VDivider />
            <VCardText>
              <Draggable v-bind="draggableOptions" :list="answers">
                <template #item="{ element: answerId }">
                  <VChip
                    :class="{ draggable: !isSubmitted }"
                    :text="element.data.answers[answerId]"
                    label
                  />
                </template>
              </Draggable>
            </VCardText>
          </VCard>
        </VInput>
      </VCol>
      <VCol
        v-for="{ id: groupId, group } in groupsCollection"
        :key="groupId"
        :cols="12 / config.groupsPerRow"
        class="d-flex flex-column"
      >
        <VCard
          class="d-flex flex-grow-1 flex-column"
          min-height="160"
          variant="flat"
          border
        >
          <VCardTitle class="text-subtitle-2">{{ group }}</VCardTitle>
          <VDivider />
          <VCardText>
            <Draggable v-bind="draggableOptions" :list="userAnswer[groupId]">
              <template #item="{ element: answerId }">
                <VChip
                  v-bind="chipProps(groupId, answerId)"
                  :class="{ draggable: !isSubmitted }"
                  :text="element.data.answers[answerId]"
                  label
                  @click:close="removeAnswer(groupId, answerId)"
                />
              </template>
            </Draggable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </QuestionContainer>
</template>

<script setup lang="ts">
import {
  cloneDeep,
  difference,
  flatMap,
  map,
  mapValues,
  pull,
  shuffle,
  uniqueId,
} from 'lodash-es';
import { computed, ref, watch } from 'vue';
import Draggable from 'vuedraggable/src/vuedraggable';
import { Element } from '@tailor-cms/ce-drag-drop-manifest';
import { QuestionContainer } from '@tailor-cms/lx-components';

const initializeUserAnswer = () => {
  const response = cloneDeep(props.userState?.response) ?? {};
  return mapValues(props.element.data.groups, (_, key: string) => {
    const answers = Object.keys(props.element.data.answers);
    return response[key]?.filter((it: string) => answers.includes(it)) || [];
  });
};

const initializeAnswers = () => {
  const answerIds = Object.keys(props.element.data.answers);
  const usedAnswerIds = flatMap(props.userState.response) as string[];
  const remainingAnswers = difference(answerIds, usedAnswerIds);
  return shuffle(remainingAnswers);
};

const props = defineProps<{ element: Element; userState: any }>();
const emit = defineEmits(['interaction']);

const isSubmitted = ref(!!props.userState.isSubmitted);
const answers = ref(initializeAnswers());
const userAnswer = ref(initializeUserAnswer());

const config = computed(() => ({
  groupsPerRow: 2,
}));

const draggableOptions = computed(() => ({
  class: 'box',
  itemKey: (id: string) => id,
  disabled: isSubmitted.value,
  group: `dragDrop-${uniqueId()}`,
  animation: 150,
}));

const groupsCollection = computed(() => {
  return map(props.element.data.groups, (group, id) => ({ id, group }));
});

const removeAnswer = (id: string, answerId: any) => {
  pull(userAnswer.value[id], answerId);
  answers.value.push(answerId);
};

const chipProps = (groupId: string, answerId: string) => {
  const isCorrect = props.userState?.correct?.[groupId]?.includes(answerId);
  if (!isSubmitted.value) return { closable: true };
  if (isCorrect) return { prependIcon: 'mdi-check-circle', color: 'success' };
  return { prependIcon: 'mdi-close-circle', color: 'error' };
};

const answersRule = (val: string[]) => {
  return !val.length || 'All the answers must be used';
};

const submit = () => emit('interaction', { response: userAnswer.value });
const retry = () => {
  isSubmitted.value = false;
};

watch(
  () => props.userState,
  (state = {}) => {
    userAnswer.value = initializeUserAnswer();
    isSubmitted.value = !!state.isSubmitted;
  },
  { deep: true },
);

watch(
  () => props.element.data.answers,
  () => {
    answers.value = initializeAnswers();
    userAnswer.value = initializeUserAnswer();
  },
  { deep: true },
);
</script>

<style lang="scss" scoped>
.v-card-title {
  font-weight: bold;
}

.box {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0.5rem;

  .v-chip.draggable {
    cursor: move;
  }

  .v-chip {
    align-items: flex-start;
    min-height: 2.125rem;
    height: unset !important;
    padding: 0.5rem 0.75rem !important;

    :deep(.v-chip__content) {
      white-space: wrap;
      line-height: 1;
      min-height: 1.125rem;
    }
  }
}

.answers {
  .v-chip {
    max-width: calc(50% - 4px);
  }
}
</style>
