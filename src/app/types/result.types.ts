/**
 * Generic Result type for handling operation results and errors
 */
export interface Result<T> {
  data: T | null;
  error: string | null;
}
