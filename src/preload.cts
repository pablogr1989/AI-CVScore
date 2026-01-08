const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectFile: (): Promise<{ content: string; path: string } | null> => 
    ipcRenderer.invoke('select-file'),
  saveCV: (content: string, path: string): Promise<void> => 
    ipcRenderer.invoke('save-cv', content, path),
  loadInfo: (): Promise<string> => 
    ipcRenderer.invoke('load-info'),
  saveInfo: (content: string): Promise<void> => 
    ipcRenderer.invoke('save-info', content),
  generateCVAI: (jobOffer: string, personalInfo: string, specifications: string): Promise<string> => 
    ipcRenderer.invoke('generate-cv-ai', jobOffer, personalInfo, specifications),
  validateResumeAI: (jobOffer: string, generatedCV: string): Promise<string> => 
    ipcRenderer.invoke('validate-resume-ai', jobOffer, generatedCV),
  generatePDF: (content: string, templateName: string, targetDir: string): Promise<string> => 
    ipcRenderer.invoke('generate-pdf', content, templateName, targetDir),
  openPDF: (path: string): Promise<string> => 
    ipcRenderer.invoke('open-pdf', path),
  renderPreview: (content: string, templateName: string): Promise<{ success: boolean; html?: string; error?: string }> => 
    ipcRenderer.invoke('render-preview', content, templateName),
  selectDirectory: (): Promise<string | null> => 
    ipcRenderer.invoke('select-directory'),
  sendLog: (level: string, message: string, data?: any): void => 
    ipcRenderer.send('log-from-renderer', { level, message, data })
});