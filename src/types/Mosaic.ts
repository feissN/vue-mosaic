import { Component, ComponentPublicInstance } from "vue";
import { Spec } from "immutability-helper";

export type MosaicItem = string | number;

export type MosaicNode = MosaicParent | MosaicItem;

export type MosaicDirection = "row" | "column";

export interface MosaicParent {
  direction: MosaicDirection;
  first: MosaicNode;
  second: MosaicNode;
  splitPercentage?: number;
}

export type MosaicBranch = "first" | "second";
export type MosaicPath = MosaicBranch[];

export type TileRenderer = (t: MosaicItem, path: MosaicBranch[]) => Component;

export type MosaicUpdateSpec = Spec<MosaicNode | null>;

export interface MosaicUpdate {
  path: MosaicPath;
  spec: MosaicUpdateSpec;
}

/**
 * These actions are used to alter the state of the view tree
 */
export interface MosaicRootActions {
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
  replaceWith: (path: MosaicPath, node: MosaicNode) => void;
  /**
   * Atomically applies all updates to the current tree
   * @param updates
   * @param suppressOnRelease (default: false)
   * @param refreshPortals (default: false)
   */
  updateTree: (updates: MosaicUpdate[], suppressOnRelease?: boolean, refreshPortals?: boolean) => void;
  /**
   * Returns the root of this Mosaic instance
   */
  getRoot: () => MosaicNode | null;
}

export type MosaicContextActionsProviders = MosaicRootActions & {
  handleAddPanel: () => void;
};
