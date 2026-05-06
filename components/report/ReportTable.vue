<template>
  <view class="table-wrap">
    <view v-if="columns.length" class="table-header">
      <text v-for="column in columns" :key="column.key" class="table-head-cell">{{ column.label }}</text>
    </view>
    <view v-for="(row, rowIndex) in rows" :key="rowIndex" class="table-row">
      <text v-for="column in columns" :key="column.key" class="table-cell">{{ formatDisplayValue(row[column.key]) }}</text>
    </view>
  </view>
</template>

<script>
import { ensureArray, formatDisplayValue, tableColumns } from './shared'

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    propsConfig: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    rows() {
      return ensureArray(this.data)
    },
    columns() {
      return tableColumns(this.rows, this.propsConfig.columns)
    }
  },
  methods: {
    formatDisplayValue
  }
}
</script>

<style scoped>
.table-wrap {
  border: 1rpx solid rgba(15, 23, 42, 0.12);
  border-radius: 14rpx;
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(140rpx, 1fr);
}

.table-header {
  background-color: #f3f6fb;
}

.table-row + .table-row {
  border-top: 1rpx solid #eef2f7;
}

.table-head-cell,
.table-cell {
  padding: 18rpx 16rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.table-head-cell {
  color: #6b7280;
  font-weight: 600;
}

.table-cell {
  color: #1d2129;
}
</style>
