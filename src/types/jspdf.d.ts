declare module 'jspdf' {
  export default class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string | number[]);
    text(text: string, x: number, y: number): void;
    setFontSize(size: number): void;
    addPage(): void;
    addImage(imageData: string, format: string, x: number, y: number, width: number, height: number): void;
    save(filename: string): void;
  }
}

declare module 'jspdf-autotable' {
  // This module extends jsPDF with autotable functionality
}
