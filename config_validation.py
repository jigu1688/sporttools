#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""配置验证脚本"""
import os
import json
import re
import sys
from pathlib import Path

# 设置 UTF-8 编码
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def check_config():
    """检查所有关键配置"""
    print("\n" + "=" * 70)
    print("项目配置验证")
    print("=" * 70)
    
    issues = []
    warnings = []
    
    # 1. 检查前端 .env
    print("\n[1] 检查前端配置 (sport-web/.env)...")
    frontend_env = Path("sport-web/.env")
    if frontend_env.exists():
        content = frontend_env.read_text(encoding='utf-8')
        if "localhost:8002" in content:
            print("  [OK] VITE_API_BASE_URL 正确配置为 8002")
        else:
            issues.append("前端 API 地址未正确配置为 8002")
            print("  ✗ VITE_API_BASE_URL 未指向 8002")
    else:
        issues.append("sport-web/.env 文件不存在")
    
    # 2. 检查后端 .env
    print("\n[2] 检查后端配置 (sport-api/.env)...")
    backend_env = Path("sport-api/.env")
    if backend_env.exists():
        content = backend_env.read_text(encoding='utf-8')
        
        # 检查 SECRET_KEY
        secret_match = re.search(r'SECRET_KEY=(.+)$', content, re.MULTILINE)
        if secret_match:
            secret = secret_match.group(1).strip()
            if "your-secret-key" in secret:
                warnings.append("后端 SECRET_KEY 仍使用默认值，生产环境需更改")
                print("  ⚠ SECRET_KEY 为默认值")
            else:
                print(f"  ✓ SECRET_KEY 已配置: {secret[:20]}...")
        else:
            issues.append("后端未配置 SECRET_KEY")
        
        # 检查数据库配置
        if "sqlite:///./sports_teaching.db" in content:
            print("  ✓ 数据库配置正确")
        else:
            warnings.append("数据库配置可能不正确")
    else:
        issues.append("sport-api/.env 文件不存在")
    
    # 3. 检查后端 main.py 端口
    print("\n[3] 检查后端端口配置 (sport-api/main.py)...")
    main_py = Path("sport-api/main.py")
    if main_py.exists():
        content = main_py.read_text(encoding='utf-8')
        if "port=8002" in content:
            print("  ✓ 后端监听端口: 8002")
        else:
            issues.append("后端端口配置不是 8002")
    
    # 4. 检查 docker-compose.yml
    print("\n[4] 检查 Docker 配置 (docker-compose.yml)...")
    docker_file = Path("docker-compose.yml")
    if docker_file.exists():
        content = docker_file.read_text(encoding='utf-8')
        if '"8002:8000"' in content or "'8002:8000'" in content:
            print("  ✓ 后端服务端口映射: 8002:8000")
        else:
            issues.append("Docker 后端端口映射配置不正确")
        
        if '8888:80' in content:
            print("  ✓ 前端服务端口映射: 8888:80")
        else:
            issues.append("Docker 前端端口映射配置不正确")
    
    # 5. 检查数据库
    print("\n[5] 检查数据库 (sport-api/sports_teaching.db)...")
    db_path = Path("sport-api/sports_teaching.db")
    if db_path.exists():
        size_mb = db_path.stat().st_size / (1024 * 1024)
        print(f"  ✓ 数据库文件存在: {size_mb:.2f} MB")
    else:
        issues.append("数据库文件不存在")
    
    # 6. 检查依赖
    print("\n[6] 检查项目依赖...")
    requirements = Path("sport-api/requirements.txt")
    if requirements.exists():
        print("  ✓ requirements.txt 存在")
    else:
        warnings.append("sport-api/requirements.txt 不存在")
    
    package_json = Path("sport-web/package.json")
    if package_json.exists():
        print("  ✓ package.json 存在")
    else:
        warnings.append("sport-web/package.json 不存在")
    
    # 7. 总结
    print("\n" + "=" * 70)
    print("验证结果总结")
    print("=" * 70)
    
    if not issues and not warnings:
        print("✓ 所有配置验证通过！")
        print("\n可以执行以下命令启动应用:")
        print("  前端开发: cd sport-web && npm run dev")
        print("  后端开发: cd sport-api && python main.py")
        print("  Docker部署: docker-compose up -d --build")
        return True
    
    if issues:
        print(f"\n✗ 发现 {len(issues)} 个配置错误:")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
    
    if warnings:
        print(f"\n⚠ 发现 {len(warnings)} 个警告:")
        for i, warning in enumerate(warnings, 1):
            print(f"  {i}. {warning}")
    
    return len(issues) == 0

if __name__ == "__main__":
    success = check_config()
    exit(0 if success else 1)
