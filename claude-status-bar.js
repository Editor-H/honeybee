#!/usr/bin/env node

/**
 * Claude Code Status Bar
 * 실시간으로 Claude Code 세션의 상태를 모니터링하고 표시
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');

class ClaudeStatusBar {
  constructor() {
    this.currentMode = 'CHAT';
    this.activeFile = 'None';
    this.mcpStatus = [];
    this.tokenUsage = { used: 0, limit: 0 };
    this.sessionStartTime = Date.now();
    this.lastActivity = Date.now();
    
    // 설정
    this.refreshInterval = 1000; // 1초마다 업데이트
    this.claudeConfigPath = path.join(os.homedir(), '.config/claude-code');
    this.claudeDataPath = path.join(os.homedir(), '.claude');
    
    this.init();
  }

  init() {
    console.log('\x1b[2J\x1b[H'); // 화면 지우기
    this.setupDisplay();
    this.startMonitoring();
  }

  setupDisplay() {
    // 터미널 설정
    process.stdout.write('\x1b[?1049h'); // Alternative screen buffer
    process.stdout.write('\x1b[?25l');   // Hide cursor
    
    // Cleanup on exit
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
    process.on('exit', () => this.cleanup());
  }

  cleanup() {
    process.stdout.write('\x1b[?25h');   // Show cursor
    process.stdout.write('\x1b[?1049l'); // Normal screen buffer
    process.exit(0);
  }

  detectCurrentMode() {
    try {
      // Claude Code 프로세스 확인
      const processes = execSync('ps aux | grep "claude"', { encoding: 'utf8' });
      
      if (processes.includes('--debug')) {
        this.currentMode = 'DEBUG';
      } else if (processes.includes('plan')) {
        this.currentMode = 'PLAN';
      } else if (processes.includes('edit')) {
        this.currentMode = 'EDIT';  
      } else if (processes.includes('review')) {
        this.currentMode = 'REVIEW';
      } else {
        this.currentMode = 'CHAT';
      }
    } catch (error) {
      this.currentMode = 'UNKNOWN';
    }
  }

  detectActiveFile() {
    try {
      // 최근 편집된 파일 확인
      const currentDir = process.cwd();
      const files = fs.readdirSync(currentDir);
      
      let mostRecentFile = '';
      let mostRecentTime = 0;
      
      files.forEach(file => {
        const filePath = path.join(currentDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile() && stats.mtime.getTime() > mostRecentTime) {
            mostRecentTime = stats.mtime.getTime();
            mostRecentFile = file;
          }
        } catch (e) {
          // 파일 접근 불가
        }
      });
      
      this.activeFile = mostRecentFile || 'None';
    } catch (error) {
      this.activeFile = 'None';
    }
  }

  checkMCPStatus() {
    this.mcpStatus = [];
    
    try {
      // Claude MCP 설정 확인
      const mcpConfigPath = path.join(this.claudeConfigPath, 'mcp.json');
      if (fs.existsSync(mcpConfigPath)) {
        const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
        
        Object.keys(mcpConfig.servers || {}).forEach(serverName => {
          this.mcpStatus.push({
            name: serverName,
            status: 'CONNECTED', // 실제로는 포트 확인 필요
            type: mcpConfig.servers[serverName].command?.[0] || 'Unknown'
          });
        });
      }
    } catch (error) {
      // MCP 설정 없음
    }
    
    // 기본 MCP 서버들 확인
    if (this.mcpStatus.length === 0) {
      this.mcpStatus = [{ name: 'None', status: 'DISCONNECTED', type: 'N/A' }];
    }
  }

  estimateTokenUsage() {
    try {
      // Claude 세션 데이터 확인
      const sessionFiles = fs.readdirSync(this.claudeDataPath);
      let totalChars = 0;
      
      sessionFiles.forEach(file => {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.claudeDataPath, file);
            const data = fs.readFileSync(filePath, 'utf8');
            totalChars += data.length;
          } catch (e) {
            // 파일 읽기 실패
          }
        }
      });
      
      // 대략적인 토큰 추정 (1 토큰 ≈ 4 문자)
      const estimatedTokens = Math.floor(totalChars / 4);
      this.tokenUsage = {
        used: estimatedTokens,
        limit: 100000, // 기본 추정값
        percentage: Math.min((estimatedTokens / 100000) * 100, 100)
      };
      
    } catch (error) {
      this.tokenUsage = { used: 0, limit: 0, percentage: 0 };
    }
  }

  getStatusColor(status) {
    const colors = {
      'CHAT': '\x1b[32m',     // 녹색
      'PLAN': '\x1b[33m',     // 노란색  
      'EDIT': '\x1b[34m',     // 파란색
      'DEBUG': '\x1b[35m',    // 마젠타
      'REVIEW': '\x1b[36m',   // 시안
      'UNKNOWN': '\x1b[31m'   // 빨간색
    };
    return colors[status] || '\x1b[37m'; // 기본 흰색
  }

  formatUptime() {
    const uptime = Date.now() - this.sessionStartTime;
    const minutes = Math.floor(uptime / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  formatTokenBar() {
    const percentage = this.tokenUsage.percentage || 0;
    const barLength = 20;
    const filledLength = Math.floor((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    let color = '\x1b[32m'; // 녹색
    if (percentage > 70) color = '\x1b[33m'; // 노란색
    if (percentage > 90) color = '\x1b[31m'; // 빨간색
    
    return `${color}${bar}\x1b[0m ${percentage.toFixed(1)}%`;
  }

  render() {
    const { rows, columns } = process.stdout;
    const statusBarHeight = 6;
    
    // 상태바 영역을 터미널 하단에 그리기
    const startRow = Math.max(1, rows - statusBarHeight);
    
    // 배경 그리기
    for (let i = 0; i < statusBarHeight; i++) {
      process.stdout.write(`\x1b[${startRow + i};1H\x1b[48;5;236m${' '.repeat(columns)}\x1b[0m`);
    }
    
    // 제목
    process.stdout.write(`\x1b[${startRow};2H\x1b[1;97m┌─ Claude Code Status ─${'─'.repeat(Math.max(0, columns - 25))}┐\x1b[0m`);
    
    // 현재 모드
    const modeColor = this.getStatusColor(this.currentMode);
    process.stdout.write(`\x1b[${startRow + 1};2H\x1b[97m│ Mode: ${modeColor}${this.currentMode}\x1b[0m`);
    
    // 활성 파일
    const fileDisplay = this.activeFile.length > 40 ? '...' + this.activeFile.slice(-37) : this.activeFile;
    process.stdout.write(`\x1b[${startRow + 1};25H\x1b[97m│ File: \x1b[96m${fileDisplay}\x1b[0m`);
    
    // MCP 상태
    const mcpDisplay = this.mcpStatus.length > 0 ? 
      `${this.mcpStatus.length} servers (${this.mcpStatus.filter(s => s.status === 'CONNECTED').length} active)` : 
      'None';
    process.stdout.write(`\x1b[${startRow + 2};2H\x1b[97m│ MCP: \x1b[93m${mcpDisplay}\x1b[0m`);
    
    // 토큰 사용량
    const tokenBar = this.formatTokenBar();
    process.stdout.write(`\x1b[${startRow + 3};2H\x1b[97m│ Tokens: ${tokenBar} \x1b[90m(~${this.tokenUsage.used.toLocaleString()})\x1b[0m`);
    
    // 세션 정보
    const uptime = this.formatUptime();
    const timestamp = new Date().toLocaleTimeString();
    process.stdout.write(`\x1b[${startRow + 4};2H\x1b[97m│ Session: \x1b[92m${uptime}\x1b[0m \x1b[97m│ Time: \x1b[94m${timestamp}\x1b[0m`);
    
    // 하단 경계
    process.stdout.write(`\x1b[${startRow + 5};2H\x1b[1;97m└${'─'.repeat(Math.max(0, columns - 3))}┘\x1b[0m`);
  }

  startMonitoring() {
    const update = () => {
      this.detectCurrentMode();
      this.detectActiveFile();
      this.checkMCPStatus();
      this.estimateTokenUsage();
      this.render();
    };
    
    // 초기 렌더링
    update();
    
    // 주기적 업데이트
    setInterval(update, this.refreshInterval);
    
    console.log('\x1b[1;1H\x1b[92mClaude Code Status Bar Active\x1b[0m');
    console.log('\x1b[2;1H\x1b[90mPress Ctrl+C to exit\x1b[0m');
  }
}

// 실행
if (require.main === module) {
  new ClaudeStatusBar();
}

module.exports = ClaudeStatusBar;