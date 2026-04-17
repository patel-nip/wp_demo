import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Set fluent-ffmpeg to use the locally installed static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

const ASSETS_DIR = path.resolve('public', 'assets');
const FFMPEG_DIR = path.join(ASSETS_DIR, 'ffmpeg_images');

const videosToProcess = [
  { file: 'download.mp4', folder: 'hero_frames' },
  { file: 'download (1).mp4', folder: 'desc_frames' },
  { file: 'download (2).mp4', folder: 'title_frames' }
];

// Helper to ensure directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Process video to image sequence
const processVideo = (videoInfo) => {
  return new Promise((resolve, reject) => {
    const inputPath = path.resolve(videoInfo.file);
    const outputDir = path.join(FFMPEG_DIR, videoInfo.folder);
    ensureDir(outputDir);

    console.log(`Starting extraction for ${videoInfo.file} -> ${videoInfo.folder}...`);

    ffmpeg(inputPath)
      // Extract frames as jpg at the video's native framerate. 
      // Using a moderately high quality compression (scale options can go here if needed)
      .outputOptions([
        '-qscale:v 2' // high quality JPEGs
      ])
      .output(path.join(outputDir, '%04d.jpg'))
      .on('end', () => {
        console.log(`✅ Finished extracting ${videoInfo.file} to ${videoInfo.folder}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`❌ Error extracting ${videoInfo.file}:`, err);
        reject(err);
      })
      .run();
  });
};

const setupHoverVideo = async () => {
  // Move and setup the hover video
  const hoverInput = 'download (3) - REVERSE - Videobolt.net.mp4';
  const hoverOutput = path.join(ASSETS_DIR, 'hover_video.mp4');
  ensureDir(ASSETS_DIR);
  
  if (fs.existsSync(hoverInput)) {
    fs.copyFileSync(hoverInput, hoverOutput);
    console.log(`✅ Copied hover video. Now extracting poster image...`);
    
    return new Promise((resolve, reject) => {
      ffmpeg(hoverInput)
        .screenshots({
          timestamps: ['00:00:00.000'],
          filename: 'hover_poster.jpg',
          folder: ASSETS_DIR,
          size: '1920x1080'
        })
        .on('end', () => {
          console.log(`✅ Finished creating hover poster image`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`❌ Error creating hover poster:`, err);
          reject(err);
        });
    });
  } else {
    console.log(`Hover video not found at ${hoverInput}`);
  }
};

async function main() {
  console.log('Starting Asset Processing...');
  try {
    for (const vid of videosToProcess) {
      if (fs.existsSync(vid.file)) {
         await processVideo(vid);
      } else {
         console.log(`Warning: Input file ${vid.file} not found.`);
      }
    }
    await setupHoverVideo();
    console.log('All extractions complete!');
  } catch (e) {
    console.error('Processing failed:', e);
  }
}

main();
