declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableOptions {
    startY?: number;
    head?: string[][];
    body?: any[][];
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: {
      fillColor?: number[];
      textColor?: number[];
      fontSize?: number;
    };
    columnStyles?: {
      [key: number]: {
        cellWidth?: number | 'auto';
        halign?: 'left' | 'center' | 'right';
      };
    };
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    didDrawPage?: (data: any) => void;
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}