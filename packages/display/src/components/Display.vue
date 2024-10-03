<template>
  <VForm ref="form" class="tce-root" @submit.prevent="submit">
    <div class="px-2 my-4">{{ data.question }}</div>
    <VRow class="mb-2">
      <VCol cols="12">
        <VCard variant="flat">
          <VCardTitle>Answers</VCardTitle>
          <VDivider />
          <VCardText>
            <Draggable
              :disabled="submitted"
              :list="answers"
              v-bind="draggableOptions"
              class="box"
              item-key="id"
            >
              <template #item="{ element: answerId }">
                <VChip :text="data.answers[answerId]" />
              </template>
            </Draggable>
          </VCardText>
        </VCard>
      </VCol>
      <VCol
        v-for="{ id: groupId, group } in groupsCollection"
        :key="groupId"
        :cols="12 / config.groupsPerRow"
      >
        <VCard variant="flat">
          <VCardTitle>{{ group }}</VCardTitle>
          <VDivider />
          <VCardText class="">
            <Draggable
              :disabled="submitted"
              :list="userAnswer[groupId]"
              v-bind="draggableOptions"
              class="box"
              item-key="id"
            >
              <template #item="{ element: answerId }">
                <VChip
                  v-bind="chipProps(groupId, answerId)"
                  :closable="!submitted"
                  :text="data.answers[answerId]"
                  @click:close="removeAnswer(groupId, answerId)"
                />
              </template>
            </Draggable>
          </VCardText>
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
import Draggable from 'vuedraggable/src/vuedraggable';
import { ElementData } from '@tailor-cms/ce-drag-drop-manifest';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import pull from 'lodash/pull';
import shuffle from 'lodash/shuffle';
import uniqueId from 'lodash/uniqueId';

const initializeAnswer = () =>
  cloneDeep(props.userState?.response) ??
  mapValues(props.data.groups, () => []);

const props = defineProps<{ id: number; data: ElementData; userState: any }>();
const emit = defineEmits(['interaction']);

const form = ref<HTMLFormElement>();
const submitted = ref('isCorrect' in (props.userState ?? {}));
const answers = ref(shuffle(Object.keys(props.data.answers)));
const userAnswer = ref(initializeAnswer());

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

const chipProps = (groupId: string, answerId: string) => {
  if (!submitted.value || !props.userState.correct) return;
  const isCorrect = props.userState?.correct[groupId].includes(answerId);
  if (isCorrect) return { prependIcon: 'mdi-check-circle', color: 'success' };
  return { prependIcon: 'mdi-close-circle', color: 'error' };
};

watch(
  () => props.userState,
  (state = {}) => {
    userAnswer.value = initializeAnswer();
    submitted.value = 'isCorrect' in state;
  },
  { deep: true },
);

watch(
  () => props.data.answers,
  () => (answers.value = shuffle(Object.keys(props.data.answers))),
  { deep: true },
);
</script>

<style lang="scss" scoped>
.tce-root {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
}

.box {
  min-height: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  [draggable='true'] {
    .v-chip {
      cursor: move;
    }
  }
}
</style>
