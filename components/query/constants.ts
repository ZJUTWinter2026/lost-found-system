import type {
  CampusCode,
  FeedbackRecord,
  ItemPostType,
  ItemStatus,
  LostFoundItem,
  TimeRangeValue,
} from './types'

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000

function toIsoByHoursAgo(hoursAgo: number) {
  return new Date(Date.now() - hoursAgo * HOUR_IN_MILLISECONDS).toISOString()
}

export const ITEM_TYPE_OTHER_VALUE = '__other_item_type__'

export const ITEM_TYPE_OPTIONS = [
  { label: '证件卡类', value: '证件卡类' },
  { label: '电子设备', value: '电子设备' },
  { label: '书籍资料', value: '书籍资料' },
  { label: '衣物配饰', value: '衣物配饰' },
  { label: '钥匙门禁', value: '钥匙门禁' },
  { label: '生活用品', value: '生活用品' },
]

export const ITEM_TYPE_OPTIONS_WITH_OTHER = [
  ...ITEM_TYPE_OPTIONS,
  { label: '其它', value: ITEM_TYPE_OTHER_VALUE },
]

export const PUBLISH_TYPE_OPTIONS: Array<{ label: ItemPostType, value: ItemPostType }> = [
  { label: '失物', value: '失物' },
  { label: '招领', value: '招领' },
]

export const CAMPUS_OPTIONS: Array<{ label: string, value: CampusCode }> = [
  { label: '朝晖', value: 'ZHAO_HUI' },
  { label: '屏峰', value: 'PING_FENG' },
  { label: '莫干山', value: 'MO_GAN_SHAN' },
]

export const LOCATION_OPTIONS = [
  { label: '一食堂门口', value: '一食堂门口' },
  { label: '图书馆一楼', value: '图书馆一楼' },
  { label: '教学楼A区', value: '教学楼A区' },
  { label: '体育馆入口', value: '体育馆入口' },
  { label: '东门快递点', value: '东门快递点' },
  { label: '宿舍3号楼', value: '宿舍3号楼' },
]

export const TIME_RANGE_OPTIONS: Array<{ label: string, value: TimeRangeValue }> = [
  { label: '近24小时', value: '24h' },
  { label: '近3天', value: '3d' },
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' },
]

export const STATUS_OPTIONS: Array<{ label: ItemStatus, value: ItemStatus }> = [
  { label: '寻找中', value: '寻找中' },
  { label: '待认领', value: '待认领' },
  { label: '已归还', value: '已归还' },
]

export const TIME_RANGE_HOUR_MAP: Record<TimeRangeValue, number> = {
  '24h': 24,
  '3d': 72,
  '7d': 168,
  '30d': 720,
}

export const FEEDBACK_TYPE_OTHER_VALUE = '__other_feedback_type__'

export const FEEDBACK_TYPE_OPTIONS = [
  { label: '信息不全', value: '信息不全' },
  { label: '不实消息', value: '不实消息' },
  { label: '恶心血腥', value: '恶心血腥' },
  { label: '涉黄信息', value: '涉黄信息' },
  { label: '其它类型', value: FEEDBACK_TYPE_OTHER_VALUE },
]

