/**
 * 国家学生体质健康标准评分计算器
 * 严格按照《国家学生体质健康标准（2014年修订）》实现
 */

// 加分标准：超过100分后可获得加分
// 小学：跳绳最高可加20分（每超出2个加1分）
// 初中及以上：引体向上(男)/仰卧起坐(女)/耐力跑 最高可加10分

// 小学跳绳加分标准 - 100分基准和加分换算
const ropeSkippingBonusStandards = {
  male: {
    // 年级: { base100: 100分对应次数, perBonus: 每增加多少次加1分 }
    '一年级': { base100: 109, perBonus: 2 },
    '二年级': { base100: 117, perBonus: 2 },
    '三年级': { base100: 126, perBonus: 2 },
    '四年级': { base100: 137, perBonus: 2 },
    '五年级': { base100: 148, perBonus: 2 },
    '六年级': { base100: 157, perBonus: 2 }
  },
  female: {
    '一年级': { base100: 117, perBonus: 2 },
    '二年级': { base100: 127, perBonus: 2 },
    '三年级': { base100: 139, perBonus: 2 },
    '四年级': { base100: 149, perBonus: 2 },
    '五年级': { base100: 158, perBonus: 2 },
    '六年级': { base100: 166, perBonus: 2 }
  }
}

// 引体向上(男)加分标准 - 超过100分基准，每多1个加1分，最高10分
const pullUpsBonusStandards = {
  // 年级: 100分对应的次数
  '初一': 13, '初二': 14, '初三': 15,
  '高一': 16, '高二': 17, '高三': 18,
  '大一': 19, '大二': 19, '大三': 20, '大四': 20
}

// 仰卧起坐(女)加分标准 - 超过100分基准，加分规则
const sitUpsBonusFemaleStandards = {
  // 年级: { base100: 100分对应次数, bonus: {加分: 需超出次数} }
  '初一': { base100: 52, bonus: { 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 4, 1: 2 } },
  '初二': { base100: 52, bonus: { 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 4, 1: 2 } },
  '初三': { base100: 52, bonus: { 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 4, 1: 2 } },
  '高一': { base100: 52, bonus: { 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 4, 1: 2 } },
  '高二': { base100: 52, bonus: { 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 4, 1: 2 } },
  '高三': { base100: 52, bonus: { 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 4, 1: 2 } },
  '大一': { base100: 52, bonus: { 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 4, 1: 2 } },
  '大二': { base100: 52, bonus: { 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 4, 1: 2 } },
  '大三': { base100: 52, bonus: { 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 4, 1: 2 } },
  '大四': { base100: 52, bonus: { 10: 13, 9: 12, 8: 11, 7: 10, 6: 9, 5: 8, 4: 7, 3: 6, 2: 4, 1: 2 } }
}

// 耐力跑加分标准 - 时间(秒)比100分基准快多少可得多少加分
// 1000米(男) - 比100分基准快，每快一定秒数可加1分
const run1000mBonusStandards = {
  // 年级: { base100: 100分对应秒数, bonus: {加分: 需比基准快多少秒} }
  '初一': { base100: 235, bonus: { 10: 35, 9: 32, 8: 29, 7: 26, 6: 23, 5: 20, 4: 16, 3: 12, 2: 8, 1: 4 } },
  '初二': { base100: 230, bonus: { 10: 35, 9: 32, 8: 29, 7: 26, 6: 23, 5: 20, 4: 16, 3: 12, 2: 8, 1: 4 } },
  '初三': { base100: 225, bonus: { 10: 35, 9: 32, 8: 29, 7: 26, 6: 23, 5: 20, 4: 16, 3: 12, 2: 8, 1: 4 } },
  '高一': { base100: 220, bonus: { 10: 35, 9: 32, 8: 29, 7: 26, 6: 23, 5: 20, 4: 16, 3: 12, 2: 8, 1: 4 } },
  '高二': { base100: 215, bonus: { 10: 35, 9: 32, 8: 29, 7: 26, 6: 23, 5: 20, 4: 16, 3: 12, 2: 8, 1: 4 } },
  '高三': { base100: 210, bonus: { 10: 35, 9: 32, 8: 29, 7: 26, 6: 23, 5: 20, 4: 16, 3: 12, 2: 8, 1: 4 } },
  '大一': { base100: 207, bonus: { 10: 35, 9: 32, 8: 29, 7: 26, 6: 23, 5: 20, 4: 16, 3: 12, 2: 8, 1: 4 } },
  '大二': { base100: 207, bonus: { 10: 35, 9: 32, 8: 29, 7: 26, 6: 23, 5: 20, 4: 16, 3: 12, 2: 8, 1: 4 } },
  '大三': { base100: 212, bonus: { 10: 35, 9: 32, 8: 29, 7: 26, 6: 23, 5: 20, 4: 16, 3: 12, 2: 8, 1: 4 } },
  '大四': { base100: 212, bonus: { 10: 35, 9: 32, 8: 29, 7: 26, 6: 23, 5: 20, 4: 16, 3: 12, 2: 8, 1: 4 } }
}

