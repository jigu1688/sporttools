# 体育教学辅助网站 - 性能监控
# 提供系统性能监控和分析功能

from typing import Dict, Any, List, Optional, Callable
from datetime import datetime, timedelta
from functools import wraps
import time
import threading

class PerformanceMetric:
    """性能指标"""
    def __init__(self, name: str):
        self.name = name
        self.count = 0
        self.total_time = 0.0
        self.min_time = float('inf')
        self.max_time = 0.0
        self.errors = 0
        self.lock = threading.Lock()
    
    def record(self, duration: float, success: bool = True):
        """记录性能数据"""
        with self.lock:
            self.count += 1
            self.total_time += duration
            self.min_time = min(self.min_time, duration)
            self.max_time = max(self.max_time, duration)
            if not success:
                self.errors += 1
    
    def get_stats(self) -> Dict[str, Any]:
        """获取统计信息"""
        avg_time = self.total_time / self.count if self.count > 0 else 0
        error_rate = (self.errors / self.count * 100) if self.count > 0 else 0
        
        return {
            "name": self.name,
            "count": self.count,
            "total_time": round(self.total_time, 3),
            "average_time": round(avg_time, 3),
            "min_time": round(self.min_time, 3) if self.min_time != float('inf') else 0,
            "max_time": round(self.max_time, 3),
            "errors": self.errors,
            "error_rate": round(error_rate, 2)
        }
    
    def reset(self):
        """重置统计信息"""
        with self.lock:
            self.count = 0
            self.total_time = 0.0
            self.min_time = float('inf')
            self.max_time = 0.0
            self.errors = 0

class PerformanceMonitor:
    """性能监控器"""
    
    def __init__(self):
        self.metrics: Dict[str, PerformanceMetric] = {}
        self.lock = threading.Lock()
        self.enabled = True
    
    def get_metric(self, name: str) -> PerformanceMetric:
        """获取或创建性能指标"""
        with self.lock:
            if name not in self.metrics:
                self.metrics[name] = PerformanceMetric(name)
            return self.metrics[name]
    
    def record(self, name: str, duration: float, success: bool = True):
        """记录性能数据"""
        if not self.enabled:
            return
        
        metric = self.get_metric(name)
        metric.record(duration, success)
    
    def get_all_stats(self) -> Dict[str, Any]:
        """获取所有性能统计"""
        with self.lock:
            return {
                name: metric.get_stats()
                for name, metric in self.metrics.items()
            }
    
    def get_metric_stats(self, name: str) -> Optional[Dict[str, Any]]:
        """获取指定指标的统计"""
        with self.lock:
            metric = self.metrics.get(name)
            return metric.get_stats() if metric else None
    
    def reset_all(self):
        """重置所有统计"""
        with self.lock:
            for metric in self.metrics.values():
                metric.reset()
    
    def reset_metric(self, name: str):
        """重置指定指标"""
        with self.lock:
            metric = self.metrics.get(name)
            if metric:
                metric.reset()
    
    def get_slow_queries(self, threshold: float = 1.0) -> List[Dict[str, Any]]:
        """获取慢查询"""
        with self.lock:
            slow_queries = []
            for name, metric in self.metrics.items():
                stats = metric.get_stats()
                if stats["average_time"] > threshold:
                    slow_queries.append(stats)
            return sorted(slow_queries, key=lambda x: x["average_time"], reverse=True)
    
    def get_high_error_rate_operations(self, threshold: float = 5.0) -> List[Dict[str, Any]]:
        """获取高错误率操作"""
        with self.lock:
            high_error_ops = []
            for name, metric in self.metrics.items():
                stats = metric.get_stats()
                if stats["error_rate"] > threshold:
                    high_error_ops.append(stats)
            return sorted(high_error_ops, key=lambda x: x["error_rate"], reverse=True)
    
    def enable(self):
        """启用监控"""
        self.enabled = True
    
    def disable(self):
        """禁用监控"""
        self.enabled = False

