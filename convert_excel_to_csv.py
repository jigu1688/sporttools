import pandas as pd
import os

# 定义要处理的Excel文件路径
excel_files = [
    r'd:\Projects\sporttools\sporttools\国家学生体质健康标准\国家学生体质健康标准-评分表.xlsx',
    r'd:\Projects\sporttools\sporttools\国家学生体质健康标准\国家学生体质健康标准-加分表.xlsx'
]

# 定义输出目录
output_dir = r'd:\Projects\sporttools\sporttools\国家学生体质健康标准'

print(f"输出目录: {output_dir}")

# 遍历所有指定的Excel文件
for excel_path in excel_files:
    if os.path.exists(excel_path):
        print(f"正在处理文件: {excel_path}")
        
        try:
            # 使用pandas读取Excel文件
            excel_file = pd.ExcelFile(excel_path)
            
            # 获取所有工作表名
            sheets = excel_file.sheet_names
            print(f"包含工作表: {sheets}")
            
            # 遍历所有工作表
            for sheet_name in sheets:
                # 读取工作表数据
                df = excel_file.parse(sheet_name)
                
                # 获取原始文件名（不包含路径）
                filename = os.path.basename(excel_path)
                # 构建CSV文件名
                csv_filename = filename.replace('.xlsx', '.csv')
                # 构建包含工作表名的CSV文件名
                sheet_csv_filename = f"{csv_filename.replace('.csv', '')}_{sheet_name}.csv"
                sheet_csv_path = os.path.join(output_dir, sheet_csv_filename)
                
                # 将数据保存为CSV文件
                df.to_csv(sheet_csv_path, index=False, encoding='utf-8-sig')
                print(f"已保存工作表 {sheet_name} 到 {sheet_csv_path}")
        except Exception as e:
            print(f"处理文件 {excel_path} 时出错: {e}")
    else:
        print(f"文件不存在: {excel_path}")

print("所有Excel文件处理完成!")