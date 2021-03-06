var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

var menu = module.exports = [];
var isDarwin = process.platform === 'darwin';

menu.push(
	{
		label: '&File',
		submenu: [
			{
				label: '&Quit',
				accelerator: 'CmdOrCtrl+Q',
				click: function () {
					app.quit();
				}
			}
		]
	}
);

if (process.env.ELECTRON_APP_DEBUG) {
	menu.push(
		{
			label: '&Debug',
			submenu: [
				{
					label: '&Reload',
					accelerator: 'CmdOrCtrl+R',
					click: function () {
						BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
					}
				},
				{
					label: 'Toggle &Developer Tools',
					accelerator: isDarwin ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
					click: function () {
						BrowserWindow.getFocusedWindow().toggleDevTools();
					}
				}
			]
		}
	);
}