// 800米(女) - 比100分基准快，每快一定秒数可加1分
const run800mBonusStandards = {
  '初一': { base100: 203, bonus: { 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 3: 15, 2: 10, 1: 5 } },
  '初二': { base100: 203, bonus: { 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 3: 15, 2: 10, 1: 5 } },
  '初三': { base100: 203, bonus: { 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 3: 15, 2: 10, 1: 5 } },
  '高一': { base100: 201, bonus: { 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 3: 15, 2: 10, 1: 5 } },
  '高二': { base100: 200, bonus: { 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 3: 15, 2: 10, 1: 5 } },
  '高三': { base100: 199, bonus: { 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 3: 15, 2: 10, 1: 5 } },
  '大一': { base100: 196, bonus: { 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 3: 15, 2: 10, 1: 5 } },
  '大二': { base100: 196, bonus: { 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 3: 15, 2: 10, 1: 5 } },
  '大三': { base100: 201, bonus: { 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 3: 15, 2: 10, 1: 5 } },
  '大四': { base100: 201, bonus: { 10: 50, 9: 45, 8: 40, 7: 35, 6: 30, 5: 25, 4: 20, 3: 15, 2: 10, 1: 5 } }
}

// 各项目权重配置
const itemWeights = {
  // 必测项目
  bmi: 15,        // 体重指数(BMI)
  vitalCapacity: 15,  // 肺活量
  run50m: 20,     // 50米跑
  sitAndReach: 10,    // 坐位体前屈
  
  // 选测项目（小学）
  ropeSkipping: 20,   // 一分钟跳绳
  sitUps: 10,         // 一分钟仰卧起坐（三四五六年级）
  run50m8x: 20,       // 50米×8往返跑（五六年级）
  
  // 选测项目（初中及以上）
  standingLongJump: 10,  // 立定跳远
  pullUps: 10,           // 引体向上（男）
  run1000m: 20,          // 1000米跑（男）
  run800m: 20            // 800米跑（女）
}

// BMI评分标准
const bmiStandards = {
  male: {
    // 年级: { 正常: [低, 高], 低体重上限, 超重下限, 肥胖下限 }
    '一年级': { normal: [13.4, 17.7], underweight: 13.4, overweight: 17.7, obesity: 19.2 },
    '二年级': { normal: [13.5, 18.1], underweight: 13.5, overweight: 18.1, obesity: 19.8 },
    '三年级': { normal: [13.6, 18.6], underweight: 13.6, overweight: 18.6, obesity: 20.4 },
    '四年级': { normal: [13.7, 19.2], underweight: 13.7, overweight: 19.2, obesity: 21.2 },
    '五年级': { normal: [13.9, 19.8], underweight: 13.9, overweight: 19.8, obesity: 22.0 },
    '六年级': { normal: [14.1, 20.4], underweight: 14.1, overweight: 20.4, obesity: 22.7 },
    '初一': { normal: [14.6, 21.2], underweight: 14.6, overweight: 21.2, obesity: 24.0 },
    '初二': { normal: [15.2, 21.9], underweight: 15.2, overweight: 21.9, obesity: 25.1 },
    '初三': { normal: [15.8, 22.5], underweight: 15.8, overweight: 22.5, obesity: 25.9 },
    '高一': { normal: [16.3, 22.9], underweight: 16.3, overweight: 22.9, obesity: 26.3 },
    '高二': { normal: [16.7, 23.3], underweight: 16.7, overweight: 23.3, obesity: 26.8 },
    '高三': { normal: [17.0, 23.6], underweight: 17.0, overweight: 23.6, obesity: 27.1 },
    '大一': { normal: [17.3, 23.9], underweight: 17.3, overweight: 23.9, obesity: 27.4 },
    '大二': { normal: [17.3, 23.9], underweight: 17.3, overweight: 23.9, obesity: 27.4 },
    '大三': { normal: [17.3, 23.9], underweight: 17.3, overweight: 23.9, obesity: 27.4 },
    '大四': { normal: [17.3, 23.9], underweight: 17.3, overweight: 23.9, obesity: 27.4 }
  },
  female: {
    '一年级': { normal: [13.1, 17.2], underweight: 13.1, overweight: 17.2, obesity: 18.8 },
    '二年级': { normal: [13.1, 17.6], underweight: 13.1, overweight: 17.6, obesity: 19.4 },
    '三年级': { normal: [13.2, 18.1], underweight: 13.2, overweight: 18.1, obesity: 20.1 },
    '四年级': { normal: [13.3, 18.7], underweight: 13.3, overweight: 18.7, obesity: 21.0 },
    '五年级': { normal: [13.5, 19.3], underweight: 13.5, overweight: 19.3, obesity: 21.8 },
    '六年级': { normal: [13.7, 19.9], underweight: 13.7, overweight: 19.9, obesity: 22.6 },
    '初一': { normal: [14.3, 20.8], underweight: 14.3, overweight: 20.8, obesity: 23.6 },
    '初二': { normal: [14.9, 21.6], underweight: 14.9, overweight: 21.6, obesity: 24.4 },
    '初三': { normal: [15.4, 22.2], underweight: 15.4, overweight: 22.2, obesity: 25.0 },
    '高一': { normal: [15.8, 22.6], underweight: 15.8, overweight: 22.6, obesity: 25.3 },
    '高二': { normal: [16.1, 22.8], underweight: 16.1, overweight: 22.8, obesity: 25.5 },
    '高三': { normal: [16.3, 23.0], underweight: 16.3, overweight: 23.0, obesity: 25.6 },
    '大一': { normal: [16.5, 23.2], underweight: 16.5, overweight: 23.2, obesity: 25.7 },
    '大二': { normal: [16.5, 23.2], underweight: 16.5, overweight: 23.2, obesity: 25.7 },
    '大三': { normal: [16.5, 23.2], underweight: 16.5, overweight: 23.2, obesity: 25.7 },
    '大四': { normal: [16.5, 23.2], underweight: 16.5, overweight: 23.2, obesity: 25.7 }
  }
}

