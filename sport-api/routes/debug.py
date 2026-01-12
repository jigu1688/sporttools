from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Student, Class, StudentClassRelation, UserRoleEnum
from auth import get_current_user

router = APIRouter(tags=["debug"])


@router.delete("/clear-data")
def clear_data(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """清除学生、班级及学生-班级关系数据（仅限管理员）。"""
    # 验证角色为 admin
    user_role = None
    if hasattr(current_user, 'role'):
        if hasattr(current_user.role, 'value'):
            user_role = current_user.role.value
        else:
            user_role = str(current_user.role)
    elif isinstance(current_user, dict):
        user_role = current_user.get('role')

    if user_role != UserRoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='权限不足，需管理员权限')

    try:
        rel_count = db.query(StudentClassRelation).delete(synchronize_session=False)
        stu_count = db.query(Student).delete(synchronize_session=False)
        cls_count = db.query(Class).delete(synchronize_session=False)
        db.commit()
        return {
            'deleted': {
                'student_class_relations': rel_count,
                'students': stu_count,
                'classes': cls_count
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'清除数据失败: {e}')
