#!/bin/bash

# Claude Code Status Bar Launcher
# 간단한 셸 스크립트 버전

echo "🐝 Claude Code Status Monitor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

while true; do
    # 현재 시간
    current_time=$(date '+%H:%M:%S')
    
    # 현재 모드 감지
    if ps aux | grep -q "claude.*debug"; then
        mode="🔍 DEBUG"
        mode_color="\033[35m"
    elif ps aux | grep -q "claude.*plan"; then
        mode="📋 PLAN"  
        mode_color="\033[33m"
    elif ps aux | grep -q "claude.*edit"; then
        mode="✏️  EDIT"
        mode_color="\033[34m"
    else
        mode="💬 CHAT"
        mode_color="\033[32m"
    fi
    
    # 활성 파일 확인
    if [ -f package.json ]; then
        active_file="$(basename $(pwd))/package.json"
    else
        active_file=$(ls -t *.js *.ts *.tsx *.jsx 2>/dev/null | head -1)
        if [ -z "$active_file" ]; then
            active_file="None"
        fi
    fi
    
    # MCP 상태 (간단화)
    mcp_status="0 servers"
    if [ -f ~/.config/claude-code/mcp.json ]; then
        mcp_status="MCP configured"
    fi
    
    # 토큰 사용량 (대략적 추정)
    session_files=$(find ~/.claude -name "*.json" 2>/dev/null | wc -l)
    token_estimate=$((session_files * 100))
    
    # 상태바 출력 (터미널 하단 고정)
    tput cup $(($(tput lines)-6)) 0
    echo -e "\033[48;5;236m\033[97m┌─ Claude Code Status ─────────────────────────────────────────────────────┐\033[0m"
    echo -e "\033[48;5;236m\033[97m│ Mode: ${mode_color}${mode}\033[97m │ File: \033[96m${active_file}\033[97m │ Time: \033[94m${current_time}\033[97m\033[0m"
    echo -e "\033[48;5;236m\033[97m│ MCP: \033[93m${mcp_status}\033[97m │ Tokens: ~${token_estimate} │ Project: \033[92mHoneyBee\033[97m\033[0m"  
    echo -e "\033[48;5;236m\033[97m│ Session: Active │ Model: Sonnet-4 │ Status: \033[92mConnected\033[97m\033[0m"
    echo -e "\033[48;5;236m\033[97m└──────────────────────────────────────────────────────────────────────────┘\033[0m"
    echo -e "\033[90mPress Ctrl+C to exit status monitor\033[0m"
    
    sleep 2
done