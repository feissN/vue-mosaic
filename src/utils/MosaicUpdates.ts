import update from "immutability-helper";
import drop from "lodash/drop";
import dropRight from "lodash/dropRight";
import isEqual from "lodash/isEqual";
import last from "lodash/last";
import set from "lodash/set";
import take from "lodash/take";
import { MosaicBranch, MosaicDirection, MosaicNode, MosaicParent, MosaicPath, MosaicUpdate, MosaicUpdateSpec } from "../types/Mosaic";
import { MosaicDropTargetPosition } from "../utils/DragAndDrop";
import { getAndAssertNodeAtPathExists, getOtherBranch, isParent } from "./Mosaic";

/**
 * Used to prepare `update` for `immutability-helper`
 * @param mosaicUpdate
 * @returns {any}
 */
export function buildSpecFromUpdate(mosaicUpdate: MosaicUpdate): MosaicUpdateSpec {
  if (mosaicUpdate.path.length > 0) {
    return set({}, mosaicUpdate.path, mosaicUpdate.spec);
  } else {
    return mosaicUpdate.spec;
  }
}

/**
 * Applies `updates` to `root`
 * @param root
 * @param updates
 * @returns {MosaicNode}
 */
export function updateTree(root: MosaicNode, updates: MosaicUpdate[]) {
  let currentNode = root;
  // TODO: get rid of the immutability-helper and just move all the updating items yourself.
  // Reason: I need to be able to keep the state of my component between updates
  updates.forEach((mUpdate: MosaicUpdate) => {
    currentNode = update(currentNode as MosaicParent, buildSpecFromUpdate(mUpdate));
  });

  return currentNode;
}

/**
 * Creates a `MosaicUpdate` to remove the node at `path` from `root`
 * @param root
 * @param path
 * @returns {{path: T[], spec: {$set: MosaicNode}}}
 */
export function createRemoveUpdate(root: MosaicNode | null, path: MosaicPath): MosaicUpdate {
  const parentPath = dropRight(path);
  const nodeToRemove = last(path);
  const siblingPath = parentPath.concat(getOtherBranch(nodeToRemove!));
  const sibling = getAndAssertNodeAtPathExists(root, siblingPath);

  return {
    path: parentPath,
    spec: {
      $set: sibling,
    },
  };
}

function isPathPrefixEqual(a: MosaicPath, b: MosaicPath, length: number) {
  return isEqual(take(a, length), take(b, length));
}

/**
 * Creates a `MosaicUpdate` to split the _leaf_ at `destinationPath` into a node of it and the node from `sourcePath`
 * placing the node from `sourcePath` in `position`.
 * @param root
 * @param sourcePath
 * @param destinationPath
 * @param position
 * @returns {(MosaicUpdate|{path: MosaicPath, spec: {$set: {first: MosaicNode, second: MosaicNode, direction: MosaicDirection}}})[]}
 */
export function createDragToUpdates(
  root: MosaicNode,
  sourcePath: MosaicPath,
  destinationPath: MosaicPath,
  position: MosaicDropTargetPosition
): MosaicUpdate[] {
  let destinationNode = getAndAssertNodeAtPathExists(root, destinationPath);
  const updates: MosaicUpdate[] = [];

  const destinationIsParentOfSource = isPathPrefixEqual(sourcePath, destinationPath, destinationPath.length);
  if (destinationIsParentOfSource) {
    // Must explicitly remove source from the destination node
    destinationNode = updateTree(destinationNode, [createRemoveUpdate(destinationNode, drop(sourcePath, destinationPath.length))]);
  } else {
    // Can remove source normally
    updates.push(createRemoveUpdate(root, sourcePath));

    // Have to drop in the correct destination after the source has been removed
    const removedNodeParentIsInPath = isPathPrefixEqual(sourcePath, destinationPath, sourcePath.length - 1);
    if (removedNodeParentIsInPath) {
      destinationPath.splice(sourcePath.length - 1, 1);
    }
  }

  const sourceNode = getAndAssertNodeAtPathExists(root, sourcePath);
  let first: MosaicNode;
  let second: MosaicNode;
  if (position === MosaicDropTargetPosition.LEFT || position === MosaicDropTargetPosition.TOP) {
    first = sourceNode;
    second = destinationNode;
  } else {
    first = destinationNode;
    second = sourceNode;
  }

  let direction: MosaicDirection = "column";
  if (position === MosaicDropTargetPosition.LEFT || position === MosaicDropTargetPosition.RIGHT) {
    direction = "row";
  }

  updates.push({
    path: destinationPath,
    spec: {
      $set: { first, second, direction },
    },
  });

  return updates;
}

/**
 * Sets the splitPercentage to hide the node at `path`
 * @param path
 * @returns {{path: T[], spec: {splitPercentage: {$set: number}}}}
 */
export function createHideUpdate(path: MosaicPath): MosaicUpdate {
  const targetPath = dropRight(path);
  const thisBranch = last(path);

  let splitPercentage: number;
  if (thisBranch === "first") {
    splitPercentage = 0;
  } else {
    splitPercentage = 100;
  }

  return {
    path: targetPath,
    spec: {
      splitPercentage: {
        $set: splitPercentage,
      },
    },
  };
}

/**
 * Sets the splitPercentage of node at `path` and all of its parents to `percentage` in order to expand it
 * @param path
 * @param percentage
 * @returns {{spec: MosaicUpdateSpec, path: Array}}
 */
export function createExpandUpdate(path: MosaicPath, percentage: number): MosaicUpdate {
  let spec: MosaicUpdateSpec = {};
  for (let i = path.length - 1; i >= 0; i--) {
    const branch: MosaicBranch = path[i];
    const splitPercentage = branch === "first" ? percentage : 100 - percentage;
    spec = {
      splitPercentage: {
        $set: splitPercentage,
      },
      [branch]: spec,
    };
  }

  return {
    spec,
    path: [],
  };
}
