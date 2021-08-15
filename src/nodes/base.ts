import { AncestorNode } from "./ancestor";
import { DirectoryNode } from "./directory";

// base
export interface Base {
  name: string;
  root: null | AncestorNode;
  parent: null | AncestorNode;
  absolutePath: string;
  relativePath: string;
}
