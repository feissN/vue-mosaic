import { Component } from "vue";
import { Spec } from "immutability-helper";

export type MosaicKey = string | number;

export type MosaicNode<T extends MosaicKey> = MosaicParent<T> | T;

export type MosaicDirection = "row" | "column";

export interface MosaicParent<T extends MosaicKey> {
  direction: MosaicDirection;
  first: MosaicNode<T>;
  second: MosaicNode<T>;
  splitPercentage?: number;
}

export type MosaicBranch = "first" | "second";
export type MosaicPath = MosaicBranch[];

export type TileRenderer<T extends MosaicKey> = (t: T, path: MosaicBranch[]) => Component;

export type MosaicUpdateSpec<T extends MosaicKey> = Spec<MosaicNode<T>>;

export interface MosaicUpdate<T extends MosaicKey> {
  path: MosaicPath;
  spec: MosaicUpdateSpec<T>;
}
