const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('正確なファイル名を指定してください。');
  process.exit(1);
}

const inputFileName = args[0];
const outputFileName = 'output.gif';

ffmpeg.ffprobe(inputFileName, (err, metadata) => {
  if (err) {
    console.error('ファイルのメタデータの取得に失敗しました。', err.message);
    process.exit(1);
  }

  const inputVideoStream = metadata.streams.find((stream) => stream.codec_type === 'video');
  const inputFps = inputVideoStream.avg_frame_rate;
  const inputWidth = inputVideoStream.width;
  const inputHeight = inputVideoStream.height;

  ffmpeg(inputFileName)
    .outputOptions('-vf', `fps=${inputFps},scale=${inputWidth}:${inputHeight}:flags=lanczos`)
    .toFormat('gif')
    .on('start', () => {
      console.log('変換を開始します。');
    })
    .on('progress', (progress) => {
      if (progress.percent) {
        console.log(`変換中: ${progress.percent.toFixed(2)}% 完了`);
      }
    })
    .on('end', () => {
      console.log('変換が完了しました。');
    })
    .on('error', (err) => {
      console.error('エラーが発生しました。', err.message);
    })
    .save(outputFileName);
});
