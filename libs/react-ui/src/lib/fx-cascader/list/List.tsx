import React, { useRef, useMemo } from 'react';
import { get } from 'lodash-es';
import VirtualList from 'rc-virtual-list';
import { Checkbox, List, Radio, Tooltip } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { classNames as cs } from '../../../utils';
import { listScrollStyle } from '../helper';
import { CascaderOptions, InterListProps } from '../interface';
import '../FxCascader.scss';

const TARGET_CLS = 'cascader';

const defaultFieldNames = {
  label: 'label',
  value: 'value',
  children: 'children',
};

function InterList<T = CascaderOptions>(props: InterListProps<T>) {
  const {
    virtual,
    mode,
    onItemClick,
    groupName,
    getContainer,
    onCheck,
    getStatus,
    sourceMap,
    fieldNames,
    dataSource,
    itemTooltip,
    ...otherProps
  } = props;
  const groupRef = useRef<HTMLDivElement>(null);
  const {
    label: _LABEL = 'label',
    value: _VALUE = 'value',
    children: _CHILDREN = 'children',
  } = fieldNames ?? { ...defaultFieldNames };

  const virtualProps = useMemo(() => {
    if (typeof virtual === 'boolean' && virtual) {
      return {
        itemHeight: 32,
        height: 200,
      };
    } else if (virtual) {
      return virtual;
    }
  }, [virtual]);

  const renderItem = (item: T) => {
    const [label, value, children] = [
      get(item, _LABEL),
      get(item, _VALUE),
      get(item, _CHILDREN),
    ];
    const checkedConfig = getStatus(value);
    const hasChildren = Array.isArray(children) && children.length > 0;
    let tooltipFlag = itemTooltip;
    if (typeof itemTooltip === 'object') {
      tooltipFlag = label?.length >= (itemTooltip?.maxLength ?? 0);
    }
    const itemClassName = [`${TARGET_CLS}-section-row`];
    if (mode === 'single' && checkedConfig.checked) {
      itemClassName.push(`${TARGET_CLS}-section-row-checked`);
    }
    return (
      <List.Item
        className={cs(itemClassName)}
        // @ts-ignore
        style={{ '--list-item-height': virtualProps?.itemHeight ?? '32px' }}
        onClick={() => {
          if (mode === 'single') {
            onCheck?.(!checkedConfig.checked, item as CascaderOptions);
          }
        }}
      >
        {mode === 'multiple' ? (
          <Checkbox
            checked={checkedConfig.checked}
            indeterminate={checkedConfig.indeterminate}
            onChange={(e) =>
              onCheck?.(e.target.checked, item as CascaderOptions)
            }
            className={cs(`${TARGET_CLS}-section-checkbox`)}
          />
        ) : null}
        <div
          className={cs(`${TARGET_CLS}-section-content`)}
          onClick={() => onItemClick?.(item)}
        >
          {tooltipFlag ? (
            <Tooltip title={label} getPopupContainer={getContainer}>
              <div className={cs(`${TARGET_CLS}-section-label`)}>{label}</div>
            </Tooltip>
          ) : (
            <div className={cs(`${TARGET_CLS}-section-label`)}>{label}</div>
          )}
          {hasChildren && (
            <RightOutlined className={cs(`${TARGET_CLS}-section-next`)} />
          )}
        </div>
      </List.Item>
    );
  };

  return (
    <div className={cs(`${TARGET_CLS}-group`)} ref={groupRef}>
      <div className={cs(`${TARGET_CLS}-group-name`)}>{groupName}</div>
      <List
        {...otherProps}
        className={cs([
          `${TARGET_CLS}-section`,
          virtual ? `${TARGET_CLS}-virtual-section` : '',
        ])}
        bordered={false}
        dataSource={virtual ? void 0 : dataSource}
        renderItem={virtual ? void 0 : renderItem}
        style={listScrollStyle(virtual)}
      >
        {virtual && (
          <VirtualList
            prefixCls={cs('virtual-list')}
            className={cs(`${TARGET_CLS}-virtual-list`)}
            data={dataSource ?? []}
            itemKey={_VALUE}
            {...virtualProps}
          >
            {renderItem}
          </VirtualList>
        )}
      </List>
    </div>
  );
}

export default InterList;
