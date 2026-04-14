type DocWithId = {
  _id?: unknown;
  id?: unknown;
};

// Use specific generic T defaulting to any, so caller gets full type if they specify it, or any to bypass Mongoose's strict FlattenMaps interface
export function normalizeDoc<T = any>(doc: any): T {
  if (!doc) return doc;
  const anyDoc = doc as Record<string, any>;
  const id = (anyDoc.id ?? anyDoc._id)?.toString() ?? undefined;
  const { _id, ...rest } = anyDoc;
  return { ...rest, id } as T;
}

export function normalizeDocs<T = any>(docs: any[]): T[] {
  if (!docs || !Array.isArray(docs)) return [];
  return docs.map((doc) => normalizeDoc<T>(doc));
}

