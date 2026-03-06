import { Readable } from 'node:stream';

export async function readBlobFromStream(stream: Readable) {
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return new Blob([Buffer.concat(chunks)]);
}

export async function readBufferFromStream(stream: Readable) {
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
