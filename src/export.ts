import { logger } from './logger';

interface TimeRange {
  start: number;
  duration: number;
}

interface Segment {
  id: string;
  material_id: string;
  source_timerange: TimeRange;
  target_timerange: TimeRange;
}

interface DraftInfo {
  materials: {
    videos: Array<{
      id: string;
      path: string;
      type: string;
    }>;
  };
  tracks: Array<{
    id: string;
    type: string;
    segments: Segment[];
  }>;
}

export default async (file: string, options = {}) => {
  console.log(options);

  const draftInfo = fs.readJsonSync(file) as DraftInfo;
  const { tracks = [], materials } = draftInfo;
  const videoTracks = tracks.filter((v) => v.type === 'video');
  const videoMaterials = new Map(
    materials.videos
      .filter((v) => v.type === 'video')
      .map((v) => [
        v.id,
        // ##_draftpath_placeholder_[ID]_##/relative/path
        v.path.replace(/##.*##/, path.dirname(file)),
      ]),
  );

  const videoInfo: Array<TimeRange & { path: string }> = [];

  for (const segment of videoTracks.map((v) => v.segments).flat()) {
    const videoPath = videoMaterials.get(segment.material_id);

    if (videoPath) {
      videoInfo.push({
        ...segment.source_timerange,
        path: videoPath,
      });
    }
  }

  for (const [index, video] of videoInfo.entries()) {
    const toSeconds = (num: number) => Math.round((num / 1000000) * 100) / 100;
    const start = toSeconds(video.start);
    const duration = toSeconds(video.duration);

    if (fs.existsSync(video.path)) {
      logger.info(
        `Start to export video(start:${start}s,duration:${duration}s) from ${video.path}.`,
      );
      const outputFile = `${index + 1}${path.extname(video.path)}`;
      const result =
        await $`ffmpeg -ss ${start} -t ${duration + 1} -i ${video.path} -c copy ${outputFile} -y`
          .quiet()
          .nothrow();
      if (result.exitCode !== 0) {
        logger.error(result);
      } else {
        logger.success(`Export into ${outputFile}.`);
      }
    } else {
      logger.warn(`File doesn't exist: ${video.path}`);
    }
  }
};
