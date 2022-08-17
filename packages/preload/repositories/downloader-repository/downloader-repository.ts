import { DownloaderType } from "./downloader/downloader";
import { XHubDownloader } from "./downloader/xhub";

import { Preference, DownloaderPreference } from "../../utils/preference";
import { PaperEntityDraft } from "../../models/PaperEntityDraft";
import { SharedState } from "../../utils/appstate";

export class DownloaderRepository {
  sharedState: SharedState;
  preference: Preference;

  downloaderList: Array<{ name: string; downloader: DownloaderType }>;

  constructor(sharedState: SharedState, preference: Preference) {
    this.sharedState = sharedState;
    this.preference = preference;

    this.downloaderList = [];

    this.createDownloaders();
  }

  async createDownloaders() {
    this.downloaderList = [];

    const downloaderPrefs = (
      this.preference.get("downloaders") as Array<DownloaderPreference>
    ).sort((a, b) => b.priority - a.priority);

    for (const downloader of downloaderPrefs) {
      let downloaderInstance: DownloaderType | undefined;
      switch (downloader.name) {
        case "x-hub":
          downloaderInstance = new XHubDownloader(
            this.sharedState,
            this.preference
          );
          break;
        default:
          downloaderInstance = new XHubDownloader(
            this.sharedState,
            this.preference
          );
      }
      if (downloaderInstance !== undefined) {
        this.downloaderList.push({
          name: downloader.name,
          downloader: downloaderInstance,
        });
      }
    }
  }

  async download(
    entityDraft: PaperEntityDraft,
    excludes: string[] = []
  ): Promise<PaperEntityDraft> {
    for (const downloader of this.downloaderList) {
      if (excludes.includes(downloader.name)) {
        continue;
      }
      try {
        entityDraft = await downloader.downloader.download(entityDraft);
      } catch (error) {
        console.log(error);
        this.sharedState.set(
          "viewState.alertInformation",
          `${downloader.name} error: ${error as string}`
        );
      }
    }
    return entityDraft;
  }
}