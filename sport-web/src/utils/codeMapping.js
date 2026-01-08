// 年级编码映射：11=一年级，12=二年级，以此类推
export const gradeCodeMapping = {
  // 编码到中文名称的映射
  codeToName: {
    '11': '一年级',
    '12': '二年级',
    '13': '三年级',
    '14': '四年级',
    '15': '五年级',
    '16': '六年级',
    '21': '初一',
    '22': '初二',
    '23': '初三',
    '31': '高一',
    '32': '高二',
    '33': '高三'
  },
  // 中文名称到编码的映射
  nameToCode: {
    '一年级': '11',
    '二年级': '12',
    '三年级': '13',
    '四年级': '14',
    '五年级': '15',
    '六年级': '16',
    '初一': '21',
    '初二': '22',
    '初三': '23',
    '高一': '31',
    '高二': '32',
    '高三': '33'
  }
};

// 班级编码映射：年级编号+0+班级编号，如11011=一年级主校区1班
export const classCodeMapping = {
  // 编码到中文名称的映射
  codeToName: (code) => {
    // 根据Excel示例，11011对应主校区1班
    // 直接从编码中提取班级编号
    const classNumber = code.substring(4, 5); // 第5位是班级编号
    return `主校区${classNumber}班`;
  },
  // 中文名称到编码的映射
  nameToCode: (className, gradeName) => {
    // 从中文名称中提取班级编号，如"主校区1班" -> "1"
    const classNumber = className.match(/\d+/)[0];
    const gradeCode = gradeCodeMapping.nameToCode[gradeName] || '11';
    // 生成编码：年级编码+01+班级编号，例如11011=一年级主校区1班
    return `${gradeCode}01${classNumber}`;
  }
};

// 解析年级编码
export const parseGradeCode = (grade) => {
  // 确保grade是字符串类型
  const gradeStr = String(grade);
  // 如果是数字编码，转换为中文名称
  if (/^\d+$/.test(gradeStr)) {
    return gradeCodeMapping.codeToName[gradeStr] || gradeStr;
  }
  // 否则返回原始值
  return gradeStr;
};

// 解析班级编码
export const parseClassCode = (className) => {
  // 确保className是字符串类型
  const classStr = String(className);
  // 如果是数字编码，转换为中文名称
  if (/^\d+$/.test(classStr)) {
    return classCodeMapping.codeToName(classStr);
  }
  // 否则返回原始值
  return classStr;
};

// 生成年级编码
export const generateGradeCode = (gradeName) => {
  return gradeCodeMapping.nameToCode[gradeName] || '11';
};

// 生成班级编码
export const generateClassCode = (className, gradeName) => {
  return classCodeMapping.nameToCode(className, gradeName);
};
