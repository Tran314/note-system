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

// 性能优化：禁用 GPU 加速
app.disableHardwareAcceleration();

// 性能优化：设置 V8 标志
app.commandLine.appendSwitch('--js-flags', '--max-old-space-size=4096');
app.commandLine.appendSwitch('--enable-features', 'VaapiVideoDecoderLib');

// 主进程异步初始化（性能优化）
async function initializeApp(): Promise<void> {
  // 异步启动后端（不阻塞主窗口）
  const backendPromise = startBackendAsync();
  
  // 先创建主窗口（用户可以立即看到界面）
  mainWindow = createMainWindow();
  
  // 等待后端启动完成
  await backendPromise;
  
  log.info('App initialized successfully');
}

// 异步启动后端服务（性能优化）
function startBackendAsync(): Promise<void> {
  return new Promise((resolve) => {
    if (isDev) {
      log.info('Development mode: using external backend');
      resolve();
      return;
    }

    const backendPath = path.join(process.resourcesPath, 'backend');
    
    log.info('Starting backend server asynchronously...');
    
    backendProcess = spawn('node', ['dist/main.js'], {
      cwd: backendPath,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3001',
        DATABASE_URL: `file:${path.join(app.getPath('userData'), 'notes.db')}`,
        UV_THREADPOOL_SIZE: '4',
      },
    });

    backendProcess.stdout?.on('data', (data) => {
      const msg = data.toString();
      log.info(`Backend: ${msg}`);
      
      // 检测后端就绪信号
      if (msg.includes('Server started') || msg.includes('listening')) {
        resolve();
      }
    });

    backendProcess.stderr?.on('data', (data) => {
      log.error(`Backend Error: ${data}`);
    });

    backendProcess.on('close', (code) => {
      log.info(`Backend process exited with code ${code}`);
    });

    // 超时自动 resolve（避免无限等待）
    setTimeout(resolve, 5000);
  });
}

// 创建主窗口（性能优化版本）
function createMainWindow(): BrowserWindow {
  const lastSize = store.get('window.size', { width: 1400, height: 900 });
  const lastPosition = store.get('window.position', { x: undefined, y: undefined });

  const window = new BrowserWindow({
    width: lastSize.width,
    height: lastSize.height,
    minWidth: 1000,
    minHeight: 600,
    x: lastPosition.x,
    y: lastPosition.y,
    title: 'Nebula',
    icon: path.join(__dirname, '../build/icon.png'),
    
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev,
      
      // 性能优化
      spellcheck: false,
      enableWebSQL: false,
      backgroundThrottling: true,
      partition: 'persist:nebula',
    },
    
    titleBarStyle: 'hiddenInset',
    show: false,
    backgroundColor: '#ffffff',
    frame: process.platform === 'darwin',
    transparent: false,
  });

  // 加载前端页面
  if (isDev) {
    window.loadURL('http://localhost:3000');
    window.webContents.openDevTools();
  } else {
    window.loadFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }

  // 延迟显示窗口
  window.once('ready-to-show', () => {
    window.show();
    
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  // 处理新窗口
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 保存窗口状态
  window.on('resize', () => {
    const [width, height] = window.getSize();
    store.set('window.size', { width, height });
  });

  window.on('move', () => {
    const [x, y] = window.getPosition();
    store.set('window.position', { x, y });
  });

  return window;
}

// 停止后端服务
function stopBackend(): void {
  if (backendProcess) {
    log.info('Stopping backend server...');
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
}

// 应用准备就绪（异步初始化）
app.whenReady().then(initializeApp);

// 应用关闭前
app.on('before-quit', stopBackend);

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