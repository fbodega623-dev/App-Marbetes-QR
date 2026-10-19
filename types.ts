
export enum LabelType {
  BARCODE = 'barcode'
}

export interface InventoryData {
  sku: string;
  description: string;
  localizador: string;
  pieces: number;
  subinventario: string;
}

export interface ProductRecord extends InventoryData {
  id: string;
}

export type BarcodeDataMode = 'SKU_ONLY' | 'STRUCTURED';
export type QRDataFormat = 'JSON' | 'PIPE' | 'CSV' | 'PREFIJO';
export type PaperSize = 'LETTER' | 'LABEL' | 'LABEL2';
export type ArrowDirection = 'NONE' | 'LEFT' | 'RIGHT';

export interface TemplateConfig {
  headerText: string;
  headerBg: string;
  headerTextColor: string;
  accentColor: string;
  barcodeWidth: number;
  barcodeHeight: number;
  qrSize: number;
  showDate: boolean;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'double';
  fontFamily: 'font-sans' | 'font-serif' | 'font-mono';
  logoUrl?: string;
  qrFormat: QRDataFormat;
  barcodeMode: BarcodeDataMode;
  qrSeparator: string;
  paperSize: PaperSize;
  arrowDirection: ArrowDirection;
  arrowSize: number;
  arrowOnlyOnFloor?: boolean;
  arrowPosition?: 'MIDDLE' | 'BELOW_LOCATOR';
}

export interface BarcodeConfig {
  value: string;
  format: 'CODE128' | 'EAN13' | 'CODE39';
  displayValue: boolean;
  fontSize: number;
}

export interface BarcodeLabelRecord {
  id: string;
  sku: string;
  fichaTecnica: string;
  categoria: string;
  description: string;
  cantCama: number;
  numEstiba: number;
  totalCajas: number;
  pzCaja: number;
  pzTarima: number;
  createdAt: string;
  logoUrl?: string;
  logoSize?: number;
  logoAlign?: 'left' | 'center' | 'right';
  logoPosition?: 'header' | 'footer' | 'watermark';
  orientation?: 'vertical' | 'horizontal';
  cornerFocus?: boolean;
  designStyle?: 'industrial' | 'modern';
  barcodeType?: string;
  barcodeScaleX?: number;
  barcodeScaleY?: number;
  labelFontSize?: number;
  valueFontSize?: number;
}
