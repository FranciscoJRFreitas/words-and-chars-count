import * as vscode from 'vscode';

export function activate({ subscriptions }: vscode.ExtensionContext) {
  // Creates the status bar word counter
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    0
  );
  
  let isVisible = true;

  // Registers the word-count.show command
  subscriptions.push(
    vscode.commands.registerCommand('word-count.show', () => {
      isVisible = true;
      statusBarItem.show();
    })
  );

  // Registers the word-count.hide command
  subscriptions.push(
    vscode.commands.registerCommand('word-count.hide', () => {
      isVisible = false;
      statusBarItem.hide();
    })
  );

  // Toggle visibility when clicking on status bar item
  statusBarItem.command = 'word-count.toggle';

  subscriptions.push(
    vscode.commands.registerCommand('word-count.toggle', async () => {
      if (isVisible) {
        const confirmation = await vscode.window.showWarningMessage(
          'Are you sure you want to hide the word and character count?',
          'Yes',
          'Cancel'
        );
        
        if (confirmation === 'Yes') {
          isVisible = false;
          statusBarItem.hide();
          
          await vscode.window.showInformationMessage(
            'Word and character count is hidden. You can have it displayed back by running "Word Count: Show" in the Command Palette (Ctrl+Shift+P).'
          );
        }
      } else {
        isVisible = true;
        statusBarItem.show();
      }
    })
  );

  // Counts the number of words in a passed-in string
  const countWords = (text: string): number => {
    return text.split(/\s+/g).filter((word) => word).length;
  };

  // Gets the document text (or selection if any)
  const getText = (): string | null => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return null;
    const { document, selection } = editor;
    
    return selection.isEmpty ? document.getText() : document.getText(selection);
  };

  // Updates the status bar text with word and character count
  const setWordCount = (): null | void => {
    const text = getText();
    if (text === null) return null;
    const words = countWords(text);
    statusBarItem.text = `$(edit) ${words} Word${words === 1 ? '' : 's'} | ${text.length} Char${text.length === 1 ? '' : 's'}`;
  };

  // Initialize word count display
  setWordCount();
  statusBarItem.show();

  // Update count on document change or selection change
  vscode.workspace.onDidChangeTextDocument(setWordCount);
  vscode.window.onDidChangeTextEditorSelection(setWordCount);
}

export function deactivate() {}