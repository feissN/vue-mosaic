import { InjectionKey, Ref } from "vue";
import { MosaicItem, MosaicPath, MosaicRootActions, MosaicContextActionsProviders } from "../types/Mosaic";

export const MosaicRootActionsKey: InjectionKey<MosaicRootActions> = Symbol("mosaicRootActions");
export const MosaicContextActionsProviderKey: InjectionKey<MosaicContextActionsProviders> = Symbol("mosaicContextActionProviders");
export const MosaicIsDraggingKey: InjectionKey<Ref<boolean>> = Symbol("mosaicIsDragging");
export const MosaicDraggingSourcePathKey: InjectionKey<Ref<MosaicPath>> = Symbol("mosaicDragginSourcePath");
export const MosaicDraggingSourceItemKey: InjectionKey<Ref<MosaicItem | null>> = Symbol("mosaicDragginSourceItem");
export const MosaicContextAllLeavesKey: InjectionKey<Ref<{ key: string; title: string }[]>> = Symbol("mosaicContextAllLeaves");
export const MosaicContextActiveLeavesKey: InjectionKey<Ref<MosaicItem[]>> = Symbol("mosaicContextActiveLeaves");
export const MosaicContextInactiveLeavesKey: InjectionKey<Ref<MosaicItem[]>> = Symbol("mosaicContextInactiveLeaves");
