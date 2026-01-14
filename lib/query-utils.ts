import { InfiniteData } from "@tanstack/react-query";

/**
 * Generic interface for paginated responses used in the project.
 */
interface BasePaginatedResponse<T> {
  data: T[];
  meta: any;
}

/**
 * Updates an item within an infinite query cache.
 */
export const updateInfiniteCacheItem = <T extends { _id: string }, R extends BasePaginatedResponse<T>>(
  oldData: InfiniteData<R> | undefined,
  itemId: string,
  updateFn: (item: T) => T
): InfiniteData<R> | undefined => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((item) => (item._id === itemId ? updateFn(item) : item)),
    })),
  };
};

/**
 * prepends an item to the first page of an infinite query cache.
 */
export const prependInfiniteCacheItem = <T, R extends BasePaginatedResponse<T>>(
  oldData: InfiniteData<R> | undefined,
  newItem: T,
  idKey: keyof T = "_id" as keyof T
): InfiniteData<R> | undefined => {
  if (!oldData) return oldData;

  // Avoid duplicates
  const exists = oldData.pages.some((page) =>
    page.data.some((item: any) => item[idKey] === (newItem as any)[idKey])
  );
  if (exists) return oldData;

  const newPages = [...oldData.pages];
  if (newPages.length > 0) {
    newPages[0] = {
      ...newPages[0],
      data: [newItem, ...newPages[0].data],
    };
  }

  return { ...oldData, pages: newPages };
};

/**
 * Removes an item from an infinite query cache.
 */
export const removeInfiniteCacheItem = <T extends { _id: string }, R extends BasePaginatedResponse<T>>(
  oldData: InfiniteData<R> | undefined,
  itemId: string
): InfiniteData<R> | undefined => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.filter((item) => item._id !== itemId),
    })),
  };
};

/**
 * Moves an item to the top of the first page (common for conversation lists).
 */
export const moveInfiniteCacheItemToTop = <T extends { _id: string }, R extends BasePaginatedResponse<T>>(
  oldData: InfiniteData<R> | undefined,
  itemId: string,
  updatedItem?: T
): InfiniteData<R> | undefined => {
  if (!oldData) return oldData;

  let foundItem: T | undefined = updatedItem;

  // Filter out the item from all pages
  const newPages = oldData.pages.map((page) => ({
    ...page,
    data: page.data.filter((item) => {
      if (item._id === itemId) {
        if (!foundItem) foundItem = item;
        return false;
      }
      return true;
    }),
  }));

  if (foundItem && newPages.length > 0) {
    newPages[0].data = [foundItem, ...newPages[0].data];
    return { ...oldData, pages: newPages };
  }

  return oldData;
};
