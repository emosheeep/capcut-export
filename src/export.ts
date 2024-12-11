import type { DraftInfo, TimeRange } from './types';
import process from 'node:process';
import ora from 'ora';
import pLimit from 'p-limit';

interface Options {
  verbose: boolean;
  offset?: number;
  concurrent?: number;
}

/** transform timestamp to second */
const toSeconds = (num: number) => Number.parseFloat((num / 1000000).toFixed(2));

function handleDraftInfo(file: string) {
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
  return {
    videoTracks,
    videoMaterials,
  };
}

export async function exportVideos(
  file: string,
  output: string = process.cwd(),
  options: Options,
) {
  const { offset = 2, concurrent = os.cpus().length, verbose } = options;

  $.verbose = verbose;
  $.quiet = !verbose;

  const startAt = Date.now();
  const concurrency = pLimit(concurrent);
  const outputDir = path.isAbsolute(output) ? output : path.resolve(output);
  fs.ensureDir(outputDir);

  const { exitCode } = await $`which ffmpeg`.nothrow();
  if (exitCode) {
    return console.log(
      `fatal: You should manually install ${chalk.bold('ffmpeg')} first, see https://ffmpeg.org/download.html`,
    );
  }

  if (offset <= 0) {
    return console.log('fatal: offset must be greater than 0');
  }

  const { videoMaterials, videoTracks } = handleDraftInfo(file);
  const videoClips: Array<TimeRange & { path: string }> = [];
  for (const segment of videoTracks.map((v) => v.segments).flat()) {
    const videoPath = videoMaterials.get(segment.material_id);
    if (videoPath) {
      videoClips.push({
        ...segment.source_timerange,
        path: videoPath,
      });
    }
  }

  const spinner = ora(
    `Export ${chalk.cyan(videoClips.length)} video clip(s) from ${chalk.cyan(videoTracks.length)} video track(s).`,
  );

  spinner.start();
  const result = await Promise.allSettled(
    videoClips.map((video, index) =>
      concurrency(async () => {
        spinner.prefixText = `${videoClips.length - concurrency.pendingCount}/${videoClips.length}`;
        const start = Math.max(0, toSeconds(video.start) - offset);
        const duration = toSeconds(video.duration) + offset * 2;
        if (concurrent === 1) {
          spinner.suffixText = `- start:${start},duration:${duration} - ${video.path}`;
        }

        if (!fs.existsSync(video.path)) {
          throw new Error(`File not found - ${video.path}`);
        }

        const outputFile = path.join(
          outputDir,
          `Clip_${index + 1}${path.extname(video.path)}`,
        );

        await $`ffmpeg -ss ${start} -t ${duration} -i ${video.path} -c copy ${outputFile} -y`;
      }),
    ),
  );
  spinner.prefixText = '';
  spinner.suffixText = '';

  const successCount = result.reduce((result, item) => {
    if (item.status === 'fulfilled') {
      result++;
    }
    else if (item.reason instanceof Error) {
      console.log(`\n${chalk.red.bold('error')} ${item.reason.message}`);
    }
    else {
      console.log(item.reason);
    }
    return result;
  }, 0);

  let text = `Done in ${((Date.now() - startAt) / 1000).toFixed(2)}s, succeeds ${chalk.green(successCount)}`;

  if (successCount < result.length) {
    text += `, fails ${chalk.red(result.length - successCount)}`;
  }

  if (typeof output === 'string' && path.resolve(output) !== process.cwd()) {
    text += `, output into ${output}`;
  }

  spinner.succeed(`${text}.`);
}
