import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

// 配置日志
log.transports.file.level = 'info';
autoUpdater.logger = log;

// 配置存储
const store = new Store();

// 全局变量
let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

// 是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

// 创建主窗口
function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: '笔记系统',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  // 加载前端页面
  if (isDev) {
    window.loadURL('http://localhost:3000');
    window.webContents.openDevTools();
  } else {
    window.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }

  // 窗口准备好后显示
  window.once('ready-to-show', () => {
    window.show();
    
    // 检查更新
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  // 处理新窗口打开
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return window;
}

// 启动后端服务
function startBackend(): void {
  if (isDev) {
    log.info('Development mode: using external backend');
    return;
  }

  const backendPath = path.join(process.resourcesPath, 'backend');
  
  log.info('Starting backend server...');
  
  backendProcess = spawn('node', ['dist/main.js'], {
    cwd: backendPath,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '3001',
      DATABASE_URL: `file:${path.join(app.getPath('userData'), 'notes.db')}`,
    },
  });

  backendProcess.stdout?.on('data', (data) => {
    log.info(`Backend: ${data}`);
  });

  backendProcess.stderr?.on('data', (data) => {
    log.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    log.info(`Backend process exited with code ${code}`);
  });
}

// 停止后端服务
function stopBackend(): void {
  if (backendProcess) {
    log.info('Stopping backend server...');
    backendProcess.kill();
    backendProcess = null;
  }
}

// 应用准备就绪
app.whenReady().then(() => {
  startBackend();
  mainWindow = createMainWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      mainWindow = createMainWindow();
    }
  });
});

// 应用关闭前
app.on('before-quit', () => {
  stopBackend();
});

// 所有窗口关闭
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信
ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('app:get-path', (_, name: string) => app.getPath(name as any));
ipcMain.handle('store:get', (_, key: string) => store.get(key));
ipcMain.handle('store:set', (_, key: string, value: any) => store.set(key, value));
ipcMain.handle('store:delete', (_, key: string) => store.delete(key));

ipcMain.handle('dialog:showOpenDialog', async (_, options) => {
  if (!mainWindow) return { canceled: true };
  return dialog.showOpenDialog(mainWindow, options);
});

ipcMain.handle('dialog:showSaveDialog', async (_, options) => {
  if (!mainWindow) return { canceled: true };
  return dialog.showSaveDialog(mainWindow, options);
});

ipcMain.handle('shell:openExternal', (_, url: string) => shell.openExternal(url));
ipcMain.handle('shell:openPath', (_, filePath: string) => shell.openPath(filePath));

// 自动更新事件
autoUpdater.on('checking-for-update', () => log.info('Checking for update...'));
autoUpdater.on('update-available', (info) => log.info('Update available:', info));
autoUpdater.on('update-not-available', (info) => log.info('Update not available:', info));
autoUpdater.on('error', (err) => log.error('Error in auto-updater:', err));
autoUpdater.on('download-progress', (progressObj) => {
  log.info(`Download progress: ${progressObj.percent}%`);
});
autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
});