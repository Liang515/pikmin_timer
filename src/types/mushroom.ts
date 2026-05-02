export interface AreaGroup {
  id: string;
  name: string;
  lastAccessed?: number;
}

export interface Mushroom {
  id: string;
  name: string;
  groupId: string; // To link with AreaGroup
  startTime?: number; // Timestamp when tracking started
  battleEndTime: number; // Timestamp of battle completion
  endTime: number; // Timestamp of respawn (battleEndTime + 5 mins)
  participants: number;
  note: string;
  isFavorite: boolean;
  color: string;
}
