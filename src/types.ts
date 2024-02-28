export interface TimeRange {
  start: number;
  duration: number;
}

export interface Segment {
  id: string;
  material_id: string;
  source_timerange: TimeRange;
  target_timerange: TimeRange;
}

export interface VideoMaterial {
  id: string;
  path: string;
  type: string;
}

export interface Track {
  id: string;
  type: string;
  segments: Segment[];
}

export interface DraftInfo {
  materials: {
    videos: VideoMaterial[];
  };
  tracks: Track[];
}
