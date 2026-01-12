import pandas as pd
import os
import json

# 定义输入目录
input_dir = r'd:\Projects\sporttools\sporttools\国家学生体质健康标准'

# 将pandas数据类型转换为Python原生类型
def convert_to_native_type(value):
    if pd.isna(value):
        return None
    elif isinstance(value, (int, float)):
        return value
    elif hasattr(value, 'item'):
        return value.item()
    else:
        return value

# 读取CSV文件并转换为结构化数据
def parse_score_table(csv_path):
    df = pd.read_csv(csv_path)
    # 移除空行
    df = df.dropna(how='all')
    # 重置索引
    df = df.reset_index(drop=True)
    
    # 获取测试项目名称
    filename = os.path.basename(csv_path)
    if 'BMI' in filename:
        item_name = 'BMI'
    elif '肺活量' in filename:
        item_name = '肺活量'
    elif '50米跑' in filename:
        item_name = '50米跑'
    elif '坐位体前屈' in filename:
        item_name = '坐位体前屈'
    elif '一分钟跳绳' in filename:
        item_name = '一分钟跳绳'
    elif '立定跳远' in filename:
        item_name = '立定跳远'
    elif '仰卧起坐' in filename:
        if '男生' in filename and '引体向上' in filename:
            item_name = '引体向上/仰卧起坐'
        else:
            item_name = '一分钟仰卧起坐'
    elif '耐力跑' in filename or '1000米跑' in filename or '800米跑' in filename:
        if '1000米' in filename:
            item_name = '1000米跑'
        elif '800米' in filename:
            item_name = '800米跑'
        else:
            # 根据性别将耐力跑映射到具体项目
            if '男生' in filename:
                item_name = '1000米跑'
            else:
                item_name = '800米跑'
    else:
        item_name = '未知项目'
    
    # 确定性别
    gender = '男生' if '男生' in filename else '女生'
    
    # 解析数据
    score_data = {
        'item_name': item_name,
        'gender': gender,
        'scores': []
    }
    
    # 处理不同的测试项目
    # 获取列名
    columns = df.columns.tolist()
    
    if item_name in ['BMI', '肺活量', '50米跑', '坐位体前屈', '一分钟跳绳', '立定跳远', '一分钟仰卧起坐']:
        # 这些项目的格式比较统一
        for _, row in df.iterrows():
            # 确保行中有数据
            if any(pd.notna(row)):
                try:
                    # 获取年龄或年级
                    age_or_grade = str(row.iloc[0])
                    # 获取各个分数段的标准
                    score_row = {
                        'age_or_grade': age_or_grade
                    }
                    
                    # 从第二列开始是分数段
                    for i in range(1, len(columns)):
                        col_name = columns[i]
                        value = row.iloc[i]
                        if pd.notna(value):
                            score_row[col_name] = convert_to_native_type(value)
                    
                    score_data['scores'].append(score_row)
                except Exception as e:
                    print(f"解析行时出错: {e}")
                    continue
    elif item_name == '引体向上/仰卧起坐':
        # 男生的引体向上和仰卧起坐是同一个表
        for _, row in df.iterrows():
            if any(pd.notna(row)):
                try:
                    age_or_grade = str(row.iloc[0])
                    score_row = {
                        'age_or_grade': age_or_grade
                    }
                    
                    for i in range(1, len(columns)):
                        col_name = columns[i]
                        value = row.iloc[i]
                        if pd.notna(value):
                            score_row[col_name] = convert_to_native_type(value)
                    
                    score_data['scores'].append(score_row)
                except Exception as e:
                    print(f"解析行时出错: {e}")
                    continue
    elif item_name in ['1000米跑', '800米跑', '耐力跑']:
        # 耐力跑项目，时间格式需要特殊处理
        for _, row in df.iterrows():
            if any(pd.notna(row)):
                try:
                    age_or_grade = str(row.iloc[0])
                    score_row = {
                        'age_or_grade': age_or_grade
                    }
                    
                    for i in range(1, len(columns)):
                        col_name = columns[i]
                        value = row.iloc[i]
                        if pd.notna(value):
                            score_row[col_name] = convert_to_native_type(value)
                    
                    score_data['scores'].append(score_row)
                except Exception as e:
                    print(f"解析行时出错: {e}")
                    continue
    
    return score_data

# 解析所有评分表文件
def parse_all_score_tables():
    all_score_data = {
        'score_tables': [],
        'bonus_tables': []
    }
    
    # 遍历目录下所有CSV文件
    for filename in os.listdir(input_dir):
        if filename.endswith('.csv'):
            csv_path = os.path.join(input_dir, filename)
            print(f"正在解析文件: {filename}")
            
            try:
                score_data = parse_score_table(csv_path)
                if '加分表' in filename:
                    all_score_data['bonus_tables'].append(score_data)
                else:
                    all_score_data['score_tables'].append(score_data)
            except Exception as e:
                print(f"解析文件 {filename} 时出错: {e}")
                continue
    
    return all_score_data

# 生成JavaScript文件
def generate_js_file(data):
    # 生成时间戳
    timestamp = pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
    # 生成JSON数据
    score_standards_json = json.dumps(data, ensure_ascii=False, indent=2)
    
    # 构建JavaScript内容
    js_content = '''// 国家学生体质健康标准评分表
// 自动生成于 ''' + timestamp + '''

export const scoreStandards = ''' + score_standards_json + ''';

// 计算单项得分
export const calculateSingleScore = (itemName, gender, ageOrGrade, value) => {
  // 查找对应的评分表
  const scoreTable = scoreStandards.score_tables.find(table => 
    table.item_name === itemName && table.gender === gender
  );
  
  if (!scoreTable) return 0;
  
  // 遍历评分表中的所有分数段
  for (const scoreRow of scoreTable.scores) {
    // 检查该分数段是否包含当前年级/年龄的数据
    if (scoreRow[ageOrGrade] !== undefined) {
      // 根据项目类型确定评分规则
      if (itemName === '50米跑' || itemName === '1000米跑' || itemName === '800米跑' || itemName === '耐力跑') {
        // 时间越短，分数越高
        if (typeof value === 'number' && typeof scoreRow[ageOrGrade] === 'number') {
          if (value <= scoreRow[ageOrGrade]) {
            return parseInt(scoreRow.单项) || 0;
          }
        }
      } else {
        // 数值越大，分数越高
        if (typeof value === 'number' && typeof scoreRow[ageOrGrade] === 'number') {
          if (value >= scoreRow[ageOrGrade]) {
            return parseInt(scoreRow.单项) || 0;
          }
        }
      }
    }
  }
  
  return 0;
};

// 计算总分
export const calculateTotalScore = (scores) => {
  // 实现总分计算逻辑
  return scores.reduce((total, score) => total + score, 0);
};
'''
    
    return js_content

# 主函数
def main():
    # 解析所有评分表
    all_score_data = parse_all_score_tables()
    
    # 生成JavaScript文件
    js_content = generate_js_file(all_score_data)
    
    # 保存到scoreStandards.js文件
    output_path = r'd:\Projects\sporttools\sporttools\sport-web\src\utils\scoreStandards.js'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"评分标准文件已生成: {output_path}")
    print(f"共解析了 {len(all_score_data['score_tables'])} 个评分表和 {len(all_score_data['bonus_tables'])} 个加分表")

if __name__ == "__main__":
    main()
