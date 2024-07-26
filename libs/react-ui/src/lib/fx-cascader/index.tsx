import React, { useRef, useState } from 'react';
import { ConfigProvider, Select, Tag } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { PREFIX_CLASS_NAMES } from '../../constant';
import CascaderPanel from './cascader-panel/CascaderPanel';
import {
  FxCascaderProps,
  ShowAll,
  ShowChild,
  CascaderPanelProps,
  sourceMapRef,
} from './interface';
import './FxCascader.scss';

declare type CascaderComponent = React.FC<FxCascaderProps> & {
  SHOW_ALL: ShowAll;
  SHOW_CHILD: ShowChild;
  CascaderPanel: React.ForwardRefExoticComponent<
    CascaderPanelProps & React.RefAttributes<sourceMapRef>
  >;
};

const ALL: ShowAll = 'all';
const CHILD: ShowChild = 'child';

/**
 * # 级联选择器组件
 * Cascader Component
 */
const Cascader: React.FC<FxCascaderProps> = (props) => {
  const {
    value,
    showSearch,
    options,
    fieldNames,
    virtual,
    onChange,
    showCheckedStrategy,
    itemTooltip,
    filterOption,
    mode,
    ...otherProps
  } = props;
  const [open, setOpen] = useState(false);
  const cascaderRef = useRef<sourceMapRef>({ sourceMap: new Map() });
  return (
    <ConfigProvider prefixCls={PREFIX_CLASS_NAMES} locale={zhCN}>
      <Select
        {...otherProps}
        onChange={onChange}
        value={value}
        showSearch={false}
        mode="multiple"
        open={open}
        onDropdownVisibleChange={(visible) => {
          setOpen(visible);
        }}
        dropdownRender={() => (
          <CascaderPanel
            ref={cascaderRef}
            open={open}
            value={value}
            mode={mode}
            virtual={virtual}
            showSearch={showSearch}
            fieldNames={fieldNames}
            options={options}
            onChange={onChange}
            itemTooltip={itemTooltip}
            showCheckedStrategy={showCheckedStrategy}
            filterOption={filterOption}
          />
        )}
        tagRender={({ value }) => {
          const current = cascaderRef.current.sourceMap.get(value);
          return (
            <Tag>
              {current?.[fieldNames?.label ?? 'label'] ?? value}
            </Tag>
          );
        }}
      />
    </ConfigProvider>
  );
};

Cascader.defaultProps = {
  popupMatchSelectWidth: 550,
  maxTagCount: 'responsive',
  mode: 'multiple',
  fieldNames: {
    label: 'label',
    value: 'value',
    children: 'children',
  },
  showCheckedStrategy: CHILD,
};

export const FxCascader = Cascader as CascaderComponent;

FxCascader.SHOW_ALL = ALL;
FxCascader.SHOW_CHILD = CHILD;
FxCascader.CascaderPanel = CascaderPanel;

export default FxCascader;
export * from './interface';