class QueryPerformanceTracker:
    """查询性能跟踪器"""
    
    def __init__(self, monitor: PerformanceMonitor):
        self.monitor = monitor
    
    def track_query(self, query_name: str):
        """查询跟踪装饰器"""
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                success = True
                
                try:
                    result = func(*args, **kwargs)
                    return result
                except Exception as e:
                    success = False
                    raise e
                finally:
                    duration = time.time() - start_time
                    self.monitor.record(query_name, duration, success)
            
            return wrapper
        return decorator
    
    def track_db_query(self, query_type: str):
        """数据库查询跟踪装饰器"""
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                success = True
                
                try:
                    result = func(*args, **kwargs)
                    return result
                except Exception as e:
                    success = False
                    raise e
                finally:
                    duration = time.time() - start_time
                    query_name = f"db_{query_type}"
                    self.monitor.record(query_name, duration, success)
            
            return wrapper
        return decorator

class SystemHealthChecker:
    """系统健康检查器"""
    
    def __init__(self, db_session_factory):
        self.db_session_factory = db_session_factory
    
    def check_database_health(self) -> Dict[str, Any]:
        """检查数据库健康状态"""
        try:
            db = self.db_session_factory()
            start_time = time.time()
            
            # 执行简单查询
            from models import User
            db.query(User).count()
            
            duration = time.time() - start_time
            db.close()
            
            return {
                "status": "healthy",
                "response_time": round(duration, 3),
                "message": "数据库连接正常"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "response_time": None,
                "message": f"数据库连接失败: {str(e)}"
            }
    
    def check_cache_health(self) -> Dict[str, Any]:
        """检查缓存健康状态"""
        try:
            from utils.cache import get_cache_manager
            cache_manager = get_cache_manager()
            stats = cache_manager.get_all_stats()
            
            # 计算总体命中率
            total_hits = sum(s["hits"] for s in stats.values())
            total_requests = sum(s["total_requests"] for s in stats.values())
            hit_rate = (total_hits / total_requests * 100) if total_requests > 0 else 0
            
            return {
                "status": "healthy",
                "hit_rate": round(hit_rate, 2),
                "total_requests": total_requests,
                "message": "缓存运行正常"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "hit_rate": None,
                "message": f"缓存检查失败: {str(e)}"
            }
    
    def check_memory_usage(self) -> Dict[str, Any]:
        """检查内存使用情况"""
        try:
            import psutil
            process = psutil.Process()
            memory_info = process.memory_info()
            
            return {
                "status": "healthy",
                "rss_mb": round(memory_info.rss / 1024 / 1024, 2),
                "vms_mb": round(memory_info.vms / 1024 / 1024, 2),
                "percent": round(process.memory_percent(), 2),
                "message": "内存使用正常"
            }
        except ImportError:
            return {
                "status": "unknown",
                "message": "psutil未安装，无法检查内存"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "message": f"内存检查失败: {str(e)}"
            }
    
    def check_disk_usage(self) -> Dict[str, Any]:
        """检查磁盘使用情况"""
        try:
            import psutil
            disk = psutil.disk_usage('/')
            
            return {
                "status": "healthy",
                "total_gb": round(disk.total / 1024 / 1024 / 1024, 2),
                "used_gb": round(disk.used / 1024 / 1024 / 1024, 2),
                "free_gb": round(disk.free / 1024 / 1024 / 1024, 2),
                "percent": round(disk.percent, 2),
                "message": "磁盘使用正常"
            }
        except ImportError:
            return {
                "status": "unknown",
                "message": "psutil未安装，无法检查磁盘"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "message": f"磁盘检查失败: {str(e)}"
            }
    
    def get_system_health(self) -> Dict[str, Any]:
        """获取系统整体健康状态"""
        checks = {
            "database": self.check_database_health(),
            "cache": self.check_cache_health(),
            "memory": self.check_memory_usage(),
            "disk": self.check_disk_usage()
        }
        
        # 判断整体状态
        unhealthy_count = sum(1 for c in checks.values() if c["status"] == "unhealthy")
        unknown_count = sum(1 for c in checks.values() if c["status"] == "unknown")
        
        if unhealthy_count > 0:
            overall_status = "unhealthy"
        elif unknown_count > 0:
            overall_status = "degraded"
        else:
            overall_status = "healthy"
        
        return {
            "overall_status": overall_status,
            "checks": checks,
            "timestamp": datetime.now().isoformat()
        }

