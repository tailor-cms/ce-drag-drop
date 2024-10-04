<template>
  <VForm ref="form" class="tce-root" @submit.prevent="submit">
    <div class="px-2 my-4">{{ data.question }}</div>
    <VRow class="mb-2">
      <VCol cols="12">
        <VInput
          :model-value="answers"
          :rules="[answersRule]"
          hide-details="auto"
          validate-on="submit"
        >
          <VCard class="w-100" color="blue-grey-lighten-4" variant="flat">
            <VCardTitle>Answers</VCardTitle>
            <VDivider />
            <Draggable
              :disabled="submitted"
              :list="answers"
              v-bind="draggableOptions"
              class="box"
              item-key="id"
            >
              <template #item="{ element: answerId }">
                <VCard
                  :class="{ draggable: !submitted }"
                  class="w-100"
                  variant="flat"
                >
                  <VCardText class="text-subtitle-1">
                    {{ data.answers[answerId] }}
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
      >
        <VCard class="h-100" color="blue-grey-lighten-4" variant="flat">
          <VCardTitle>{{ group }}</VCardTitle>
          <VDivider />
          <Draggable
            :disabled="submitted"
            :list="userAnswer[groupId]"
            v-bind="draggableOptions"
            class="box"
            item-key="id"
          >
            <template #item="{ element: answerId }">
              <VCard
                :class="{ draggable: !submitted }"
                class="w-100 d-flex"
                variant="flat"
              >
                <VCardText class="text-subtitle-1">
                  {{ data.answers[answerId] }}
                </VCardText>
                <VBtn
                  v-if="!submitted"
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
    <VAlert
      v-if="submitted"
      :text="userState?.isCorrect ? 'Correct' : 'Incorrect'"
      :type="userState?.isCorrect ? 'success' : 'error'"
      class="mb-3"
      rounded="lg"
      variant="tonal"
    />
    <div class="d-flex justify-end">
      <VBtn v-if="!submitted" type="submit" variant="tonal">Submit</VBtn>
      <VBtn v-else variant="tonal" @click="submitted = false">Try Again</VBtn>
    </div>
  </VForm>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';
import Draggable from 'vuedraggable/src/vuedraggable';
import { ElementData } from '@tailor-cms/ce-drag-drop-manifest';
import flatMap from 'lodash/flatMap';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import pull from 'lodash/pull';
import shuffle from 'lodash/shuffle';
import uniqueId from 'lodash/uniqueId';

const initializeUserAnswer = () =>
  cloneDeep(props.userState?.response) ??
  mapValues(props.data.groups, () => []);

const initializeAnswers = () => {
  const answerIds = Object.keys(props.data.answers);
  const usedAnswerIds = flatMap(props.userState.response) as string[];
  const remainingAnswers = difference(answerIds, usedAnswerIds);
  return shuffle(remainingAnswers);
};

const props = defineProps<{ id: number; data: ElementData; userState: any }>();
const emit = defineEmits(['interaction']);

const form = ref<HTMLFormElement>();
const submitted = ref('isCorrect' in (props.userState ?? {}));
const answers = ref(initializeAnswers());
const userAnswer = ref(initializeUserAnswer());

const config = computed(() => ({
  groupsPerRow: 2,
}));

const draggableOptions = computed(() => ({
  animation: 150,
  group: `dragDrop-${uniqueId()}`,
}));

const groupsCollection = computed(() => {
  return map(props.data.groups, (group, id) => ({ id, group }));
});

const removeAnswer = (id: string, answerId: any) => {
  pull(userAnswer.value[id], answerId);
  answers.value.push(answerId);
};

const submit = async () => {
  const { valid } = await form.value?.validate();
  if (valid) emit('interaction', { response: userAnswer.value });
};

const iconProps = (groupId: string, answerId: string) => {
  const isCorrect = props.userState?.correct?.[groupId].includes(answerId);
  if (isCorrect) return { icon: 'mdi-check-circle', color: 'success' };
  return { icon: 'mdi-close-circle', color: 'error' };
};

const answersRule = (val: string[]) => {
  return !val.length || 'All the answers must be used.';
};

watch(
  () => props.userState,
  (state = {}) => {
    submitted.value = 'isCorrect' in state;
    userAnswer.value = initializeUserAnswer();
  },
  { deep: true },
);

watch(
  () => props.data.answers,
  () => {
    answers.value = initializeAnswers();
    Object.keys(props.data.groups).forEach((groupId) => {
      if (!userAnswer.value[groupId]) userAnswer.value[groupId] = [];
    });
  },
  { deep: true },
);
</script>

<style lang="scss" scoped>
.tce-root {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
}

.box {
  padding: 1rem;
  height: 100%;
  min-height: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0.5rem;

  .v-card.draggable {
    cursor: move;
  }
}
</style>