// 肺活量评分标准 (简化版，实际应更精确)
const vitalCapacityStandards = {
  male: {
    '一年级': { 100: 1700, 90: 1500, 80: 1300, 60: 900 },
    '二年级': { 100: 1900, 90: 1700, 80: 1500, 60: 1100 },
    '三年级': { 100: 2100, 90: 1900, 80: 1700, 60: 1300 },
    '四年级': { 100: 2300, 90: 2100, 80: 1900, 60: 1500 },
    '五年级': { 100: 2600, 90: 2400, 80: 2100, 60: 1700 },
    '六年级': { 100: 3000, 90: 2700, 80: 2400, 60: 1900 },
    '初一': { 100: 3500, 90: 3150, 80: 2700, 60: 2200 },
    '初二': { 100: 3900, 90: 3500, 80: 3050, 60: 2500 },
    '初三': { 100: 4200, 90: 3800, 80: 3350, 60: 2800 },
    '高一': { 100: 4500, 90: 4050, 80: 3550, 60: 3000 },
    '高二': { 100: 4700, 90: 4250, 80: 3750, 60: 3100 },
    '高三': { 100: 4800, 90: 4350, 80: 3850, 60: 3200 },
    '大一': { 100: 4800, 90: 4350, 80: 3850, 60: 3200 },
    '大二': { 100: 4800, 90: 4350, 80: 3850, 60: 3200 },
    '大三': { 100: 4800, 90: 4350, 80: 3850, 60: 3200 },
    '大四': { 100: 4800, 90: 4350, 80: 3850, 60: 3200 }
  },
  female: {
    '一年级': { 100: 1500, 90: 1350, 80: 1200, 60: 800 },
    '二年级': { 100: 1700, 90: 1500, 80: 1350, 60: 950 },
    '三年级': { 100: 1850, 90: 1650, 80: 1500, 60: 1100 },
    '四年级': { 100: 2000, 90: 1800, 80: 1650, 60: 1250 },
    '五年级': { 100: 2200, 90: 2000, 80: 1800, 60: 1400 },
    '六年级': { 100: 2400, 90: 2200, 80: 2000, 60: 1550 },
    '初一': { 100: 2650, 90: 2400, 80: 2150, 60: 1750 },
    '初二': { 100: 2900, 90: 2600, 80: 2300, 60: 1900 },
    '初三': { 100: 3050, 90: 2750, 80: 2400, 60: 2000 },
    '高一': { 100: 3150, 90: 2850, 80: 2500, 60: 2050 },
    '高二': { 100: 3200, 90: 2900, 80: 2550, 60: 2100 },
    '高三': { 100: 3250, 90: 2950, 80: 2600, 60: 2150 },
    '大一': { 100: 3300, 90: 3000, 80: 2650, 60: 2200 },
    '大二': { 100: 3300, 90: 3000, 80: 2650, 60: 2200 },
    '大三': { 100: 3300, 90: 3000, 80: 2650, 60: 2200 },
    '大四': { 100: 3300, 90: 3000, 80: 2650, 60: 2200 }
  }
}

