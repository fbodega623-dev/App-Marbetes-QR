
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { toJpeg } from 'html-to-image';
import { createClient } from '@supabase/supabase-js';
import { 
  QrCode as QrCodeIcon, 
  Printer, 
  Palette, 
  X,
  ClipboardList,
  Database,
  Search,
  Trash2,
  UploadCloud,
  Scan,
  Plus,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  FileText,
  Tag,
  LayoutGrid,
  Trash,
  Layers,
  ArrowLeft,
  ArrowRight,
  Minus,
  AlertTriangle,
  Info,
  Activity,
  Wifi,
  WifiOff,
  Copy
} from 'lucide-react';
import { 
  InventoryData,
  TemplateConfig,
  ProductRecord,
  BarcodeLabelRecord
} from './types';
import BarcodeStudio from './BarcodeStudio';

const SUPABASE_URL = 'https://unldivrtcnnivzsbstpi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubGRpdnJ0Y25uaXZ6c2JzdHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Nzg4MTMsImV4cCI6MjA5ODA1NDgxM30.mFQT6GMtMOfU-aS_sU3tjbIXhkCpe7UWyskJO4nqCqI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ZONES = ['TODOS', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const RACK_ORIENTATION: Record<string, 'FRENTE' | 'FONDO'> = {
  'A': 'FONDO', 'B': 'FRENTE', 'C': 'FRENTE', 'D': 'FONDO',
  'E': 'FONDO', 'F': 'FRENTE', 'G': 'FRENTE', 'H': 'FONDO',
  'I': 'FONDO', 'J': 'FRENTE', 'K': 'FRENTE', 'L': 'FONDO'
};

const RACK_PAIRS: Record<string, string> = {
  'A': 'AB', 'B': 'AB', 'C': 'CD', 'D': 'CD', 'E': 'EF', 'F': 'EF',
  'G': 'GH', 'H': 'GH', 'I': 'IJ', 'J': 'IJ', 'K': 'KL', 'L': 'KL'
};

const PASILLO_MAP: Record<string, [string, string]> = {
  'AB': ['A', 'B'], 'CD': ['C', 'D'], 'EF': ['E', 'F'],
  'GH': ['G', 'H'], 'IJ': ['I', 'J'], 'KL': ['K', 'L']
};

const compareLocators = (a: string, b: string) => {
  const parse = (loc: string) => {
    const parts = (loc || '').toUpperCase().split('-');
    return {
      rack: parts[0] || 'Z',
      col: parseInt(parts[1]) || 0,
      lvl: parseInt(parts[2]) || 0
    };
  };
  const la = parse(a), lb = parse(b);
  if (la.rack !== lb.rack) return la.rack.localeCompare(lb.rack);
  if (la.col !== lb.col) return la.col - lb.col;
  return la.lvl - lb.lvl;
};

const QRRenderer = memo(({ value, size }: { value: string; size: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let active = true;
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size, margin: 1, color: { dark: '#000000', light: '#ffffff' }, errorCorrectionLevel: 'M'
      }, (error) => { if (error && active) console.error("Error QR:", error); });
    }
    return () => { active = false; };
  }, [value, size]);
  return <canvas ref={canvasRef} className="max-w-full h-auto" />;
});

const BarcodeRenderer = memo(({ value, height = 30, width = 1.8, fontSize = 9, displayValue = false }: {
  value: string;
  height?: number;
  width?: number;
  fontSize?: number;
  displayValue?: boolean;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let active = true;
    if (svgRef.current && value && active) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          margin: 0,
          background: "#ffffff",
          lineColor: "#000000"
        });
      } catch (err) {
        console.error("Error generating barcode:", err);
      }
    }
    return () => { active = false; };
  }, [value, height, width, fontSize, displayValue]);

  return <svg ref={svgRef} className="max-w-full h-auto mx-auto" />;
});

const PrintableBarcodeLabel = memo(({ product }: { product: any }) => {
  const sku = product.sku || 'C0605-00';
  const fichaTecnica = product.fichaTecnica || 'Ficha Tecnica.';
  const categoria = product.categoria || 'Cocina';
  const description = product.description || 'JADE ESSENTIALS BATERIA 11 PZS';
  const cantCama = product.cantCama !== undefined ? product.cantCama : 7;
  const numEstiba = product.numEstiba !== undefined ? product.numEstiba : 4;
  const totalCajas = product.totalCajas !== undefined ? product.totalCajas : 28;
  const pzCaja = product.pzCaja !== undefined ? product.pzCaja : 2;
  const pzTarima = product.pzTarima !== undefined ? product.pzTarima : 56;

  return (
    <div 
      className="print-barcode-page bg-white text-black font-sans flex flex-col border-[2px] border-black p-1 box-border select-none overflow-hidden" 
      style={{ width: '15.2cm', height: '10.1cm', margin: '0 auto', pageBreakAfter: 'always' }}
    >
      {/* Header with Logo */}
      <div className="flex items-center justify-center py-1.5 shrink-0 border-b-[1.5px] border-black gap-2 bg-white">
        <svg viewBox="0 0 120 40" className="h-8 w-auto">
          <circle cx="20" cy="20" r="14" fill="#ef4444" />
          <circle cx="20" cy="20" r="10" fill="#ffffff" />
          <circle cx="20" cy="20" r="6" fill="#ef4444" />
          <path d="M 20,10 A 10,10 0 0,1 30,20 L 28,20 A 8,8 0 0,0 20,12 Z" fill="#ffffff" />
          <text x="42" y="26" fontFamily="'Outfit', sans-serif" fontWeight="900" fontSize="16" fill="#000000">cvdirecto</text>
        </svg>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0 text-[10px] leading-tight font-black uppercase text-center bg-white">
        
        {/* Ficha Tecnica row */}
        <div className="bg-zinc-100 py-0.5 border-b border-black font-bold text-[9px]">
          {fichaTecnica}
        </div>

        {/* Categoria row */}
        <div className="grid grid-rows-2 border-b border-black">
          <div className="bg-zinc-100 text-[7px] py-0.5 font-bold tracking-wider text-zinc-500 border-b border-zinc-200">CATEGORÍA:</div>
          <div className="py-0.5 text-[11px] font-black">{categoria}</div>
        </div>

        {/* Clave row */}
        <div className="grid grid-rows-2 border-b border-black">
          <div className="bg-zinc-100 text-[7px] py-0.5 font-bold tracking-wider text-zinc-500 border-b border-zinc-200">CLAVE / SKU:</div>
          <div className="py-0.5 text-xs font-black tracking-widest">{sku}</div>
        </div>

        {/* SKU Barcode Section */}
        <div className="py-1 flex items-center justify-center border-b border-black bg-white min-h-[45px]">
          <BarcodeRenderer value={sku} height={32} width={1.6} fontSize={8} displayValue={false} />
        </div>

        {/* Descripción row */}
        <div className="grid grid-rows-2 border-b border-black">
          <div className="bg-zinc-100 text-[7px] py-0.5 font-bold tracking-wider text-zinc-500 border-b border-zinc-200">DESCRIPCIÓN:</div>
          <div className="py-0.5 px-2 text-[9px] leading-tight font-extrabold truncate">{description}</div>
        </div>

        {/* Quantitative Grid / Table */}
        <div className="grid grid-cols-5 border-b border-black text-[8px] bg-white">
          <div className="border-r border-black flex flex-col justify-between">
            <span className="bg-zinc-100 py-0.5 border-b border-zinc-200 text-[7px] text-zinc-500 font-bold">CANT X CAMA</span>
            <span className="py-0.5 font-black text-[11px]">{cantCama}</span>
          </div>
          <div className="border-r border-black flex flex-col justify-between">
            <span className="bg-zinc-100 py-0.5 border-b border-zinc-200 text-[7px] text-zinc-500 font-bold">NUM X ESTIBA</span>
            <span className="py-0.5 font-black text-[11px]">{numEstiba}</span>
          </div>
          <div className="border-r border-black flex flex-col justify-between">
            <span className="bg-zinc-100 py-0.5 border-b border-zinc-200 text-[7px] text-zinc-500 font-bold">TOTAL CAJAS</span>
            <span className="py-0.5 font-black text-[11px]">{totalCajas}</span>
          </div>
          <div className="border-r border-black flex flex-col justify-between">
            <span className="bg-zinc-100 py-0.5 border-b border-zinc-200 text-[7px] text-zinc-500 font-bold">PZ X CAJA</span>
            <span className="py-0.5 font-black text-[11px]">{pzCaja}</span>
          </div>
          <div className="flex flex-col justify-between bg-blue-50/20">
            <span className="bg-zinc-100 py-0.5 border-b border-zinc-200 text-[7px] text-zinc-600 font-extrabold">PZ X TARIMA</span>
            <span className="py-0.5 font-black text-[12px] text-blue-900">{pzTarima}</span>
          </div>
        </div>

        {/* Pieces Barcode Section */}
        <div className="flex-1 py-1 bg-white flex flex-col items-center justify-center min-h-[45px]">
          <BarcodeRenderer value={String(pzTarima)} height={32} width={2.0} fontSize={8} displayValue={true} />
        </div>

      </div>
    </div>
  );
});