export const MOCK_LOST_FOUND_ITEMS: LostFoundItem[] = [
  {
    id: 'LF-0001',
    name: '校园卡',
    itemType: '证件卡类',
    location: '一食堂门口',
    occurredAt: toIsoByHoursAgo(5),
    status: '寻找中',
    postType: '失物',
    description: '蓝色卡套内的校园卡，卡面有姓名贴纸。',
    features: '卡套背面贴有白色星星贴纸。',
    storageLocation: '保卫处失物柜 A-01',
    claimCount: 1,
    contact: '张老师 138****0210',
    hasReward: true,
    rewardRemark: '核对信息无误后酬谢 50 元',
    photos: ['/file.svg'],
  },
  {
    id: 'LF-0002',
    name: '黑色双肩包',
    itemType: '生活用品',
    location: '图书馆一楼',
    occurredAt: toIsoByHoursAgo(10),
    status: '待认领',
    postType: '招领',
    description: '黑色双肩包，内有笔记本和水杯。',
    features: '肩带上有橙色挂饰。',
    storageLocation: '图书馆服务台',
    claimCount: 2,
    contact: '李同学 139****5023',
    hasReward: false,
    photos: ['/file.svg', '/globe.svg'],
  },
  {
    id: 'LF-0003',
    name: 'AirPods 充电盒',
    itemType: '电子设备',
    location: '教学楼A区',
    occurredAt: toIsoByHoursAgo(18),
    status: '寻找中',
    postType: '失物',
    description: '白色 AirPods 充电盒，外壳有透明保护套。',
    features: '保护套侧面有字母 M 的贴纸。',
    storageLocation: '教学楼值班室',
    claimCount: 0,
    contact: '王同学 186****8842',
    hasReward: true,
    rewardRemark: '可提供饮料感谢',
    photos: ['/globe.svg'],
  },
  {
    id: 'LF-0004',
    name: '课程笔记本',
    itemType: '书籍资料',
    location: '教学楼A区',
    occurredAt: toIsoByHoursAgo(26),
    status: '待认领',
    postType: '招领',
    description: '线圈笔记本，封面写有“高数笔记”。',
    features: '封面右下角有蓝色贴纸。',
    storageLocation: '教学楼值班室',
    claimCount: 3,
    contact: '教学办 150****1880',
    hasReward: false,
    photos: ['/file.svg'],
  },
  {
    id: 'LF-0005',
    name: '钥匙串',
    itemType: '钥匙门禁',
    location: '宿舍3号楼',
    occurredAt: toIsoByHoursAgo(35),
    status: '寻找中',
    postType: '失物',
    description: '一串钥匙含宿舍门禁卡和两把钥匙。',
    features: '钥匙圈为银色，挂有蓝色卡通吊坠。',
    storageLocation: '宿舍阿姨值班处',
    claimCount: 1,
    contact: '宿管中心 137****1122',
    hasReward: false,
    photos: ['/file.svg'],
  },
  {
    id: 'LF-0006',
    name: '灰色外套',
    itemType: '衣物配饰',
    location: '体育馆入口',
    occurredAt: toIsoByHoursAgo(46),
    status: '待认领',
    postType: '招领',
    description: '灰色连帽外套，口袋里有纸巾。',
    features: '袖口有轻微磨损。',
    storageLocation: '体育馆前台',
    claimCount: 0,
    contact: '前台老师 151****9008',
    hasReward: false,
    photos: ['/next.svg'],
  },
  {
    id: 'LF-0007',
    name: '身份证',
    itemType: '证件卡类',
    location: '东门快递点',
    occurredAt: toIsoByHoursAgo(60),
    status: '待认领',
    postType: '招领',
    description: '身份证一张，已交由快递点保管。',
    features: '证件表面完好。',
    storageLocation: '东门快递点柜台',
    claimCount: 4,
    contact: '快递点值班 188****6902',
    hasReward: false,
    photos: ['/file.svg'],
  },
  {
    id: 'LF-0008',
    name: '蓝牙鼠标',
    itemType: '电子设备',
    location: '图书馆一楼',
    occurredAt: toIsoByHoursAgo(84),
    status: '已归还',
    postType: '失物',
    description: '黑色蓝牙鼠标，底部贴有编号标签。',
    features: '滚轮处略有掉漆。',
    storageLocation: '图书馆服务台',
    claimCount: 2,
    contact: '图书馆管理员 136****0029',
    hasReward: false,
    photos: ['/globe.svg'],
  },
  {
    id: 'LF-0009',
    name: '金属保温杯',
    itemType: '生活用品',
    location: '一食堂门口',
    occurredAt: toIsoByHoursAgo(100),
    status: '寻找中',
    postType: '失物',
    description: '银色保温杯，杯盖有裂纹。',
    features: '杯身贴有“CHEM”字样贴纸。',
    storageLocation: '一食堂服务台',
    claimCount: 0,
    contact: '食堂值班 131****5507',
    hasReward: false,
    photos: ['/next.svg'],
  },
  {
    id: 'LF-0010',
    name: '计算机网络教材',
    itemType: '书籍资料',
    location: '宿舍3号楼',
    occurredAt: toIsoByHoursAgo(130),
    status: '待认领',
    postType: '招领',
    description: '教材封面为蓝白色，内页有笔记。',
    features: '扉页写有班级信息。',
    storageLocation: '宿舍3号楼门卫室',
    claimCount: 1,
    contact: '门卫室 132****3006',
    hasReward: false,
    photos: ['/file.svg'],
  },
  {
    id: 'LF-0011',
    name: '门禁卡',
    itemType: '钥匙门禁',
    location: '体育馆入口',
    occurredAt: toIsoByHoursAgo(180),
    status: '寻找中',
    postType: '失物',
    description: '白色门禁卡，已挂失处理中。',
    features: '卡片背面写有手机号后四位。',
    storageLocation: '体育馆前台',
    claimCount: 0,
    contact: '陈同学 187****3308',
    hasReward: false,
    photos: ['/file.svg'],
  },
  {
    id: 'LF-0012',
    name: '黑框眼镜',
    itemType: '衣物配饰',
    location: '东门快递点',
    occurredAt: toIsoByHoursAgo(300),
    status: '已归还',
    postType: '招领',
    description: '黑色镜框，带灰色眼镜盒。',
    features: '镜腿内侧刻有品牌字样。',
    storageLocation: '东门快递点失物柜',
    claimCount: 2,
    contact: '快递点值班 188****6902',
    hasReward: false,
    photos: ['/globe.svg'],
  },
]

export const INITIAL_FEEDBACK_RECORDS: FeedbackRecord[] = [
  {
    id: 'FDBK-20260215-01',
    types: ['信息不全'],
    description: '物品描述缺少关键特征，建议补充可识别信息。',
    createdAt: toIsoByHoursAgo(144),
    status: '处理中',
    source: '意见箱',
  },
  {
    id: 'FDBK-20260211-02',
    types: ['不实消息'],
    description: '该条信息与现场情况不符，建议管理员复核。',
    createdAt: toIsoByHoursAgo(240),
    status: '已处理',
    source: '反馈页',
  },
]