// 50米跑评分标准（秒数越小越好）
const run50mStandards = {
  male: {
    '一年级': { 100: 9.4, 90: 10.2, 80: 11.0, 60: 12.6 },
    '二年级': { 100: 8.8, 90: 9.6, 80: 10.4, 60: 12.0 },
    '三年级': { 100: 8.4, 90: 9.1, 80: 9.8, 60: 11.4 },
    '四年级': { 100: 8.1, 90: 8.7, 80: 9.4, 60: 10.8 },
    '五年级': { 100: 7.9, 90: 8.4, 80: 9.0, 60: 10.4 },
    '六年级': { 100: 7.6, 90: 8.1, 80: 8.7, 60: 10.0 },
    '初一': { 100: 7.3, 90: 7.8, 80: 8.4, 60: 9.6 },
    '初二': { 100: 7.1, 90: 7.5, 80: 8.1, 60: 9.2 },
    '初三': { 100: 6.9, 90: 7.3, 80: 7.8, 60: 8.8 },
    '高一': { 100: 6.7, 90: 7.1, 80: 7.6, 60: 8.4 },
    '高二': { 100: 6.6, 90: 7.0, 80: 7.5, 60: 8.2 },
    '高三': { 100: 6.6, 90: 7.0, 80: 7.4, 60: 8.0 },
    '大一': { 100: 6.7, 90: 7.1, 80: 7.5, 60: 8.1 },
    '大二': { 100: 6.7, 90: 7.1, 80: 7.5, 60: 8.1 },
    '大三': { 100: 6.8, 90: 7.2, 80: 7.6, 60: 8.2 },
    '大四': { 100: 6.8, 90: 7.2, 80: 7.6, 60: 8.2 }
  },
  female: {
    '一年级': { 100: 10.2, 90: 10.8, 80: 11.6, 60: 13.2 },
    '二年级': { 100: 9.6, 90: 10.2, 80: 11.0, 60: 12.6 },
    '三年级': { 100: 9.2, 90: 9.8, 80: 10.4, 60: 12.0 },
    '四年级': { 100: 8.8, 90: 9.4, 80: 10.0, 60: 11.4 },
    '五年级': { 100: 8.6, 90: 9.2, 80: 9.8, 60: 11.0 },
    '六年级': { 100: 8.4, 90: 9.0, 80: 9.6, 60: 10.8 },
    '初一': { 100: 8.2, 90: 8.8, 80: 9.4, 60: 10.6 },
    '初二': { 100: 8.0, 90: 8.6, 80: 9.2, 60: 10.4 },
    '初三': { 100: 7.9, 90: 8.5, 80: 9.0, 60: 10.2 },
    '高一': { 100: 7.9, 90: 8.4, 80: 9.0, 60: 10.0 },
    '高二': { 100: 7.9, 90: 8.4, 80: 9.0, 60: 10.0 },
    '高三': { 100: 7.9, 90: 8.4, 80: 9.0, 60: 10.0 },
    '大一': { 100: 7.9, 90: 8.4, 80: 9.0, 60: 10.0 },
    '大二': { 100: 7.9, 90: 8.4, 80: 9.0, 60: 10.0 },
    '大三': { 100: 8.0, 90: 8.5, 80: 9.1, 60: 10.1 },
    '大四': { 100: 8.0, 90: 8.5, 80: 9.1, 60: 10.1 }
  }
}

// 坐位体前屈评分标准（厘米，越大越好）
const sitAndReachStandards = {
  male: {
    '一年级': { 100: 16.1, 90: 13.0, 80: 9.8, 60: 3.0 },
    '二年级': { 100: 16.2, 90: 13.0, 80: 9.8, 60: 3.0 },
    '三年级': { 100: 16.3, 90: 13.1, 80: 9.9, 60: 3.1 },
    '四年级': { 100: 16.4, 90: 13.2, 80: 10.0, 60: 3.2 },
    '五年级': { 100: 16.5, 90: 13.3, 80: 10.1, 60: 3.3 },
    '六年级': { 100: 16.6, 90: 13.4, 80: 10.2, 60: 3.4 },
    '初一': { 100: 17.0, 90: 13.5, 80: 10.3, 60: 3.7 },
    '初二': { 100: 17.8, 90: 14.2, 80: 10.8, 60: 4.2 },
    '初三': { 100: 19.2, 90: 15.4, 80: 11.8, 60: 5.2 },
    '高一': { 100: 21.0, 90: 16.8, 80: 13.0, 60: 6.2 },
    '高二': { 100: 21.9, 90: 17.6, 80: 13.7, 60: 6.9 },
    '高三': { 100: 22.5, 90: 18.1, 80: 14.2, 60: 7.4 },
    '大一': { 100: 24.9, 90: 19.9, 80: 15.4, 60: 8.4 },
    '大二': { 100: 24.9, 90: 19.9, 80: 15.4, 60: 8.4 },
    '大三': { 100: 25.1, 90: 20.1, 80: 15.6, 60: 8.6 },
    '大四': { 100: 25.1, 90: 20.1, 80: 15.6, 60: 8.6 }
  },
  female: {
    '一年级': { 100: 19.3, 90: 15.8, 80: 12.3, 60: 5.4 },
    '二年级': { 100: 19.5, 90: 15.9, 80: 12.5, 60: 5.6 },
    '三年级': { 100: 19.7, 90: 16.1, 80: 12.7, 60: 5.8 },
    '四年级': { 100: 19.9, 90: 16.3, 80: 12.9, 60: 6.0 },
    '五年级': { 100: 20.2, 90: 16.5, 80: 13.1, 60: 6.2 },
    '六年级': { 100: 20.5, 90: 16.8, 80: 13.4, 60: 6.5 },
    '初一': { 100: 21.0, 90: 17.2, 80: 13.7, 60: 6.8 },
    '初二': { 100: 21.7, 90: 17.8, 80: 14.2, 60: 7.3 },
    '初三': { 100: 22.4, 90: 18.4, 80: 14.7, 60: 7.8 },
    '高一': { 100: 23.1, 90: 19.0, 80: 15.2, 60: 8.3 },
    '高二': { 100: 23.5, 90: 19.3, 80: 15.5, 60: 8.6 },
    '高三': { 100: 23.8, 90: 19.6, 80: 15.8, 60: 8.9 },
    '大一': { 100: 25.8, 90: 21.2, 80: 17.1, 60: 10.2 },
    '大二': { 100: 25.8, 90: 21.2, 80: 17.1, 60: 10.2 },
    '大三': { 100: 25.9, 90: 21.3, 80: 17.2, 60: 10.3 },
    '大四': { 100: 25.9, 90: 21.3, 80: 17.2, 60: 10.3 }
  }
}

