<script setup lang="ts">
import { MainRendererStateStore } from "@/state/renderer/appstate";

const viewState = MainRendererStateStore.useViewState();
const selectionState = MainRendererStateStore.useSelectionState();

const onClick = () => {
  viewState.isDeleteConfirmShown = false;
};

const keyDownListener = (e: KeyboardEvent) => {
  e.preventDefault();
  if (e.key === "Enter") {
    onConfirm();
  } else if (e.key === "Escape") {
    onCancel();
  }
};

document.addEventListener("keydown", keyDownListener, { once: true });

const onCancel = () => {
  onClick();
};

const onConfirm = () => {
  window.entityInteractor.delete(selectionState.selectedIds);
  selectionState.selectedIds = [];
  selectionState.selectedIndex = [];
  onClick();
};
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-75"
    enter-from-class="transform opacity-0"
    enter-to-class="transform opacity-100"
    leave-active-class="transition ease-in duration-75"
    leave-from-class="transform opacity-100"
    leave-to-class="transform opacity-0"
  >
    <div
      id="modal-view"
      class="absolute w-full h-full top-0 left-0"
      v-show="viewState.isDeleteConfirmShown"
      @click="onClick"
    >
      <div
        class="fixed top-0 right-0 left-0 z-50 w-screen h-screen bg-neutral-800 bg-opacity-50 dark:bg-neutral-900 dark:bg-opacity-80 dark:text-neutral-300"
        @click.stop="onCancel"
      >
        <div class="flex flex-col justify-center items-center w-full h-full">
          <div
            class="m-auto flex flex-col justify-between px-2 pt-3 pb-4 border-[1px] dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 w-60 rounded-lg shadow-lg select-none space-y-5"
            @click.stop=""
          >
            <div>
              <img
                class="mx-auto mt-2 w-14 h-14"
                src="@/renderer/assets/icon.png"
              />
              <div class="mt-1 text-center text-sm font-semibold">
                {{ $t("confirmation.title") }}
              </div>
              <div class="text-xxs mt-4 px-2 text-center overflow-hidden">
                {{ $t("confirmation.message") }}
              </div>
            </div>

            <div class="flex justify-between px-4">
              <div
                class="flex h-6 rounded-md bg-neutral-300 dark:bg-neutral-600 hover:shadow-sm w-20"
                @click.stop="onCancel"
              >
                <span class="m-auto text-xs">
                  {{ $t("confirmation.cancel") }}
                </span>
              </div>
              <div
                class="flex h-6 rounded-md bg-accentlight dark:bg-accentdark hover:shadow-sm w-20"
                @click.stop="onConfirm"
              >
                <span class="m-auto text-xs text-white">
                  {{ $t("confirmation.ok") }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
