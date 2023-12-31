import clone from "lodash/clone";
import get from "lodash/get";
import { MosaicBranch, MosaicDirection, MosaicItem, MosaicNode, MosaicParent, MosaicPath } from "../types/Mosaic";
import dropRight from "lodash/dropRight";
import { ComponentPublicInstance } from "vue";
import { updateTree } from "./MosaicUpdates";

function alternateDirection(node: MosaicNode, direction: MosaicDirection = "row"): MosaicNode {
  if (isParent(node)) {
    const nextDirection = getOtherDirection(direction);
    return {
      direction,
      first: alternateDirection(node.first, nextDirection),
      second: alternateDirection(node.second, nextDirection),
    };
  } else {
    return node;
  }
}

export enum Corner {
  TOP_LEFT = 1,
  TOP_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
}

/**
 * Returns `true` if `node` is a MosaicParent
 * @param node
 * @returns {boolean}
 */
export function isParent(node: MosaicNode): node is MosaicParent {
  return (node as MosaicParent).direction != null;
}

/**
 * Creates a balanced binary tree from `leaves` with the goal of making them as equal area as possible
 * @param leaves
 * @param startDirection
 * @returns {MosaicNode}
 */
export function createBalancedTreeFromLeaves(leaves: MosaicNode[], startDirection: MosaicDirection = "row"): MosaicNode | null {
  if (leaves.length === 0) {
    return null;
  }

  let current: MosaicNode[] = clone(leaves);
  let next: MosaicNode[] = [];

  while (current.length > 1) {
    while (current.length > 0) {
      if (current.length > 1) {
        next.push({
          direction: "row",
          first: current.shift()!,
          second: current.shift()!,
        });
      } else {
        next.unshift(current.shift()!);
      }
    }
    current = next;
    next = [];
  }
  return alternateDirection(current[0], startDirection);
}

/**
 * Gets the sibling of `branch`
 * @param branch
 * @returns {any}
 */
export function getOtherBranch(branch: MosaicBranch): MosaicBranch {
  if (branch === "first") {
    return "second";
  } else if (branch === "second") {
    return "first";
  } else {
    throw new Error(`Branch '${branch}' not a valid branch`);
  }
}

/**
 * Gets the opposite of `direction`
 * @param direction
 * @returns {any}
 */
export function getOtherDirection(direction: MosaicDirection): MosaicDirection {
  if (direction === "row") {
    return "column";
  } else {
    return "row";
  }
}

/**
 * Traverses `tree` to find the path to the specified `corner`
 * @param tree
 * @param corner
 * @returns {MosaicPath}
 */
export function getPathToCorner(tree: MosaicNode, corner: Corner): MosaicPath {
  let currentNode: MosaicNode = tree;
  const currentPath: MosaicPath = [];
  while (isParent(currentNode)) {
    if (currentNode.direction === "row" && (corner === Corner.TOP_LEFT || corner === Corner.BOTTOM_LEFT)) {
      currentPath.push("first");
      currentNode = currentNode.first;
    } else if (currentNode.direction === "column" && (corner === Corner.TOP_LEFT || corner === Corner.TOP_RIGHT)) {
      currentPath.push("first");
      currentNode = currentNode.first;
    } else {
      currentPath.push("second");
      currentNode = currentNode.second;
    }
  }

  return currentPath;
}

/**
 * Gets all leaves of `tree`
 * @param tree
 * @returns {MosaicItem[]}
 */
export function getLeaves(tree: MosaicNode | null): MosaicItem[] {
  if (tree == null) {
    return [];
  } else if (isParent(tree)) {
    return getLeaves(tree.first).concat(getLeaves(tree.second));
  } else {
    return [tree];
  }
}

/**
 * Gets node at `path` from `tree`
 * @param tree
 * @param path
 * @returns {MosaicNode|null}
 */
export function getNodeAtPath(tree: MosaicNode | null, path: MosaicPath): MosaicNode | null {
  if (path.length > 0) {
    return get(tree, path, null);
  } else {
    return tree;
  }
}

/**
 * Gets node at `path` from `tree` and verifies that neither `tree` nor the result are null
 * @param tree
 * @param path
 * @returns {MosaicNode}
 */
export function getAndAssertNodeAtPathExists(tree: MosaicNode | null, path: MosaicPath): MosaicNode {
  if (tree == null) {
    throw new Error("Root is empty, cannot fetch path");
  }
  const node = getNodeAtPath(tree, path);
  if (node == null) {
    throw new Error(`Path [${path.join(", ")}] did not resolve to a node`);
  }
  return node;
}

export function addMosaicNode(root: MosaicNode | null, item: MosaicItem) {
  if (root) {
    const path = getPathToCorner(root, Corner.TOP_RIGHT);
    const parent = getNodeAtPath(root, dropRight(path)) as MosaicParent;
    const destination = getNodeAtPath(root, path) as MosaicNode;
    const direction: MosaicDirection = parent ? getOtherDirection(parent.direction) : "row";

    let first: MosaicNode;
    let second: MosaicNode;
    if (direction === "row") {
      first = destination;
      second = item;
    } else {
      first = item;
      second = destination;
    }

    root = updateTree(root, [
      {
        path,
        spec: {
          $set: {
            direction,
            first,
            second,
          },
        },
      },
    ]);
  } else {
    root = item;
  }

  return root;
}
