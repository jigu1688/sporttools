# 修复所有路由文件的 CRUD 导入

import re
import os

# 文件配置：每个文件需要修改的导入
file_configs = {
    'routes/students.py': {
        'old_imports': [
            'from database import SessionLocal',
            'from crud import student_crud, class_crud, school_crud'
        ],
        'new_imports': [
            'from database import get_db',
            'import crud'
        ],
        'replacements': [
            (r'student_crud\.', 'crud.student_crud.'),
            (r'class_crud\.', 'crud.class_crud.'),
            (r'school_crud\.', 'crud.school_crud.'),
        ],
        'remove_get_db_func': True,  # 删除自定义的 get_db 函数
        'fix_router': True,  # 修复路由前缀
        'add_user_import': True,  # 添加 User 导入和 current_user 参数
    },
    'routes/classes.py': {
        'old_imports': ['from crud import class_crud, school_crud'],
        'new_imports': ['import crud'],
        'replacements': [
            (r'class_crud\.', 'crud.class_crud.'),
            (r'school_crud\.', 'crud.school_crud.'),
            (r'user_crud\.', 'crud.user_crud.'),
            (r'from crud import user_crud', 'pass  # import replaced'),
        ],
    },
    'routes/school.py': {
        'old_imports': ['from crud import school_crud'],
        'new_imports': ['import crud'],
        'replacements': [
            (r'school_crud\.', 'crud.school_crud.'),
            (r'class_crud\.', 'crud.class_crud.'),
            (r'student_crud\.', 'crud.student_crud.'),
            (r'from crud import class_crud', 'pass  # import replaced'),
            (r'from crud import student_crud', 'pass  # import replaced'),
        ],
    },
    'routes/school_year.py': {
        'old_imports': ['from crud import school_year_crud'],
        'new_imports': ['import crud'],
        'replacements': [
            (r'school_year_crud\.', 'crud.school_year_crud.'),
            (r'student_crud\.', 'crud.student_crud.'),
            (r'class_crud\.', 'crud.class_crud.'),
            (r'physical_test_crud\.', 'crud.physical_test_crud.'),
            (r'from crud import student_crud, class_crud, physical_test_crud', 'pass  # import replaced'),
        ],
    },
    'routes/users.py': {
        'old_imports': ['from crud import user_crud'],
        'new_imports': ['import crud'],
        'replacements': [
            (r'user_crud\.', 'crud.user_crud.'),
        ],
    },
    'routes/auth.py': {
        'old_imports': ['from crud import user_crud'],
        'new_imports': ['import crud'],
        'replacements': [
            (r'user_crud\.', 'crud.user_crud.'),
            (r'token_crud\.', 'crud.token_crud.'),
            (r'from crud import token_crud', 'pass  # import replaced'),
        ],
    },
    'routes/sports_meet.py': {
        'old_imports': ['from crud import sports_meet_crud'],
        'new_imports': ['import crud'],
        'replacements': [
            (r'sports_meet_crud\.', 'crud.sports_meet_crud.'),
        ],
    },
}

def fix_file(filepath, config):
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 修改导入
    for old_import in config.get('old_imports', []):
        content = content.replace(old_import, '')
    
    # 添加新导入（在现有导入后面）
    for new_import in config.get('new_imports', []):
        if new_import not in content:
            # 在 from fastapi 之后添加
            content = content.replace(
                'from fastapi import',
                f'from fastapi import'
            )
    
    # 应用替换
    for pattern, replacement in config.get('replacements', []):
        content = re.sub(pattern, replacement, content)
    
    # 删除自定义 get_db 函数
    if config.get('remove_get_db_func'):
        content = re.sub(
            r'# 依赖注入：获取数据库会话\ndef get_db\(\):.*?db\.close\(\)\n',
            '',
            content,
            flags=re.DOTALL
        )
    
    # 修复路由前缀
    if config.get('fix_router'):
        content = content.replace(
            'router = APIRouter(prefix="/api/v1/students", tags=["students"])',
            'router = APIRouter(tags=["students"])'
        )
    
    # 清理空行
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  Fixed {filepath}")

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    for filepath, config in file_configs.items():
        if os.path.exists(filepath):
            fix_file(filepath, config)
        else:
            print(f"File not found: {filepath}")
    
    print("All files processed!")
