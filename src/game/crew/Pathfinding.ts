// A* Pathfinding implementation for crew movement

import { Room, Door } from '@/utils/types';

interface PathNode {
  roomId: string;
  gCost: number; // Cost from start
  hCost: number; // Heuristic cost to end
  fCost: number; // Total cost
  parent: string | null;
}

// Get connected rooms through doors
function getConnectedRooms(roomId: string, doors: Door[]): string[] {
  const connected: string[] = [];

  for (const door of doors) {
    if (!door.isOpen) continue; // Skip closed doors

    if (door.room1Id === roomId) {
      connected.push(door.room2Id);
    } else if (door.room2Id === roomId) {
      connected.push(door.room1Id);
    }
  }

  return connected;
}

// Simple heuristic: grid distance between room centers
function heuristic(roomA: Room, roomB: Room): number {
  const dx = Math.abs(roomA.gridX - roomB.gridX);
  const dy = Math.abs(roomA.gridY - roomB.gridY);
  return dx + dy;
}

// A* pathfinding algorithm
export function findPath(
  startRoomId: string,
  endRoomId: string,
  rooms: Room[],
  doors: Door[]
): string[] {
  if (startRoomId === endRoomId) {
    return [startRoomId];
  }

  const roomMap = new Map<string, Room>();
  for (const room of rooms) {
    roomMap.set(room.id, room);
  }

  const startRoom = roomMap.get(startRoomId);
  const endRoom = roomMap.get(endRoomId);

  if (!startRoom || !endRoom) {
    return [];
  }

  const openSet = new Map<string, PathNode>();
  const closedSet = new Set<string>();

  // Initialize with start node
  const startNode: PathNode = {
    roomId: startRoomId,
    gCost: 0,
    hCost: heuristic(startRoom, endRoom),
    fCost: heuristic(startRoom, endRoom),
    parent: null,
  };
  openSet.set(startRoomId, startNode);

  while (openSet.size > 0) {
    // Find node with lowest fCost
    let current: PathNode | null = null;
    for (const node of openSet.values()) {
      if (!current || node.fCost < current.fCost) {
        current = node;
      }
    }

    if (!current) break;

    // Check if we reached the goal
    if (current.roomId === endRoomId) {
      // Reconstruct path
      const path: string[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift(node.roomId);
        node = node.parent ? openSet.get(node.parent) || closedSet.has(node.parent) ? { roomId: node.parent, gCost: 0, hCost: 0, fCost: 0, parent: null } : null : null;
      }

      // Proper path reconstruction
      const finalPath: string[] = [];
      const parentMap = new Map<string, string | null>();

      // Build parent map from both sets
      for (const [id, n] of openSet) {
        parentMap.set(id, n.parent);
      }

      // Reconstruct using current node's parent chain
      let tempNode: PathNode | undefined = current;
      while (tempNode) {
        finalPath.unshift(tempNode.roomId);
        if (tempNode.parent) {
          // Find parent in our records
          const records = [...openSet.values()].find(n => n.roomId === tempNode!.parent);
          if (!records) {
            // Parent is in closed set, we need to track it differently
            break;
          }
          tempNode = records;
        } else {
          break;
        }
      }

      // Simple reconstruction approach
      return reconstructPath(current, openSet);
    }

    // Move current from open to closed
    openSet.delete(current.roomId);
    closedSet.add(current.roomId);

    // Check neighbors
    const neighbors = getConnectedRooms(current.roomId, doors);
    for (const neighborId of neighbors) {
      if (closedSet.has(neighborId)) continue;

      const neighborRoom = roomMap.get(neighborId);
      if (!neighborRoom) continue;

      const tentativeG = current.gCost + 1; // Each room transition costs 1

      let neighborNode = openSet.get(neighborId);
      if (!neighborNode) {
        // New node
        neighborNode = {
          roomId: neighborId,
          gCost: tentativeG,
          hCost: heuristic(neighborRoom, endRoom),
          fCost: tentativeG + heuristic(neighborRoom, endRoom),
          parent: current.roomId,
        };
        openSet.set(neighborId, neighborNode);
      } else if (tentativeG < neighborNode.gCost) {
        // Better path found
        neighborNode.gCost = tentativeG;
        neighborNode.fCost = tentativeG + neighborNode.hCost;
        neighborNode.parent = current.roomId;
      }
    }
  }

  // No path found
  return [];
}

// Helper to reconstruct path
function reconstructPath(endNode: PathNode, nodeMap: Map<string, PathNode>): string[] {
  const path: string[] = [];
  let current: PathNode | undefined = endNode;

  // Store all nodes we've seen for reconstruction
  const allNodes = new Map(nodeMap);

  while (current) {
    path.unshift(current.roomId);
    if (current.parent) {
      current = allNodes.get(current.parent);
      if (!current) {
        // Try to find in nodeMap (might have been moved)
        break;
      }
    } else {
      break;
    }
  }

  return path;
}

// Improved A* with proper parent tracking
export function findPathImproved(
  startRoomId: string,
  endRoomId: string,
  rooms: Room[],
  doors: Door[]
): string[] {
  if (startRoomId === endRoomId) {
    return [];
  }

  const roomMap = new Map<string, Room>();
  for (const room of rooms) {
    roomMap.set(room.id, room);
  }

  const startRoom = roomMap.get(startRoomId);
  const endRoom = roomMap.get(endRoomId);

  if (!startRoom || !endRoom) {
    return [];
  }

  // Priority queue simulation with Map
  const openSet = new Set<string>([startRoomId]);
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  gScore.set(startRoomId, 0);
  fScore.set(startRoomId, heuristic(startRoom, endRoom));

  while (openSet.size > 0) {
    // Get node with lowest fScore
    let current = '';
    let lowestF = Infinity;
    for (const roomId of openSet) {
      const f = fScore.get(roomId) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = roomId;
      }
    }

    if (current === endRoomId) {
      // Reconstruct path
      const path: string[] = [];
      let node: string | undefined = current;
      while (node) {
        path.unshift(node);
        node = cameFrom.get(node);
      }
      return path;
    }

    openSet.delete(current);

    const neighbors = getConnectedRooms(current, doors);
    for (const neighbor of neighbors) {
      const tentativeG = (gScore.get(current) ?? Infinity) + 1;

      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        const neighborRoom = roomMap.get(neighbor);
        fScore.set(neighbor, tentativeG + (neighborRoom ? heuristic(neighborRoom, endRoom) : 0));
        openSet.add(neighbor);
      }
    }
  }

  return []; // No path found
}
