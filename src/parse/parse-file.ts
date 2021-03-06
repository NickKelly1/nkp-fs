import { OrPromise } from '../types';
import { FileWrite } from '../nodes/file';
import { InputType } from './parse-type';
import { Maybe } from '@nkp/maybe';

export type InputFileWriteObject = { content: string | Buffer, encoding?: BufferEncoding };
export type InputFileWriteFn = () => OrPromise<InputFileWriteObject>;
export type InputFileOptions = { type?: InputType.File, write: string | InputFileWriteFn, encoding?: BufferEncoding };

export type InputFileArray = [ name: string, write: string | InputFileOptions | InputFileWriteFn ];
export type InputFileObject = { name: string, } & InputFileOptions;
export type InputFile = InputFileArray | InputFileObject;

export type InputNormalizedFile = { type: InputType.File, name: string, write: FileWrite }

export function parseFile(unknown: unknown): Maybe<InputNormalizedFile> {
  if (!unknown) return Maybe.none;
  const _unknown = unknown as InputFile;
  if (Array.isArray(_unknown)) {
    if (_unknown.length !== 2) return Maybe.none;
    const [name, options,] = _unknown;
    if (typeof name !== 'string') return Maybe.none;
    return parseFileWriteFn(options).map((write): InputNormalizedFile => ({
      type: InputType.File,
      name,
      write,
    }));
  }
  else if (typeof _unknown === 'object') {
    const { name, write, } = _unknown;
    if (typeof name !== 'string') return Maybe.none;
    return parseFileWriteFn(write).map((write): InputNormalizedFile => ({
      type: InputType.File,
      name,
      write,
    }));
  }
  return Maybe.none;
}

function parseFileWriteFn(options: unknown): Maybe<FileWrite> {
  if (!options) return Maybe.none;
  switch (typeof options) {
  case 'string':
    return Maybe.some(() => ({ content: options, encoding: 'utf-8', }));

  case 'function':
    return Maybe.some(async () => {
      const { content, encoding, } = await (options as InputFileWriteFn)();
      return { content, encoding: encoding ?? 'utf-8', };
    });

  case 'object': {
    const { write, encoding: _encoding, } = options as InputFileOptions;

    switch (typeof write) {
    case 'string':
      return Maybe.some(() => ({ content: write, encoding: _encoding ?? 'utf-8', }));

    case 'function': {
      return Maybe.some(async () => {
        const { content, encoding, } = await write();
        return { content, encoding: encoding ?? _encoding ?? 'utf-8', };
      });
    }
    }
  }
  }

  return Maybe.none;
}
