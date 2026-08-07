import * as FileSystem from 'expo-file-system/legacy';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';

/**
 * Converts recorded audio (m4a/aac) to MP3 before backend upload.
 * Backend requires MP3 format for the 20-second analysis chunks.
 */
export async function convertToMp3(inputUri) {
  const outputUri = `${FileSystem.cacheDirectory}truvoice_${Date.now()}.mp3`;

  const inputPath = inputUri.startsWith('file://')
    ? inputUri.replace('file://', '')
    : inputUri;
  const outputPath = outputUri.replace('file://', '');

  const command = `-y -i "${inputPath}" -codec:a libmp3lame -b:a 128k -ar 16000 -ac 1 "${outputPath}"`;
  const session = await FFmpegKit.execute(command);
  const returnCode = await session.getReturnCode();

  if (!ReturnCode.isSuccess(returnCode)) {
    const logs = await session.getAllLogsAsString();
    throw new Error(logs || 'Failed to convert audio to MP3.');
  }

  const info = await FileSystem.getInfoAsync(outputUri);
  if (!info.exists) {
    throw new Error('MP3 output file was not created.');
  }

  return outputUri;
}

export async function deleteAudioFile(uri) {
  if (!uri) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // ignore cleanup errors
  }
}

export default convertToMp3;
