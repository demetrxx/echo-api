enum MimeType {
  Pdf = 'application/pdf',
  Xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  Csv = 'text/csv',
  VideoMp4 = 'video/mp4',
  VideoWebm = 'video/webm',
  ImageJpg = 'image/jpg',
  ImageJpeg = 'image/jpeg',
  ImagePng = 'image/png',
  AudioOgg = 'audio/ogg',
  AudioWebm = 'audio/webm;codecs=opus',
}

enum FileExtension {
  Pdf = 'pdf',
  Xlsx = 'xlsx',
  Csv = 'csv',
  VideoMp4 = 'mp4',
  ImageJpg = 'jpg',
  ImageJpeg = 'jpeg',
  ImagePng = 'png',
  AudioOgg = 'ogg',
  Webm = 'webm',
}

const MIME_TYPE_TO_EXTENSION: Record<MimeType, FileExtension> = {
  [MimeType.Pdf]: FileExtension.Pdf,
  [MimeType.Xlsx]: FileExtension.Xlsx,
  [MimeType.Csv]: FileExtension.Csv,
  [MimeType.VideoMp4]: FileExtension.VideoMp4,
  [MimeType.VideoWebm]: FileExtension.Webm,
  [MimeType.ImageJpg]: FileExtension.ImageJpg,
  [MimeType.ImageJpeg]: FileExtension.ImageJpeg,
  [MimeType.ImagePng]: FileExtension.ImagePng,
  [MimeType.AudioOgg]: FileExtension.AudioOgg,
  [MimeType.AudioWebm]: FileExtension.Webm,
};

export const FILE_EXTENSION_TO_MIME_TYPE: Record<FileExtension, MimeType> =
  Object.entries(MIME_TYPE_TO_EXTENSION).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {} as Record<FileExtension, MimeType>,
  );
