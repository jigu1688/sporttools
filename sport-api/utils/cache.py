# 体育教学辅助网站 - 缓存管理
# 提供查询结果缓存功能

from typing import Any, Optional, Callable, Dict, List
from datetime import datetime, timedelta
import hashlib
import json

class CacheEntry:
    """缓存条目"""
    def __init__(self, key: str, value: Any, ttl: int = 300):
        self.key = key
        self.value = value
        self.created_at = datetime.now()
        self.ttl = ttl
    
    def is_expired(self) -> bool:
        """检查是否过期"""
        return (datetime.now() - self.created_at).total_seconds() > self.ttl
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "key": self.key,
            "value": self.value,
            "created_at": self.created_at.isoformat(),
            "ttl": self.ttl
        }

class MemoryCache:
    """内存缓存"""
    
    def __init__(self, max_size: int = 1000):
        self.cache: Dict[str, CacheEntry] = {}
        self.max_size = max_size
        self.hits = 0
        self.misses = 0
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """生成缓存键"""
        key_parts = [prefix]
        key_parts.extend([str(arg) for arg in args])
        key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
        key_string = "|".join(key_parts)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """获取缓存值"""
        entry = self.cache.get(key)
        if entry is None:
            self.misses += 1
            return None
        
        if entry.is_expired():
            del self.cache[key]
            self.misses += 1
            return None
        
        self.hits += 1
        return entry.value
    
    def set(self, key: str, value: Any, ttl: int = 300):
        """设置缓存值"""
        # 检查缓存大小
        if len(self.cache) >= self.max_size:
            self._evict_oldest()
        
        self.cache[key] = CacheEntry(key, value, ttl)
    
    def delete(self, key: str):
        """删除缓存值"""
        if key in self.cache:
            del self.cache[key]
    
    def clear(self):
        """清空缓存"""
        self.cache.clear()
        self.hits = 0
        self.misses = 0
    
    def _evict_oldest(self):
        """淘汰最旧的缓存条目"""
        if not self.cache:
            return
        
        oldest_key = min(
            self.cache.keys(),
            key=lambda k: self.cache[k].created_at
        )
        del self.cache[oldest_key]
    
    def get_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息"""
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(hit_rate, 2),
            "total_requests": total_requests
        }
    
    def cleanup_expired(self):
        """清理过期缓存"""
        expired_keys = [
            key for key, entry in self.cache.items()
            if entry.is_expired()
        ]
        
        for key in expired_keys:
            del self.cache[key]
        
        return len(expired_keys)

class CacheManager:
    """缓存管理器"""
    
    def __init__(self):
        self.caches: Dict[str, MemoryCache] = {
            "default": MemoryCache(),
            "students": MemoryCache(max_size=500),
            "classes": MemoryCache(max_size=200),
            "physical_tests": MemoryCache(max_size=1000),
            "sports_meets": MemoryCache(max_size=100),
            "registrations": MemoryCache(max_size=1000),
            "statistics": MemoryCache(max_size=200)
        }
    
    def get_cache(self, cache_name: str = "default") -> MemoryCache:
        """获取指定缓存"""
        return self.caches.get(cache_name, self.caches["default"])
    
    def get(self, cache_name: str, key: str) -> Optional[Any]:
        """从指定缓存获取值"""
        cache = self.get_cache(cache_name)
        return cache.get(key)
    
    def set(self, cache_name: str, key: str, value: Any, ttl: int = 300):
        """向指定缓存设置值"""
        cache = self.get_cache(cache_name)
        cache.set(key, value, ttl)
    
    def delete(self, cache_name: str, key: str):
        """从指定缓存删除值"""
        cache = self.get_cache(cache_name)
        cache.delete(key)
    
    def clear_cache(self, cache_name: str):
        """清空指定缓存"""
        cache = self.get_cache(cache_name)
        cache.clear()
    
    def clear_all(self):
        """清空所有缓存"""
        for cache in self.caches.values():
            cache.clear()
    
    def cleanup_all(self):
        """清理所有过期缓存"""
        total_cleaned = 0
        for cache in self.caches.values():
            total_cleaned += cache.cleanup_expired()
        return total_cleaned
    
    def get_all_stats(self) -> Dict[str, Any]:
        """获取所有缓存统计信息"""
        stats = {}
        for name, cache in self.caches.items():
            stats[name] = cache.get_stats()
        return stats

def cached(cache_name: str = "default", ttl: int = 300, key_prefix: str = ""):
    """缓存装饰器"""
    def decorator(func: Callable) -> Callable:
        def wrapper(*args, **kwargs):
            # 获取缓存管理器
            cache_manager = get_cache_manager()
            
            # 生成缓存键
            cache = cache_manager.get_cache(cache_name)
            key_parts = [key_prefix, func.__name__]
            key_parts.extend([str(arg) for arg in args[1:]])  # 跳过self参数
            key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
            key_string = "|".join(key_parts)
            cache_key = hashlib.md5(key_string.encode()).hexdigest()
            
            # 尝试从缓存获取
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # 执行函数
            result = func(*args, **kwargs)
            
            # 存入缓存
            cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# 全局缓存管理器实例
_cache_manager: Optional[CacheManager] = None

def get_cache_manager() -> CacheManager:
    """获取全局缓存管理器"""
    global _cache_manager
    if _cache_manager is None:
        _cache_manager = CacheManager()
    return _cache_manager

def init_cache_manager():
    """初始化缓存管理器"""
    global _cache_manager
    _cache_manager = CacheManager()
    return _cache_manager