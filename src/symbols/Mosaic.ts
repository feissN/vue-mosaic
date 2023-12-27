import { InjectionKey } from "vue";
import { MosaicKey, MosaicUpdate } from "../types/Mosaic";

export const UpdateTreeKey: InjectionKey<(updates: MosaicUpdate<MosaicKey>[], suppressOnRelease: boolean) => void> = Symbol("updateTree");
