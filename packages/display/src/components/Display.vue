<template>
  <QuestionContainer
    :data="element.data"
    :is-correct="userState.isCorrect"
    :is-submitted="isSubmitted"
    allowed-retake
    is-graded
    @retry="isSubmitted = false"
    @submit="submit"
  >
    <VRow class="mb-2">
      <VCol cols="12">
        <div class="text-subtitle-2 mb-2">
          Drag the answers to the correct group:
        </div>
        <VInput
          :model-value="answers"
          :rules="[answersRule]"
          hide-details="auto"
          validate-on="submit"
        >
          <VCard
            class="pa-4 w-100"
            color="grey-lighten-5"
            min-height="160"
            variant="flat"
            border
          >
            <div class="text-subtitle-2 mb-2">Answers</div>
            <Draggable :list="answers" v-bind="draggableOptions">
              <template #item="{ element: answerId }">
                <VCard
                  :class="{ draggable: !isSubmitted }"
                  class="w-100"
                  variant="flat"
                  border
                >
                  <VCardText class="text-subtitle-1">
                    {{ element.data.answers[answerId] }}
                  </VCardText>
                </VCard>
              </template>
            </Draggable>
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
          class="flex-grow-1 pa-4"
          color="grey-lighten-5"
          min-height="160"
          variant="flat"
          border
        >
          <div class="text-subtitle-2 mb-2">{{ group }}</div>
          <Draggable :list="userAnswer[groupId]" v-bind="draggableOptions">
            <template #item="{ element: answerId }">
              <VCard
                :class="{ draggable: !isSubmitted }"
                class="w-100 d-flex"
                variant="flat"
                border
              >
                <VCardText class="text-subtitle-1">
                  {{ element.data.answers[answerId] }}
                </VCardText>
                <VBtn
                  v-if="!isSubmitted"
                  class="ma-2"
                  density="comfortable"
                  icon="mdi-close"
                  variant="text"
                  @click="removeAnswer(groupId, answerId)"
                />
                <VIcon
                  v-else
                  v-bind="iconProps(groupId, answerId)"
                  class="ma-3"
                  size="large"
                />
              </VCard>
            </template>
          </Draggable>
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

const initializeUserAnswer = () =>
  cloneDeep(props.userState?.response) ??
  mapValues(props.element.data.groups, () => []);

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
  itemKey: 'id',
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

const iconProps = (groupId: string, answerId: string) => {
  const isCorrect = props.userState?.correct?.[groupId].includes(answerId);
  if (isCorrect) return { icon: 'mdi-check-circle', color: 'success' };
  return { icon: 'mdi-close-circle', color: 'error' };
};

const answersRule = (val: string[]) => {
  return !val.length || 'All the answers must be used';
};

const submit = () => emit('interaction', { response: userAnswer.value });

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
    Object.keys(props.element.data.groups).forEach((groupId) => {
      if (!userAnswer.value[groupId]) userAnswer.value[groupId] = [];
    });
  },
  { deep: true },
);
</script>

<style lang="scss" scoped>
.box {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0.5rem;

  .v-card.draggable {
    cursor: move;
  }
}
</style>
