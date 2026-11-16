/** Stored photographs shared by page adapters. Publication needs a local file
 * and a source, photographer and licence that can be credited to students. */
export function publishable(record) {
  return !!(record?.src?.startsWith('/assets/img/') && record.page && record.author && record.licence);
}