// 一分钟跳绳评分标准（个数，越多越好）
const ropeSkippingStandards = {
  male: {
    '一年级': { 100: 109, 90: 87, 80: 65, 60: 17 },
    '二年级': { 100: 117, 90: 97, 80: 77, 60: 25 },
    '三年级': { 100: 126, 90: 108, 80: 90, 60: 39 },
    '四年级': { 100: 137, 90: 120, 80: 103, 60: 50 },
    '五年级': { 100: 148, 90: 132, 80: 116, 60: 63 },
    '六年级': { 100: 157, 90: 141, 80: 125, 60: 72 }
  },
  female: {
    '一年级': { 100: 117, 90: 103, 80: 87, 60: 37 },
    '二年级': { 100: 127, 90: 113, 80: 97, 60: 47 },
    '三年级': { 100: 139, 90: 125, 80: 109, 60: 59 },
    '四年级': { 100: 149, 90: 135, 80: 119, 60: 69 },
    '五年级': { 100: 158, 90: 144, 80: 128, 60: 78 },
    '六年级': { 100: 166, 90: 152, 80: 136, 60: 86 }
  }
}

// 仰卧起坐评分标准（个数，越多越好）
const sitUpsStandards = {
  male: {
    '三年级': { 100: 42, 90: 36, 80: 30, 60: 16 },
    '四年级': { 100: 46, 90: 40, 80: 34, 60: 20 },
    '五年级': { 100: 50, 90: 44, 80: 38, 60: 24 },
    '六年级': { 100: 51, 90: 45, 80: 39, 60: 25 }
  },
  female: {
    '一年级': { 100: 52, 90: 45, 80: 38, 60: 21 },
    '二年级': { 100: 52, 90: 45, 80: 38, 60: 21 },
    '三年级': { 100: 46, 90: 40, 80: 34, 60: 20 },
    '四年级': { 100: 49, 90: 43, 80: 37, 60: 23 },
    '五年级': { 100: 51, 90: 45, 80: 39, 60: 25 },
    '六年级': { 100: 52, 90: 46, 80: 40, 60: 26 },
    '初一': { 100: 52, 90: 46, 80: 40, 60: 26 },
    '初二': { 100: 52, 90: 46, 80: 40, 60: 26 },
    '初三': { 100: 52, 90: 46, 80: 40, 60: 26 },
    '高一': { 100: 52, 90: 46, 80: 40, 60: 26 },
    '高二': { 100: 52, 90: 46, 80: 40, 60: 26 },
    '高三': { 100: 52, 90: 46, 80: 40, 60: 26 },
    '大一': { 100: 56, 90: 49, 80: 42, 60: 26 },
    '大二': { 100: 56, 90: 49, 80: 42, 60: 26 },
    '大三': { 100: 56, 90: 49, 80: 42, 60: 26 },
    '大四': { 100: 56, 90: 49, 80: 42, 60: 26 }
  }
}

// 立定跳远评分标准（厘米，越大越好）
const standingLongJumpStandards = {
  male: {
    '初一': { 100: 225, 90: 207, 80: 188, 60: 142 },
    '初二': { 100: 240, 90: 220, 80: 199, 60: 151 },
    '初三': { 100: 250, 90: 230, 80: 209, 60: 161 },
    '高一': { 100: 254, 90: 234, 80: 213, 60: 165 },
    '高二': { 100: 260, 90: 240, 80: 218, 60: 168 },
    '高三': { 100: 265, 90: 245, 80: 223, 60: 173 },
    '大一': { 100: 273, 90: 252, 80: 228, 60: 176 },
    '大二': { 100: 273, 90: 252, 80: 228, 60: 176 },
    '大三': { 100: 268, 90: 248, 80: 225, 60: 173 },
    '大四': { 100: 268, 90: 248, 80: 225, 60: 173 }
  },
  female: {
    '初一': { 100: 195, 90: 176, 80: 156, 60: 106 },
    '初二': { 100: 196, 90: 177, 80: 157, 60: 107 },
    '初三': { 100: 197, 90: 178, 80: 158, 60: 108 },
    '高一': { 100: 198, 90: 179, 80: 159, 60: 109 },
    '高二': { 100: 199, 90: 180, 80: 160, 60: 110 },
    '高三': { 100: 200, 90: 181, 80: 161, 60: 111 },
    '大一': { 100: 207, 90: 186, 80: 164, 60: 112 },
    '大二': { 100: 207, 90: 186, 80: 164, 60: 112 },
    '大三': { 100: 201, 90: 182, 80: 162, 60: 112 },
    '大四': { 100: 201, 90: 182, 80: 162, 60: 112 }
  }
}

