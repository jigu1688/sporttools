# 体育教学辅助网站 - 令牌管理CRUD操作
# 提供令牌的创建、查询、更新和删除功能

from sqlalchemy.orm import Session
from models import Token
from datetime import datetime, timezone

class TokenCRUD:
    """令牌CRUD操作类"""
    
    @staticmethod
    def create_token(db: Session, token_data: dict) -> Token:
        """创建新令牌"""
        db_token = Token(**token_data)
        db.add(db_token)
        db.commit()
        db.refresh(db_token)
        return db_token
    
    @staticmethod
    def get_token(db: Session, token_id: int) -> Token:
        """根据ID获取令牌"""
        return db.query(Token).filter(Token.id == token_id).first()
    
    @staticmethod
    def get_token_by_access_token(db: Session, access_token: str) -> Token:
        """根据访问令牌获取令牌"""
        return db.query(Token).filter(Token.access_token == access_token).first()
    
    @staticmethod
    def get_token_by_refresh_token(db: Session, refresh_token: str) -> Token:
        """根据刷新令牌获取令牌"""
        return db.query(Token).filter(Token.refresh_token == refresh_token).first()
    
    @staticmethod
    def get_user_tokens(db: Session, user_id: int) -> list[Token]:
        """获取用户的所有令牌"""
        return db.query(Token).filter(Token.user_id == user_id).all()
    
    @staticmethod
    def revoke_token(db: Session, token_value: str) -> bool:
        """撤销令牌（加入黑名单）"""
        # 先尝试根据访问令牌查找
        token = db.query(Token).filter(Token.access_token == token_value).first()
        if not token:
            # 再尝试根据刷新令牌查找
            token = db.query(Token).filter(Token.refresh_token == token_value).first()
        
        if token:
            token.revoked = True
            db.commit()
            return True
        return False
    
    @staticmethod
    def revoke_all_tokens(db: Session, user_id: int) -> bool:
        """撤销用户的所有令牌"""
        updated = db.query(Token).filter(Token.user_id == user_id).update({"revoked": True})
        db.commit()
        return updated > 0
    
    @staticmethod
    def is_token_revoked(db: Session, token_value: str) -> bool:
        """检查令牌是否已被撤销"""
        # 先尝试根据访问令牌查找
        token = db.query(Token).filter(Token.access_token == token_value).first()
        if not token:
            # 再尝试根据刷新令牌查找
            token = db.query(Token).filter(Token.refresh_token == token_value).first()
        
        if not token:
            # 令牌不存在，视为已撤销
            return True
        
        return token.revoked
    
    @staticmethod
    def clean_expired_tokens(db: Session) -> int:
        """清理过期令牌"""
        deleted = db.query(Token).filter(
            Token.expires_at < datetime.now(timezone.utc)
        ).delete()
        db.commit()
        return deleted
    
    @staticmethod
    def clean_expired_refresh_tokens(db: Session) -> int:
        """清理过期的刷新令牌"""
        deleted = db.query(Token).filter(
            Token.refresh_expires_at < datetime.now(timezone.utc)
        ).delete()
        db.commit()
        return deleted

# 创建token_crud实例
token_crud = TokenCRUD()