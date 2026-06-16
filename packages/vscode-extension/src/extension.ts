import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { installPluginFiles, generateLocalBundle, detectIde } from './installer';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('velocity.init', () => cmdInit(context)),
    vscode.commands.registerCommand('velocity.installPlugin', () => cmdInstallPlugin(context)),
    vscode.commands.registerCommand('velocity.generateBundle', () => cmdGenerateBundle(context)),
    vscode.commands.registerCommand('velocity.openDocs', cmdOpenDocs),
  );
}

export function deactivate() {}

// ---------------------------------------------------------------------------
// velocity.init
// Copies the init entry file for the detected IDE and opens the chat panel
// with the correct invocation command pre-filled.
// ---------------------------------------------------------------------------
async function cmdInit(context: vscode.ExtensionContext) {
  const workspace = requireWorkspace();
  if (!workspace) { return; }

  const ide = detectIde();
  const result = await installPluginFiles(context.extensionPath, workspace, ide);
  if (!result.ok) {
    vscode.window.showErrorMessage(`Velocity: ${result.error}`);
    return;
  }

  const invocation = ide === 'cursor' ? '/velocity-init' : '#velocity-init';
  const msg = `Velocity entry files installed. Open your AI chat and run: ${invocation}`;

  const choice = await vscode.window.showInformationMessage(msg, 'Open Chat', 'Show files');
  if (choice === 'Open Chat') {
    // Both Copilot and Cursor expose their chat via the same workbench command.
    await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus')
      .then(undefined, () =>
        vscode.commands.executeCommand('aichat.newchataction'));
  } else if (choice === 'Show files') {
    vscode.window.showInformationMessage(result.files.join('\n'));
  }
}

// ---------------------------------------------------------------------------
// velocity.installPlugin
// Same as init but lets the user choose the target IDE explicitly.
// ---------------------------------------------------------------------------
async function cmdInstallPlugin(context: vscode.ExtensionContext) {
  const workspace = requireWorkspace();
  if (!workspace) { return; }

  const picked = await vscode.window.showQuickPick(
    [
      { label: 'VS Code / GitHub Copilot', value: 'copilot' as const },
      { label: 'Cursor',                   value: 'cursor'  as const },
    ],
    { placeHolder: 'Select plugin target' }
  );
  if (!picked) { return; }

  const result = await installPluginFiles(context.extensionPath, workspace, picked.value);
  if (!result.ok) {
    vscode.window.showErrorMessage(`Velocity: ${result.error}`);
    return;
  }

  vscode.window.showInformationMessage(
    `Velocity installed for ${picked.label}. Installed: ${result.files.join(', ')}`
  );
}

// ---------------------------------------------------------------------------
// velocity.generateBundle
// Writes a velocity-local-install/ folder with the copy-pasteable files.
// ---------------------------------------------------------------------------
async function cmdGenerateBundle(context: vscode.ExtensionContext) {
  const workspace = requireWorkspace();
  if (!workspace) { return; }

  const outputDir = path.join(workspace, 'velocity-local-install');

  const result = await generateLocalBundle(context.extensionPath, outputDir);
  if (!result.ok) {
    vscode.window.showErrorMessage(`Velocity: ${result.error}`);
    return;
  }

  const choice = await vscode.window.showInformationMessage(
    `Bundle created at velocity-local-install/. ${result.files.length} files written.`,
    'Open folder'
  );
  if (choice === 'Open folder') {
    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(outputDir));
  }
}

// ---------------------------------------------------------------------------
// velocity.openDocs
// ---------------------------------------------------------------------------
function cmdOpenDocs() {
  vscode.env.openExternal(vscode.Uri.parse('https://velocity.dev/guide/installation'));
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function requireWorkspace(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    vscode.window.showWarningMessage('Velocity: Open a workspace folder first.');
    return undefined;
  }
  return folders[0].uri.fsPath;
}
