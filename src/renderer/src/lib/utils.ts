import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed
 * since the last time the debounced function was invoked. The debounced function comes with a `cancel`
 * method to cancel delayed `func` invocations.
 *
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @returns {{ (...args: any[]): void; cancel(): void }} The new debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait = 300) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };

  return debounced;
}