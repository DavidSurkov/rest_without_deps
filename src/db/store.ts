import { readFile, writeFile } from 'node:fs/promises';

export enum RecordType {
  USERS = 'users',
  NOTES = 'notes',
}

const makeFilePath = (recordType: RecordType) => {
  return `../${recordType}`;
};

export class Store {
  protected generateRandomId() {
    return Math.floor(Math.random() * 100000);
  }

  protected async readFileFromRecordType(
    recordType: RecordType,
  ): Promise<string | null> {
    try {
      const record = await readFile(makeFilePath(recordType), {
        encoding: 'utf-8',
      });
      return record;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  protected async writeFileFromRecordType<T>(recordType: RecordType, data: T) {
    try {
      await writeFile(
        makeFilePath(recordType),
        typeof data === 'string' ? data : JSON.stringify(data),
        { encoding: 'utf-8' },
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
