import { useState } from "react";

export const useCircularBuffer = <T>(bufferSize: number) => {
  const [buffer, setBuffer] = useState<T[]>([]);

  const append = (value: T) => {
    let newBuffer = buffer;
    if (buffer.length == bufferSize) {
      newBuffer.shift();
    }
    newBuffer.push(value);
    setBuffer(newBuffer);
  };

  const res: [T[], (value: T) => void] = [buffer, append];

  return res;
};