const PrintableLabel = memo(({ product, template, isMiniMode = false, arrowDirectionOverride }: any) => {
  const isEmptyLoc = product.sku === 'UBICACIÓN VACÍA';
  const isPickingLoc = product.sku === 'PICKING';
  const isSpecial = isEmptyLoc || isPickingLoc;
  
  const rackId = useMemo(() => (product.localizador || '').split('-')[0], [product.localizador]);
  const orientation = useMemo(() => RACK_ORIENTATION[rackId] || 'N/A', [rackId]);
  const isPickeoZone = useMemo(() => product.localizador?.toString().trim().endsWith('1'), [product.localizador]);
  
  const qrValue = useMemo(() => {
    if (isEmptyLoc) return "EMPTY_LOCATION";
    if (isPickingLoc) return "PICKING_LOCATION";
    const piecesData = isPickeoZone ? '0' : product.pieces;
    return `${product.sku || '---'}_${piecesData}_${product.description || 'N/A'}_${product.subinventario || 'N/A'}_${product.localizador || '---'}`;
  }, [product, isPickeoZone, isEmptyLoc, isPickingLoc]);

  const displayQrSize = isMiniMode ? 105 : template.qrSize;
  const finalArrowDir = arrowDirectionOverride !== undefined ? arrowDirectionOverride : template.arrowDirection;
  const shouldShowArrow = finalArrowDir !== 'NONE' && (!template.arrowOnlyOnFloor || isPickeoZone);

  if (isMiniMode) {
    return (
      <div className={`bg-white text-black flex flex-col h-full w-full overflow-hidden font-sans border box-border ${isSpecial ? 'border-zinc-200' : 'border-zinc-300'}`}>
        <div className={`${isPickingLoc ? 'bg-orange-600' : (isEmptyLoc ? 'bg-zinc-400' : 'bg-black')} text-white px-2 flex items-center justify-between shrink-0 h-[18px]`}>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded-full flex items-center justify-center font-black text-[5px]">CV</div>
            <h2 className="text-[8px] font-black leading-none uppercase tracking-tighter">{template.headerText}</h2>
          </div>
          <span className="text-[5px] font-black opacity-70 uppercase tracking-tight">{product.subinventario || (isSpecial ? 'ZONA ESPECIAL' : 'CTL')}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-between p-1 overflow-hidden">
          <div className="w-full text-center shrink-0">
             <span className="text-[4px] font-bold text-zinc-400 uppercase leading-none block tracking-tighter">{isSpecial ? 'TIPO DE ÁREA' : 'ARTÍCULO / SKU'}</span>
             <p className={`text-[11px] font-black leading-none uppercase truncate tracking-tight ${isPickingLoc ? 'text-orange-600' : (isEmptyLoc ? 'text-zinc-400' : 'text-black')}`}>{product.sku}</p>
          </div>
          <div className="flex-1 flex items-center justify-center w-full min-h-0 py-0.5">
            {isSpecial ? (
              <div className={`flex flex-col items-center justify-start pt-1 gap-0.5 w-full h-full`}>
                <div className={`px-2 py-0.5 rounded border border-black w-[85%] text-center ${orientation === 'FRENTE' ? 'bg-emerald-50' : 'bg-purple-50'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-tight ${orientation === 'FRENTE' ? 'text-emerald-800' : 'text-purple-800'}`}>
                    {orientation}
                  </span>
                </div>
                {shouldShowArrow && template.arrowPosition === 'MIDDLE' && (
                  <div className="flex items-center justify-center text-black">
                    {finalArrowDir === 'LEFT' ? <ArrowLeft size={template.arrowSize * 0.375} strokeWidth={3} /> : <ArrowRight size={template.arrowSize * 0.375} strokeWidth={3} />}
                  </div>
                )}
              </div>
            ) : (
              <QRRenderer value={qrValue} size={displayQrSize} />
            )}
          </div>
          <div className="w-full shrink-0 border-t border-zinc-200 pt-1 pb-1 px-1 flex flex-col items-center">
            <div className="flex justify-between items-baseline w-full">
              <p className={`text-[8px] font-black leading-none uppercase tracking-tight truncate flex-1 mr-1 ${isPickingLoc ? 'text-orange-700' : (isEmptyLoc ? 'text-zinc-500' : 'text-blue-800')}`}>
                {product.localizador} 
              </p>
              {!isSpecial && <p className="text-[9px] font-black leading-none uppercase text-black shrink-0">{isPickeoZone ? '---' : product.pieces}</p>}
            </div>
            {shouldShowArrow && template.arrowPosition === 'BELOW_LOCATOR' && (
              <div className="mt-1 text-black flex items-center justify-center w-full">
                {finalArrowDir === 'LEFT' ? <ArrowLeft size={template.arrowSize * 0.28} strokeWidth={3} /> : <ArrowRight size={template.arrowSize * 0.28} strokeWidth={3} />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black flex flex-col h-full w-full overflow-hidden font-sans box-border border border-zinc-300">
      <div className={`${isPickingLoc ? 'bg-orange-600' : 'bg-black'} text-white px-5 py-2 flex items-center gap-3 shrink-0 h-[60px]`}>
        <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center font-black text-xs">CV</div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-xl font-black leading-none tracking-tighter truncate uppercase">{template.headerText}</h2>
          <p className="text-[7px] font-bold uppercase tracking-[0.2em] opacity-80 mt-0.5">MARBETE DE CONTROL</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col px-6 py-3 overflow-hidden">
        <div className="flex justify-between items-end mb-1 shrink-0">
          <div className="min-w-0 flex flex-col">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-tight">{isSpecial ? 'SITUACIÓN' : 'ID / SKU'}</p>
            <p className={`text-2xl font-black leading-none uppercase truncate ${isPickingLoc ? 'text-orange-600' : (isEmptyLoc ? 'text-zinc-300' : 'text-black')}`}>{product.sku || '---'}</p>
          </div>
          {!isSpecial && (
            <div className="text-right shrink-0">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-tight">CANTIDAD</p>
              <p className="text-3xl font-black leading-none">{isPickeoZone ? '---' : (product.pieces || 0)}</p>
            </div>
          )}
        </div>
        <div className={`h-[2px] w-full mb-3 ${isPickingLoc ? 'bg-orange-500' : 'bg-black'}`}></div>
        <div className="flex-1 min-h-0 flex items-center justify-center py-1">
          {isSpecial ? (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <div className={`font-black text-6xl opacity-10 absolute top-[10%] select-none ${isPickingLoc ? 'text-orange-900' : 'text-zinc-900'}`}>
                {isPickingLoc ? 'PICKING' : 'VACÍO'}
              </div>
              <div className={`z-10 w-full py-5 border-y-4 border-black text-center flex flex-col items-center justify-center transform -translate-y-2 ${orientation === 'FRENTE' ? 'bg-emerald-50' : 'bg-purple-50'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${orientation === 'FRENTE' ? 'text-emerald-900' : 'text-purple-900'}`}>ORIENTACIÓN LOGÍSTICA</p>
                <p className={`text-6xl font-black uppercase leading-tight ${orientation === 'FRENTE' ? 'text-emerald-700' : 'text-purple-700'}`}>{orientation}</p>
                {shouldShowArrow && template.arrowPosition === 'MIDDLE' && (
                  <div className="mt-2 flex items-center justify-center text-black">
                    {finalArrowDir === 'LEFT' ? <ArrowLeft size={template.arrowSize} strokeWidth={4} /> : <ArrowRight size={template.arrowSize} strokeWidth={4} />}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <QRRenderer value={qrValue} size={displayQrSize} />
          )}
        </div>
        <div className="h-[1px] bg-zinc-200 w-full my-2"></div>
        <p className="text-[12px] font-bold italic uppercase leading-none line-clamp-1 text-zinc-800 mb-2">
          {isPickingLoc ? 'ÁREA DE SURTIDO ACTIVO' : (isEmptyLoc ? 'SIN REGISTRO EN BASE DE DATOS' : (product.description || 'N/A'))}
        </p>
        <div className={`border rounded-lg p-3 mt-auto shrink-0 flex flex-col items-center justify-center ${isPickingLoc ? 'bg-orange-50 border-orange-200' : 'bg-zinc-50 border-zinc-200'}`}>
          <p className={`text-2xl font-black uppercase leading-none text-center ${isPickingLoc ? 'text-orange-900' : 'text-black'}`}>
            {product.localizador || '---'} 
            {!isSpecial && <span className="text-xs text-zinc-400 ml-2">[{product.subinventario || 'GENERAL'}]</span>}
          </p>
          {shouldShowArrow && template.arrowPosition === 'BELOW_LOCATOR' && (
            <div className="mt-2 text-black flex items-center justify-center w-full">
              {finalArrowDir === 'LEFT' ? <ArrowLeft size={template.arrowSize * 0.8} strokeWidth={4} /> : <ArrowRight size={template.arrowSize * 0.8} strokeWidth={4} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const CatalogItem = memo(({ prod, isSelected, onToggle, onSelect, onDelete }: any) => {
  const rack = (prod.localizador || '').split('-')[0];
  const orientation = RACK_ORIENTATION[rack] || '---';

  return (
    <div className={`group border-2 rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer ${isSelected ? 'bg-blue-600/10 border-blue-600/50' : 'bg-zinc-950/40 border-zinc-800/40 hover:border-zinc-700'}`} onClick={() => onToggle(prod)}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-600'}`}>{isSelected ? <CheckSquare size={20} /> : <Square size={20} />}</div>
      <div className="flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); onSelect(prod); }}>
        <p className={`text-sm font-black uppercase tracking-tight truncate ${isSelected ? 'text-blue-400' : 'text-zinc-100'}`}>{prod.sku}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase">{prod.localizador}</span>
          <span className="text-[8px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">{prod.pieces} UDS</span>
          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${orientation === 'FRENTE' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-purple-900/30 text-purple-400'}`}>{orientation}</span>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(prod.id); }} className="p-2 text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
    </div>
  );
});

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'database' | 'design' | 'layout'>('content');
  const [dbStatus, setDbStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showUploadRules, setShowUploadRules] = useState(false);
  const [exportProgress, setExportProgress] = useState<{current: number, total: number} | null>(null);
  const [previewPage, setPreviewPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('TODOS');
  const [selectedColumn, setSelectedColumn] = useState<string>('TODOS');
  
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [selectedItems, setSelectedItems] = useState<Map<string, ProductRecord>>(new Map());
  const [inventory, setInventory] = useState<InventoryData>({ sku: '', description: '', localizador: '', pieces: 0, subinventario: '' });
  const [existingLocatorData, setExistingLocatorData] = useState<ProductRecord | null>(null);
  const [showSensitiveDataModal, setShowSensitiveDataModal] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  
  const [layoutMode, setLayoutMode] = useState<'DATABASE' | 'LOCAL'>('LOCAL');
  const [layoutSqlCopied, setLayoutSqlCopied] = useState(false);
  const [layoutItems, setLayoutItems] = useState<{id: string, localizador: string, zone?: string, zona?: string}[]>([]);
  const [layoutFilterRack, setLayoutFilterRack] = useState<string>('TODOS');
  const [layoutFilterColumn, setLayoutFilterColumn] = useState<string>('TODOS');
  const [layoutError, setLayoutError] = useState<string | null>(null);
  
  const [usingBackupNotice, setUsingBackupNotice] = useState(false);
  const [usingLayoutBackupNotice, setUsingLayoutBackupNotice] = useState(false);
  
  const [isFetching, setIsFetching] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const csvInputRef = useRef<HTMLInputElement>(null);

  const [template, setTemplate] = useState<TemplateConfig>({
    headerText: 'CVDIRECTO', headerBg: '#000000', headerTextColor: '#ffffff', accentColor: '#3b82f6',
    barcodeWidth: 160, barcodeHeight: 160, qrSize: 150, showDate: true, borderWidth: 4, borderStyle: 'solid',
    fontFamily: 'font-sans', logoUrl: undefined, qrFormat: 'PIPE', barcodeMode: 'STRUCTURED', qrSeparator: '_', paperSize: 'LABEL2',
    arrowDirection: 'NONE', arrowSize: 64, arrowOnlyOnFloor: true, arrowPosition: 'MIDDLE'
  });

  const [customPliegoArrows, setCustomPliegoArrows] = useState<Record<number, 'NONE' | 'LEFT' | 'RIGHT'>>({});

  // --- BARCODE MODE STATES ---
  const [currentMode, setCurrentMode] = useState<'qr' | 'barcode'>('qr');
  const [barcodeActiveTab, setBarcodeActiveTab] = useState<'content' | 'database'>('content');
  const [barcodeForm, setBarcodeForm] = useState({
    sku: 'C0605-00',
    fichaTecnica: 'Ficha Tecnica.',
    categoria: 'Cocina',
    description: 'JADE ESSENTIALS BATERIA 11 PZS',
    cantCama: 7,
    numEstiba: 4,
    totalCajas: 28,
    pzCaja: 2,
    pzTarima: 56
  });
  const [barcodeHistory, setBarcodeHistory] = useState<BarcodeLabelRecord[]>(() => {
    const stored = localStorage.getItem('cv_barcode_labels_history');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error("Error parsing barcode history:", e); }
    }
    return [
      {
        id: 'initial-1',
        sku: 'C0605-00',
        fichaTecnica: 'Ficha Tecnica.',
        categoria: 'Cocina',
        description: 'JADE ESSENTIALS BATERIA 11 PZS',
        cantCama: 7,
        numEstiba: 4,
        totalCajas: 28,
        pzCaja: 2,
        pzTarima: 56,
        createdAt: new Date().toISOString()
      }
    ];
  });
  const [selectedBarcodeItems, setSelectedBarcodeItems] = useState<Map<string, BarcodeLabelRecord>>(new Map());
  const [barcodeSearchTerm, setBarcodeSearchTerm] = useState('');
  const [barcodePrintList, setBarcodePrintList] = useState<any[]>([]);
  const [barcodeShowBatchPreview, setBarcodeShowBatchPreview] = useState(false);

  const handleCantCamaChange = useCallback((val: number) => {
    setBarcodeForm(prev => {
      const newTotal = val * prev.numEstiba;
      const newPzTarima = newTotal * prev.pzCaja;
      return { ...prev, cantCama: val, totalCajas: newTotal, pzTarima: newPzTarima };
    });
  }, []);

  const handleNumEstibaChange = useCallback((val: number) => {
    setBarcodeForm(prev => {
      const newTotal = prev.cantCama * val;
      const newPzTarima = newTotal * prev.pzCaja;
      return { ...prev, numEstiba: val, totalCajas: newTotal, pzTarima: newPzTarima };
    });
  }, []);

  const handlePzCajaChange = useCallback((val: number) => {
    setBarcodeForm(prev => {
      const newPzTarima = prev.totalCajas * val;
      return { ...prev, pzCaja: val, pzTarima: newPzTarima };
    });
  }, []);

  const handleTotalCajasChange = useCallback((val: number) => {
    setBarcodeForm(prev => {
      const newPzTarima = val * prev.pzCaja;
      return { ...prev, totalCajas: val, pzTarima: newPzTarima };
    });
  }, []);

  const handlePzTarimaChange = useCallback((val: number) => {
    setBarcodeForm(prev => ({ ...prev, pzTarima: val }));
  }, []);

  const handleAddBarcodeLabel = useCallback(() => {
    if (!barcodeForm.sku.trim()) {
      alert("Por favor ingrese la Clave / SKU.");
      return;
    }
    const newRecord: BarcodeLabelRecord = {
      id: `barcode-${Date.now()}`,
      ...barcodeForm,
      createdAt: new Date().toISOString()
    };
    setBarcodeHistory(prev => {
      const next = [newRecord, ...prev];
      localStorage.setItem('cv_barcode_labels_history', JSON.stringify(next));
      return next;
    });
    alert("Etiqueta guardada en el historial exitosamente.");
  }, [barcodeForm]);

  const handleDeleteBarcodeLabel = useCallback((id: string) => {
    setBarcodeHistory(prev => {
      const next = prev.filter(item => item.id !== id);
      localStorage.setItem('cv_barcode_labels_history', JSON.stringify(next));
      return next;
    });
    setSelectedBarcodeItems(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleClearBarcodeHistory = useCallback(() => {
    if (confirm("¿Estás seguro de que deseas vaciar todo el historial de códigos de barras?")) {
      setBarcodeHistory([]);
      localStorage.removeItem('cv_barcode_labels_history');
      setSelectedBarcodeItems(new Map());
    }
  }, []);

  const handleToggleBarcodeSelection = useCallback((item: BarcodeLabelRecord) => {
    setSelectedBarcodeItems(prev => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, item);
      }
      return next;
    });
  }, []);

  const handleSelectAllBarcodeFiltered = useCallback((filteredItems: BarcodeLabelRecord[]) => {
    setSelectedBarcodeItems(prev => {
      const next = new Map(prev);
      filteredItems.forEach(item => next.set(item.id, item));
      return next;
    });
  }, []);

  const handleDeselectAllBarcodeFiltered = useCallback((filteredItems: BarcodeLabelRecord[]) => {
    setSelectedBarcodeItems(prev => {
      const next = new Map(prev);
      filteredItems.forEach(item => next.delete(item.id));
      return next;
    });
  }, []);

  const handleLoadBarcodeLabelToForm = useCallback((item: BarcodeLabelRecord) => {
    setBarcodeForm({
      sku: item.sku,
      fichaTecnica: item.fichaTecnica,
      categoria: item.categoria,
      description: item.description,
      cantCama: item.cantCama,
      numEstiba: item.numEstiba,
      totalCajas: item.totalCajas,
      pzCaja: item.pzCaja,
      pzTarima: item.pzTarima
    });
    setBarcodeActiveTab('content');
  }, []);

  const handlePrintSingleBarcode = useCallback((item: any) => {
    setBarcodePrintList([item]);
    setTimeout(() => {
      window.print();
    }, 150);
  }, []);

  const handlePrintBatchBarcode = useCallback((items: BarcodeLabelRecord[]) => {
    setBarcodePrintList(items);
    setTimeout(() => {
      window.print();
    }, 150);
  }, []);

  const barcodePreviewRef = useRef<HTMLDivElement>(null);

  const handleDownloadBarcodeJpeg = useCallback(async () => {
    if (!barcodePreviewRef.current) return;
    try {
      const dataUrl = await toJpeg(barcodePreviewRef.current, {
        quality: 0.95,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true
      });
      const link = document.createElement('a');
      link.download = `MARBETE_BARRAS_${barcodeForm.sku}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error downloading barcode JPEG:", err);
      alert("Error al descargar la imagen.");
    }
  }, [barcodeForm]);

  const getPliegoArrowDirection = useCallback((pIdx: number) => {
    if (customPliegoArrows[pIdx] !== undefined) {
      return customPliegoArrows[pIdx];
    }
    const base = template.arrowDirection;
    if (base === 'NONE') return 'NONE';
    if (base === 'LEFT') {
      return pIdx % 2 === 0 ? 'LEFT' : 'RIGHT';
    } else { // base === 'RIGHT'
      return pIdx % 2 === 0 ? 'RIGHT' : 'LEFT';
    }
  }, [template.arrowDirection, customPliegoArrows]);

  const handleTogglePliegoArrow = useCallback((pIdx: number) => {
    const currentDir = getPliegoArrowDirection(pIdx);
    let nextDir: 'NONE' | 'LEFT' | 'RIGHT' = 'NONE';
    if (currentDir === 'NONE') nextDir = 'LEFT';
    else if (currentDir === 'LEFT') nextDir = 'RIGHT';
    else if (currentDir === 'RIGHT') nextDir = 'NONE';
    
    setCustomPliegoArrows(prev => ({
      ...prev,
      [pIdx]: nextDir
    }));
  }, [getPliegoArrowDirection]);

  // --- IMPLEMENTACIÓN PUNTO 4: HEARTBEAT & KEEP-ALIVE ---
  const performHeartbeat = useCallback(async (isInitial = false) => {
    if (isInitial) setDbStatus('connecting');
    try {
      // Consulta ultra ligera para despertar a Supabase y mantenerlo activo
      const { error } = await supabase.from('inventory').select('id').limit(1);
      if (error) throw error;
      setDbStatus('online');
    } catch (err) {
      console.warn('Supabase Heartbeat failed, retrying...', err);
      setDbStatus('offline');
      // Reintento exponencial simple
      setTimeout(() => performHeartbeat(), isInitial ? 2000 : 5000);
    }
  }, []);

  useEffect(() => {
    performHeartbeat(true);
    // Latido cada 5 minutos mientras la app esté abierta para evitar pausa por inactividad
    const interval = setInterval(() => performHeartbeat(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [performHeartbeat]);
  // -----------------------------------------------------

  // --- INICIO DE SISTEMA DE RESPALDO INTELIGENTE (FALLBACK) ---
  const filterLayoutItemsLocally = useCallback((items: any[], rack: string, col: string) => {
    let filtered = items;
    if (rack !== 'TODOS') {
      filtered = filtered.filter(item => (item.localizador || '').toUpperCase().startsWith(`${rack}-`));
    }
    if (col !== 'TODOS') {
      const colInt = parseInt(col, 10);
      filtered = filtered.filter(item => {
        const parts = (item.localizador || '').split('-');
        return parts.length >= 2 && parseInt(parts[1], 10) === colInt;
      });
    }
    return filtered.sort((a, b) => compareLocators(a.localizador, b.localizador));
  }, []);

  const generateLocalLayoutFallback = useCallback(() => {
    const racks = layoutFilterRack === 'TODOS' ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] : [layoutFilterRack];
    const columns = layoutFilterColumn === 'TODOS' ? Array.from({ length: 25 }, (_, i) => i + 1) : [parseInt(layoutFilterColumn, 10)];
    const levels = Array.from({ length: 5 }, (_, i) => i + 1);
    
    const generated: any[] = [];
    racks.forEach(r => {
      columns.forEach(c => {
        levels.forEach(l => {
          generated.push({
            id: `local-${r}-${c}-${l}`,
            localizador: `${r}-${c}-${l}`,
            zone: r,
            zona: r
          });
        });
      });
    });
    
    const sorted = generated.sort((a, b) => compareLocators(a.localizador, b.localizador));
    setLayoutItems(sorted);
    setUsingLayoutBackupNotice(true);
  }, [layoutFilterRack, layoutFilterColumn]);

  const refreshCompleteBackup = useCallback(async () => {
    if (dbStatus === 'offline') return;
    try {
      const { data, error } = await supabase.from('inventory').select('*');
      if (!error && data && data.length > 0) {
        localStorage.setItem('cv_backup_inventory', JSON.stringify(data));
      }
    } catch (e) {
      console.error("Error al refrescar respaldo de inventario:", e);
    }
  }, [dbStatus]);

  const refreshCompleteLayoutBackup = useCallback(async () => {
    if (dbStatus === 'offline') return;
    try {
      const { data, error } = await supabase.from('warehouse_layout').select('*').limit(3000);
      if (!error && data && data.length > 0) {
        localStorage.setItem('cv_backup_layout', JSON.stringify(data));
      }
    } catch (e) {
      console.error("Error al refrescar respaldo de layout:", e);
    }
  }, [dbStatus]);

  const fetchInventoryDataOnDemand = useCallback(async () => {
    setIsFetching(true);
    const isFiltered = !!searchTerm || selectedZone !== 'TODOS' || selectedColumn !== 'TODOS';

    if (dbStatus === 'offline') {
      const stored = localStorage.getItem('cv_backup_inventory');
      if (stored) {
        try {
          let parsed = JSON.parse(stored) as ProductRecord[];
          if (searchTerm) {
            parsed = parsed.filter(p => (p.sku || '').toUpperCase().includes(searchTerm.toUpperCase()));
          }
          if (selectedZone !== 'TODOS') {
            parsed = parsed.filter(p => (p.localizador || '').toUpperCase().startsWith(`${selectedZone}-`));
          }
          if (selectedColumn !== 'TODOS') {
            const colInt = parseInt(selectedColumn, 10);
            parsed = parsed.filter(p => {
              const parts = (p.localizador || '').split('-');
              return parts.length >= 2 && parseInt(parts[1], 10) === colInt;
            });
          }
          const sorted = parsed.sort((a, b) => compareLocators(a.localizador, b.localizador));
          setProducts(sorted);
          setUsingBackupNotice(true);
        } catch (e) {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
      setIsFetching(false);
      return;
    }

    try {
      // 1. Verificar si la base de datos de Supabase está vacía
      const { data: countCheck, error: countErr } = await supabase.from('inventory').select('id').limit(1);
      
      if (!countErr && countCheck) {
        if (countCheck.length > 0) {
          // La base de datos contiene registros, consultamos y mostramos de forma normal
          let query = supabase.from('inventory').select('*');
          if (searchTerm) query = query.ilike('sku', `%${searchTerm.toUpperCase()}%`);
          if (selectedZone !== 'TODOS') query = query.ilike('localizador', `${selectedZone}-%`);

          const { data, error } = await query.limit(1000);
          if (error) throw error;

          if (data) {
            let filtered = data as ProductRecord[];
            if (selectedColumn !== 'TODOS') {
              const colInt = parseInt(selectedColumn, 10);
              filtered = filtered.filter(p => {
                const parts = (p.localizador || '').split('-');
                return parts.length >= 2 && parseInt(parts[1], 10) === colInt;
              });
            }
            const sorted = filtered.sort((a, b) => compareLocators(a.localizador, b.localizador));
            setProducts(sorted);
            setUsingBackupNotice(false);

            // Si se consulta sin filtros, actualizamos el respaldo completo local inmediatamente
            if (!isFiltered) {
              localStorage.setItem('cv_backup_inventory', JSON.stringify(data));
            } else {
              // Si tiene filtros, refrescamos el respaldo completo en segundo plano para mantenerlo al día
              refreshCompleteBackup();
            }
          }
        } else {
          // La base de datos está COMPLETAMENTE VACÍA (0 filas)
          // Activamos el respaldo inteligente para no perder la información guardada localmente
          const stored = localStorage.getItem('cv_backup_inventory');
          if (stored) {
            try {
              let parsed = JSON.parse(stored) as ProductRecord[];
              if (searchTerm) {
                parsed = parsed.filter(p => (p.sku || '').toUpperCase().includes(searchTerm.toUpperCase()));
              }
              if (selectedZone !== 'TODOS') {
                parsed = parsed.filter(p => (p.localizador || '').toUpperCase().startsWith(`${selectedZone}-`));
              }
              if (selectedColumn !== 'TODOS') {
                const colInt = parseInt(selectedColumn, 10);
                parsed = parsed.filter(p => {
                  const parts = (p.localizador || '').split('-');
                  return parts.length >= 2 && parseInt(parts[1], 10) === colInt;
                });
              }
              const sorted = parsed.sort((a, b) => compareLocators(a.localizador, b.localizador));
              setProducts(sorted);
              setUsingBackupNotice(true);
            } catch (e) {
              setProducts([]);
            }
          } else {
            setProducts([]);
            setUsingBackupNotice(false);
          }
        }
      } else {
        // En caso de error de conexión o consulta de conteo, cargamos el respaldo local directamente
        throw countErr || new Error("Fallo al verificar registros.");
      }
    } catch (err) {
      console.error("Error al consultar inventario Supabase, usando respaldo:", err);
      const stored = localStorage.getItem('cv_backup_inventory');
      if (stored) {
        try {
          let parsed = JSON.parse(stored) as ProductRecord[];
          if (searchTerm) {
            parsed = parsed.filter(p => (p.sku || '').toUpperCase().includes(searchTerm.toUpperCase()));
          }
          if (selectedZone !== 'TODOS') {
            parsed = parsed.filter(p => (p.localizador || '').toUpperCase().startsWith(`${selectedZone}-`));
          }
          if (selectedColumn !== 'TODOS') {
            const colInt = parseInt(selectedColumn, 10);
            parsed = parsed.filter(p => {
              const parts = (p.localizador || '').split('-');
              return parts.length >= 2 && parseInt(parts[1], 10) === colInt;
            });
          }
          const sorted = parsed.sort((a, b) => compareLocators(a.localizador, b.localizador));
          setProducts(sorted);
          setUsingBackupNotice(true);
        } catch (e) {}
      }
    } finally {
      setIsFetching(false);
    }
  }, [searchTerm, selectedZone, selectedColumn, dbStatus, refreshCompleteBackup]);

  const fetchLayoutDataOnDemand = useCallback(async () => {
    setIsFetching(true);
    setLayoutError(null);

    if (layoutMode === 'LOCAL') {
      try {
        const racks = layoutFilterRack === 'TODOS' ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] : [layoutFilterRack];
        const columns = layoutFilterColumn === 'TODOS' ? Array.from({ length: 25 }, (_, i) => i + 1) : [parseInt(layoutFilterColumn, 10)];
        const levels = Array.from({ length: 5 }, (_, i) => i + 1);
        
        const generated: any[] = [];
        racks.forEach(r => {
          columns.forEach(c => {
            levels.forEach(l => {
              generated.push({
                id: `local-${r}-${c}-${l}`,
                localizador: `${r}-${c}-${l}`,
                zone: r,
                zona: r
              });
            });
          });
        });
        
        const sorted = generated.sort((a, b) => compareLocators(a.localizador, b.localizador));
        setLayoutItems(sorted);
        setUsingLayoutBackupNotice(false);
      } catch (err: any) {
        setLayoutError(err.message || String(err));
      } finally {
        setIsFetching(false);
      }
      return;
    }

    if (dbStatus === 'offline') {
      const stored = localStorage.getItem('cv_backup_layout');
      if (stored) {
        try {
          let parsed = JSON.parse(stored) as any[];
          parsed = filterLayoutItemsLocally(parsed, layoutFilterRack, layoutFilterColumn);
          setLayoutItems(parsed);
          setUsingLayoutBackupNotice(true);
        } catch (e) {
          generateLocalLayoutFallback();
        }
      } else {
        generateLocalLayoutFallback();
      }
      setIsFetching(false);
      return;
    }

    try {
      // 1. Verificar si la tabla de layout tiene datos en Supabase
      const { data: layoutCountCheck, error: layoutCountErr } = await supabase.from('warehouse_layout').select('id').limit(1);
      
      if (!layoutCountErr && layoutCountCheck) {
        if (layoutCountCheck.length > 0) {
          // Contiene registros, procedemos a consultar de forma habitual
          let query = supabase.from('warehouse_layout').select('*');
          if (layoutFilterRack !== 'TODOS') {
            query = query.ilike('localizador', `${layoutFilterRack}-%`);
          } else {
            query = query.limit(3000);
          }

          const { data, error } = await query;
          if (error) throw error;

          if (data) {
            let filtered = data;
            if (layoutFilterColumn !== 'TODOS') {
              const filterColInt = parseInt(layoutFilterColumn, 10);
              filtered = data.filter(item => {
                const loc = (item.localizador || '').trim();
                const parts = loc.split('-');
                if (parts.length < 2) return false;
                const colInt = parseInt(parts[1], 10);
                return colInt === filterColInt;
              });
            }

            const sorted = filtered.sort((a, b) => compareLocators(a.localizador, b.localizador));
            setLayoutItems(sorted);
            setUsingLayoutBackupNotice(false);

            // Si es consulta completa de todos los racks, actualizamos el respaldo
            if (layoutFilterRack === 'TODOS') {
              localStorage.setItem('cv_backup_layout', JSON.stringify(data));
            } else {
              refreshCompleteLayoutBackup();
            }
          }
        } else {
          // La tabla está vacía en Supabase, activamos el respaldo inteligente
          const stored = localStorage.getItem('cv_backup_layout');
          if (stored) {
            try {
              let parsed = JSON.parse(stored) as any[];
              parsed = filterLayoutItemsLocally(parsed, layoutFilterRack, layoutFilterColumn);
              setLayoutItems(parsed);
              setUsingLayoutBackupNotice(true);
            } catch (e) {
              generateLocalLayoutFallback();
            }
          } else {
            generateLocalLayoutFallback();
          }
        }
      } else {
        throw layoutCountErr || new Error("Fallo al verificar tabla layout.");
      }
    } catch (err: any) {
      console.error("Error al consultar layout Supabase, usando respaldo:", err);
      const stored = localStorage.getItem('cv_backup_layout');
      if (stored) {
        try {
          let parsed = JSON.parse(stored) as any[];
          parsed = filterLayoutItemsLocally(parsed, layoutFilterRack, layoutFilterColumn);
          setLayoutItems(parsed);
          setUsingLayoutBackupNotice(true);
        } catch (e) {
          generateLocalLayoutFallback();
        }
      } else {
        generateLocalLayoutFallback();
      }
    } finally {
      setIsFetching(false);
    }
  }, [layoutFilterRack, layoutFilterColumn, dbStatus, layoutMode, filterLayoutItemsLocally, generateLocalLayoutFallback, refreshCompleteLayoutBackup]);

  useEffect(() => { 
    const timer = setTimeout(() => { fetchInventoryDataOnDemand(); }, 400); 
    return () => clearTimeout(timer);
  }, [searchTerm, selectedZone, selectedColumn, fetchInventoryDataOnDemand]);
  
  useEffect(() => { 
    if (activeTab === 'layout') fetchLayoutDataOnDemand(); 
  }, [activeTab, layoutFilterRack, layoutFilterColumn, layoutMode, fetchLayoutDataOnDemand]);

  useEffect(() => {
    const checkLocator = async () => {
      if (!inventory.localizador) {
        setExistingLocatorData(null);
        return;
      }
      const cleanLoc = inventory.localizador.trim().toUpperCase();
      if (cleanLoc.length < 3) {
        setExistingLocatorData(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .eq('localizador', cleanLoc)
          .limit(1);
        if (!error && data && data.length > 0) {
          setExistingLocatorData(data[0] as ProductRecord);
        } else {
          setExistingLocatorData(null);
        }
      } catch (err) {
        console.error("Error checking locator:", err);
      }
    };
    const timer = setTimeout(checkLocator, 300);
    return () => clearTimeout(timer);
  }, [inventory.localizador]);

  const handleAddProduct = async (forceUpdate = false) => {
    if (!inventory.sku || !inventory.localizador) {
      alert("Por favor, ingresa SKU y Localizador.");
      return;
    }

    if (existingLocatorData && !forceUpdate) {
      setShowSensitiveDataModal(true);
      return;
    }

    let error;
    let data;

    if (existingLocatorData) {
      const res = await supabase
        .from('inventory')
        .update({
          sku: inventory.sku.toUpperCase(),
          description: inventory.description,
          pieces: inventory.pieces,
          subinventario: inventory.subinventario?.toUpperCase()
        })
        .eq('localizador', inventory.localizador.toUpperCase())
        .select();
      error = res.error;
      data = res.data;
    } else {
      const res = await supabase.from('inventory').insert([{ 
        sku: inventory.sku.toUpperCase(), 
        localizador: inventory.localizador.toUpperCase(),
        pieces: inventory.pieces,
        description: inventory.description,
        subinventario: inventory.subinventario?.toUpperCase()
      }]).select();
      error = res.error;
      data = res.data;
    }

    if (!error && data) {
      fetchInventoryDataOnDemand();
      setInventory({ sku: '', description: '', localizador: '', pieces: 0, subinventario: '' });
      setExistingLocatorData(null);
      setShowSensitiveDataModal(false);
      alert('Información guardada exitosamente.');
    } else if (error) {
      alert('Error al guardar datos: ' + error.message);
    }
  };

  const generatedSql = useMemo(() => {
    const cleanSku = (inventory.sku || '').toUpperCase();
    const cleanLoc = (inventory.localizador || '').toUpperCase();
    const cleanPieces = inventory.pieces || 0;
    const cleanDesc = (inventory.description || '').replace(/'/g, "''");
    const cleanSub = (inventory.subinventario || '').toUpperCase().replace(/'/g, "''");
    
    return `UPDATE inventory \nSET \n  sku = '${cleanSku}', \n  pieces = ${cleanPieces}, \n  description = '${cleanDesc}', \n  subinventario = '${cleanSub}' \nWHERE \n  localizador = '${cleanLoc}';`;
  }, [inventory]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(generatedSql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  const handleExportCSV = async () => {
    try {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error || !data) throw error;
      const csvHeaders = ['SKU', 'LOCALIZADOR', 'PIEZAS', 'DESCRIPTION', 'SUBINVENTARIO'];
      const dbFieldsMapping = ['sku', 'localizador', 'pieces', 'description', 'subinventario'];
      const csvContent = [
        csvHeaders.join(','),
        ...data.map((row: any) => dbFieldsMapping.map(field => `"${row[field] || ''}"`).join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `INVENTARIO_CVDIRECTO_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) { alert('Error al exportar catálogo'); }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const validationErrors: string[] = [];
      const localizadorRegex = /^[A-L]-[0-9]+-[0-9]+$/i;
      const numericRegex = /^[0-9]+$/;
      const dataLines = lines.slice(1).filter(l => l.replace(/,/g, '').trim() !== '');
      if (dataLines.length === 0) { alert("El archivo CSV no contiene datos."); return; }
      const toInsert = dataLines.map((line, index) => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/"/g, ''));
        const rowNum = index + 2;
        const sku = (values[0] || '').toUpperCase();
        const loc = (values[1] || '').toUpperCase();
        const pcsStr = values[2] || "";
        const descRaw = values[3] || "";
        const sub = (values[4] || '').toUpperCase();
        if (!sku) validationErrors.push(`Fila ${rowNum}: SKU vacío.`);
        if (!loc) validationErrors.push(`Fila ${rowNum}: LOCALIZADOR vacío.`);
        if (loc && !localizadorRegex.test(loc)) validationErrors.push(`Fila ${rowNum}: El LOCALIZADOR '${loc}' es inválido.`);
        if (pcsStr && !numericRegex.test(pcsStr)) validationErrors.push(`Fila ${rowNum}: Cantidad de PIEZAS '${pcsStr}' inválida.`);
        const descClean = descRaw.replace(/[_"]/g, '');
        return { sku, localizador: loc, pieces: parseInt(pcsStr) || 0, description: descClean, subinventario: sub };
      });
      if (validationErrors.length > 0) {
        setTimeout(() => alert(`⚠️ ERROR DE ESTRUCTURA\n\nSe detectaron ${validationErrors.length} errores.`), 100);
        return;
      }
      if (toInsert.length > 0) {
        setIsFetching(true);
        const { error } = await supabase.from('inventory').insert(toInsert);
        setIsFetching(false);
        if (error) alert('Error técnico al subir.');
        else { alert('Carga masiva completada.'); fetchInventoryDataOnDemand(); }
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAll = async () => {
    setIsFetching(true);
    const { error } = await supabase.from('inventory').delete().neq('sku', 'BORRADO_ABSURDO_QUERY');
    setIsFetching(false);
    setShowDeleteConfirm(false);
    if (error) alert('Error al vaciar');
    else { alert('Base de datos vaciada.'); fetchInventoryDataOnDemand(); }
  };

  const handleExportBatch = async () => {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;
    setExportProgress({ current: 0, total: totalPages });
    printArea.style.display = 'block';
    try {
      const pages = printArea.querySelectorAll('.print-page');
      for (let i = 0; i < pages.length; i++) {
        setExportProgress({ current: i + 1, total: totalPages });
        const dataUrl = await toJpeg(pages[i] as HTMLElement, { quality: 0.90, pixelRatio: 3, backgroundColor: '#ffffff', cacheBust: true });
        const link = document.createElement('a');
        link.download = `LOTE_PAG_${i + 1}.jpg`; link.href = dataUrl; link.click();
        await new Promise(r => setTimeout(r, 1000)); 
      }
      setSelectedItems(new Map()); setShowPreview(false); alert('Lote descargado exitosamente.');
    } catch (e) { alert('Error en la exportación.'); } finally { printArea.style.display = 'none'; setExportProgress(null); }
  };

  const baseCapacity = template.paperSize === 'LETTER' ? 4 : 12;
  const organizedPrintingData = useMemo(() => {
    const raw: ProductRecord[] = selectedItems.size > 0 ? Array.from(selectedItems.values()) : (inventory.sku ? [{ ...inventory, id: 'temp' } as ProductRecord] : []);
    if (template.paperSize !== 'LABEL2' || raw.length === 0) return raw;
    const groups: Record<string, ProductRecord[]> = {};
    raw.forEach(p => { 
      const parts = (p.localizador || '').split('-');
      const rack = parts[0] || 'Z';
      const col = parts[1] || '0';
      const aisle = RACK_PAIRS[rack] || rack;
      const key = `${aisle}-${col}`;
      if (!groups[key]) groups[key] = []; 
      groups[key].push(p); 
    });
    const pages: (ProductRecord | null)[] = [];
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const pa = a.split('-'), pb = b.split('-');
      if (pa[0] !== pb[0]) return pa[0].localeCompare(pb[0]);
      return (parseInt(pa[1]) || 0) - (parseInt(pb[1]) || 0);
    });
    sortedKeys.forEach(key => {
      const [aisle, col] = key.split('-');
      const racksInAisle = PASILLO_MAP[aisle] || [aisle, aisle];
      for (let l = 6; l >= 1; l--) {
        const leftRack = racksInAisle[0];
        const leftProd = groups[key]?.find((p: ProductRecord) => {
          const parts = p.localizador.split('-');
          return parts[0] === leftRack && parseInt(parts[2]) === l;
        });
        if (l === 1) pages.push({ id: `picking-${leftRack}-${col}-${l}`, sku: 'PICKING', localizador: `${leftRack}-${col}-${l}`, description: '', pieces: 0, subinventario: '' } as ProductRecord);
        else pages.push(leftProd || { id: `empty-${leftRack}-${col}-${l}`, sku: 'UBICACIÓN VACÍA', localizador: `${leftRack}-${col}-${l}`, description: '', pieces: 0, subinventario: '' } as ProductRecord);
        const rightRack = racksInAisle[1];
        const rightProd = groups[key]?.find((p: ProductRecord) => {
          const parts = p.localizador.split('-');
          return parts[0] === rightRack && parseInt(parts[2]) === l;
        });
        if (l === 1) pages.push({ id: `picking-${rightRack}-${col}-${l}`, sku: 'PICKING', localizador: `${rightRack}-${col}-${l}`, description: '', pieces: 0, subinventario: '' } as ProductRecord);
        else pages.push(rightProd || { id: `empty-${rightRack}-${col}-${l}`, sku: 'UBICACIÓN VACÍA', localizador: `${rightRack}-${col}-${l}`, description: '', pieces: 0, subinventario: '' } as ProductRecord);
      }
    });
    return pages;
  }, [selectedItems, inventory, template.paperSize]);

  const totalPages = Math.ceil(organizedPrintingData.length / baseCapacity);
  const printPageStyle = template.paperSize === 'LETTER' ? { width: '215.9mm', height: '279.4mm', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' } : { width: '100mm', height: '310mm', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'repeat(6, 1fr)' };

  let lastRC_H = "";
  let lastRC_L = "";

  const handleToggleItem = useCallback((prod: ProductRecord) => {
    setSelectedItems(prev => {
      const next = new Map(prev);
      if (next.has(prod.id)) next.delete(prod.id);
      else next.set(prod.id, prod);
      return next;
    });
  }, []);

  const handleSelectAllFiltered = useCallback(() => {
    setSelectedItems(prev => {
      const next = new Map(prev);
      products.forEach(p => next.set(p.id, p));
      return next;
    });
  }, [products]);

  const handleDeselectAllFiltered = useCallback(() => {
    setSelectedItems(prev => {
      const next = new Map(prev);
      products.forEach(p => next.delete(p.id));
      return next;
    });
  }, [products]);

  return (
    <div className={`min-h-screen text-zinc-100 flex flex-col ${template.fontFamily}`}>
      <input type="file" ref={csvInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />

      {/* MODALES */}
      {showUploadRules && (
        <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#121215] border border-zinc-800/80 p-8 md:p-10 rounded-[2.5rem] max-w-2xl w-full space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Background absolute cloud icon */}
            <div className="absolute -top-4 -right-4 text-zinc-800/10 pointer-events-none">
              <UploadCloud size={160} strokeWidth={1} />
            </div>

            {/* Header */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20">
                <Info size={28} className="text-blue-500" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white leading-none">REQUISITOS DEL TEMPLATE</h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5">VALIDACIÓN OBLIGATORIA DEL SISTEMA</p>
              </div>
            </div>

            {/* Cards Container */}
            <div className="space-y-4 relative z-10">
              
              {/* Card 1: ORDEN DE COLUMNAS */}
              <div className="bg-[#18181c] p-5 rounded-2xl border border-zinc-800/60 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20 text-blue-500">
                  <LayoutGrid size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black uppercase text-blue-500 tracking-wider mb-1">ORDEN DE COLUMNAS</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mb-2">EL ARCHIVO DEBE TENER ESTE ORDEN EXACTO:</p>
                  <p className="text-[11px] font-mono-data font-black text-white bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800/50 uppercase tracking-tight overflow-x-auto whitespace-nowrap">
                    SKU | LOCALIZADOR | PIEZAS | DESCRIPTION | SUBINVENTARIO
                  </p>
                </div>
              </div>

              {/* Card 2: REGLAS ESTRICTAS */}
              <div className="bg-[#18181c] p-5 rounded-2xl border border-zinc-800/60 flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20 text-amber-500">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-2">REGLAS ESTRICTAS</h4>
                  <ul className="space-y-1.5">
                    <li className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight flex items-start gap-2">
                      <span className="text-amber-500 shrink-0 mt-1">•</span>
                      <span>TODAS LAS COLUMNAS DEBEN TENER DATOS (SIN CELDAS VACÍAS).</span>
                    </li>
                    <li className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight flex items-start gap-2">
                      <span className="text-amber-500 shrink-0 mt-1">•</span>
                      <span>EL LOCALIZADOR DEBE SER RACK-COL-NIVEL (EJ: A-1-1).</span>
                    </li>
                    <li className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight flex items-start gap-2">
                      <span className="text-amber-500 shrink-0 mt-1">•</span>
                      <span>LA COLUMNA DE PIEZAS SOLO ACEPTA NÚMEROS.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card 3: TRATAMIENTO DE DATOS */}
              <div className="bg-[#18181c] p-5 rounded-2xl border border-zinc-800/60 flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-500">
                  <Layers size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase text-emerald-500 tracking-wider mb-1.5">TRATAMIENTO DE DATOS</h4>
                  <p className="text-[10px] font-bold text-zinc-300 uppercase leading-relaxed tracking-tight">
                    EL SISTEMA NO PERMITE LA SUBIDA SI LA DESCRIPCIÓN CONTIENE LOS CARACTERES <span className="text-emerald-400 font-mono">"_"</span> O <span className="text-emerald-400 font-mono">"\"</span>. POR FAVOR, ELIMÍNALOS DE TU ARCHIVO ANTES DE CARGAR.
                  </p>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 relative z-10 pt-2">
              <button 
                onClick={() => { setShowUploadRules(false); csvInputRef.current?.click(); }} 
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 tracking-wider transition-colors"
              >
                <UploadCloud size={16} />
                ENTENDIDO, SELECCIONAR ARCHIVO
              </button>
              <button 
                onClick={() => setShowUploadRules(false)} 
                className="w-full bg-zinc-800/80 hover:bg-zinc-800 active:bg-zinc-900 py-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-colors"
              >
                CANCELAR
              </button>
            </div>

          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-red-500/30 p-10 rounded-[3rem] max-w-lg w-full text-center space-y-6">
            <AlertTriangle size={64} className="text-red-500 mx-auto" />
            <h2 className="text-3xl font-black uppercase tracking-tighter">¿BORRAR TODO EL CATÁLOGO?</h2>
            <button onClick={handleDeleteAll} className="w-full bg-red-600 py-6 rounded-2xl font-black uppercase text-xs">SÍ, BORRAR TODO</button>
            <button onClick={() => setShowDeleteConfirm(false)} className="w-full bg-zinc-800 py-6 rounded-2xl font-black uppercase text-xs">CANCELAR</button>
          </div>
        </div>
      )}

      {showExportConfirm && (
        <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-zinc-950 border border-blue-500/40 p-12 rounded-[3rem] max-w-xl w-full text-center space-y-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 mx-auto">
              <Printer size={36} className="text-blue-400" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">¿CONFIRMAR DESCARGA DE LOTE?</h2>
              <p className="text-zinc-400 text-xs font-black uppercase tracking-widest leading-relaxed">
                Le aconsejamos que revise de antemano que cada uno de los pliegos coincida con sus datos reales, si está seguro de que todo está en orden continúe para descargar.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setShowExportConfirm(false);
                  handleExportBatch();
                }} 
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all py-5 rounded-2xl font-black uppercase text-xs text-white"
              >
                SÍ, CONTINUAR Y DESCARGAR
              </button>
              <button 
                onClick={() => setShowExportConfirm(false)} 
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 active:scale-95 transition-all py-5 rounded-2xl font-black uppercase text-xs text-zinc-400 hover:text-white"
              >
                REGRESAR
              </button>
            </div>
          </div>
        </div>
      )}

      {showSensitiveDataModal && (
        <div className="fixed inset-0 z-[700] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-zinc-950 border border-amber-500/30 p-8 sm:p-10 rounded-[2.5rem] max-w-2xl w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left my-8">
            <div className="flex items-center gap-4 border-b border-zinc-800/60 pb-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 shrink-0">
                <AlertTriangle size={28} className="text-amber-400 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white leading-tight">¿MODIFICAR DATOS SENSIBLES?</h2>
                <p className="text-xs text-zinc-400 mt-1 font-black uppercase tracking-wider">El localizador <strong className="text-amber-400 font-mono text-sm">{inventory.localizador.toUpperCase()}</strong> ya tiene información registrada.</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Comparativa de cambios:</p>
              <div className="bg-zinc-900/60 border border-zinc-850 rounded-2xl overflow-hidden divide-y divide-zinc-800/60 text-xs font-mono">
                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="text-zinc-500 font-black uppercase tracking-wider text-[10px]">SKU:</span>
                  <span className="text-zinc-400 font-bold">{existingLocatorData?.sku}</span>
                  <span className="text-emerald-400 font-black flex items-center gap-1">➡️ {inventory.sku.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="text-zinc-500 font-black uppercase tracking-wider text-[10px]">PIEZAS:</span>
                  <span className="text-zinc-400 font-bold">{existingLocatorData?.pieces ?? 0}</span>
                  <span className="text-emerald-400 font-black flex items-center gap-1">➡️ {inventory.pieces ?? 0}</span>
                </div>
                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="text-zinc-500 font-black uppercase tracking-wider text-[10px]">DESCRIPCIÓN:</span>
                  <span className="text-zinc-400 font-bold truncate pr-2">{existingLocatorData?.description || 'N/A'}</span>
                  <span className="text-emerald-400 font-black truncate flex items-center gap-1">➡️ {inventory.description || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="text-zinc-500 font-black uppercase tracking-wider text-[10px]">SUBINVENTARIO:</span>
                  <span className="text-zinc-400 font-bold">{existingLocatorData?.subinventario || 'N/A'}</span>
                  <span className="text-emerald-400 font-black flex items-center gap-1">➡️ {(inventory.subinventario || 'N/A').toUpperCase()}</span>
                </div>
              </div>
            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/60">
              <button 
                onClick={() => handleAddProduct(true)} 
                className="w-full bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all py-5 rounded-2xl font-black uppercase text-xs text-white"
              >
                SÍ, MODIFICAR DATOS SENSIBLES
              </button>
              <button 
                onClick={() => setShowSensitiveDataModal(false)} 
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 active:scale-95 transition-all py-5 rounded-2xl font-black uppercase text-xs text-zinc-400 hover:text-white"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA DE IMPRESIÓN */}
      <div id="print-area" className="hidden fixed top-0 left-0" style={{ zIndex: -100 }}>
        {Array.from({ length: totalPages }).map((_, pIdx) => (
          <div key={pIdx} className="print-page bg-white p-[1.5mm] grid gap-[1.5mm] box-border" style={printPageStyle}>
            {organizedPrintingData.slice(pIdx * baseCapacity, pIdx * baseCapacity + baseCapacity).map((prod, i) => (
              <div key={prod?.id || `empty-${i}`} className="w-full h-full overflow-hidden">
                {prod && <PrintableLabel product={prod} template={template} isMiniMode={template.paperSize !== 'LETTER'} arrowDirectionOverride={getPliegoArrowDirection(pIdx)} />}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ÁREA DE IMPRESIÓN DE CÓDIGOS DE BARRAS */}
      <div id="print-barcode-area" className="hidden fixed top-0 left-0 bg-white" style={{ zIndex: -100 }}>
        {barcodePrintList.map((item) => (
          <div key={item.id} className="print-barcode-page-container bg-white p-0 m-0">
            <PrintableBarcodeLabel product={item} />
          </div>
        ))}
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-[400] bg-zinc-950 flex flex-col items-center justify-center p-6 backdrop-blur-2xl">
          <div className="w-full max-w-6xl h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4"><Printer className="text-blue-500" /><h3 className="text-2xl font-black uppercase tracking-tighter">PREVISUALIZACIÓN DE LOTE</h3></div>
              <button onClick={() => setShowPreview(false)} className="bg-white/5 p-3 rounded-full hover:bg-white/10"><X /></button>
            </div>
            
            <div className="flex-1 bg-zinc-900/50 rounded-[3rem] border border-white/5 flex flex-col overflow-hidden p-6">
              <div className="flex justify-between items-center px-4 mb-4">
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                  TOTAL: {totalPages} {totalPages === 1 ? 'PÁGINA / PLIEGO' : 'PÁGINAS / PLIEGOS'}
                </span>
                <span className="text-[10px] text-zinc-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider">
                  {selectedItems.size} ETIQUETAS SELECCIONADAS
                </span>
              </div>
              
              <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar flex items-start gap-8 p-6 bg-black/20 rounded-[2rem] border border-zinc-800/40">
                {Array.from({ length: totalPages }).map((_, pIdx) => {
                  const isLetter = template.paperSize === 'LETTER';
                  const previewScale = isLetter ? 0.28 : 0.40;
                  const containerWidth = isLetter ? '240px' : '152px';
                  const containerHeight = isLetter ? '310px' : '470px';
                  const activeArrow = getPliegoArrowDirection(pIdx);
                  
                  return (
                    <div 
                      key={pIdx} 
                      onClick={() => handleTogglePliegoArrow(pIdx)}
                      className="flex flex-col items-center gap-4 shrink-0 bg-[#121215]/60 border border-zinc-800/60 p-4 rounded-2xl relative cursor-pointer hover:border-blue-500/50 hover:bg-[#121215]/80 active:scale-[0.98] transition-all group select-none"
                      title="Haz clic para alternar la flecha de este pliego"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                          PLIEGO {pIdx + 1}
                        </span>
                        <span className="text-[9px] font-black text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded uppercase">
                          {isLetter ? 'CARTA (4)' : 'LOGÍSTICO (12)'}
                        </span>
                      </div>
                      
                      {/* Fixed sized canvas container to hold the scaled high-res printable page */}
                      <div 
                        className="shadow-2xl bg-white rounded-lg overflow-hidden border border-zinc-200 flex items-center justify-center relative" 
                        style={{ width: containerWidth, height: containerHeight }}
                      >
                        <div 
                          className="bg-white grid p-[1.5mm] gap-[1.5mm] origin-center pointer-events-none" 
                          style={{ 
                            ...printPageStyle, 
                            transform: `scale(${previewScale})`, 
                            transformOrigin: 'center center',
                            position: 'absolute'
                          }}
                        >
                          {organizedPrintingData.slice(pIdx * baseCapacity, pIdx * baseCapacity + baseCapacity).map((prod, i) => prod ? (
                            <div key={prod.id} className="w-full h-full">
                              <PrintableLabel product={prod} template={template} isMiniMode={template.paperSize !== 'LETTER'} arrowDirectionOverride={activeArrow} />
                            </div>
                          ) : (
                            <div key={`empty-${i}`} className="w-full h-full bg-zinc-50 border border-dashed border-zinc-200 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-zinc-300">ESPACIO VACÍO</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full mt-1.5 px-2.5 py-2 bg-black/40 rounded-xl border border-zinc-800/50 group-hover:border-blue-500/30 transition-all">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">FLECHA:</span>
                        <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase flex items-center gap-1 shrink-0">
                          {activeArrow === 'NONE' ? <Minus size={10} className="stroke-[3]" /> : (activeArrow === 'LEFT' ? <ArrowLeft size={10} className="stroke-[3]" /> : <ArrowRight size={10} className="stroke-[3]" />)}
                          {activeArrow === 'NONE' ? 'NINGUNA' : (activeArrow === 'LEFT' ? 'IZQ' : 'DER')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button onClick={() => setShowExportConfirm(true)} className="mt-8 bg-blue-600 py-6 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-4"><Download size={20} /> GENERAR LOTE FINAL</button>
          </div>
        </div>
      )}

      {exportProgress && (
        <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="text-blue-500 animate-spin mb-6" size={64} />
          <h2 className="text-2xl font-black uppercase tracking-tighter">Exportando {exportProgress.current} de {exportProgress.total}</h2>
        </div>
      )}

      {/* HEADER & UI PRINCIPAL */}
      <div className="flex-1 flex flex-col items-center p-6 md:p-12 lg:p-16 max-w-[1700px] mx-auto w-full gap-8">
        <header className="w-full flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl rotate-3"><QrCodeIcon className="text-white" size={32} /></div>
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">CV <span className="text-blue-600">DIRECTO</span></h1>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">INDUSTRIAL QR STUDIO</p>
            </div>
          </div>

          {/* MODE SELECTOR */}
          <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 p-1.5 rounded-2xl shrink-0">
            <button 
              onClick={() => setCurrentMode('qr')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${currentMode === 'qr' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <QrCodeIcon size={14} />
              <span>Generador QR</span>
            </button>
            <button 
              onClick={() => setCurrentMode('barcode')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${currentMode === 'barcode' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <FileText size={14} />
              <span>Marbetes Barras</span>
            </button>
          </div>
          
          {/* INDICADOR DE ESTADO SUPABASE (KEEP-ALIVE) */}
          <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 px-6 py-3 rounded-2xl shadow-inner">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-zinc-500 uppercase">Estado Database</span>
              <span className={`text-[10px] font-black uppercase ${dbStatus === 'online' ? 'text-emerald-500' : (dbStatus === 'connecting' ? 'text-amber-500' : 'text-red-500')}`}>
                {dbStatus === 'online' ? 'Conectado' : (dbStatus === 'connecting' ? 'Despertando...' : 'Offline')}
              </span>
            </div>
            <div className="relative flex items-center justify-center">
              <div className={`absolute w-4 h-4 rounded-full blur-[6px] animate-pulse ${dbStatus === 'online' ? 'bg-emerald-500' : (dbStatus === 'connecting' ? 'bg-amber-500' : 'bg-red-500')}`}></div>
              <div className={`w-2.5 h-2.5 rounded-full border border-white/20 z-10 ${dbStatus === 'online' ? 'bg-emerald-500' : (dbStatus === 'connecting' ? 'bg-amber-500' : 'bg-red-500')}`}></div>
            </div>
          </div>
        </header>

        {currentMode === 'qr' ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-[3rem] overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col min-h-[680px]">
              <nav className="flex bg-black/40 border-b border-zinc-800/60 p-3 gap-2 overflow-x-auto">
                {[{ id: 'content', label: 'Captura', icon: ClipboardList }, { id: 'database', label: 'Historial', icon: Database }, { id: 'layout', label: 'Layout', icon: LayoutGrid }, { id: 'design', label: 'Diseño', icon: Palette }].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-8 py-4 text-[11px] font-black uppercase rounded-2xl transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'text-zinc-500 hover:bg-white/5'}`}><tab.icon size={18} /><span>{tab.label}</span></button>
                ))}
              </nav>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'content' && (
                  <div className="animate-in fade-in duration-300 space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SKU</label>
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          value={inventory.sku} 
                          onChange={e => setInventory({...inventory, sku: e.target.value.toUpperCase()})} 
                          className="flex-1 bg-zinc-950 border border-zinc-800 p-5 rounded-[1.5rem] font-mono text-xl outline-none focus:border-blue-500/50 transition-all text-white" 
                          placeholder="ID-000" 
                        />
                        <button onClick={() => setIsScanning(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white p-5 rounded-[1.5rem]"><Scan size={24} /></button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">LOCALIZADOR</label>
                      <input 
                        type="text" 
                        value={inventory.localizador} 
                        onChange={e => setInventory({...inventory, localizador: e.target.value.toUpperCase()})} 
                        className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-[1.5rem] text-xl font-black outline-none focus:border-blue-500/50 transition-all text-white font-mono" 
                        placeholder="A-1-1" 
                      />
                      {existingLocatorData && (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col gap-1 text-left animate-in fade-in duration-200">
                          <div className="flex items-center gap-2 text-amber-400">
                            <AlertTriangle size={14} className="stroke-[2.5]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">¡LOCALIZADOR YA REGISTRADO!</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                            Este localizador ya tiene información asignada en el historial:
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-1.5 p-3 bg-black/40 rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-400">
                            <div><span className="text-zinc-600 font-bold block text-[8px] uppercase tracking-wider">SKU ACTUAL:</span> <strong className="text-white font-black">{existingLocatorData.sku}</strong></div>
                            <div><span className="text-zinc-600 font-bold block text-[8px] uppercase tracking-wider">PIEZAS ACTUAL:</span> <strong className="text-white font-black">{existingLocatorData.pieces || 0}</strong></div>
                            <div className="col-span-2 mt-1"><span className="text-zinc-600 font-bold block text-[8px] uppercase tracking-wider">DESCRIPCIÓN:</span> <span className="text-zinc-300 line-clamp-1">{existingLocatorData.description || 'N/A'}</span></div>
                          </div>
                          <p className="text-[9px] text-amber-400 font-black uppercase tracking-wider mt-1.5 animate-pulse">
                            ⚠️ Al guardar se modificarán datos sensibles.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">PIEZAS</label>
                      <input 
                        type="number" 
                        value={inventory.pieces === 0 ? '' : inventory.pieces} 
                        onChange={e => setInventory({...inventory, pieces: parseInt(e.target.value) || 0})} 
                        className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-[1.5rem] text-xl font-black outline-none focus:border-blue-500/50 transition-all text-white font-mono" 
                        placeholder="Cantidad de piezas (ej. 50)" 
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">DESCRIPTION</label>
                      <input 
                        type="text" 
                        value={inventory.description || ''} 
                        onChange={e => setInventory({...inventory, description: e.target.value})} 
                        className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-[1.5rem] text-xl font-black outline-none focus:border-blue-500/50 transition-all text-white" 
                        placeholder="Descripción o nombre del producto" 
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SUBINVENTARIO</label>
                      <input 
                        type="text" 
                        value={inventory.subinventario || ''} 
                        onChange={e => setInventory({...inventory, subinventario: e.target.value.toUpperCase()})} 
                        className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-[1.5rem] text-xl font-black outline-none focus:border-blue-500/50 transition-all text-white font-mono" 
                        placeholder="Subinventario (ej. FONDO)" 
                      />
                    </div>

                    <button 
                      onClick={() => handleAddProduct(false)} 
                      disabled={!inventory.sku || dbStatus === 'offline'} 
                      className={`w-full py-7 rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-4 transition-all ${!inventory.sku || dbStatus === 'offline' ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                    >
                      <Plus size={24} /> AGREGAR A LISTA
                    </button>
                    
                    {dbStatus === 'connecting' && (
                      <div className="flex items-center gap-3 bg-amber-600/10 border border-amber-500/20 p-4 rounded-2xl">
                        <Activity className="text-amber-500 animate-pulse" size={18} />
                        <p className="text-[9px] font-black text-amber-500 uppercase">Despertando base de datos para asegurar el servicio... Espere un momento.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'database' && (
                  <div className="animate-in fade-in duration-300 space-y-6">
                    {usingBackupNotice && (
                      <div className="bg-[#1c1214]/60 border border-amber-500/30 p-5 rounded-[1.5rem] flex items-center gap-4 text-left animate-in fade-in duration-300">
                        <AlertTriangle className="text-amber-500 shrink-0 animate-pulse" size={24} />
                        <div>
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">Modo de Respaldo Local Activo</h4>
                          <p className="text-[10px] text-zinc-400 font-medium leading-normal mt-0.5">
                            Se detectó que la base de datos de Supabase está vacía o inalcanzable. Se ha cargado automáticamente tu copia local guardada para proteger tu historial de inventario.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ROW 1: Action Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => setShowUploadRules(true)} 
                        className="flex items-center justify-center gap-2 p-5 bg-[#0a1e12]/80 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20 rounded-[1.5rem] font-black uppercase text-[10px] md:text-xs tracking-wider transition-all"
                      >
                        <UploadCloud size={16} /> SUBIR TEMPLATE
                      </button>
                      <button 
                        onClick={handleExportCSV} 
                        className="flex items-center justify-center gap-2 p-5 bg-[#0e1629]/80 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 active:bg-blue-500/20 rounded-[1.5rem] font-black uppercase text-[10px] md:text-xs tracking-wider transition-all"
                      >
                        <Download size={16} /> DESCARGAR TEMPLATE
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)} 
                        className="flex items-center justify-center gap-2 p-5 bg-[#240f12]/80 border border-red-500/30 text-red-400 hover:bg-red-500/10 active:bg-red-500/20 rounded-[1.5rem] font-black uppercase text-[10px] md:text-xs tracking-wider transition-all"
                      >
                        <Trash size={16} /> BORRAR TODO
                      </button>
                    </div>

                    {/* ROW 2: Filters Panel */}
                    <div className="bg-[#121215]/60 border border-zinc-800/80 p-6 rounded-[2rem] space-y-5">
                      {/* Search & Selection Actions */}
                      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                          <input 
                            type="text" 
                            placeholder="BUSCAR EN CATÁLOGO..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className="w-full bg-[#09090b] border border-zinc-800 py-3.5 pl-12 pr-4 rounded-full text-xs font-bold uppercase tracking-wider outline-none text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20" 
                          />
                        </div>

                        {/* Batch selection helpers */}
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleSelectAllFiltered} 
                            className="flex-1 md:flex-initial px-6 py-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-xs font-black uppercase tracking-wider transition-all"
                          >
                            SELECCIONAR TODO EL FILTRADO
                          </button>
                          <button 
                            onClick={handleDeselectAllFiltered} 
                            className="flex-1 md:flex-initial px-6 py-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 rounded-full text-xs font-black uppercase tracking-wider transition-all"
                          >
                            DESELECCIONAR TODO
                          </button>
                        </div>
                      </div>

                      {/* Zone Selector Row */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">FILTRAR POR PASILLO / RACK</span>
                          {selectedZone !== 'TODOS' && (
                            <button onClick={() => setSelectedZone('TODOS')} className="text-xs font-black text-blue-500 hover:underline uppercase tracking-wider">Limpiar</button>
                          )}
                        </div>
                        <div className="flex items-center justify-between bg-[#09090b] border border-zinc-850 rounded-[1.5rem] p-2.5 overflow-x-auto custom-scrollbar gap-1.5">
                          {ZONES.map(zone => {
                            const isActive = selectedZone === zone;
                            return (
                              <button
                                key={zone}
                                onClick={() => setSelectedZone(zone)}
                                className={`px-5 py-3 rounded-full text-xs font-black tracking-wider transition-all uppercase min-w-[50px] text-center shrink-0 ${
                                  isActive 
                                    ? 'bg-blue-600 text-white shadow-md border border-blue-500' 
                                    : 'text-zinc-500 hover:text-zinc-300 bg-zinc-900/40 border border-zinc-800/40'
                                }`}
                              >
                                {zone}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column Selector Row */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">FILTRAR POR COLUMNA (1 - 25)</span>
                          {selectedColumn !== 'TODOS' && (
                            <button onClick={() => setSelectedColumn('TODOS')} className="text-xs font-black text-blue-500 hover:underline uppercase tracking-wider">Limpiar</button>
                          )}
                        </div>
                        <div className="flex items-center bg-[#09090b] border border-zinc-850 rounded-[1.5rem] p-2.5 overflow-x-auto custom-scrollbar gap-1.5">
                          {['TODOS', ...Array.from({ length: 25 }, (_, i) => String(i + 1))].map(col => {
                            const isActive = selectedColumn === col;
                            return (
                              <button
                                key={col}
                                onClick={() => setSelectedColumn(col)}
                                className={`px-5 py-3 rounded-full text-xs font-black tracking-wider transition-all uppercase min-w-[50px] text-center shrink-0 ${
                                  isActive 
                                    ? 'bg-blue-600 text-white shadow-md border border-blue-500' 
                                    : 'text-zinc-500 hover:text-zinc-300 bg-zinc-900/40 border border-zinc-800/40'
                                }`}
                              >
                                {col === 'TODOS' ? 'TODAS' : col}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* LIST OF PRODUCTS */}
                    <div className="space-y-4">
                      {(() => {
                        let lastRC_H_local = "";
                        return products.map(prod => {
                          const parts = (prod.localizador || '').split('-');
                          const currentRC = `${parts[0]}-${parts[1]}`;
                          const showDivider = currentRC !== lastRC_H_local;
                          lastRC_H_local = currentRC;
                          return (
                            <React.Fragment key={prod.id}>
                              {showDivider && (
                                <div className="pt-4 border-b border-zinc-800 pb-1 mb-2">
                                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                                    RACK {parts[0]} · COL {parts[1]}
                                  </span>
                                </div>
                              )}
                              <CatalogItem 
                                prod={prod} 
                                isSelected={selectedItems.has(prod.id)} 
                                onToggle={handleToggleItem} 
                                onSelect={(p: any) => { setInventory(p); setActiveTab('content'); }} 
                                onDelete={(id: string) => supabase.from('inventory').delete().eq('id', id).then(() => fetchInventoryDataOnDemand())} 
                              />
                            </React.Fragment>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {activeTab === 'layout' && (
                  <div className="animate-in fade-in duration-300 space-y-6">
                    {/* Controles de Modo */}
                    <div className="bg-[#121215]/60 border border-zinc-800/80 p-5 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left">
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Modo de Datos de Layout</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight mt-1 leading-normal">Elige entre la generación inmediata en memoria o consulta desde Supabase.</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto shrink-0 bg-black/40 border border-zinc-800 p-1.5 rounded-2xl">
                        <button
                          onClick={() => { setLayoutMode('LOCAL'); setLayoutError(null); }}
                          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                            layoutMode === 'LOCAL'
                              ? 'bg-blue-600 text-white shadow-md border border-blue-500'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          ⚡ Local
                        </button>
                        <button
                          onClick={() => { setLayoutMode('DATABASE'); }}
                          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                            layoutMode === 'DATABASE'
                              ? 'bg-blue-600 text-white shadow-md border border-blue-500'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          🗄️ Supabase
                        </button>
                      </div>
                    </div>

                    {usingLayoutBackupNotice && layoutMode === 'DATABASE' && (
                      <div className="bg-[#1c1214]/60 border border-amber-500/30 p-5 rounded-[1.5rem] flex items-center gap-4 text-left animate-in fade-in duration-300">
                        <AlertTriangle className="text-amber-500 shrink-0 animate-pulse" size={24} />
                        <div>
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">Diseño Físico desde Respaldo Local</h4>
                          <p className="text-[10px] text-zinc-400 font-medium leading-normal mt-0.5">
                            Se detectó que la tabla 'warehouse_layout' está vacía o inalcanzable. Se cargó la estructura desde el respaldo local para asegurar la visualización física.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Selectors Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <select
                          value={layoutFilterRack}
                          onChange={e => setLayoutFilterRack(e.target.value)}
                          className="w-full bg-[#09090b] border border-zinc-800 py-4 px-6 pr-10 rounded-2xl text-xs font-black uppercase tracking-wider text-white outline-none appearance-none focus:border-blue-500/50"
                        >
                          <option value="TODOS">TODOS LOS RACKS</option>
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(r => (
                            <option key={r} value={r}>RACK {r}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                          <ChevronRight size={16} className="rotate-90" />
                        </div>
                      </div>

                      <div className="relative">
                        <select
                          value={layoutFilterColumn}
                          onChange={e => setLayoutFilterColumn(e.target.value)}
                          className="w-full bg-[#09090b] border border-zinc-800 py-4 px-6 pr-10 rounded-2xl text-xs font-black uppercase tracking-wider text-white outline-none appearance-none focus:border-blue-500/50"
                        >
                          <option value="TODOS">TODAS</option>
                          {Array.from({ length: 25 }, (_, i) => String(i + 1)).map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                          <ChevronRight size={16} className="rotate-90" />
                        </div>
                      </div>
                    </div>

                    {/* Layout Items Grid */}
                    {layoutError ? (
                      <div className="bg-[#1c1214]/60 border border-red-500/20 rounded-[2rem] p-8 md:p-10 text-center text-zinc-400 space-y-6">
                        <div className="max-w-md mx-auto space-y-3">
                          <AlertTriangle className="mx-auto text-red-500 animate-pulse" size={48} />
                          <h4 className="text-sm font-black text-red-400 uppercase tracking-widest leading-tight">Error al consultar 'warehouse_layout'</h4>
                          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                            No se pudo leer la tabla de ubicaciones desde Supabase. Probablemente falte crear o inicializar la tabla de diseño físico.
                          </p>
                          <div className="p-3 bg-red-950/20 border border-red-950/50 rounded-xl font-mono text-[10px] text-zinc-500 break-words">
                            {layoutError}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                          <button 
                            onClick={() => { setLayoutMode('LOCAL'); setLayoutError(null); }}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] py-4 rounded-xl transition-all tracking-wider"
                          >
                            ⚡ USAR GENERACIÓN LOCAL (RECOMENDADO)
                          </button>
                          <button 
                            onClick={fetchLayoutDataOnDemand}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-black uppercase text-[10px] py-4 rounded-xl transition-all tracking-wider"
                          >
                            🔄 REINTENTAR CONEXIÓN
                          </button>
                        </div>

                        <div className="border-t border-zinc-800/60 pt-6 text-left max-w-xl mx-auto space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">CÓDIGO SQL PARA INICIALIZAR EN SUPABASE:</span>
                            <button
                              onClick={() => {
                                const sql = `-- 1. Eliminar la tabla si existe para asegurar una instalación limpia\nDROP TABLE IF EXISTS warehouse_layout CASCADE;\n\n-- 2. Crear la tabla del diseño del almacén con restricciones correctas\nCREATE TABLE warehouse_layout (\n    id SERIAL PRIMARY KEY,\n    localizador VARCHAR(50) UNIQUE NOT NULL,\n    zone VARCHAR(50) NOT NULL\n);\n\n-- 3. Insertar automáticamente las 1500 ubicaciones físicas\nINSERT INTO warehouse_layout (localizador, zone)\nSELECT \n    rack || '-' || col || '-' || lvl AS localizador,\n    rack AS zone\nFROM \n    unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']) AS rack,\n    generate_series(1, 25) AS col,\n    generate_series(1, 5) AS lvl\nON CONFLICT (localizador) DO NOTHING;`;
                                navigator.clipboard.writeText(sql);
                                setLayoutSqlCopied(true);
                                setTimeout(() => setLayoutSqlCopied(false), 2000);
                              }}
                              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                                layoutSqlCopied 
                                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700'
                              }`}
                            >
                              {layoutSqlCopied ? '¡COPIADO!' : 'COPIAR SQL'}
                            </button>
                          </div>
                          <pre className="bg-black/80 border border-zinc-850 p-4 rounded-xl font-mono text-[10px] text-zinc-400 overflow-x-auto whitespace-pre leading-relaxed select-all">
{`-- 1. Eliminar la tabla si existe para asegurar una instalación limpia
DROP TABLE IF EXISTS warehouse_layout CASCADE;

-- 2. Crear la tabla del diseño del almacén con restricciones correctas
CREATE TABLE warehouse_layout (
    id SERIAL PRIMARY KEY,
    localizador VARCHAR(50) UNIQUE NOT NULL,
    zone VARCHAR(50) NOT NULL
);

-- 3. Insertar automáticamente las 1500 ubicaciones físicas (Racks A-L, Columnas 1-25, Niveles 1-5)
INSERT INTO warehouse_layout (localizador, zone)
SELECT 
    rack || '-' || col || '-' || lvl AS localizador,
    rack AS zone
FROM 
    unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']) AS rack,
    generate_series(1, 25) AS col,
    generate_series(1, 5) AS lvl
ON CONFLICT (localizador) DO NOTHING;`}
                          </pre>
                        </div>
                      </div>
                    ) : isFetching ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-500">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <span className="text-xs font-black uppercase tracking-widest">CARGANDO DISTRIBUCIÓN...</span>
                      </div>
                    ) : layoutItems.length === 0 ? (
                      <div className="bg-[#121215] border border-zinc-800/60 rounded-[2rem] p-12 text-center text-zinc-500">
                        <LayoutGrid className="mx-auto mb-4 opacity-30 text-zinc-400" size={48} />
                        <p className="text-xs font-black uppercase tracking-widest">No se encontraron ubicaciones para los filtros seleccionados.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {layoutItems.map(item => {
                          const parts = (item.localizador || '').split('-');
                          const rackId = parts[0] || 'Z';
                          const orientation = RACK_ORIENTATION[rackId] || 'N/A';
                          
                          return (
                            <div 
                              key={item.id} 
                              className="group bg-[#121215]/60 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all gap-4"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/10">
                                    <Scan className="text-blue-400" size={18} />
                                  </div>
                                  <div>
                                    <h4 className="text-base font-black text-white leading-none">{item.localizador}</h4>
                                    <p className="text-[9px] font-black text-zinc-500 uppercase mt-1 tracking-wider">ZONA: {item.zone || item.zona || 'N/A'}</p>
                                  </div>
                                </div>
                                <span className={`text-[8px] px-2 py-1 rounded font-black uppercase ${
                                  orientation === 'FRENTE' 
                                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' 
                                    : 'bg-purple-950/40 text-purple-400 border border-purple-500/10'
                                }`}>
                                  {orientation}
                                </span>
                              </div>

                              {/* Print actions for location */}
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/50">
                                <button 
                                  onClick={() => {
                                    const fakeProd: ProductRecord = {
                                      id: `vacio-${item.id}`,
                                      sku: 'UBICACIÓN VACÍA',
                                      description: 'SITUACIÓN DE VACÍO',
                                      localizador: item.localizador,
                                      pieces: 0,
                                      subinventario: item.zone || 'CTL'
                                    };
                                    setInventory(fakeProd);
                                    setActiveTab('content');
                                  }}
                                  className="bg-zinc-950/60 hover:bg-blue-600/10 border border-zinc-800 hover:border-blue-500/30 text-zinc-400 hover:text-blue-400 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                                >
                                  IMPRIMIR VACÍO
                                </button>
                                <button 
                                  onClick={() => {
                                    const fakeProd: ProductRecord = {
                                      id: `picking-${item.id}`,
                                      sku: 'PICKING',
                                      description: 'SITUACIÓN DE PICKING',
                                      localizador: item.localizador,
                                      pieces: 0,
                                      subinventario: item.zone || 'CTL'
                                    };
                                    setInventory(fakeProd);
                                    setActiveTab('content');
                                  }}
                                  className="bg-zinc-950/60 hover:bg-[#ea580c]/10 border border-zinc-800 hover:border-[#ea580c]/30 text-zinc-400 hover:text-[#ea580c] py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                                >
                                  IMPRIMIR PICKING
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="animate-in fade-in duration-300 space-y-8">
                    {/* FORMATO DE PAPEL */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">FORMATO DE PAPEL</label>
                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={() => setTemplate({ ...template, paperSize: 'LETTER' })} 
                          className={`w-full flex items-center gap-4 p-6 rounded-[1.5rem] border transition-all ${
                            template.paperSize === 'LETTER' 
                              ? 'bg-blue-600 border-blue-500 text-white font-black' 
                              : 'bg-[#09090b]/80 border-zinc-800 text-zinc-400 hover:text-white font-bold'
                          }`}
                        >
                          <FileText size={22} />
                          <span className="text-xs uppercase tracking-wider">CARTA (4 ETIQUETAS)</span>
                        </button>

                        <button 
                          onClick={() => setTemplate({ ...template, paperSize: 'LABEL2' })} 
                          className={`w-full flex items-center gap-4 p-6 rounded-[1.5rem] border transition-all ${
                            template.paperSize === 'LABEL2' 
                              ? 'bg-blue-600 border-blue-500 text-white font-black' 
                              : 'bg-[#09090b]/80 border-zinc-800 text-zinc-400 hover:text-white font-bold'
                          }`}
                        >
                          <Tag size={22} />
                          <span className="text-xs uppercase tracking-wider">LOGÍSTICO (12 ETIQUETAS)</span>
                        </button>
                      </div>
                    </div>

                    {/* INDICADOR DIRECCIONAL (ESPECIALES) */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">INDICADOR DIRECCIONAL (ESPECIALES)</label>
                      <div className="grid grid-cols-3 gap-4">
                        <button
                          onClick={() => {
                            setTemplate({ ...template, arrowDirection: 'NONE' });
                            setCustomPliegoArrows({});
                          }}
                          className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all gap-3 ${
                            template.arrowDirection === 'NONE'
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-[#09090b]/80 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <Minus size={20} className="stroke-[3]" />
                          <span className="text-[9px] font-black uppercase tracking-wider">SIN FLECHA</span>
                        </button>

                        <button
                          onClick={() => {
                            setTemplate({ ...template, arrowDirection: 'LEFT' });
                            setCustomPliegoArrows({});
                          }}
                          className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all gap-3 ${
                            template.arrowDirection === 'LEFT'
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-[#09090b]/80 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <ArrowLeft size={20} className="stroke-[3]" />
                          <span className="text-[9px] font-black uppercase tracking-wider">IZQUIERDA</span>
                        </button>

                        <button
                          onClick={() => {
                            setTemplate({ ...template, arrowDirection: 'RIGHT' });
                            setCustomPliegoArrows({});
                          }}
                          className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all gap-3 ${
                            template.arrowDirection === 'RIGHT'
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-[#09090b]/80 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <ArrowRight size={20} className="stroke-[3]" />
                          <span className="text-[9px] font-black uppercase tracking-wider">DERECHA</span>
                        </button>
                      </div>
                    </div>

                    {/* TAMAÑO DE FLECHA */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">TAMAÑO DE FLECHA</label>
                      <div className="bg-[#09090b]/80 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between gap-6">
                        <input 
                          type="range" 
                          min="32" 
                          max="128" 
                          value={template.arrowSize} 
                          onChange={e => setTemplate({ ...template, arrowSize: Number(e.target.value) })} 
                          className="flex-1 accent-blue-600 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xl font-black text-blue-500 shrink-0 select-none min-w-[60px] text-right">
                          {template.arrowSize}px
                        </span>
                      </div>
                    </div>

                    {/* RESTRICCIÓN DE FLECHAS A PISO */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">¿DÓNDE MOSTRAR FLECHAS?</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setTemplate({ ...template, arrowOnlyOnFloor: true })}
                          className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all gap-2 ${
                            template.arrowOnlyOnFloor
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-[#09090b]/80 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider">SOLO EN PISO (NIVEL 1)</span>
                          <span className="text-[8px] opacity-70">Para picking a ras de suelo</span>
                        </button>

                        <button
                          onClick={() => setTemplate({ ...template, arrowOnlyOnFloor: false })}
                          className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all gap-2 ${
                            !template.arrowOnlyOnFloor
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-[#09090b]/80 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider">TODOS LOS NIVELES</span>
                          <span className="text-[8px] opacity-70">Para todas las especiales</span>
                        </button>
                      </div>
                    </div>

                    {/* POSICIÓN DE LA FLECHA */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">POSICIÓN DE LA FLECHA EN ETIQUETA</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setTemplate({ ...template, arrowPosition: 'MIDDLE' })}
                          className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all gap-2 ${
                            template.arrowPosition === 'MIDDLE'
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-[#09090b]/80 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider">DENTRO DE ORIENTACIÓN</span>
                          <span className="text-[8px] opacity-70">Sección central</span>
                        </button>

                        <button
                          onClick={() => setTemplate({ ...template, arrowPosition: 'BELOW_LOCATOR' })}
                          className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all gap-2 ${
                            template.arrowPosition === 'BELOW_LOCATOR'
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-[#09090b]/80 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider">DEBAJO DEL LOCALIZADOR</span>
                          <span className="text-[8px] opacity-70">Al final de la etiqueta</span>
                        </button>
                      </div>
                    </div>

                    {/* TEXTO CABECERA */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">TEXTO CABECERA</label>
                      <input 
                        type="text" 
                        value={template.headerText} 
                        onChange={e => setTemplate({ ...template, headerText: e.target.value.toUpperCase() })} 
                        className="w-full bg-[#09090b]/80 border border-zinc-800 p-5 rounded-[1.5rem] outline-none font-black text-white uppercase tracking-wider focus:border-blue-500/50" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex flex-col gap-6">
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-[3rem] p-6 flex flex-col items-center justify-between gap-6 min-h-[680px] w-full shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="flex justify-between items-center w-full px-4 border-b border-zinc-800/40 pb-4">
                <div className="flex items-center gap-3">
                  <Layers className="text-blue-500 animate-pulse" size={18} />
                  <span className="text-[11px] font-black uppercase tracking-wider text-white">VISTA PREVIA EN VIVO (PLIEGO 1)</span>
                </div>
                <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full uppercase tracking-widest shrink-0">
                  {template.paperSize === 'LETTER' ? 'CARTA (4)' : 'LOGÍSTICO (12)'}
                </span>
              </div>

              {/* Contenedor central de la hoja de papel */}
              <div className="flex-1 flex items-center justify-center w-full py-4 select-none">
                <div 
                  className="shadow-2xl bg-white rounded-xl overflow-hidden border border-zinc-200 flex items-center justify-center relative transition-all" 
                  style={{ 
                    width: template.paperSize === 'LETTER' ? '368px' : '220px', 
                    height: template.paperSize === 'LETTER' ? '476px' : '680px' 
                  }}
                >
                  <div 
                    className="bg-white grid p-[1.5mm] gap-[1.5mm] origin-center pointer-events-none" 
                    style={{ 
                      ...printPageStyle, 
                      transform: template.paperSize === 'LETTER' ? 'scale(0.45)' : 'scale(0.58)',
                      transformOrigin: 'center center',
                      position: 'absolute'
                    }}
                  >
                    {Array.from({ length: baseCapacity }).map((_, i) => {
                      const prod = organizedPrintingData[i];
                      return prod ? (
                        <div key={prod.id} className="w-full h-full">
                          <PrintableLabel product={prod} template={template} isMiniMode={template.paperSize !== 'LETTER'} arrowDirectionOverride={getPliegoArrowDirection(0)} />
                        </div>
                      ) : (
                        <div key={`empty-prev-${i}`} className="w-full h-full bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center justify-center p-2 text-center">
                          <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-none">VACÍO</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Resumen del pliego */}
              <div className="w-full bg-black/40 border border-zinc-800/60 p-4 rounded-2xl flex items-center justify-between px-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">OCUPACIÓN PLIEGO 1</span>
                  <span className="text-xs font-black text-white uppercase tracking-widest">
                    {organizedPrintingData.slice(0, baseCapacity).filter(Boolean).length} / {baseCapacity} ESPACIOS
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">FLECHA ASIGNADA</span>
                  <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 uppercase flex items-center gap-1.5">
                    {getPliegoArrowDirection(0) === 'NONE' ? <Minus size={10} className="stroke-[3]" /> : (getPliegoArrowDirection(0) === 'LEFT' ? <ArrowLeft size={10} className="stroke-[3]" /> : <ArrowRight size={10} className="stroke-[3]" />)}
                    {getPliegoArrowDirection(0) === 'NONE' ? 'NINGUNA' : (getPliegoArrowDirection(0) === 'LEFT' ? 'IZQ' : 'DER')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <BarcodeStudio />
        )}

        {selectedItems.size > 0 && !showPreview && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-zinc-900/95 border border-blue-500/30 px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-12 backdrop-blur-2xl animate-in slide-in-from-bottom-20 duration-500">
            <span className="text-white font-black text-lg uppercase">{selectedItems.size} SELECCIONADOS</span>
            <button onClick={() => { setPreviewPage(0); setShowPreview(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-4 shadow-xl"><Printer size={20} /> PREVISUALIZAR</button>
            <button onClick={()=>setSelectedItems(new Map())} className="p-5 text-zinc-500 hover:text-white transition-all"><X size={20}/></button>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        @media print { 
          body { background: white !important; } 
          #root { display: none !important; } 
          #print-area { display: ${currentMode === 'qr' ? 'block' : 'none'} !important; position: static !important; } 
          #print-barcode-area { display: ${currentMode === 'barcode' ? 'block' : 'none'} !important; position: static !important; } 
          .print-page { page-break-after: always; } 
          .print-barcode-page-container { page-break-after: always; } 
        }
      `}</style>
    </div>
  );
};

export default App;