class PerformanceReporter:
    """性能报告生成器"""
    
    def __init__(self, monitor: PerformanceMonitor):
        self.monitor = monitor
    
    def generate_summary_report(self) -> Dict[str, Any]:
        """生成性能摘要报告"""
        stats = self.monitor.get_all_stats()
        
        # 计算总体统计
        total_operations = sum(s["count"] for s in stats.values())
        total_errors = sum(s["errors"] for s in stats.values())
        overall_error_rate = (total_errors / total_operations * 100) if total_operations > 0 else 0
        
        # 找出最慢的操作
        slowest_operations = sorted(
            stats.values(),
            key=lambda x: x["average_time"],
            reverse=True
        )[:5]
        
        # 找出最高错误率的操作
        highest_error_ops = sorted(
            [s for s in stats.values() if s["error_rate"] > 0],
            key=lambda x: x["error_rate"],
            reverse=True
        )[:5]
        
        return {
            "summary": {
                "total_operations": total_operations,
                "total_errors": total_errors,
                "overall_error_rate": round(overall_error_rate, 2),
                "monitored_operations": len(stats)
            },
            "slowest_operations": slowest_operations,
            "highest_error_operations": highest_error_ops,
            "all_stats": stats,
            "generated_at": datetime.now().isoformat()
        }
    
    def generate_detailed_report(self, operation_name: str) -> Dict[str, Any]:
        """生成详细操作报告"""
        stats = self.monitor.get_metric_stats(operation_name)
        
        if not stats:
            return {
                "error": f"操作 {operation_name} 未找到"
            }
        
        return {
            "operation": operation_name,
            "statistics": stats,
            "recommendations": self._generate_recommendations(stats),
            "generated_at": datetime.now().isoformat()
        }
    
    def _generate_recommendations(self, stats: Dict[str, Any]) -> List[str]:
        """生成优化建议"""
        recommendations = []
        
        # 基于平均时间的建议
        if stats["average_time"] > 1.0:
            recommendations.append("操作平均响应时间较长，建议检查查询性能")
        
        if stats["average_time"] > 5.0:
            recommendations.append("操作响应时间过长，建议优化数据库索引或查询逻辑")
        
        # 基于错误率的建议
        if stats["error_rate"] > 1.0:
            recommendations.append("操作错误率较高，建议检查错误日志")
        
        if stats["error_rate"] > 5.0:
            recommendations.append("操作错误率过高，建议立即检查系统稳定性")
        
        # 基于执行次数的建议
        if stats["count"] > 10000:
            recommendations.append("操作执行频率很高，建议考虑缓存优化")
        
        return recommendations

# 全局性能监控器实例
_performance_monitor: Optional[PerformanceMonitor] = None

def get_performance_monitor() -> PerformanceMonitor:
    """获取全局性能监控器"""
    global _performance_monitor
    if _performance_monitor is None:
        _performance_monitor = PerformanceMonitor()
    return _performance_monitor

def init_performance_monitor():
    """初始化性能监控器"""
    global _performance_monitor
    _performance_monitor = PerformanceMonitor()
    return _performance_monitor

def monitor_performance(operation_name: str):
    """性能监控装饰器"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            monitor = get_performance_monitor()
            start_time = time.time()
            success = True
            
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                raise e
            finally:
                duration = time.time() - start_time
                monitor.record(operation_name, duration, success)
        
        return wrapper
    return decorator