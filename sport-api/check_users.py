from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User

# 创建数据库引擎
engine = create_engine('sqlite:///./sports_teaching.db')

# 创建会话工厂
Session = sessionmaker(bind=engine)

# 创建会话
db = Session()

try:
    # 查询所有用户
    users = db.query(User).all()
    
    print('系统中所有用户信息：')
    print('-' * 80)
    print(f'{'ID':<5} {'用户名':<15} {'角色':<10} {'状态':<10} {'邮箱':<30}')
    print('-' * 80)
    
    for user in users:
        print(f'{user.id:<5} {user.username:<15} {user.role.value:<10} {user.status.value:<10} {user.email:<30}')
        
    print('-' * 80)
except Exception as e:
    print(f'查询用户信息失败：{e}')
finally:
    # 关闭会话
    db.close()
