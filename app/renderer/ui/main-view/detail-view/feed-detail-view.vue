<script setup lang="ts">
import { BIconCheck2, BIconPlus } from "bootstrap-icons-vue";
import { onBeforeUpdate, ref, watch } from "vue";

import { FeedEntity } from "@/models/feed-entity";
import Spinner from "@/renderer/ui/sidebar-view/components/spinner.vue";
import { MainRendererStateStore } from "@/state/renderer/appstate";

import Authors from "./components/authors.vue";
import PubDetails from "./components/pub-details.vue";
import Section from "./components/section.vue";

const props = defineProps({
  entity: {
    type: Object as () => FeedEntity,
    required: true,
  },
});

const emits = defineEmits([
  "add-clicked",
  "read-timeout",
  "read-timeout-in-unread",
]);

const viewState = MainRendererStateStore.useViewState();
const selectionState = MainRendererStateStore.useSelectionState();

const onAddClicked = () => {
  if (viewState.feedEntityAddingStatus === 0) {
    emits("add-clicked");
  }
};

const timeoutID = ref();

const debounce = (fn: Function, delay: number) => {
  return () => {
    clearTimeout(timeoutID.value);
    // @ts-ignore
    var that = this;
    timeoutID.value = setTimeout(function () {
      fn.apply(that, null);
    }, delay);
  };
};

const onReadTimeout = () => {
  if (selectionState.selectedFeed !== "feed-unread") {
    debounce(() => {
      emits("read-timeout");
    }, 2000)();
  } else {
    debounce(() => {
      emits("read-timeout-in-unread");
    }, 10000)();
  }
};

const reanderedTitle = ref("");
const reanderedAbstract = ref("");

const render = async () => {
  if (props.entity.title?.includes("$")) {
    reanderedTitle.value = await window.renderInteractor.renderMath(
      props.entity.title
    );
  } else {
    reanderedTitle.value = props.entity.title || "";
  }

  if (props.entity.abstract?.includes("$")) {
    reanderedAbstract.value = await window.renderInteractor.renderMath(
      props.entity.abstract
    );
  } else {
    reanderedAbstract.value = props.entity.abstract || "";
  }
};

onBeforeUpdate(() => {
  render();
});

watch(props, (props, prevProps) => {
  onReadTimeout();
});
</script>

<template>
  <div
    id="detail-view"
    class="flex-none flex flex-col w-full max-h-[calc(100vh-3rem)] pl-4 pr-2 pb-4 overflow-auto"
  >
    <div
      class="flex mr-2 mb-4 h-8 bg-accentlight dark:bg-accentdark text-neutral-50 rounded-md shadow-md cursor-pointer hover:shadow-lg"
      @click="onAddClicked"
    >
      <div
        class="m-auto h-8 flex space-x-1"
        v-if="viewState.feedEntityAddingStatus === 0"
      >
        <BIconPlus class="my-auto" />
        <span class="my-auto text-xs select-none">Add to Library</span>
      </div>
      <div
        class="m-auto h-8 flex space-x-2"
        v-if="viewState.feedEntityAddingStatus === 1"
      >
        <Spinner class="my-auto" />
        <span class="my-auto text-xs select-none">Adding...</span>
      </div>
      <div
        class="m-auto h-8 flex space-x-1"
        v-if="viewState.feedEntityAddingStatus === 2"
      >
        <BIconCheck2 class="my-auto" />
        <span class="my-auto text-xs select-none">Added</span>
      </div>
    </div>
    <div class="text-md font-bold" v-html="reanderedTitle"></div>

    <Section title="Feed Name">
      <div class="text-xxs">
        {{ entity.feed.name }}
      </div>
    </Section>

    <Section title="Authors" v-if="entity.authors">
      <Authors :authors="entity.authors" />
    </Section>
    <PubDetails
      :publication="entity.publication"
      :volume="entity.volume"
      :pages="entity.pages"
      :number="entity.number"
      :publisher="entity.publisher"
    />
    <Section title="Publication Year">
      <div class="text-xxs">
        {{ entity.pubTime }}
      </div>
    </Section>
    <Section title="Add Time">
      <div class="text-xxs">
        {{ entity.feedTime.toLocaleString() }}
      </div>
    </Section>
    <Section title="Abstract" v-if="entity.abstract" class="pr-3">
      <div class="text-xxs text-justify" v-html="reanderedAbstract"></div>
    </Section>
    <div class="w-40 h-10">&nbsp;</div>
    <div
      class="fixed bottom-0 w-80 h-10 bg-gradient-to-t from-white dark:from-neutral-800"
    ></div>
  </div>
</template>
