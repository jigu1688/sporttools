# 体育教学辅助网站 - CRUD操作包
# 导入所有CRUD模块，方便统一导入使用

from .user_crud import user_crud
from .token_crud import token_crud
from .student_crud import student_crud
from .class_crud import class_crud
from .school_crud import school_crud
from .school_year_crud import school_year_crud

# 可以在这里添加更多CRUD模块的导入

__all__ = [
    "user_crud",
    "token_crud",
    "student_crud",
    "class_crud",
    "school_crud",
    "school_year_crud"
    # 可以在这里添加更多CRUD模块的名称
]