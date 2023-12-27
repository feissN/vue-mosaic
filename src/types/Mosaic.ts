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

/**
 * These actions are used to alter the state of the view tree
 */
export interface MosaicRootActions<T extends MosaicKey> {
  /**
   * Increases the size of this node and bubbles up the tree
   * @param path Path to node to expand
   * @param percentage Every node in the path up to root will be expanded to this percentage
   */
  expand: (path: MosaicPath, percentage?: number) => void;
  /**
   * Remove the node at `path`
   * @param path
   */
  remove: (path: MosaicPath) => void;
  /**
   * Hide the node at `path` but keep it in the DOM. Used in Drag and Drop
   * @param path
   */
  hide: (path: MosaicPath) => void;
  /**
   * Replace currentNode at `path` with `node`
   * @param path
   * @param node
   */
  replaceWith: (path: MosaicPath, node: MosaicNode<T>) => void;
  /**
   * Atomically applies all updates to the current tree
   * @param updates
   * @param suppressOnRelease (default: false)
   */
  updateTree: (updates: MosaicUpdate<T>[], suppressOnRelease?: boolean) => void;
  /**
   * Returns the root of this Mosaic instance
   */
  getRoot: () => MosaicNode<T> | null;
}
