import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import sharp = require('sharp');

class SVGCodeActionProvider implements vscode.CodeActionProvider {
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeAction[]> {
        const codeAction = new vscode.CodeAction('Convert SVG to PNG', vscode.CodeActionKind.QuickFix);
        codeAction.command = { command: 'extension.convertSVGToPNG', title: 'Convert SVG to PNG' };
        return [codeAction];
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.convertSVGToPNG', async (uri: vscode.Uri) => {
			// inform the user that the image conversion is in progress
			vscode.window.showInformationMessage('Converting SVG to PNG...');
			const svgData = fs.readFileSync(uri.fsPath, 'utf8');
			const pngData = await sharp(Buffer.from(svgData)).resize(512, 512).png().toBuffer();
            const pngPath = path.join(path.dirname(uri.fsPath), path.basename(uri.fsPath, '.svg') + '.png');

            fs.writeFileSync(pngPath, pngData);

            vscode.window.showInformationMessage(`Converted SVG to PNG: ${pngPath}`);
        })
    );

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('svg', new SVGCodeActionProvider())
    );
}


