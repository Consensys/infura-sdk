export type AwaitIterable<T> = Iterable<T> | AsyncIterable<T>;

export type ToContent =
  | string
  | InstanceType<typeof String>
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | AwaitIterable<Uint8Array>
  | ReadableStream<Uint8Array>;

export interface ToFile {
  path?: string;
  content: ToContent;
}
export type ImportCandidate = ToFile;

export type ImportCandidateStream =
  | AwaitIterable<ImportCandidate>
  | ReadableStream<ImportCandidate>;
