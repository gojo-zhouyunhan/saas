<template>
  <component :is="resolvedComponent" :data="component.data" :props-config="component.props || {}" />
</template>

<script>
import SummaryCard from './SummaryCard.vue'
import StatGrid from './StatGrid.vue'
import ReportTable from './ReportTable.vue'
import TagList from './TagList.vue'
import Timeline from './Timeline.vue'
import Checklist from './Checklist.vue'
import TextBlock from './TextBlock.vue'
import ImageText from './ImageText.vue'
import BadgeRow from './BadgeRow.vue'
import RiskPanel from './RiskPanel.vue'
import ProgressBar from './ProgressBar.vue'
import MetricList from './MetricList.vue'
import RatingList from './RatingList.vue'
import FallbackRenderer from './FallbackRenderer.vue'

const componentMap = {
  summaryCard: SummaryCard,
  statGrid: StatGrid,
  table: ReportTable,
  tagList: TagList,
  timeline: Timeline,
  checklist: Checklist,
  textBlock: TextBlock,
  imageText: ImageText,
  badgeRow: BadgeRow,
  riskPanel: RiskPanel,
  progressBar: ProgressBar,
  metricList: MetricList,
  ratingList: RatingList
}

export default {
  props: {
    component: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    resolvedComponent() {
      return componentMap[this.component.componentType] || FallbackRenderer
    }
  }
}
</script>
