import { AppInteractor } from "../../preload/interactors/app-interactor";
import { EntityInteractor } from "../../preload/interactors/entity-interactor";
import { RenderInteractor } from "../../preload/interactors/render-interactor";
import { BrowserExtensionInteractor } from "../../preload/interactors/browser-extension-interactor";
import { PluginSideInteractor } from "../../preload/interactors/plugin-side-interactor";
import { FeedInteractor } from "../../preload/interactors/feed-interactor";

export {};

declare global {
  interface Window {
    appInteractor: AppInteractor;
    entityInteractor: EntityInteractor;
    renderInteractor: RenderInteractor;
    browserExtensionInteractor: BrowserExtensionInteractor;
    pluginInteractor: PluginSideInteractor;
    feedInteractor: FeedInteractor;
    quicklookInteractor: { preview: () => void; closePreview: () => void };
  }

  interface Realm {
    safeWrite: (callback: () => void) => void;
  }
}
