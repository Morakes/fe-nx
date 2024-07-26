import { SelectProps, ListProps } from 'antd';
import { BaseOptionType } from 'antd/es/select';

declare type OmitSelectProps =
  | 'fieldNames'
  | 'virtual'
  | 'onChange'
  | 'mode'
  | 'filterOption'
  | 'showCheckedStrategy'
  | 'options'
  | 'mode';

export type ShowAll = 'all';
export type ShowParent = 'parent';
export type ShowChild = 'child';

export interface CascaderOptions extends BaseOptionType {
  label?: React.ReactNode;
  value?: string | number | null;
  children?: Omit<CascaderOptions, 'children'>[];
}

export interface FxCascaderProps extends Omit<SelectProps, OmitSelectProps> {
  fieldNames?: {
    label?: string;
    value?: string;
    children?: string;
  };
  /**
   * # 单选/多选
   */
  mode?: 'multiple' | 'single';
  virtual?:
    | boolean
    | {
        itemHeight: number;
        height: number;
      };
  showCheckedStrategy?: ShowAll | ShowChild;
  options?: CascaderOptions[];
  onChange?: (value?: Array<string | number> | (string | number)) => void;
  filterOption?: (inputValue: string, path: CascaderOptions) => boolean;
  itemTooltip?:
    | boolean
    | {
        maxLength?: number;
      };
}

export interface CascaderPanelProps {
  value?: Array<string | number> | (string | number);
  open?: boolean;
  showSearch?: boolean;
  mode?: FxCascaderProps['mode'];
  fieldNames?: FxCascaderProps['fieldNames'];
  options?: CascaderOptions[];
  panelWidth?: number;
  virtual?: FxCascaderProps['virtual'];
  showCheckedStrategy?: ShowAll | ShowChild;
  onChange?: FxCascaderProps['onChange'];
  filterOption?: (inputValue: string, path: CascaderOptions) => boolean;
  itemTooltip?: FxCascaderProps['itemTooltip'];
}

export interface InterListProps<T = any> extends ListProps<T> {
  virtual?: FxCascaderProps['virtual'];
  mode?: FxCascaderProps['mode'];
  fieldNames?: FxCascaderProps['fieldNames'];
  sourceMap?: Map<string | number, CascaderOptions>;
  onItemClick?: (item: T) => void;
  groupName?: React.ReactNode;
  getContainer?: () => HTMLElement;
  onCheck?: (checked: boolean, item: CascaderOptions) => void;
  getStatus: (val: string | number) => {
    checked: boolean;
    indeterminate: boolean;
  };
  itemTooltip?: FxCascaderProps['itemTooltip'];
}

export type sourceMapRef = {
  sourceMap: Map<string | number, CascaderOptions>;
};
