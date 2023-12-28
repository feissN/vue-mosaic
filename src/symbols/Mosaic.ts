import { InjectionKey, Ref } from "vue";
import { MosaicItem, MosaicPath, MosaicRootActions } from "../types/Mosaic";

export const MosaicRootActionsKey: InjectionKey<MosaicRootActions> = Symbol("mosaicRootActions");
export const MosaicIsDraggingKey: InjectionKey<Ref<boolean>> = Symbol("mosaicIsDragging");
export const MosaicDraggingSourcePathKey: InjectionKey<Ref<MosaicPath>> = Symbol("mosaicDragginSourcePath");
export const MosaicDraggingSourceItemKey: InjectionKey<Ref<MosaicItem | null>> = Symbol("mosaicDragginSourceItem");
