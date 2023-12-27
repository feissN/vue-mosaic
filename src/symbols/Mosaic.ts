import { InjectionKey, Ref } from "vue";
import { MosaicPath, MosaicRootActions } from "../types/Mosaic";

export const MosaicRootActionsKey: InjectionKey<MosaicRootActions<any>> = Symbol("mosaicRootActions");
export const MosaicIsDraggingKey: InjectionKey<Ref<boolean>> = Symbol("mosaicIsDragging");
export const MosaicDraggingSourcePathKey: InjectionKey<Ref<MosaicPath>> = Symbol("mosaicDragginSourcePath");
