import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { newId } from './ids';

const PHOTOS = new Directory(Paths.document, 'listing-photos');

function ensureDirectory(): void {
  if (!PHOTOS.exists) PHOTOS.create({ intermediates: true });
}

/**
 * Copies a picked image into the application sandbox and returns its file name.
 *
 * Two traps are avoided here. The picker hands back a URI in the cache
 * directory, which the system may reclaim, so the file has to be copied. And
 * only the file name is stored, never the absolute URI: on iOS the container
 * UUID changes on every app update, which would break every stored path at
 * once.
 */
export function persistPickedPhoto(pickedUri: string): string {
  ensureDirectory();
  const extension = pickedUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const fileName = `${newId()}.${extension.length <= 4 ? extension : 'jpg'}`;

  new File(pickedUri).copy(new File(PHOTOS, fileName));
  return fileName;
}

export function photoUri(fileName: string): string {
  return new File(PHOTOS, fileName).uri;
}

export function deletePhoto(fileName: string): void {
  const file = new File(PHOTOS, fileName);
  if (file.exists) file.delete();
}

// Entry-level Android, metered data: the full-resolution original has no reason
// to be kept.
const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.6,
};

export async function pickPhotoFromLibrary(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled) return null;

  return persistPickedPhoto(result.assets[0].uri);
}

export async function takePhoto(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  if (result.canceled) return null;

  return persistPickedPhoto(result.assets[0].uri);
}
