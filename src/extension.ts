import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import sharp = require('sharp');
import ico = require('sharp-ico');

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
	
			// add a dialog to ask for the sizes (with platform presets)
			const sizeOptions: string[] = ['32x32', '128x128', '180x180', '256x256', '512x512', '1024x1024'];
			const size = await vscode.window.showQuickPick(sizeOptions, { placeHolder: 'Select the size of the PNG' });
			if (!size) {
				return;
			}
			const [width, height] = size.split('x').map(Number);
	
			const svgData = fs.readFileSync(uri.fsPath, 'utf8');
			const pngData = await sharp(Buffer.from(svgData)).resize(width, height).png().toBuffer();
			const pngPath = path.join(path.dirname(uri.fsPath), path.basename(uri.fsPath, '.svg') + size + '.png');
	
			fs.writeFileSync(pngPath, pngData);
	
			vscode.window.showInformationMessage(`Converted SVG to PNG: ${pngPath}`);
		})	
    );

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('svg', new SVGCodeActionProvider())
    );
    
    // Add another context item to the extension to generate an ICO
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.convertPNGToICO', async (uri: vscode.Uri) => {
            // inform the user that the image conversion is in progress
            vscode.window.showInformationMessage('Converting PNG to ICO...');
            const pngData = fs.readFileSync(uri.fsPath);
			//@ts-ignore
            const icoData = await ico.sharpsToIco([sharp(pngData)], null);
            const icoPath = path.join(path.dirname(uri.fsPath), path.basename(uri.fsPath, '.png') + '.ico');

			//@ts-ignore
            fs.writeFileSync(icoPath, icoData);

            vscode.window.showInformationMessage(`Converted PNG to ICO: ${icoPath}`);
        })
    );
}




//TODO: Ico files https://github.com/lovell/sharp/issues/1118#issuecomment-1205599759