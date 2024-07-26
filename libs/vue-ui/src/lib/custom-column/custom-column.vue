<script setup lang="tsx">
import { cloneDeep } from 'lodash-es';
import { computed, ref, watch } from 'vue';
import type { CustomProps, EmitEventsType } from './typing';
import draggable from 'vuedraggable';
import { DragOutlined } from '@ant-design/icons-vue';
import { Button, Modal, Checkbox, Tabs, TabPane, Tag } from 'ant-design-vue'

function arrayWrap<T>(val: T | T[]): T[] {
  if (val === undefined) {
    return [];
  }
  return Array.isArray(val) ? val : [val];
}

interface Props extends CustomProps {}

const props = withDefaults(defineProps<Props>(), {
  showColumns: () => ({
    common: [],
    fixed: [],
  }),
  groupColumn: () => [],
  buttonProps: () => ({}),
  modalProps: () => ({}),
});
const emits = defineEmits<EmitEventsType>();
const visible = ref(false);

const activeKey = ref(props.groupColumn?.[0]?.label);
const checkedList = ref<string[]>([]);
const commonList = ref<string[]>([]);
const fixedList = ref<string[]>([]);
// 全选样式
const checkAll = computed(() => {
  const fields = props.groupColumn.find((i) => i.label === activeKey.value)?.children ?? [];
  return fields.every((i) => checkedList.value.includes(i.dataIndex));
});

// 部分选中样式
const indeterminate = computed(() => {
  if (checkAll.value) {
    return false;
  }
  const fields = props.groupColumn.find((i) => i.label === activeKey.value)?.children ?? [];
  return fields.some((i) => checkedList.value.includes(i.dataIndex));
});

const columnsMap = computed(() => {
  return props.groupColumn.reduce((prev, next) => {
    if (next.children) {
      next.children.forEach((i) => {
        prev[i.dataIndex] = i;
      });
    }
    return prev;
  }, {} as Record<string, any>);
});

watch(
  props.showColumns,
  () => {
    checkedList.value = [...cloneDeep(props.showColumns.common ?? []), ...cloneDeep(props.showColumns.fixed ?? [])];
    fixedList.value = cloneDeep(props.showColumns.fixed) ?? [];
    commonList.value = checkedList.value.filter((i) => !fixedList.value.includes(i));
  },
  {
    immediate: true,
  }
);

// 列选中
const handleCheckedChange = (e: any, val: string) => {
  if (e.target.checked) {
    checkedList.value = [...checkedList.value, val];
    commonList.value = checkedList.value.filter((i) => !fixedList.value.includes(i));
  } else {
    handleCloseTag(val);
  }
};
// 取消列选中
const handleCloseTag = (val: string | string[]) => {
  const arrVal = arrayWrap(val);
  checkedList.value = [...checkedList.value].filter((i) => !arrVal.includes(i));
  fixedList.value = fixedList.value.filter((i) => checkedList.value.includes(i));
  commonList.value = checkedList.value.filter((i) => !fixedList.value.includes(i));
};

// 全选/反选
const handleAllChecked = (e: any) => {
  const fields = (props.groupColumn.find((i) => i.label === activeKey.value)?.children ?? []).map((i) => i.dataIndex);
  // 全选
  if (e.target.checked) {
    checkedList.value = [...checkedList.value, ...fields.filter((i) => !checkedList.value.includes(i)).map((i) => i)];
    commonList.value = checkedList.value.filter((i) => !fixedList.value.includes(i));
  } else {
    // 反选
    handleCloseTag(fields);
  }
};

const handleConfirm = () => {
  emits('update:showColumns', {
    common: commonList.value,
    fixed: fixedList.value,
  });
  visible.value = !visible.value;
};
</script>

