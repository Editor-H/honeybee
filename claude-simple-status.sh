#!/bin/bash

# Claude Code 간단한 상태 표시
while true; do
    clear
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🐝 Claude Code Status Monitor"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    echo "⏰ Time: $(date '+%H:%M:%S')"
    echo "📂 Project: HoneyBee"
    echo "🔧 Mode: DEBUG"
    echo "📄 File: $(basename $(pwd))"
    echo "🌐 Server: http://localhost:3000"
    echo "🤖 Model: Sonnet-4"
    echo "📊 Status: Active"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Press Ctrl+C to exit"
    sleep 3
done