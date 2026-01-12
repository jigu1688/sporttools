#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""项目配置验证 - 简化版"""
import os
from pathlib import Path
import re

def check_config():
    print("\n" + "="*60)
    print("项目配置验证")
    print("="*60)
    
    checks = []
    
    # 1. 前端 API 地址
    env_file = Path("sport-web/.env")
    if env_file.exists():
        try:
            content = env_file.read_text(encoding='utf-8')
        except:
            content = env_file.read_text(encoding='gbk', errors='ignore')
        has_8002 = "localhost:8002" in content
        checks.append(("[OK]" if has_8002 else "[NG]", "前端 API 地址: 8002"))
    else:
        checks.append(("[NG]", "前端 .env 文件不存在"))
    
    # 2. 后端 SECRET_KEY
    backend_env = Path("sport-api/.env")
    if backend_env.exists():
        try:
            content = backend_env.read_text(encoding='utf-8')
        except:
            content = backend_env.read_text(encoding='gbk', errors='ignore')
        secret_ok = "8KT0A5APriLeIDLyp5Qb" in content
        checks.append(("[OK]" if secret_ok else "[NG]", "后端 SECRET_KEY: 已生成"))
    else:
        checks.append(("[NG]", "后端 .env 文件不存在"))
    
    # 3. 后端端口
    main_py = Path("sport-api/main.py")
    if main_py.exists():
        try:
            content = main_py.read_text(encoding='utf-8')
        except:
            content = main_py.read_text(encoding='gbk', errors='ignore')
        port_ok = "port=8002" in content
        checks.append(("[OK]" if port_ok else "[NG]", "后端端口: 8002"))
    else:
        checks.append(("[NG]", "main.py 文件不存在"))
    
    # 4. Docker 映射
    docker_file = Path("docker-compose.yml")
    if docker_file.exists():
        try:
            content = docker_file.read_text(encoding='utf-8')
        except:
            content = docker_file.read_text(encoding='gbk', errors='ignore')
        docker_ok = "8002:8000" in content and "8888:80" in content
        checks.append(("[OK]" if docker_ok else "[NG]", "Docker 端口映射: 8002:8000, 8888:80"))
    else:
        checks.append(("[NG]", "docker-compose.yml 不存在"))
    
    # 5. 数据库
    db_file = Path("sport-api/sports_teaching.db")
    if db_file.exists():
        size_kb = db_file.stat().st_size / 1024
        checks.append(("[OK]", f"数据库文件: {size_kb:.1f} KB"))
    else:
        checks.append(("[NG]", "数据库文件不存在"))
    
    # 6. 依赖文件
    req_file = Path("sport-api/requirements.txt")
    pkg_file = Path("sport-web/package.json")
    req_ok = req_file.exists() and pkg_file.exists()
    checks.append(("[OK]" if req_ok else "[NG]", "项目依赖文件: 存在"))
    
    # 输出结果
    print("\n配置检查结果:")
    for status, item in checks:
        print(f"  {status} {item}")
    
    # 总结
    passed = all(status == "[OK]" for status, _ in checks)
    print("\n" + "="*60)
    if passed:
        print("SUCCESS: 所有配置验证通过!")
        print("\n可以启动应用:")
        print("  前端: cd sport-web && npm run dev")
        print("  后端: cd sport-api && python main.py")
        print("  Docker: docker-compose up -d --build")
    else:
        print("WARNING: 部分配置有问题，请检查上述标记为 [NG] 的项目")
    print("="*60 + "\n")
    
    return passed

if __name__ == "__main__":
    success = check_config()
    exit(0 if success else 1)