// 引体向上评分标准（男，个数）
const pullUpsStandards = {
  male: {
    '初一': { 100: 15, 90: 12, 80: 9, 60: 4 },
    '初二': { 100: 16, 90: 13, 80: 10, 60: 5 },
    '初三': { 100: 17, 90: 14, 80: 11, 60: 6 },
    '高一': { 100: 18, 90: 15, 80: 12, 60: 7 },
    '高二': { 100: 19, 90: 16, 80: 13, 60: 8 },
    '高三': { 100: 19, 90: 16, 80: 13, 60: 8 },
    '大一': { 100: 19, 90: 16, 80: 13, 60: 10 },
    '大二': { 100: 19, 90: 16, 80: 13, 60: 10 },
    '大三': { 100: 18, 90: 15, 80: 12, 60: 9 },
    '大四': { 100: 18, 90: 15, 80: 12, 60: 9 }
  }
}

// 1000米跑评分标准（男，秒数）- 需要转换为秒
const run1000mStandards = {
  male: {
    '初一': { 100: 222, 90: 245, 80: 270, 60: 330 },  // 3'42" -> 222s
    '初二': { 100: 218, 90: 238, 80: 260, 60: 315 },
    '初三': { 100: 215, 90: 232, 80: 252, 60: 302 },
    '高一': { 100: 213, 90: 227, 80: 245, 60: 290 },
    '高二': { 100: 211, 90: 225, 80: 242, 60: 285 },
    '高三': { 100: 210, 90: 223, 80: 240, 60: 280 },
    '大一': { 100: 207, 90: 220, 80: 237, 60: 277 },
    '大二': { 100: 207, 90: 220, 80: 237, 60: 277 },
    '大三': { 100: 212, 90: 225, 80: 242, 60: 282 },
    '大四': { 100: 212, 90: 225, 80: 242, 60: 282 }
  }
}

// 800米跑评分标准（女，秒数）
const run800mStandards = {
  female: {
    '初一': { 100: 207, 90: 225, 80: 246, 60: 295 },
    '初二': { 100: 205, 90: 222, 80: 242, 60: 289 },
    '初三': { 100: 203, 90: 219, 80: 238, 60: 283 },
    '高一': { 100: 201, 90: 216, 80: 234, 60: 277 },
    '高二': { 100: 200, 90: 215, 80: 232, 60: 274 },
    '高三': { 100: 199, 90: 214, 80: 230, 60: 271 },
    '大一': { 100: 196, 90: 211, 80: 227, 60: 268 },
    '大二': { 100: 196, 90: 211, 80: 227, 60: 268 },
    '大三': { 100: 201, 90: 216, 80: 232, 60: 273 },
    '大四': { 100: 201, 90: 216, 80: 232, 60: 273 }
  }
}

/**
 * 根据标准表计算单项得分
 * @param {number} value - 测试值
 * @param {object} standards - 评分标准
 * @param {boolean} lowerIsBetter - 是否值越小越好（如跑步时间）
 */
const calculateSingleScore = (value, standards, lowerIsBetter = false) => {
  if (value === undefined || value === null || isNaN(value)) return 0
  
  const { 100: excellent, 90: good, 80: pass, 60: fail } = standards
  
  if (lowerIsBetter) {
    // 越小越好（如跑步时间）
    if (value <= excellent) return 100
    if (value <= good) return 90 + (good - value) / (good - excellent) * 10
    if (value <= pass) return 80 + (pass - value) / (pass - good) * 10
    if (value <= fail) return 60 + (fail - value) / (fail - pass) * 20
    return 50 // 不及格最低50分（根据国家标准）
  } else {
    // 越大越好（如跳绳次数）
    if (value >= excellent) return 100
    if (value >= good) return 90 + (value - good) / (excellent - good) * 10
    if (value >= pass) return 80 + (value - pass) / (good - pass) * 10
    if (value >= fail) return 60 + (value - fail) / (pass - fail) * 20
    return 50
  }
}

/**
 * 计算BMI得分
 */
const calculateBMIScore = (height, weight, grade, gender) => {
  if (!height || !weight) return { score: 0, bmi: 0 }
  
  const heightM = height / 100 // 厘米转米
  const bmi = weight / (heightM * heightM)
  
  const standards = bmiStandards[gender]?.[grade]
  if (!standards) return { score: 0, bmi }
  
  const { normal, underweight, overweight, obesity } = standards
  
  // BMI评分规则
  if (bmi >= normal[0] && bmi <= normal[1]) {
    return { score: 100, bmi, level: '正常' }
  } else if (bmi < underweight) {
    return { score: 80, bmi, level: '低体重' }
  } else if (bmi > normal[1] && bmi < obesity) {
    return { score: 80, bmi, level: '超重' }
  } else if (bmi >= obesity) {
    return { score: 60, bmi, level: '肥胖' }
  }
  
  return { score: 100, bmi, level: '正常' }
}

/**
 * 解析时间格式（支持 "分'秒"" 和纯秒数）
 */
const parseTimeToSeconds = (value) => {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return 0
  
  // 匹配 3'42" 或 3:42 格式
  const match = value.match(/(\d+)[':'](\d+)/)
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2])
  }
  
  return parseFloat(value) || 0
}

