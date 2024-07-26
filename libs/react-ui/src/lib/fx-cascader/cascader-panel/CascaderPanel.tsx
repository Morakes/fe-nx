import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';
import _, { debounce } from 'lodash-es';
import { useClickAway } from 'ahooks';
import { Input, Tag, List, ConfigProvider, Checkbox, Empty } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import VirtualList from 'rc-virtual-list';
import ListComponent from '../list/List';
import {
  CascaderPanelProps,
  CascaderOptions,
  sourceMapRef,
} from '../interface';
import { CHILD } from '../constant';
import { listScrollStyle } from '../helper';
import { classNames as cs } from '../../../utils';
import { PREFIX_CLASS_NAMES } from '../../../constant';
import '../FxCascader.scss';

const TARGET_CLS = 'cascader';

const defaultFieldNames = {
  label: 'label',
  value: 'value',
  children: 'children',
};

const CascaderPanel = forwardRef<sourceMapRef, CascaderPanelProps>(
  (props: CascaderPanelProps, ref) => {
    const {
      value = [],
      mode = 'multiple',
      open,
      showSearch,
      fieldNames,
      onChange,
      options,
      showCheckedStrategy,
      itemTooltip,
      filterOption,
      virtual,
    } = props;
    const [nextLevel, setNextLevel] = useState<string | number>();
    const [searchText, setSearchText] = useState<string>();
    const [searchOptions, setSearchOptions] =
      useState<{ label: string; value: string | number }[]>();
    const sectionRef = useRef<HTMLDivElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const {
      label: _LABEL = 'label',
      value: _VALUE = 'value',
      children: _CHILDREN = 'children',
    } = fieldNames ?? { ...defaultFieldNames };
    // options的映射，并关联每一层级的_parentKeys和_childrenKeys
    const sourceMap = useMemo(() => {
      if (!options) {
        return new Map() as Map<string | number, CascaderOptions>;
      }
      // 递归并给每个节点标记所有子/父节点的keys
      const generatorMap = (data: CascaderOptions[], parent?: string[]) => {
        const map: Map<string | number, CascaderOptions> = new Map();
        data?.forEach((item) => {
          if (Array.isArray(item[_CHILDREN]) && item[_CHILDREN].length) {
            const childrenMap = generatorMap(item[_CHILDREN], [
              ...(parent ?? []),
              item[_VALUE],
            ]);
            // 所有子节点的key
            let childrenKeys = [...childrenMap.keys()];
            if (showCheckedStrategy === CHILD) {
              childrenKeys = childrenKeys.filter(
                (key) => !childrenMap.get(key)?.[_CHILDREN]?.length
              );
            }
            map.set(item[_VALUE], {
              ...item,
              _childrenKeys: childrenKeys,
              _parentKeys: parent,
            });
            childrenMap.forEach((item) => {
              map.set(item[_VALUE], item);
            });
          } else {
            map.set(item[_VALUE], { ...item, _parentKeys: parent });
          }
        });
        return map;
      };
      return generatorMap(options);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, _VALUE, _LABEL, _CHILDREN]);

    const matchHandler = (search: string, option: CascaderOptions) => {
      const optionLabel = option[_LABEL].toLowerCase();
      return (optionLabel as string).indexOf(search.toLowerCase()) !== -1;
    };

    const searchOptionHandler = debounce((search: string) => {
      if (!showSearch || !search) {
        return [];
      }
      // 搜索项item的label处理
      const labelHandler = (optionItem?: CascaderOptions) => {
        if (!optionItem) {
          return '';
        }
        if (!optionItem._parentKeys?.length) {
          return optionItem[_LABEL];
        }
        const prefixLabel = optionItem._parentKeys
          .map((parent: string | number) => sourceMap.get(parent)?.[_LABEL])
          .join(' / ');
        return `${prefixLabel} / ${optionItem[_LABEL]}`;
      };

      const matchCallback = filterOption ?? matchHandler;
      const result: typeof searchOptions = [];
      sourceMap.forEach((item) => {
        const isExist = result.some((res) => res.value === item[_VALUE]);
        const matchFlag = matchCallback(search, item);
        if (matchFlag && !isExist) {
          const currentLabel = labelHandler(item);
          result.push({
            label: currentLabel,
            value: item[_VALUE],
          });
          if (Array.isArray(item[_CHILDREN]) && item[_CHILDREN].length) {
            const children = item._childrenKeys.map(
              (child: string | number) => {
                const currentChild = sourceMap.get(child);
                const label = labelHandler(currentChild);
                return {
                  label: `${label} / ${currentChild?.[_LABEL]}`,
                  value: currentChild?.[_VALUE],
                };
              }
            );
            result.push(...children);
          }
        }
      });
      setSearchOptions(result);
    }, 300);

    const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const searchValue = e.target.value;
      setSearchText(searchValue);
      if (searchValue) {
        searchOptionHandler(searchValue);
      } else {
        setSearchOptions([]);
      }
    };

    const handleCloseSearchBar = () => {
      if (searchOptions?.length) {
        setSearchOptions(void 0);
      }
    };

    // 选中事件
    const handleCheckItem = (checked: boolean, item: CascaderOptions) => {
      const currentItem = sourceMap.get(item[_VALUE]);
      if (mode === 'single') {
        onChange?.(value === item[_VALUE] ? void 0 : item[_VALUE]);
        return;
      }
      const childKeys: Array<string | number> =
        currentItem?._childrenKeys ?? [];
      const parentKeys: Array<string | number> = currentItem?._parentKeys ?? [];
      const checkedList = (value as Array<string | number>) ?? [];
      let result: Set<string | number> = new Set();
      // 只选子模式，选中只包含子节点
      if (showCheckedStrategy === CHILD) {
        if (checked) {
          const newKeyList = [...checkedList];
          childKeys.length
            ? newKeyList.push(...childKeys)
            : newKeyList.push(item[_VALUE]);
          result = new Set([...newKeyList]);
        } else {
          result = new Set([...checkedList]);
          checkedList.forEach((key) => {
            if (childKeys.includes(key) || key === item[_VALUE]) {
              result.delete(key);
            }
          });
        }
      } else {
        // 父子全选模式，父级下所有子节点全选中时包含父节点
        if (checked) {
          result = new Set([...checkedList]);
          result.add(item[_VALUE]);
          childKeys.forEach((i) => result.add(i));
          let index = 0;
          while (index < (parentKeys?.length ?? 0)) {
            const parentItem = sourceMap.get(parentKeys?.[index]);
            const isCheckAll = (
              parentItem?._childrenKeys as Array<string | number>
            ).every((c) => result.has(c));
            if (isCheckAll) {
              result.add(parentKeys?.[index]);
              index++;
            } else {
              break;
            }
          }
        } else {
          result = new Set([...checkedList]);
          result.delete(currentItem?.[_VALUE]);
          childKeys.forEach((i) => result.delete(i));
          parentKeys.forEach((i) => result.delete(i));
        }
      }
      onChange?.([...result]);
    };

    // 获取节点选中状态
    const getCheckedStatus = useCallback(
      (val: string | number) => {
        let indeterminate = false;
        let checked = false;
        const targetItem = sourceMap?.get(val);
        if (mode === 'single') {
          checked = val === value;
        } else {
          const checkedList = (value as Array<string | number>) ?? [];
          if (
            Array.isArray(targetItem?.[_CHILDREN]) &&
            targetItem[_CHILDREN].length
          ) {
            checked = targetItem?._childrenKeys.every((item: string | number) =>
              checkedList.includes(item)
            );
            if (!checked) {
              indeterminate = targetItem._childrenKeys.some(
                (item: string | number) => checkedList?.includes(item)
              );
            }
          } else {
            checked =
              checkedList.some((item) => item === targetItem?.[_VALUE]) ??
              false;
          }
        }
        return {
          indeterminate,
          checked,
        };
      },
      [value, mode, sourceMap, _VALUE, _CHILDREN]
    );

    // 级联渲染
    const renderSection = useMemo(() => {
      if (!options?.length) {
        return null;
      }
      const renderList: Array<CascaderOptions> = [];
      renderList.push({
        [_CHILDREN]: options,
        [_LABEL]: '',
      });
      // 根据点击的下一层级渲染sections
      if (nextLevel !== void 0) {
        const currentItem = sourceMap.get(nextLevel);
        const parentKeyList = currentItem?._parentKeys;
        if (Array.isArray(parentKeyList) && parentKeyList.length) {
          parentKeyList.forEach((item) => {
            const target = sourceMap.get(item);
            target && renderList.push(target);
          });
        }
        if (
          Array.isArray(currentItem?.[_CHILDREN]) &&
          currentItem[_CHILDREN].length
        ) {
          currentItem && renderList.push(currentItem);
        }
      }
      return renderList.map((item, index) => (
        <ListComponent
          key={index}
          dataSource={item?.[_CHILDREN]}
          rowKey={(item) => item[_VALUE]}
          mode={mode}
          sourceMap={sourceMap}
          virtual={virtual}
          groupName={item[_LABEL]}
          fieldNames={fieldNames}
          getContainer={() => sectionRef.current ?? document.body}
          getStatus={getCheckedStatus}
          itemTooltip={itemTooltip}
          onItemClick={(child) => {
            if (nextLevel !== child[_VALUE]) {
              setNextLevel(child[_VALUE]);
            }
          }}
          onCheck={handleCheckItem}
        />
      ));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceMap, nextLevel, mode, value, virtual, _VALUE, _CHILDREN, _LABEL]);

    const tagRenderItem = (item: string | number) => {
      const current = sourceMap.get(item);
      return (
        <Tag
          className={cs(`${TARGET_CLS}-check-tag`)}
          closeIcon={true}
          bordered={false}
          key={item}
          onClose={() => {
            if (current) {
              handleCheckItem(false, current);
            }
          }}
        >
          <span className={cs(`${TARGET_CLS}-check-tag-label`)}>
            {current?.[_LABEL]}
          </span>
        </Tag>
      );
    };

    const searchOptionRenderItem = (item: {
      label: string;
      value: string | number;
    }) => {
      const { checked } = getCheckedStatus(item.value);
      const current = sourceMap.get(item.value);
      if (!current) {
        return null;
      }
      const itemClassName = [`${TARGET_CLS}-search-item`]
      if (mode === "single" && checked) {
        itemClassName.push(`${TARGET_CLS}-search-item-checked`)
      }
      return (
        <List.Item className={cs(itemClassName)} onClick={() => {
          if (mode === "single") {
            handleCheckItem(value !== item.value, current)
          }
        }}>
          {mode === 'multiple' ? (
            <Checkbox
              checked={checked}
              onChange={(e) => handleCheckItem(e.target.checked, current)}
            />
          ) : null}
          <div className={cs(`${TARGET_CLS}-search-label`)}>{item.label}</div>
        </List.Item>
      );
    };

    useClickAway(() => {
      handleCloseSearchBar();
    }, [searchBarRef]);

    useEffect(() => {
      if (sectionRef.current) {
        const { clientWidth } = sectionRef.current;
        sectionRef.current.scrollTo({ left: clientWidth });
      }
    }, [nextLevel]);

    useEffect(() => {
      if (!open) {
        setNextLevel(void 0);
        setSearchText(void 0);
        setSearchOptions(void 0);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useImperativeHandle(ref, () => ({
      sourceMap,
    }));

    return (
      <ConfigProvider prefixCls={PREFIX_CLASS_NAMES} locale={zhCN}>
        <div className={cs([`${TARGET_CLS}-panel`, `${TARGET_CLS}-css-var`])}>
          {options?.length ? (
            <>
              {showSearch && (
                <div
                  className={cs(`${TARGET_CLS}-search`)}
                  ref={searchBarRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (searchText) {
                      searchOptionHandler(searchText);
                    }
                  }}
                >
                  <Input.Search
                    allowClear
                    value={searchText}
                    onChange={handleSearch}
                    onKeyUp={(e) => {
                      // 阻止键盘事件冒泡
                      e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' || e.keyCode === 27) {
                        handleCloseSearchBar();
                      }
                      // 阻止键盘事件冒泡
                      e.stopPropagation();
                    }}
                  />
                  {searchText && searchOptions?.length ? (
                    <div className={cs(`${TARGET_CLS}-search-panel`)}>
                      <List
                        bordered={false}
                        dataSource={virtual ? void 0 : searchOptions}
                        renderItem={virtual ? void 0 : searchOptionRenderItem}
                        style={listScrollStyle(virtual)}
                      >
                        {virtual && (
                          <VirtualList
                            className={cs(`${TARGET_CLS}-virtual-list`)}
                            data={searchOptions}
                            itemKey={(item) => item.value}
                            itemHeight={32}
                            height={200}
                          >
                            {searchOptionRenderItem}
                          </VirtualList>
                        )}
                      </List>
                    </div>
                  ) : null}
                </div>
              )}
              <div className={cs(`${TARGET_CLS}-panel-content`)}>
                <div className={cs(`${TARGET_CLS}-sections`)} ref={sectionRef}>
                  {renderSection}
                </div>
                {mode === 'multiple' ? (
                  <div className={cs(`${TARGET_CLS}-check-panel`)}>
                    <div className={cs(`${TARGET_CLS}-check-panel-header`)}>
                      <span className={cs(`${TARGET_CLS}-check-title`)}>
                        已选
                      </span>
                      <span
                        className={cs(`${TARGET_CLS}-check-clear`)}
                        onClick={() => {
                          onChange?.(void 0);
                        }}
                      >
                        清除
                      </span>
                    </div>
                    <List
                      bordered={false}
                      dataSource={
                        virtual ? void 0 : (value as Array<string | number>)
                      }
                      renderItem={virtual ? void 0 : tagRenderItem}
                      className={cs(`${TARGET_CLS}-check-panel-body`)}
                      style={listScrollStyle(virtual)}
                    >
                      {virtual && (
                        // eslint-disable-next-line react/jsx-no-useless-fragment
                        <>
                          {(value as Array<string | number>)?.length ? (
                            <VirtualList
                              data={(value as Array<string | number>) ?? []}
                              className={cs(`${TARGET_CLS}-virtual-list`)}
                              itemKey={(item) => item}
                              itemHeight={32}
                              height={200}
                            >
                              {tagRenderItem}
                            </VirtualList>
                          ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )}
                        </>
                      )}
                    </List>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </ConfigProvider>
    );
  }
);

CascaderPanel.defaultProps = {
  showSearch: true,
  mode: 'multiple',
  fieldNames: {
    label: 'label',
    value: 'value',
    children: 'children',
  },
};

export default CascaderPanel;