<template>
  <div>
    <Button @click="() => (visible = true)" v-bind="props.buttonProps">
      <slot>自定义列</slot>
    </Button>
    <Modal v-model:visible="visible" title="自定义列" :width="1000" @ok="handleConfirm" v-bind="props.modalProps">
      <!-- <AInput
          placeholder="可搜索列名称"
          v-model:value="filterValue"
          allowClear
          style="width: 200px"
        /> -->
      <div class="main-container">
        <!-- 可选列 -->
        <div class="enable-column-box">
          <header class="label-header">可添加的列</header>
          <div class="tabs-region">
            <Tabs v-model:activeKey="activeKey" tab-position="left" style="height: 460px">
              <TabPane v-for="item in groupColumn" :key="item.label" :tab="item.label">
                <div class="tab-pane">
                  <div class="label">
                    {{ item.label }}
                    <Checkbox :indeterminate="indeterminate" @change="handleAllChecked" :checked="checkAll">
                      {{ checkAll ? '反选' : '全选' }}
                    </Checkbox>
                  </div>
                  <div style="width: 355px; display: flex; flex-wrap: wrap; row-gap: 12px">
                    <Checkbox
                      style="flex-basis: 50%; flex-shrink: 0; flex-grow: 1"
                      v-for="child in item.children"
                      :key="child.dataIndex"
                      :checked="checkedList.includes(child.dataIndex)"
                      @change="(e) => handleCheckedChange(e, child.dataIndex)"
                    >
                      {{ child.title }}
                    </Checkbox>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
        <!-- 选中列 -->
        <div class="select-cloumn-box">
          <header class="label-header">已选中普通列{{ commonList?.length ?? 0 }}项</header>
          <draggable
            group="people"
            :list="commonList"
            :force-fallback="true"
            class="list-group"
            chosen-class="chosen"
            ghost-class="ghost"
            animation="300"
            item-key="id"
          >
            <template #item="{ element }">
              <div class="list-group-item">
                <Tag class="tag" :key="element" closable @close="handleCloseTag(element)">
                  <div v-ellipsis="[150, 1]">
                    <DragOutlined />
                    <span>
                      {{ columnsMap[element]?.title }}
                    </span>
                  </div>
                </Tag>
              </div>
            </template>
          </draggable>
        </div>
        <!-- 冻结列 -->
        <div class="select-cloumn-box">
          <header class="label-header">已选中冻结列{{ fixedList?.length ?? 0 }}项</header>
          <draggable
            group="people"
            :list="fixedList"
            :force-fallback="true"
            chosen-class="chosen"
            animation="300"
            item-key="id"
          >
            <template #item="{ element }">
              <div class="list-group-item">
                <Tag class="tag" :key="element" closable chosen-class="chosen" @close="handleCloseTag(element)">
                  <div v-ellipsis="[150, 1]">
                    <DragOutlined />
                    <span>{{ columnsMap[element]?.title }}</span>
                  </div>
                </Tag>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="less" scoped>
/* 选择滚动条 */
::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background-color: #fff;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 15px;
}

/* 滚动条滑块悬停 */
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

.main-container {
  display: flex;
  column-gap: 10px;
  margin: 20px 0 0 0;
}
.label-header {
  background-color: rgb(248, 248, 249);
  color: #333333;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  font-weight: bold;
  padding-left: 30px;
}
.enable-column-box {
  height: 500px;
  flex-basis: 500px;
  border: 1px solid rgb(204, 204, 204);
  border-radius: 5px;
  .tabs-region {
    height: 460px;
    width: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    .tab-pane {
      width: 355px;
      height: 460px;
      overflow-y: auto;
      .label {
        font-size: 14px;
        font-weight: bold;
        margin: 15px 0;
      }
      ::v-deep .ant-checkbox-wrapper + .ant-checkbox-wrapper {
        margin-left: 0px;
      }
    }
  }
}
.select-cloumn-box {
  flex-basis: 200px;
  height: 500px;
  border: 1px solid rgb(204, 204, 204);
  border-radius: 5px;
  overflow-y: auto;
  .tag {
    width: 180px;
    display: block;
    height: 30px;
    font-size: 14px;
    line-height: 30px;
    border-radius: 2px;
    padding: 0 5px;
    margin: 5px auto;
    cursor: move;
    position: relative;
  }
  ::v-deep .ant-tag-close-icon {
    float: right;
    position: absolute;
    z-index: 1;
    font-size: 14px;
    right: 2px;
    top: 8px;
    cursor: pointer;
  }
}
</style>