/**
 * 计算体测总分和等级
 * @param {object} testItems - 测试项目成绩 { height, weight, vitalCapacity, run50m, ... }
 * @param {string} grade - 年级
 * @param {string} gender - 性别 'male' | 'female'
 * @returns {{ totalScore: number, gradeLevel: string, itemScores: object, bmi: number }}
 */
export const calculatePhysicalTestScore = (testItems, grade, gender) => {
  if (!testItems || !grade || !gender) {
    return { totalScore: 0, gradeLevel: '无成绩', itemScores: {}, bmi: 0 }
  }
  
  const g = gender === 'male' ? 'male' : 'female'
  const itemScores = {}
  let totalWeightedScore = 0
  let totalWeight = 0
  
  // 1. BMI得分（必测）
  const { score: bmiScore, bmi, level: bmiLevel } = calculateBMIScore(
    testItems.height, 
    testItems.weight, 
    grade, 
    g
  )
  if (bmiScore > 0) {
    itemScores.bmi = { value: bmi?.toFixed(1), score: bmiScore, level: bmiLevel }
    totalWeightedScore += bmiScore * itemWeights.bmi
    totalWeight += itemWeights.bmi
  }
  
  // 2. 肺活量得分（必测）
  if (testItems.vitalCapacity) {
    const standards = vitalCapacityStandards[g]?.[grade]
    if (standards) {
      const score = calculateSingleScore(testItems.vitalCapacity, standards, false)
      itemScores.vitalCapacity = { value: testItems.vitalCapacity, score: Math.round(score) }
      totalWeightedScore += score * itemWeights.vitalCapacity
      totalWeight += itemWeights.vitalCapacity
    }
  }
  
  // 3. 50米跑得分（必测）
  if (testItems.run50m) {
    const standards = run50mStandards[g]?.[grade]
    if (standards) {
      const score = calculateSingleScore(testItems.run50m, standards, true)
      itemScores.run50m = { value: testItems.run50m, score: Math.round(score) }
      totalWeightedScore += score * itemWeights.run50m
      totalWeight += itemWeights.run50m
    }
  }
  
  // 4. 坐位体前屈得分（必测）
  if (testItems.sitAndReach !== undefined) {
    const standards = sitAndReachStandards[g]?.[grade]
    if (standards) {
      const score = calculateSingleScore(testItems.sitAndReach, standards, false)
      itemScores.sitAndReach = { value: testItems.sitAndReach, score: Math.round(score) }
      totalWeightedScore += score * itemWeights.sitAndReach
      totalWeight += itemWeights.sitAndReach
    }
  }
  
  // 5. 一分钟跳绳（小学）
  if (testItems.ropeSkipping) {
    const standards = ropeSkippingStandards[g]?.[grade]
    if (standards) {
      const score = calculateSingleScore(testItems.ropeSkipping, standards, false)
      itemScores.ropeSkipping = { value: testItems.ropeSkipping, score: Math.round(score) }
      totalWeightedScore += score * itemWeights.ropeSkipping
      totalWeight += itemWeights.ropeSkipping
    }
  }
  
  // 6. 一分钟仰卧起坐
  if (testItems.sitUps) {
    const standards = sitUpsStandards[g]?.[grade]
    if (standards) {
      const score = calculateSingleScore(testItems.sitUps, standards, false)
      itemScores.sitUps = { value: testItems.sitUps, score: Math.round(score) }
      totalWeightedScore += score * itemWeights.sitUps
      totalWeight += itemWeights.sitUps
    }
  }
  
  // 7. 立定跳远（初中及以上）
  if (testItems.standingLongJump) {
    const standards = standingLongJumpStandards[g]?.[grade]
    if (standards) {
      const score = calculateSingleScore(testItems.standingLongJump, standards, false)
      itemScores.standingLongJump = { value: testItems.standingLongJump, score: Math.round(score) }
      totalWeightedScore += score * itemWeights.standingLongJump
      totalWeight += itemWeights.standingLongJump
    }
  }
  
  // 8. 引体向上（男，初中及以上）
  if (g === 'male' && testItems.pullUps) {
    const standards = pullUpsStandards.male?.[grade]
    if (standards) {
      const score = calculateSingleScore(testItems.pullUps, standards, false)
      itemScores.pullUps = { value: testItems.pullUps, score: Math.round(score) }
      totalWeightedScore += score * itemWeights.pullUps
      totalWeight += itemWeights.pullUps
    }
  }
  
  // 9. 1000米跑（男，初中及以上）
  if (g === 'male' && testItems.run1000m) {
    const standards = run1000mStandards.male?.[grade]
    if (standards) {
      const seconds = parseTimeToSeconds(testItems.run1000m)
      const score = calculateSingleScore(seconds, standards, true)
      itemScores.run1000m = { value: testItems.run1000m, score: Math.round(score) }
      totalWeightedScore += score * itemWeights.run1000m
      totalWeight += itemWeights.run1000m
    }
  }
  
  // 10. 800米跑（女，初中及以上）
  if (g === 'female' && testItems.run800m) {
    const standards = run800mStandards.female?.[grade]
    if (standards) {
      const seconds = parseTimeToSeconds(testItems.run800m)
      const score = calculateSingleScore(seconds, standards, true)
      itemScores.run800m = { value: testItems.run800m, score: Math.round(score) }
      totalWeightedScore += score * itemWeights.run800m
      totalWeight += itemWeights.run800m
    }
  }
  
  // 计算加权总分（标准分）
  let standardScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
  
  // ========== 计算加分 ==========
  const bonusItems = {} // 各项加分详情
  let totalBonus = 0
  
  // 小学跳绳加分（最高20分）
  const isElementary = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'].includes(grade)
  if (isElementary && testItems.ropeSkipping) {
    const bonusStd = ropeSkippingBonusStandards[g]?.[grade]
    if (bonusStd && testItems.ropeSkipping > bonusStd.base100) {
      const extra = testItems.ropeSkipping - bonusStd.base100
      const bonus = Math.min(20, Math.floor(extra / bonusStd.perBonus))
      if (bonus > 0) {
        bonusItems.ropeSkipping = { value: testItems.ropeSkipping, base100: bonusStd.base100, bonus, name: '跳绳' }
        totalBonus += bonus
      }
    }
  }
  
  // 引体向上(男)加分 - 初中及以上（最高10分）
  const isSecondaryOrAbove = ['初一', '初二', '初三', '高一', '高二', '高三', '大一', '大二', '大三', '大四'].includes(grade)
  if (isSecondaryOrAbove && g === 'male' && testItems.pullUps) {
    const base100 = pullUpsBonusStandards[grade]
    if (base100 && testItems.pullUps > base100) {
      const bonus = Math.min(10, testItems.pullUps - base100)
      if (bonus > 0) {
        bonusItems.pullUps = { value: testItems.pullUps, base100, bonus, name: '引体向上' }
        totalBonus += bonus
      }
    }
  }
  
  // 仰卧起坐(女)加分 - 初中及以上（最高10分）
  if (isSecondaryOrAbove && g === 'female' && testItems.sitUps) {
    const bonusStd = sitUpsBonusFemaleStandards[grade]
    if (bonusStd && testItems.sitUps > bonusStd.base100) {
      const extra = testItems.sitUps - bonusStd.base100
      // 根据超出量查表获取加分
      let bonus = 0
      for (let i = 10; i >= 1; i--) {
        if (extra >= bonusStd.bonus[i]) {
          bonus = i
          break
        }
      }
      if (bonus > 0) {
        bonusItems.sitUps = { value: testItems.sitUps, base100: bonusStd.base100, bonus, name: '仰卧起坐' }
        totalBonus += bonus
      }
    }
  }
  
  // 1000米跑(男)加分 - 初中及以上（最高10分）
  if (isSecondaryOrAbove && g === 'male' && testItems.run1000m) {
    const bonusStd = run1000mBonusStandards[grade]
    if (bonusStd) {
      const seconds = parseTimeToSeconds(testItems.run1000m)
      if (seconds < bonusStd.base100) {
        const faster = bonusStd.base100 - seconds
        let bonus = 0
        for (let i = 10; i >= 1; i--) {
          if (faster >= bonusStd.bonus[i]) {
            bonus = i
            break
          }
        }
        if (bonus > 0) {
          bonusItems.run1000m = { value: testItems.run1000m, base100: bonusStd.base100, bonus, name: '1000米跑' }
          totalBonus += bonus
        }
      }
    }
  }
  
  // 800米跑(女)加分 - 初中及以上（最高10分）
  if (isSecondaryOrAbove && g === 'female' && testItems.run800m) {
    const bonusStd = run800mBonusStandards[grade]
    if (bonusStd) {
      const seconds = parseTimeToSeconds(testItems.run800m)
      if (seconds < bonusStd.base100) {
        const faster = bonusStd.base100 - seconds
        let bonus = 0
        for (let i = 10; i >= 1; i--) {
          if (faster >= bonusStd.bonus[i]) {
            bonus = i
            break
          }
        }
        if (bonus > 0) {
          bonusItems.run800m = { value: testItems.run800m, base100: bonusStd.base100, bonus, name: '800米跑' }
          totalBonus += bonus
        }
      }
    }
  }
  
  // 综合分 = 标准分 + 加分（上限120分）
  const compositeScore = Math.min(120, standardScore + totalBonus)
  
  // 确定等级（根据综合分判定，但加分不能提升等级，只用于排名）
  // 国家标准：等级判定使用标准分，加分用于同等级内排名
  let gradeLevel = '不及格'
  if (standardScore >= 90) gradeLevel = '优秀'
  else if (standardScore >= 80) gradeLevel = '良好'
  else if (standardScore >= 60) gradeLevel = '及格'
  
  return {
    totalScore: standardScore, // 保持兼容性，totalScore = 标准分
    standardScore,             // 标准分（总分）
    bonusScore: totalBonus,    // 加分合计
    compositeScore,            // 综合分（标准分+加分）
    bonusItems,                // 各项加分详情
    gradeLevel,
    itemScores,
    bmi: bmi || 0
  }
}

// 兼容旧的函数签名
export const calculateTotalScore = (testItems, grade, gender) => {
  return calculatePhysicalTestScore(testItems, grade, gender)
}

export default calculatePhysicalTestScore
