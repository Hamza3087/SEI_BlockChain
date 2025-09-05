import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { HistoryEvent } from 'modules/logging/types';
import { NewTree } from 'modules/plants';
import { AssignedSpeciesResponseData } from 'modules/species';
import { v4 as getId } from 'uuid';

export type OfflineTree = {
  id: string;
  capturedAt?: string; // new trees have no capturedAt field (it lives in NewTree now)
  tree: NewTree;
};

interface RwDbSchema extends DBSchema {
  assignedSpecies: {
    key: number;
    value: AssignedSpeciesResponseData;
  };
  trees: {
    key: string;
    value: OfflineTree;
  };
  logs: {
    key: string;
    value: HistoryEvent;
  };
}

const dbName = 'RW Offline DB';
const dbVersion = 2; // increment every time DB schema changes

let db: IDBPDatabase<RwDbSchema>;

const getDb = async () => {
  if (!db) {
    db = await openDb();
  }
  return db;
};

const openDb = async () => {
  return await openDB<RwDbSchema>(dbName, dbVersion, {
    upgrade: (db, oldVersion) => {
      switch (oldVersion) {
        // @ts-expect-error intentionally fall through
        case 0:
          db.createObjectStore('assignedSpecies');
          db.createObjectStore('trees', {
            keyPath: 'id',
          });
        // eslint-disable-next-line no-fallthrough
        case 1:
          db.createObjectStore('logs', { keyPath: 'created_at' });
      }
    },
  });
};

export const saveLogEntry = async (value: HistoryEvent) => {
  const db = await getDb();
  return db.add('logs', value);
};

export const loadAllLogEntries = async () => {
  const db = await getDb();
  return db.getAll('logs');
};

export const deleteLogEntries = async (keys: string[]) => {
  const db = await getDb();
  const tx = db.transaction('logs', 'readwrite');
  await Promise.all([...keys.map((key) => tx.store.delete(key)), tx.done]);
};

export const saveAssignedSpecies = async (
  value: AssignedSpeciesResponseData
) => {
  const db = await getDb();
  const tx = db.transaction('assignedSpecies', 'readwrite');
  await Promise.all([tx.store.put(value, 0), tx.done]);
};

export const loadAssignedSpecies = async () => {
  const db = await getDb();
  return db.get('assignedSpecies', 0);
};

export const saveNewTree = async (tree: NewTree) => {
  const db = await getDb();
  const tx = db.transaction('trees', 'readwrite');
  const obj = {
    id: getId(),
    tree,
  };
  await Promise.all([tx.store.add(obj), tx.done]);
};

export const getNewTreesTotalCount = async () => {
  const db = await getDb();
  return db.count('trees');
};

export const loadNewTrees = async (offset: number, count: number) => {
  const result: OfflineTree[] = [];
  const db = await openDb();
  const tx = await db.transaction('trees', 'readonly');
  let cursor = await tx.store.openCursor();
  if (!cursor) {
    return [];
  }
  if (offset > 0) {
    cursor = await cursor.advance(offset);
  }
  for (let i = 0; i < count; i++) {
    if (!cursor) {
      break;
    }
    result.push(cursor.value);
    cursor = await cursor.continue();
  }
  return result;
};

export const getNewTreesKeys = async () => {
  const db = await getDb();
  return db.getAllKeys('trees');
};

export const getNewTreeById = async (id: string) => {
  const db = await getDb();
  return db.get('trees', id);
};

export const deleteNewTreeById = async (id: string) => {
  const db = await getDb();
  return db.delete('trees', id);
};
