export const getStorageUnits = (storageInBytes: number) => {
  if (storageInBytes >= 10 ** 12) {
    const convertedStorage = storageInBytes / 10 ** 12;
    return `${convertedStorage.toFixed(3)} TB`;
  }
  if (storageInBytes >= 10 ** 9) {
    const convertedStorage = storageInBytes / 10 ** 9;
    return `${convertedStorage.toFixed(3)} GB`;
  }
  if (storageInBytes >= 10 ** 6) {
    const convertedStorage = storageInBytes / 10 ** 6;
    return `${convertedStorage.toFixed(3)} MB`;
  }
  if (storageInBytes >= 10 ** 3) {
    const convertedStorage = storageInBytes / 10 ** 3;
    return `${convertedStorage.toFixed(3)} KB`;
  }
  return `${storageInBytes.toFixed(3)} B`;
};
