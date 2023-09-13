import path from "path";

import { ContentDataTypeChecks } from "@3d-tiles-tools/base";
import { ContentDataTypes } from "@3d-tiles-tools/base";

import { Tileset } from "@3d-tiles-tools/structure";

import { TilesetCombiner } from "../tilesetProcessing/TilesetCombiner";
import { TilesetMerger } from "../tilesetProcessing/TilesetMerger";
import { TilesetUpgrader } from "../tilesetProcessing/TilesetUpgrader";

/**
 * Methods related to tilesets.
 *
 * Most of the methods in this class are either utility methods, or
 * wrappers around the classes that implement parts of the command
 * line functionality (and that may become `TilesetStage`s in a
 * pipeline at some point).
 *
 * @internal
 */
export class Tilesets {
  /**
   * Performs the `combine` command line operation.
   *
   * @param tilesetSourceName - The tileset source name
   * @param tilesetTargetName - The tileset target name
   * @param overwrite Whether the target should be overwritten if
   * it already exists
   * @returns A promise that resolves when the process is finished
   * @throws TilesetError When the input could not be processed,
   * or when the output already exists and `overwrite` was `false`.
   */
  static async combine(
    tilesetSourceName: string,
    tilesetTargetName: string,
    overwrite: boolean
  ): Promise<void> {
    const externalTilesetDetector = ContentDataTypeChecks.createIncludedCheck(
      ContentDataTypes.CONTENT_TYPE_TILESET
    );
    const tilesetCombiner = new TilesetCombiner(externalTilesetDetector);
    await tilesetCombiner.combine(
      tilesetSourceName,
      tilesetTargetName,
      overwrite
    );
  }

  /**
   * Performs the `merge` command line operation.
   *
   * @param tilesetSourceName - The tileset source name
   * @param tilesetTargetName - The tileset target name
   * @param overwrite Whether the target should be overwritten if
   * it already exists
   * @returns A promise that resolves when the process is finished
   * @throws TilesetError When the input could not be processed,
   * or when the output already exists and `overwrite` was `false`.
   */
  static async merge(
    tilesetSourceNames: string[],
    tilesetTargetName: string,
    overwrite: boolean
  ): Promise<void> {
    const tilesetMerger = new TilesetMerger();
    await tilesetMerger.merge(tilesetSourceNames, tilesetTargetName, overwrite);
  }

  /**
   * Performs the `upgrade` command line operation.
   *
   * @param tilesetSourceName - The tileset source name
   * @param tilesetTargetName - The tileset target name
   * @param overwrite Whether the target should be overwritten if
   * it already exists
   * @param targetVersion - The target version - 1.0 or 1.1
   * @param gltfUpgradeOptions - Options that may be passed
   * to `gltf-pipeline` when GLB data in B3DM or I3DM is
   * supposed to be upgraded.
   * @returns A promise that resolves when the process is finished
   * @throws TilesetError When the input could not be processed,
   * or when the output already exists and `overwrite` was `false`.
   */
  static async upgrade(
    tilesetSourceName: string,
    tilesetTargetName: string,
    overwrite: boolean,
    targetVersion: string,
    gltfUpgradeOptions: any
  ) {
    const tilesetUpgrader = new TilesetUpgrader(
      targetVersion,
      gltfUpgradeOptions
    );
    await tilesetUpgrader.upgrade(
      tilesetSourceName,
      tilesetTargetName,
      overwrite
    );
  }

  /**
   * Performs the `upgrade` operation directly on a tileset
   *
   * @param tileset - The tileset
   * @param targetVersion - The target version - 1.0 or 1.1
   * @returns A promise that resolves when the process is finished
   * @throws TilesetError When the input could not be processed
   */
  static async upgradeTileset(tileset: Tileset, targetVersion: string) {
    const gltfUpgradeOptions = undefined;
    const tilesetUpgrader = new TilesetUpgrader(
      targetVersion,
      gltfUpgradeOptions
    );
    await tilesetUpgrader.upgradeTileset(tileset);
  }

  /**
   * Determine the name of the file that contains the tileset JSON data.
   *
   * If the given name ends with '.json' (case insensitively), then the
   * name is the last path component of the given name.
   *
   * Otherwise (if the given name is a directory, or the name of a file
   * that does not end with '.json' - for example, an archive file
   * that ends with `.3tz` or `.3dtiles`), then the default name
   * 'tileset.json' is returned.
   *
   * @param tilesetDataName - The name of the tileset data
   * @returns The tileset file name
   */
  static determineTilesetJsonFileName(tilesetDataName: string): string {
    if (tilesetDataName.toLowerCase().endsWith(".json")) {
      return path.basename(tilesetDataName);
    }
    return "tileset.json";
  }

  /**
   * Returns whether the given names likely refer to the same package.
   *
   * This will interpret the given strings as paths and normalize them.
   * When the names end with `.json` (case insensitively), then the
   * method returns whether the names refer to the same directory.
   * Otherwise, it returns whether the paths are equal.
   *
   * @param tilesetPackageName0 - The first package name
   * @param tilesetPackageName1 - The second package name
   * @returns Whether the names refer to the same package
   */
  static areEqualPackages(
    tilesetPackageName0: string,
    tilesetPackageName1: string
  ): boolean {
    let name0 = path.normalize(tilesetPackageName0);
    if (name0.toLowerCase().endsWith(".json")) {
      name0 = path.dirname(tilesetPackageName0);
    }
    let name1 = path.normalize(tilesetPackageName1);
    if (name1.toLowerCase().endsWith(".json")) {
      name1 = path.dirname(tilesetPackageName1);
    }
    return name0 === name1;
  }
}
