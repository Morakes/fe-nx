import type { VNode } from 'vue';
import { ButtonProps, ModalProps } from 'ant-design-vue'

export type GroupColumnType = {
  label: string;
  children: {
    dataIndex: string;
    title: string | VNode | Element;
    [key: string]: any;
  }[];
  [key: string]: any;
}[];


export interface CustomProps {
  /**
   * 列状态缓存
   */
  showColumns: {
    common: string[];
    fixed: string[];
  };
  /**
   * 自定义列选项
   */
  groupColumn: GroupColumnType;
  /**
   * key
   */
  keyName?: string;
  /**
   * ant-design-vue4.x Button组件属性
   */
  buttonProps: ButtonProps;
  /**
   * ant-design-vue4.x Modal组件属性
   */
  modalProps: ModalProps;
}

export interface EmitEventsType {
  /** showColumns change  */
  (event: 'update:showColumns', showColumns?: CustomProps["showColumns"]): void;
}