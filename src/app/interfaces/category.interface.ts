import { Stage } from './stage.interface';

export interface Category<T = Stage> {
  label: string;
  children?: T[];
  isChecked?: boolean;
  isOpen?: boolean;
  isIndeterminate?: boolean;
}
