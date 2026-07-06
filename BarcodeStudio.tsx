import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import ReactDOM from 'react-dom';
import JsBarcode from 'jsbarcode';
import { toJpeg } from 'html-to-image';
import { 
  ClipboardList, 
  Database, 
  Search, 
  Trash, 
  Trash2, 
  Plus, 
  Minus, 
  CheckSquare, 
  Square, 
  Printer, 
  Download, 
  Layers,
  X,
  PlusSquare,
  Sparkles,
  Barcode as BarcodeIcon,
  HelpCircle,
  UploadCloud,
  Info
} from 'lucide-react';
import { BarcodeLabelRecord } from './types';
import { supabase } from './App';

const BarcodeRenderer = memo(({ value, height = 30, width = 1.8, fontSize = 9, displayValue = false, format = "CODE128" }: {
  value: string;
  height?: number;
  width?: number;
  fontSize?: number;
  displayValue?: boolean;
  format?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let active = true;
    if (svgRef.current && value && active) {
      try {
        JsBarcode(svgRef.current, value, {
          format: format || "CODE128",
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          margin: 0,
          background: "#ffffff",
          lineColor: "#000000"
        });
      } catch (err) {
        console.warn("Rendering fallback due to format mismatch:", err);
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
        } catch (fallbackErr) {
          console.error("Critical barcode render error:", fallbackErr);
        }
      }
    }
    return () => { active = false; };
  }, [value, height, width, fontSize, displayValue, format]);

  return <svg ref={svgRef} className="max-w-full h-auto mx-auto" />;
});

export const PrintableBarcodeLabel = memo(({ product }: { product: any }) => {
  const sku = product.sku || 'C0605-00';
  const fichaTecnica = product.fichaTecnica || 'Ficha Tecnica.';
  const categoria = product.categoria || 'Cocina';
  const description = product.description || 'JADE ESSENTIALS BATERIA 11 PZS';
  const cantCama = product.cantCama !== undefined ? product.cantCama : 7;
  const numEstiba = product.numEstiba !== undefined ? product.numEstiba : 4;
  const totalCajas = product.totalCajas !== undefined ? product.totalCajas : 28;
  const pzCaja = product.pzCaja !== undefined ? product.pzCaja : 2;
  const pzTarima = product.pzTarima !== undefined ? product.pzTarima : 56;

  // Custom logo configuration
  const logoUrl = product.logoUrl || '';
  const logoSize = product.logoSize !== undefined ? product.logoSize : 36;
  const logoAlign = product.logoAlign || 'center';
  const logoPosition = product.logoPosition || 'header';
  const orientation = product.orientation || 'vertical';
  const cornerFocus = product.cornerFocus !== undefined ? product.cornerFocus : true;
  const designStyle = product.designStyle || 'modern';
  const barcodeType = product.barcodeType || 'CODE128';
  const barcodeScaleX = product.barcodeScaleX !== undefined ? product.barcodeScaleX : 1.0;
  const barcodeScaleY = product.barcodeScaleY !== undefined ? product.barcodeScaleY : 1.0;
  const labelFontSize = product.labelFontSize !== undefined ? product.labelFontSize : 7.0;
  const valueFontSize = product.valueFontSize !== undefined ? product.valueFontSize : 12.0;

  // Dynamic layout & safety calculations
  const isHeaderLogo = logoPosition === 'header' && !!logoUrl;
  const isFooterLogo = logoPosition === 'footer' && !!logoUrl;
  const isWatermarkLogo = logoPosition === 'watermark' && !!logoUrl;

  const widthVal = orientation === 'vertical' ? '10.1cm' : '15.2cm';
  const heightVal = orientation === 'vertical' ? '15.2cm' : '10.1cm';

  const renderVertical = () => {
    if (designStyle === 'modern') {
      return (
        <div className="flex-1 flex flex-col min-h-0 justify-between relative font-sans text-black select-none p-1 bg-white">
          {/* Elegant Top Header with Ficha Tecnica */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-2 shrink-0">
            <span className="bg-zinc-100 text-zinc-800 rounded-full py-1 px-3 text-[9px] font-black uppercase tracking-wider">
              {fichaTecnica || 'FICHA TÉCNICA'}
            </span>
            <span className="text-[8px] font-mono font-bold text-zinc-400">ID: {sku}</span>
          </div>

          {/* Header Logo Zone if configured */}
          {isHeaderLogo && (
            <div className="py-1.5 bg-white flex items-center justify-center shrink-0 mb-2 border-b border-zinc-100" style={{ height: `${Math.min(logoSize + 8, 70)}px` }}>
              <div className={`w-full flex ${logoAlign === 'left' ? 'justify-start pl-1' : logoAlign === 'right' ? 'justify-end pr-1' : 'justify-center'}`}>
                <img src={logoUrl} style={{ height: `${logoSize}px`, width: 'auto', maxHeight: '100%', objectFit: 'contain' }} alt="Logo" />
              </div>
            </div>
          )}

          {/* Category and SKU in a Clean Rounded Card */}
          <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
            <div className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl flex flex-col justify-center">
              <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5" style={{ fontSize: `${labelFontSize}px` }}>CATEGORÍA</span>
              <span className="text-[12px] font-bold text-zinc-900 leading-tight truncate" style={{ fontSize: `${valueFontSize}px` }}>{categoria}</span>
            </div>
            <div className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl flex flex-col justify-center">
              <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5" style={{ fontSize: `${labelFontSize}px` }}>CLAVE / SKU</span>
              <span className="text-[12.5px] font-mono font-black text-blue-600 leading-tight tracking-wide truncate" style={{ fontSize: `${valueFontSize}px` }}>{sku}</span>
            </div>
          </div>

          {/* SKU Barcode Area (Beautifully Framed) */}
          <div className="py-2.5 px-1 bg-white border border-zinc-100 rounded-xl flex flex-col items-center justify-center shrink-0 mb-2">
            <div className="flex items-center justify-center w-full">
              <BarcodeRenderer value={sku} height={Math.round(42 * barcodeScaleY)} width={Number((1.8 * barcodeScaleX).toFixed(2))} fontSize={8} displayValue={false} format={barcodeType} />
            </div>
          </div>

          {/* Description Area */}
          <div className="p-2.5 bg-zinc-50/50 border border-zinc-100 rounded-xl shrink-0 flex flex-col justify-center mb-2">
            <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest block mb-1 text-left" style={{ fontSize: `${labelFontSize}px` }}>DESCRIPCIÓN DEL PRODUCTO</span>
            <div className="text-[11px] font-bold leading-snug text-left text-zinc-800 line-clamp-2 uppercase min-h-[30px] flex items-center" style={{ fontSize: `${valueFontSize}px` }}>
              {description}
            </div>
          </div>

          {/* Multi-column specs grid */}
          <div className="grid grid-cols-4 gap-1.5 text-center shrink-0 mb-2">
            <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg flex flex-col justify-between">
              <span className="text-[6px] font-black text-zinc-400 uppercase tracking-wider leading-none block mb-1" style={{ fontSize: `${labelFontSize}px` }}>CANT X CAMA</span>
              <span className="text-[12px] font-mono font-bold text-zinc-900" style={{ fontSize: `${valueFontSize}px` }}>{cantCama}</span>
            </div>
            <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg flex flex-col justify-between">
              <span className="text-[6px] font-black text-zinc-400 uppercase tracking-wider leading-none block mb-1" style={{ fontSize: `${labelFontSize}px` }}>NUM X ESTIBA</span>
              <span className="text-[12px] font-mono font-bold text-zinc-900" style={{ fontSize: `${valueFontSize}px` }}>{numEstiba}</span>
            </div>
            <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg flex flex-col justify-between">
              <span className="text-[6px] font-black text-zinc-400 uppercase tracking-wider leading-none block mb-1" style={{ fontSize: `${labelFontSize}px` }}>TOTAL CAJAS</span>
              <span className="text-[12px] font-mono font-bold text-zinc-900" style={{ fontSize: `${valueFontSize}px` }}>{totalCajas}</span>
            </div>
            <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg flex flex-col justify-between">
              <span className="text-[6px] font-black text-zinc-400 uppercase tracking-wider leading-none block mb-1" style={{ fontSize: `${labelFontSize}px` }}>PZ X CAJA</span>
              <span className="text-[12px] font-mono font-bold text-zinc-900" style={{ fontSize: `${valueFontSize}px` }}>{pzCaja}</span>
            </div>
          </div>

          {/* High visibility elegant Tarima Badge */}
          <div className="bg-zinc-900 text-white rounded-xl px-4 py-2 flex items-center justify-between shrink-0 mb-2">
            <span className="text-[9px] font-black tracking-[0.15em] uppercase">CANTIDAD POR TARIMA</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-mono font-black text-green-400 leading-none">{pzTarima}</span>
              <span className="text-[8px] font-bold opacity-80 uppercase tracking-wider">PIEZAS</span>
            </div>
          </div>

          {/* Pieces Barcode Area with Footer Logo option */}
          <div className="flex-1 flex flex-col items-center justify-center p-2 bg-white relative">
            <div className="w-full flex flex-col items-center justify-center">
              <BarcodeRenderer value={String(pzTarima)} height={Math.round(44 * barcodeScaleY)} width={Number((2.1 * barcodeScaleX).toFixed(2))} fontSize={9} displayValue={false} format={barcodeType} />
            </div>
            
            {isFooterLogo && (
              <div className={`absolute bottom-1 left-2 right-2 flex ${logoAlign === 'left' ? 'justify-start' : logoAlign === 'right' ? 'justify-end' : 'justify-center'}`}>
                <img src={logoUrl} style={{ height: `${logoSize}px`, maxHeight: '28px', width: 'auto', objectFit: 'contain' }} alt="Logo Footer" />
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col min-h-0 justify-between relative font-sans text-black select-none">
        {/* Top Industrial Header */}
        <div className="bg-black text-white py-1.5 px-4 text-center text-[10px] font-mono tracking-[0.25em] font-black uppercase shrink-0">
          {fichaTecnica || 'FICHA TÉCNICA'}
        </div>

        {/* Header Logo Zone if configured */}
        {isHeaderLogo && (
          <div className="border-b-2 border-black py-2 bg-white flex items-center justify-center shrink-0" style={{ height: `${Math.min(logoSize + 12, 80)}px` }}>
            <div className={`w-full flex ${logoAlign === 'left' ? 'justify-start pl-3' : logoAlign === 'right' ? 'justify-end pr-3' : 'justify-center'}`}>
              <img src={logoUrl} style={{ height: `${logoSize}px`, width: 'auto', maxHeight: '100%', objectFit: 'contain' }} alt="Logo" />
            </div>
          </div>
        )}

        {/* Category and SKU Split Row */}
        <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black shrink-0">
          <div className="p-2 flex flex-col justify-center bg-zinc-50/50">
            <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5" style={{ fontSize: `${labelFontSize}px` }}>CATEGORÍA</span>
            <span className="text-[12px] font-black text-black leading-tight truncate" style={{ fontSize: `${valueFontSize}px` }}>{categoria}</span>
          </div>
          <div className="p-2 flex flex-col justify-center bg-zinc-50/50">
            <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5" style={{ fontSize: `${labelFontSize}px` }}>CLAVE / SKU</span>
            <span className="text-[13px] font-mono font-black text-black leading-tight tracking-wider truncate" style={{ fontSize: `${valueFontSize}px` }}>{sku}</span>
          </div>
        </div>

        {/* SKU Barcode Area */}
        <div className="py-2.5 border-b-2 border-black bg-white flex flex-col items-center justify-center shrink-0">
          <div className="flex items-center justify-center w-full">
            <BarcodeRenderer value={sku} height={Math.round(50 * barcodeScaleY)} width={Number((1.9 * barcodeScaleX).toFixed(2))} fontSize={8} displayValue={false} format={barcodeType} />
          </div>
        </div>

        {/* Description Area */}
        <div className="p-2.5 border-b-2 border-black bg-white shrink-0 flex flex-col justify-center">
          <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5 text-left" style={{ fontSize: `${labelFontSize}px` }}>DESCRIPCIÓN DEL PRODUCTO</span>
          <div className="text-[11px] font-black leading-snug text-left text-black line-clamp-2 uppercase min-h-[32px] flex items-center" style={{ fontSize: `${valueFontSize}px` }}>
            {description}
          </div>
        </div>

        {/* Multi-column specs grid */}
        <div className="grid grid-cols-4 border-b-2 border-black divide-x-2 divide-black text-center shrink-0">
          <div className="p-1.5 flex flex-col justify-between bg-white">
            <span className="text-[6.5px] font-bold text-zinc-500 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>CANT X CAMA</span>
            <span className="text-[13px] font-mono font-black text-zinc-900 mt-1" style={{ fontSize: `${valueFontSize}px` }}>{cantCama}</span>
          </div>
          <div className="p-1.5 flex flex-col justify-between bg-white">
            <span className="text-[6.5px] font-bold text-zinc-500 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>NUM X ESTIBA</span>
            <span className="text-[13px] font-mono font-black text-zinc-900 mt-1" style={{ fontSize: `${valueFontSize}px` }}>{numEstiba}</span>
          </div>
          <div className="p-1.5 flex flex-col justify-between bg-white">
            <span className="text-[6.5px] font-bold text-zinc-500 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>TOTAL CAJAS</span>
            <span className="text-[13px] font-mono font-black text-zinc-900 mt-1" style={{ fontSize: `${valueFontSize}px` }}>{totalCajas}</span>
          </div>
          <div className="p-1.5 flex flex-col justify-between bg-white">
            <span className="text-[6.5px] font-bold text-zinc-500 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>PZ X CAJA</span>
            <span className="text-[13px] font-mono font-black text-zinc-900 mt-1" style={{ fontSize: `${valueFontSize}px` }}>{pzCaja}</span>
          </div>
        </div>

        {/* Massive Bold Reverse Pallet Badge */}
        <div className="bg-black text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-black shrink-0">
          <span className="text-[10px] font-black tracking-[0.2em]">CANTIDAD POR TARIMA</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[20px] font-mono font-black tracking-normal leading-none">{pzTarima}</span>
            <span className="text-[8px] font-bold opacity-80 uppercase tracking-wider">PIEZAS</span>
          </div>
        </div>

        {/* Pieces Barcode Area with Footer Logo option */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 bg-white relative">
          <div className="w-full flex flex-col items-center justify-center">
            <BarcodeRenderer value={String(pzTarima)} height={Math.round(52 * barcodeScaleY)} width={Number((2.3 * barcodeScaleX).toFixed(2))} fontSize={9} displayValue={false} format={barcodeType} />
          </div>
          
          {isFooterLogo && (
            <div className={`absolute bottom-1.5 left-2 right-2 flex ${logoAlign === 'left' ? 'justify-start' : logoAlign === 'right' ? 'justify-end' : 'justify-center'}`}>
              <img src={logoUrl} style={{ height: `${logoSize}px`, maxHeight: '32px', width: 'auto', objectFit: 'contain' }} alt="Logo Footer" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHorizontal = () => {
    if (designStyle === 'modern') {
      return (
        <div className="flex-1 flex flex-col min-h-0 relative font-sans text-black select-none p-1 bg-white">
          {/* Top Banner with Ficha Tecnica & Header Logo if active */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5 mb-1.5 shrink-0">
            <span className="bg-zinc-100 text-zinc-800 rounded-full py-0.5 px-3 text-[8.5px] font-black uppercase tracking-wider">
              {fichaTecnica || 'FICHA TÉCNICA'}
            </span>
            {isHeaderLogo && (
              <div className="bg-white px-2 flex items-center justify-center">
                <img src={logoUrl} style={{ height: `${Math.min(logoSize, 22)}px`, width: 'auto', objectFit: 'contain' }} alt="Logo" />
              </div>
            )}
          </div>

          {/* Split Columns */}
          <div className="flex-1 flex min-h-0 gap-2">
            {/* Left Column: Product Info & Stats (56% width) */}
            <div className="w-[56%] flex flex-col justify-between min-h-0 bg-white gap-1.5">
              
              {/* Category & SKU row */}
              <div className="grid grid-cols-2 gap-1.5 shrink-0">
                <div className="p-1.5 bg-zinc-50 border border-zinc-100 rounded-lg flex flex-col justify-center">
                  <span className="text-[6px] font-black text-zinc-400 tracking-widest uppercase block mb-0.5" style={{ fontSize: `${labelFontSize}px` }}>CATEGORÍA</span>
                  <span className="text-[10px] font-bold leading-tight text-zinc-900 truncate" style={{ fontSize: `${valueFontSize}px` }}>{categoria}</span>
                </div>
                <div className="p-1.5 bg-zinc-50 border border-zinc-100 rounded-lg flex flex-col justify-center">
                  <span className="text-[6px] font-black text-zinc-400 tracking-widest uppercase block mb-0.5" style={{ fontSize: `${labelFontSize}px` }}>CLAVE / SKU</span>
                  <span className="text-[10px] font-mono font-black leading-tight text-blue-600 tracking-wide truncate" style={{ fontSize: `${valueFontSize}px` }}>{sku}</span>
                </div>
              </div>

              {/* Product Description */}
              <div className="p-1.5 bg-zinc-50 border border-zinc-100 rounded-lg shrink-0">
                <span className="text-[6px] font-black text-zinc-400 tracking-widest uppercase block mb-0.5" style={{ fontSize: `${labelFontSize}px` }}>DESCRIPCIÓN DEL PRODUCTO</span>
                <div className="text-[9px] font-bold leading-tight text-zinc-800 uppercase line-clamp-2 min-h-[22px] flex items-center" style={{ fontSize: `${valueFontSize}px` }}>
                  {description}
                </div>
              </div>

              {/* Quantities 4-way Grid */}
              <div className="grid grid-cols-4 gap-1 text-center shrink-0">
                <div className="p-1 bg-zinc-50 border border-zinc-100 rounded-md flex flex-col justify-between">
                  <span className="text-[5.5px] font-black text-zinc-400 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>CANT CAMA</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-900 mt-0.5" style={{ fontSize: `${valueFontSize}px` }}>{cantCama}</span>
                </div>
                <div className="p-1 bg-zinc-50 border border-zinc-100 rounded-md flex flex-col justify-between">
                  <span className="text-[5.5px] font-black text-zinc-400 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>N. ESTIBA</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-900 mt-0.5" style={{ fontSize: `${valueFontSize}px` }}>{numEstiba}</span>
                </div>
                <div className="p-1 bg-zinc-50 border border-zinc-100 rounded-md flex flex-col justify-between">
                  <span className="text-[5.5px] font-black text-zinc-400 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>TOT CAJAS</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-900 mt-0.5" style={{ fontSize: `${valueFontSize}px` }}>{totalCajas}</span>
                </div>
                <div className="p-1 bg-zinc-50 border border-zinc-100 rounded-md flex flex-col justify-between">
                  <span className="text-[5.5px] font-black text-zinc-400 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>PZ CAJA</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-900 mt-0.5" style={{ fontSize: `${valueFontSize}px` }}>{pzCaja}</span>
                </div>
              </div>

              {/* Pieces per Pallet Highlight Badge */}
              <div className="bg-zinc-900 text-white rounded-lg p-2 flex items-center justify-between shrink-0">
                <span className="text-[7.5px] font-black tracking-[0.1em] uppercase">PZ X TARIMA</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[16px] font-mono font-black text-green-400 leading-none">{pzTarima}</span>
                  <span className="text-[7px] font-bold opacity-80 tracking-wider uppercase">PZ</span>
                </div>
              </div>

            </div>

            {/* Right Column: Scannable Barcode Hub (44% width) */}
            <div className="w-[44%] flex flex-col justify-between min-h-0 gap-1.5">
              
              {/* Top Barcode (SKU) */}
              <div className="flex-1 flex flex-col items-center justify-center p-1.5 border border-zinc-100 bg-white rounded-lg">
                <span className="text-[5.5px] font-black text-zinc-400 tracking-widest uppercase mb-1" style={{ fontSize: `${labelFontSize}px` }}>CÓDIGO SKU</span>
                <div className="flex items-center justify-center w-full">
                  <BarcodeRenderer value={sku} height={Math.round(32 * barcodeScaleY)} width={Number((1.4 * barcodeScaleX).toFixed(2))} fontSize={7} displayValue={false} format={barcodeType} />
                </div>
              </div>

              {/* Bottom Barcode (Pallet pieces) */}
              <div className="flex-1 flex flex-col items-center justify-center p-1.5 border border-zinc-100 bg-white rounded-lg relative">
                <span className="text-[5.5px] font-black text-zinc-400 tracking-widest uppercase mb-1" style={{ fontSize: `${labelFontSize}px` }}>CÓDIGO TARIMA (PZ)</span>
                <div className="flex items-center justify-center w-full">
                  <BarcodeRenderer value={String(pzTarima)} height={Math.round(32 * barcodeScaleY)} width={Number((1.6 * barcodeScaleX).toFixed(2))} fontSize={8} displayValue={false} format={barcodeType} />
                </div>
                <span className="text-[8px] font-mono font-black tracking-[0.2em] text-zinc-900 mt-0.5">{pzTarima}</span>

                {isFooterLogo && (
                  <div className="absolute bottom-1 right-2 left-2 flex justify-center">
                    <img src={logoUrl} style={{ height: `${Math.min(logoSize, 22)}px`, maxHeight: '18px', width: 'auto', objectFit: 'contain' }} alt="Logo Footer" />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col min-h-0 relative font-sans text-black select-none">
        {/* Top Banner with Ficha Tecnica & Header Logo if active */}
        <div className="border-b-2 border-black flex items-center justify-between bg-black text-white shrink-0">
          <span className="py-1 px-4 text-[9px] font-mono tracking-[0.25em] font-black uppercase">
            {fichaTecnica || 'FICHA TÉCNICA'}
          </span>
          {isHeaderLogo && (
            <div className="bg-white border-l-2 border-black h-7 px-3 flex items-center justify-center">
              <img src={logoUrl} style={{ height: `${Math.min(logoSize, 22)}px`, width: 'auto', objectFit: 'contain' }} alt="Logo" />
            </div>
          )}
        </div>

        {/* Split Columns */}
        <div className="flex-1 flex min-h-0">
          {/* Left Column: Product Info & Stats (56% width) */}
          <div className="w-[56%] border-r-2 border-black flex flex-col justify-between min-h-0 bg-white">
            
            {/* Category & SKU row */}
            <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black shrink-0 bg-zinc-50/40">
              <div className="p-1.5 flex flex-col justify-center">
                <span className="text-[6.5px] font-bold text-zinc-500 tracking-wider uppercase block" style={{ fontSize: `${labelFontSize}px` }}>CATEGORÍA</span>
                <span className="text-[10px] font-black leading-tight text-black truncate" style={{ fontSize: `${valueFontSize}px` }}>{categoria}</span>
              </div>
              <div className="p-1.5 flex flex-col justify-center">
                <span className="text-[6.5px] font-bold text-zinc-500 tracking-wider uppercase block" style={{ fontSize: `${labelFontSize}px` }}>CLAVE / SKU</span>
                <span className="text-[10.5px] font-mono font-black leading-tight text-black tracking-wide truncate" style={{ fontSize: `${valueFontSize}px` }}>{sku}</span>
              </div>
            </div>

            {/* Product Description */}
            <div className="p-2 border-b-2 border-black bg-white shrink-0">
              <span className="text-[6.5px] font-bold text-zinc-400 tracking-wider uppercase block mb-0.5" style={{ fontSize: `${labelFontSize}px` }}>DESCRIPCIÓN DEL PRODUCTO</span>
              <div className="text-[9.5px] font-black leading-tight text-black uppercase line-clamp-2 min-h-[26px] flex items-center" style={{ fontSize: `${valueFontSize}px` }}>
                {description}
              </div>
            </div>

            {/* Quantities 4-way Grid */}
            <div className="grid grid-cols-4 border-b-2 border-black divide-x-2 divide-black text-center shrink-0">
              <div className="p-1 flex flex-col justify-between">
                <span className="text-[6px] font-bold text-zinc-500 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>CANT CAMA</span>
                <span className="text-[11px] font-mono font-black text-zinc-900 mt-0.5" style={{ fontSize: `${valueFontSize}px` }}>{cantCama}</span>
              </div>
              <div className="p-1 flex flex-col justify-between">
                <span className="text-[6px] font-bold text-zinc-500 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>N. ESTIBA</span>
                <span className="text-[11px] font-mono font-black text-zinc-900 mt-0.5" style={{ fontSize: `${valueFontSize}px` }}>{numEstiba}</span>
              </div>
              <div className="p-1 flex flex-col justify-between">
                <span className="text-[6px] font-bold text-zinc-500 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>TOT CAJAS</span>
                <span className="text-[11px] font-mono font-black text-zinc-900 mt-0.5" style={{ fontSize: `${valueFontSize}px` }}>{totalCajas}</span>
              </div>
              <div className="p-1 flex flex-col justify-between">
                <span className="text-[6px] font-bold text-zinc-500 uppercase tracking-wider leading-none" style={{ fontSize: `${labelFontSize}px` }}>PZ CAJA</span>
                <span className="text-[11px] font-mono font-black text-zinc-900 mt-0.5" style={{ fontSize: `${valueFontSize}px` }}>{pzCaja}</span>
              </div>
            </div>

            {/* Pieces per Pallet Highlight Badge (Massive & Bold) */}
            <div className="flex-1 bg-black text-white p-2 flex items-center justify-between shrink-0">
              <span className="text-[8px] font-black tracking-[0.15em] uppercase">PZ X TARIMA</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-mono font-black leading-none">{pzTarima}</span>
                <span className="text-[7px] font-bold opacity-85 tracking-wider uppercase">PZ</span>
              </div>
            </div>

          </div>

          {/* Right Column: Scannable Barcode Hub (44% width) */}
          <div className="w-[44%] flex flex-col justify-between bg-zinc-50/10 min-h-0 relative">
            
            {/* Top Barcode (SKU) */}
            <div className="flex-1 flex flex-col items-center justify-center p-2 border-b-2 border-black bg-white">
              <span className="text-[6px] font-bold text-zinc-400 tracking-wider uppercase mb-1" style={{ fontSize: `${labelFontSize}px` }}>CÓDIGO SKU</span>
              <div className="flex items-center justify-center w-full">
                <BarcodeRenderer value={sku} height={Math.round(35 * barcodeScaleY)} width={Number((1.5 * barcodeScaleX).toFixed(2))} fontSize={7} displayValue={false} format={barcodeType} />
              </div>
            </div>

            {/* Bottom Barcode (Pallet pieces) */}
            <div className="flex-1 flex flex-col items-center justify-center p-2 bg-white relative">
              <span className="text-[6px] font-bold text-zinc-400 tracking-wider uppercase mb-1" style={{ fontSize: `${labelFontSize}px` }}>CÓDIGO TARIMA (PZ)</span>
              <div className="flex items-center justify-center w-full">
                <BarcodeRenderer value={String(pzTarima)} height={Math.round(35 * barcodeScaleY)} width={Number((1.8 * barcodeScaleX).toFixed(2))} fontSize={8} displayValue={false} format={barcodeType} />
              </div>
              <span className="text-[8.5px] font-mono font-black tracking-[0.25em] text-zinc-900 mt-0.5">{pzTarima}</span>

              {isFooterLogo && (
                <div className="absolute bottom-1 right-2 left-2 flex justify-center">
                  <img src={logoUrl} style={{ height: `${Math.min(logoSize, 22)}px`, maxHeight: '20px', width: 'auto', objectFit: 'contain' }} alt="Logo Footer" />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`print-barcode-page bg-white text-black font-sans flex flex-col box-border select-none overflow-hidden relative ${
        designStyle === 'modern' ? 'border-[3px] border-zinc-900 rounded-[1.25rem] p-1.5' : 'border-[4px] border-black p-1'
      }`}
      style={{ width: widthVal, height: heightVal, margin: '0 auto', pageBreakAfter: 'always' }}
    >
      {/* Background Watermark Logo Option */}
      {isWatermarkLogo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.10] select-none z-0">
          <img 
            src={logoUrl} 
            style={{ maxHeight: `${logoSize * 2.5}px`, maxWidth: '80%', objectFit: 'contain' }} 
            alt="watermark" 
          />
        </div>
      )}

      {/* Esquinas de Enfoque Almacén (Rojo Alta Visibilidad como la imagen) */}
      {cornerFocus && (
        <>
          {/* Esquina superior izquierda ┌ */}
          <div className={`absolute top-1 left-1 w-6 h-6 border-t-[4px] border-l-[4px] border-red-600 z-30 pointer-events-none ${designStyle === 'modern' ? 'rounded-tl-[0.6rem]' : ''}`} />
          {/* Esquina inferior derecha ┘ */}
          <div className={`absolute bottom-1 right-1 w-6 h-6 border-b-[4px] border-r-[4px] border-red-600 z-30 pointer-events-none ${designStyle === 'modern' ? 'rounded-br-[0.6rem]' : ''}`} />
        </>
      )}

      {orientation === 'vertical' ? renderVertical() : renderHorizontal()}
    </div>
  );
});

// Helper mapping functions to synchronize between Frontend camelCase and DB snake_case
const mapFromSupabase = (row: any): BarcodeLabelRecord => ({
  id: row.id,
  sku: row.sku,
  fichaTecnica: row.ficha_tecnica || row.fichaTecnica || '',
  categoria: row.categoria || '',
  description: row.description || '',
  cantCama: row.cant_cama !== undefined ? row.cant_cama : (row.cantCama || 0),
  numEstiba: row.num_estiba !== undefined ? row.num_estiba : (row.numEstiba || 0),
  totalCajas: row.total_cajas !== undefined ? row.total_cajas : (row.totalCajas || 0),
  pzCaja: row.pz_caja !== undefined ? row.pz_caja : (row.pzCaja || 0),
  pzTarima: row.pz_tarima !== undefined ? row.pz_tarima : (row.pzTarima || 0),
  logoUrl: row.logo_url || row.logoUrl || '',
  logoSize: row.logo_size !== undefined ? row.logo_size : (row.logoSize || 36),
  logoAlign: row.logo_align || row.logoAlign || 'center',
  logoPosition: row.logo_position || row.logoPosition || 'header',
  orientation: row.orientation || 'vertical',
  cornerFocus: row.corner_focus !== undefined ? row.corner_focus : (row.cornerFocus !== undefined ? row.cornerFocus : true),
  designStyle: row.design_style || row.designStyle || 'modern',
  barcodeType: row.barcode_type || row.barcodeType || 'CODE128',
  barcodeScaleX: row.barcode_scalex !== undefined ? Number(row.barcode_scalex) : (row.barcodeScaleX !== undefined ? Number(row.barcodeScaleX) : 1.0),
  barcodeScaleY: row.barcode_scaley !== undefined ? Number(row.barcode_scaley) : (row.barcodeScaleY !== undefined ? Number(row.barcodeScaleY) : 1.0),
  labelFontSize: row.label_font_size !== undefined ? Number(row.label_font_size) : (row.labelFontSize !== undefined ? Number(row.labelFontSize) : 7.0),
  valueFontSize: row.value_font_size !== undefined ? Number(row.value_font_size) : (row.valueFontSize !== undefined ? Number(row.valueFontSize) : 12.0),
  createdAt: row.created_at || row.createdAt || new Date().toISOString()
});

const mapToSupabase = (item: any) => ({
  id: item.id,
  sku: item.sku,
  ficha_tecnica: item.fichaTecnica,
  categoria: item.categoria,
  description: item.description,
  cant_cama: item.cantCama,
  num_estiba: item.numEstiba,
  total_cajas: item.totalCajas,
  pz_caja: item.pzCaja,
  pz_tarima: item.pzTarima,
  logo_url: item.logoUrl || null,
  logo_size: item.logoSize || 36,
  logo_align: item.logoAlign || 'center',
  logo_position: item.logoPosition || 'header',
  orientation: item.orientation || 'vertical',
  corner_focus: item.cornerFocus !== undefined ? item.cornerFocus : true,
  design_style: item.designStyle || 'modern',
  barcode_type: item.barcodeType || 'CODE128',
  barcode_scalex: item.barcodeScaleX !== undefined ? item.barcodeScaleX : 1.0,
  barcode_scaley: item.barcodeScaleY !== undefined ? item.barcodeScaleY : 1.0,
  label_font_size: item.labelFontSize !== undefined ? item.labelFontSize : 7.0,
  value_font_size: item.valueFontSize !== undefined ? item.valueFontSize : 12.0
});

const BarcodeStudio: React.FC = () => {
  const [barcodeActiveTab, setBarcodeActiveTab] = useState<'content' | 'logo' | 'database'>('content');
  const [dbStatus, setDbStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [barcodeForm, setBarcodeForm] = useState(() => {
    const baseState = {
      sku: 'C0605-00',
      fichaTecnica: 'Ficha Tecnica.',
      categoria: 'Cocina',
      description: 'JADE ESSENTIALS BATERIA 11 PZS',
      cantCama: 7,
      numEstiba: 4,
      totalCajas: 28,
      pzCaja: 2,
      pzTarima: 56,
      logoUrl: '',
      logoSize: 36,
      logoAlign: 'center' as 'left' | 'center' | 'right',
      logoPosition: 'header' as 'header' | 'footer' | 'watermark',
      orientation: 'vertical' as 'vertical' | 'horizontal',
      cornerFocus: true,
      designStyle: 'modern' as 'industrial' | 'modern',
      barcodeType: 'CODE128',
      barcodeScaleX: 1.0,
      barcodeScaleY: 1.0,
      labelFontSize: 7.0,
      valueFontSize: 12.0
    };
    try {
      const storedDefault = localStorage.getItem('cv_barcode_default_design');
      if (storedDefault) {
        const parsed = JSON.parse(storedDefault);
        return {
          ...baseState,
          logoUrl: parsed.logoUrl || '',
          logoSize: parsed.logoSize || 36,
          logoAlign: parsed.logoAlign || 'center',
          logoPosition: parsed.logoPosition || 'header',
          orientation: parsed.orientation || 'vertical',
          cornerFocus: parsed.cornerFocus !== undefined ? parsed.cornerFocus : true,
          designStyle: parsed.designStyle || 'modern',
          barcodeType: parsed.barcodeType || 'CODE128',
          barcodeScaleX: parsed.barcodeScaleX !== undefined ? parsed.barcodeScaleX : 1.0,
          barcodeScaleY: parsed.barcodeScaleY !== undefined ? parsed.barcodeScaleY : 1.0,
          labelFontSize: parsed.labelFontSize !== undefined ? parsed.labelFontSize : 7.0,
          valueFontSize: parsed.valueFontSize !== undefined ? parsed.valueFontSize : 12.0
        };
      }
    } catch (e) {
      console.error("Error loading barcode default design settings:", e);
    }
    return baseState;
  });
  
  const [barcodeHistory, setBarcodeHistory] = useState<BarcodeLabelRecord[]>([]);
  const [selectedBarcodeItems, setSelectedBarcodeItems] = useState<Map<string, BarcodeLabelRecord>>(new Map());
  const [barcodeSearchTerm, setBarcodeSearchTerm] = useState('');
  const [barcodePrintList, setBarcodePrintList] = useState<BarcodeLabelRecord[]>([]);
  const [barcodeSqlCopied, setBarcodeSqlCopied] = useState(false);
  const [showBarcodePreview, setShowBarcodePreview] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(0.85);

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
      pzTarima: item.pzTarima,
      logoUrl: item.logoUrl || '',
      logoSize: item.logoSize || 36,
      logoAlign: item.logoAlign || 'center',
      logoPosition: item.logoPosition || 'header',
      orientation: item.orientation || 'vertical',
      cornerFocus: item.cornerFocus !== undefined ? item.cornerFocus : true,
      designStyle: item.designStyle || 'modern',
      barcodeType: item.barcodeType || 'CODE128',
      barcodeScaleX: item.barcodeScaleX !== undefined ? item.barcodeScaleX : 1.0,
      barcodeScaleY: item.barcodeScaleY !== undefined ? item.barcodeScaleY : 1.0,
      labelFontSize: item.labelFontSize !== undefined ? item.labelFontSize : 7.0,
      valueFontSize: item.valueFontSize !== undefined ? item.valueFontSize : 12.0
    });
    setEditingId(item.id);
    setBarcodeActiveTab('content');
  }, []);

  // Real-time synchronization of form changes into history and selected lists
  useEffect(() => {
    if (!editingId) return;

    setBarcodeHistory(prev => {
      let changed = false;
      const next = prev.map(item => {
        if (item.id === editingId) {
          // Check if any field differs to prevent infinite updates
          if (
            item.sku !== barcodeForm.sku ||
            item.cantCama !== barcodeForm.cantCama ||
            item.numEstiba !== barcodeForm.numEstiba ||
            item.totalCajas !== barcodeForm.totalCajas ||
            item.pzCaja !== barcodeForm.pzCaja ||
            item.pzTarima !== barcodeForm.pzTarima ||
            item.logoUrl !== barcodeForm.logoUrl ||
            item.logoSize !== barcodeForm.logoSize ||
            item.logoAlign !== barcodeForm.logoAlign ||
            item.logoPosition !== barcodeForm.logoPosition ||
            item.orientation !== barcodeForm.orientation ||
            item.cornerFocus !== barcodeForm.cornerFocus ||
            item.designStyle !== barcodeForm.designStyle ||
            item.barcodeType !== barcodeForm.barcodeType ||
            item.barcodeScaleX !== barcodeForm.barcodeScaleX ||
            item.barcodeScaleY !== barcodeForm.barcodeScaleY ||
            item.labelFontSize !== barcodeForm.labelFontSize ||
            item.valueFontSize !== barcodeForm.valueFontSize ||
            item.description !== barcodeForm.description ||
            item.fichaTecnica !== barcodeForm.fichaTecnica ||
            item.categoria !== barcodeForm.categoria
          ) {
            changed = true;
            return {
              ...item,
              ...barcodeForm
            };
          }
        }
        return item;
      });

      if (changed) {
        localStorage.setItem('cv_barcode_labels_history', JSON.stringify(next));
        return next;
      }
      return prev;
    });

    setSelectedBarcodeItems(prev => {
      if (prev.has(editingId)) {
        const item = prev.get(editingId)!;
        if (
          item.sku !== barcodeForm.sku ||
          item.cantCama !== barcodeForm.cantCama ||
          item.numEstiba !== barcodeForm.numEstiba ||
          item.totalCajas !== barcodeForm.totalCajas ||
          item.pzCaja !== barcodeForm.pzCaja ||
          item.pzTarima !== barcodeForm.pzTarima ||
          item.logoUrl !== barcodeForm.logoUrl ||
          item.logoSize !== barcodeForm.logoSize ||
          item.logoAlign !== barcodeForm.logoAlign ||
          item.logoPosition !== barcodeForm.logoPosition ||
          item.orientation !== barcodeForm.orientation ||
          item.cornerFocus !== barcodeForm.cornerFocus ||
          item.designStyle !== barcodeForm.designStyle ||
          item.barcodeType !== barcodeForm.barcodeType ||
          item.barcodeScaleX !== barcodeForm.barcodeScaleX ||
          item.barcodeScaleY !== barcodeForm.barcodeScaleY ||
          item.labelFontSize !== barcodeForm.labelFontSize ||
          item.valueFontSize !== barcodeForm.valueFontSize ||
          item.description !== barcodeForm.description ||
          item.fichaTecnica !== barcodeForm.fichaTecnica ||
          item.categoria !== barcodeForm.categoria
        ) {
          const next = new Map(prev);
          next.set(editingId, {
            ...item,
            ...barcodeForm
          });
          return next;
        }
      }
      return prev;
    });
  }, [barcodeForm, editingId]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeCsvInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoad = useRef(true);
  const [showBarcodeUploadRules, setShowBarcodeUploadRules] = useState(false);

  // SQL code to create barcode_labels and barcode_design_config tables inside Supabase
  const barcodeSqlCode = `-- SQL para habilitar sincronización de Marbetes Barras y Diseño con Supabase

-- OPCIÓN 1: TABLA GENERAL DE HISTORIAL (MARBETES BARRAS)
CREATE TABLE IF NOT EXISTS barcode_labels (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL,
    ficha_tecnica TEXT,
    categoria TEXT,
    description TEXT,
    cant_cama INTEGER,
    num_estiba INTEGER,
    total_cajas INTEGER,
    pz_caja INTEGER,
    pz_tarima INTEGER,
    logo_url TEXT, -- Almacena la URL o el Base64 de la imagen del logo
    logo_size INTEGER DEFAULT 36,
    logo_align TEXT DEFAULT 'center',
    logo_position TEXT DEFAULT 'header',
    orientation TEXT DEFAULT 'vertical',
    corner_focus BOOLEAN DEFAULT true,
    design_style TEXT DEFAULT 'modern',
    barcode_type TEXT DEFAULT 'CODE128',
    barcode_scalex NUMERIC DEFAULT 1.0,
    barcode_scaley NUMERIC DEFAULT 1.0,
    label_font_size NUMERIC DEFAULT 7.0,
    value_font_size NUMERIC DEFAULT 12.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para la tabla general
ALTER TABLE barcode_labels ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para la tabla general
DROP POLICY IF EXISTS "Permitir lectura de marbetes_barras" ON barcode_labels;
CREATE POLICY "Permitir lectura de marbetes_barras" ON barcode_labels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserción de marbetes_barras" ON barcode_labels;
CREATE POLICY "Permitir inserción de marbetes_barras" ON barcode_labels FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de marbetes_barras" ON barcode_labels;
CREATE POLICY "Permitir actualización de marbetes_barras" ON barcode_labels FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir borrado de marbetes_barras" ON barcode_labels;
CREATE POLICY "Permitir borrado de marbetes_barras" ON barcode_labels FOR DELETE USING (true);


-- OPCIÓN 2: TABLA DEDICADA DE CONFIGURACIÓN DE DISEÑO (Para guardar sliders, ancho X, alto Y, fuentes y logos automáticamente)
CREATE TABLE IF NOT EXISTS barcode_design_config (
    id TEXT PRIMARY KEY, -- 'active-design'
    logo_url TEXT,
    logo_size INTEGER DEFAULT 36,
    logo_align TEXT DEFAULT 'center',
    logo_position TEXT DEFAULT 'header',
    orientation TEXT DEFAULT 'vertical',
    corner_focus BOOLEAN DEFAULT true,
    design_style TEXT DEFAULT 'modern',
    barcode_type TEXT DEFAULT 'CODE128',
    barcode_scalex NUMERIC DEFAULT 1.0,
    barcode_scaley NUMERIC DEFAULT 1.0,
    label_font_size NUMERIC DEFAULT 7.0,
    value_font_size NUMERIC DEFAULT 12.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para la tabla de diseño dedicado
ALTER TABLE barcode_design_config ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para la tabla de diseño dedicado
DROP POLICY IF EXISTS "Permitir lectura de diseño" ON barcode_design_config;
CREATE POLICY "Permitir lectura de diseño" ON barcode_design_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir inserción de diseño" ON barcode_design_config;
CREATE POLICY "Permitir inserción de diseño" ON barcode_design_config FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización de diseño" ON barcode_design_config;
CREATE POLICY "Permitir actualización de diseño" ON barcode_design_config FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir borrado de diseño" ON barcode_design_config;
CREATE POLICY "Permitir borrado de diseño" ON barcode_design_config FOR DELETE USING (true);`;

  // Fetch from Supabase
  const fetchBarcodeHistory = useCallback(async () => {
    try {
      // Intentar cargar diseño activo de la tabla dedicada (Opción 2)
      try {
        const { data: designData, error: designError } = await supabase
          .from('barcode_design_config')
          .select('*')
          .eq('id', 'active-design')
          .single();
        
        if (!designError && designData) {
          const parsed = {
            logoUrl: designData.logo_url || '',
            logoSize: designData.logo_size || 36,
            logoAlign: designData.logo_align || 'center',
            logoPosition: designData.logo_position || 'header',
            orientation: designData.orientation || 'vertical',
            cornerFocus: designData.corner_focus !== undefined ? designData.corner_focus : true,
            designStyle: designData.design_style || 'modern',
            barcodeType: designData.barcode_type || 'CODE128',
            barcodeScaleX: designData.barcode_scalex !== undefined ? Number(designData.barcode_scalex) : 1.0,
            barcodeScaleY: designData.barcode_scaley !== undefined ? Number(designData.barcode_scaley) : 1.0,
            labelFontSize: designData.label_font_size !== undefined ? Number(designData.label_font_size) : 7.0,
            valueFontSize: designData.value_font_size !== undefined ? Number(designData.value_font_size) : 12.0
          };
          localStorage.setItem('cv_barcode_default_design', JSON.stringify(parsed));
          setBarcodeForm(prev => ({
            ...prev,
            ...parsed
          }));
        }
      } catch (designErr) {
        console.log("No se pudo obtener diseño de la tabla dedicada. Usando fallback.");
      }

      const { data, error } = await supabase
        .from('barcode_labels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        const mapped = data.map(mapFromSupabase);
        
        // Find default design if any (Opción 1 fallback)
        const defaultDesign = mapped.find(item => item.id === 'default-design-config');
        if (defaultDesign) {
          localStorage.setItem('cv_barcode_default_design', JSON.stringify(defaultDesign));
          setBarcodeForm(prev => {
            // Overwrite design settings with saved defaults if they were unmodified, or use them as template
            return {
              ...prev,
              logoUrl: prev.logoUrl || defaultDesign.logoUrl || '',
              logoSize: prev.logoSize === 36 ? (defaultDesign.logoSize || 36) : prev.logoSize,
              logoAlign: prev.logoAlign === 'center' ? (defaultDesign.logoAlign || 'center') : prev.logoAlign,
              logoPosition: prev.logoPosition === 'header' ? (defaultDesign.logoPosition || 'header') : prev.logoPosition,
              orientation: prev.orientation === 'vertical' ? (defaultDesign.orientation || 'vertical') : prev.orientation,
              cornerFocus: prev.cornerFocus === true ? (defaultDesign.cornerFocus !== undefined ? defaultDesign.cornerFocus : true) : prev.cornerFocus,
              designStyle: prev.designStyle === 'modern' ? (defaultDesign.designStyle || 'modern') : prev.designStyle,
              barcodeType: prev.barcodeType === 'CODE128' ? (defaultDesign.barcodeType || 'CODE128') : prev.barcodeType,
              barcodeScaleX: prev.barcodeScaleX === 1.0 ? (defaultDesign.barcodeScaleX !== undefined ? defaultDesign.barcodeScaleX : 1.0) : prev.barcodeScaleX,
              barcodeScaleY: prev.barcodeScaleY === 1.0 ? (defaultDesign.barcodeScaleY !== undefined ? defaultDesign.barcodeScaleY : 1.0) : prev.barcodeScaleY,
              labelFontSize: prev.labelFontSize === 7.0 ? (defaultDesign.labelFontSize !== undefined ? defaultDesign.labelFontSize : 7.0) : prev.labelFontSize,
              valueFontSize: prev.valueFontSize === 12.0 ? (defaultDesign.valueFontSize !== undefined ? defaultDesign.valueFontSize : 12.0) : prev.valueFontSize
            };
          });
        }

        const historyItems = mapped.filter(item => item.id !== 'default-design-config');
        setBarcodeHistory(historyItems);
        localStorage.setItem('cv_barcode_labels_history', JSON.stringify(historyItems));
        setDbStatus('online');
        if (isInitialLoad.current && historyItems.length > 0) {
          handleLoadBarcodeLabelToForm(historyItems[0]);
          isInitialLoad.current = false;
        }
      } else {
        console.log("Supabase fetch failed, fallback to localStorage. Code:", error?.code);
        setDbStatus('offline');
        loadLocalHistory();
      }
    } catch (e) {
      console.log("Supabase error, loading local history.");
      setDbStatus('offline');
      loadLocalHistory();
    }
  }, [handleLoadBarcodeLabelToForm]);

  const loadLocalHistory = () => {
    const stored = localStorage.getItem('cv_barcode_labels_history');
    if (stored) {
      try { 
        const parsed = JSON.parse(stored);
        setBarcodeHistory(parsed); 
        if (isInitialLoad.current && parsed.length > 0) {
          handleLoadBarcodeLabelToForm(parsed[0]);
          isInitialLoad.current = false;
        }
      } catch (e) { 
        console.error("Error parsing barcode history:", e); 
      }
    } else {
      setBarcodeHistory([
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
          logoUrl: '',
          logoSize: 36,
          logoAlign: 'center',
          logoPosition: 'header',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    fetchBarcodeHistory();
  }, [fetchBarcodeHistory]);

  // Guardar configuración de diseño automáticamente con un debounce de 1 segundo
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Guardar en localStorage de inmediato
      const designConfig = {
        logoUrl: barcodeForm.logoUrl,
        logoSize: barcodeForm.logoSize,
        logoAlign: barcodeForm.logoAlign,
        logoPosition: barcodeForm.logoPosition,
        orientation: barcodeForm.orientation,
        cornerFocus: barcodeForm.cornerFocus,
        designStyle: barcodeForm.designStyle,
        barcodeType: barcodeForm.barcodeType,
        barcodeScaleX: barcodeForm.barcodeScaleX,
        barcodeScaleY: barcodeForm.barcodeScaleY,
        labelFontSize: barcodeForm.labelFontSize,
        valueFontSize: barcodeForm.valueFontSize
      };
      localStorage.setItem('cv_barcode_default_design', JSON.stringify(designConfig));

      // Guardar en Supabase de forma transparente en segundo plano
      try {
        // 1. Guardar en la tabla dedicada de diseño (Opción 2)
        const dedicatedRecord = {
          id: 'active-design',
          logo_url: barcodeForm.logoUrl || null,
          logo_size: barcodeForm.logoSize || 36,
          logo_align: barcodeForm.logoAlign || 'center',
          logo_position: barcodeForm.logoPosition || 'header',
          orientation: barcodeForm.orientation || 'vertical',
          corner_focus: barcodeForm.cornerFocus !== undefined ? barcodeForm.cornerFocus : true,
          design_style: barcodeForm.designStyle || 'modern',
          barcode_type: barcodeForm.barcodeType || 'CODE128',
          barcode_scalex: barcodeForm.barcodeScaleX !== undefined ? barcodeForm.barcodeScaleX : 1.0,
          barcode_scaley: barcodeForm.barcodeScaleY !== undefined ? barcodeForm.barcodeScaleY : 1.0,
          label_font_size: barcodeForm.labelFontSize !== undefined ? barcodeForm.labelFontSize : 7.0,
          value_font_size: barcodeForm.valueFontSize !== undefined ? barcodeForm.valueFontSize : 12.0
        };

        const { error: dedicatedErr } = await supabase
          .from('barcode_design_config')
          .upsert([dedicatedRecord], { onConflict: 'id' });

        if (!dedicatedErr) {
          setDbStatus('online');
        } else {
          console.log("No se pudo guardar automáticamente en barcode_design_config, intentando tabla general.");
        }

        // 2. Guardar también en la tabla general (Opción 1) como respaldo de compatibilidad
        const defaultRecord = {
          id: 'default-design-config',
          sku: 'DEFAULT',
          ficha_tecnica: 'DISEÑO_PREDETERMINADO',
          categoria: 'DISEÑO',
          description: 'Configuración de diseño por defecto',
          cant_cama: 0,
          num_estiba: 0,
          total_cajas: 0,
          pz_caja: 0,
          pz_tarima: 0,
          logo_url: barcodeForm.logoUrl || null,
          logo_size: barcodeForm.logoSize || 36,
          logo_align: barcodeForm.logoAlign || 'center',
          logo_position: barcodeForm.logoPosition || 'header',
          orientation: barcodeForm.orientation || 'vertical',
          corner_focus: barcodeForm.cornerFocus !== undefined ? barcodeForm.cornerFocus : true,
          design_style: barcodeForm.designStyle || 'modern',
          barcode_type: barcodeForm.barcodeType || 'CODE128',
          barcode_scalex: barcodeForm.barcodeScaleX !== undefined ? barcodeForm.barcodeScaleX : 1.0,
          barcode_scaley: barcodeForm.barcodeScaleY !== undefined ? barcodeForm.barcodeScaleY : 1.0,
          label_font_size: barcodeForm.labelFontSize !== undefined ? barcodeForm.labelFontSize : 7.0,
          value_font_size: barcodeForm.valueFontSize !== undefined ? barcodeForm.valueFontSize : 12.0
        };

        const { error: generalErr } = await supabase
          .from('barcode_labels')
          .upsert([defaultRecord], { onConflict: 'id' });

        if (!generalErr) {
          setDbStatus('online');
        }
      } catch (err) {
        console.warn("Fallo el autoguardado de diseño en Supabase (offline/no-table):", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    barcodeForm.logoUrl,
    barcodeForm.logoSize,
    barcodeForm.logoAlign,
    barcodeForm.logoPosition,
    barcodeForm.orientation,
    barcodeForm.cornerFocus,
    barcodeForm.designStyle,
    barcodeForm.barcodeType,
    barcodeForm.barcodeScaleX,
    barcodeForm.barcodeScaleY,
    barcodeForm.labelFontSize,
    barcodeForm.valueFontSize
  ]);

  const handleCopyBarcodeSql = useCallback(() => {
    navigator.clipboard.writeText(barcodeSqlCode);
    setBarcodeSqlCopied(true);
    setTimeout(() => setBarcodeSqlCopied(false), 2000);
  }, []);

  // Handle image logo upload and convert to Base64
  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setBarcodeForm(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle downloading the CSV template
  const handleDownloadBarcodeTemplate = useCallback(() => {
    const csvContent = "Categoria,Clave,Descripción\nCocina,C0605-00,JADE ESSENTIALS BATERIA 11 PZS\nHogar,H1234-56,ALMOHADA CONFORT PLUS\nBelleza,B9876-54,CREMA REGENERADORA JADE";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Plantilla_Marbetes_Barras.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle uploading the CSV file and parsing it
  const handleImportBarcodeCSV = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const validationErrors: string[] = [];
      const dataLines = lines.slice(1).filter(l => l.replace(/,/g, '').trim() !== '');
      if (dataLines.length === 0) {
        alert("El archivo CSV no contiene datos.");
        return;
      }

      // Detect indices by header
      const headerLine = lines[0] || '';
      const headers = headerLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().toLowerCase().replace(/"/g, ''));
      
      let catIndex = headers.findIndex(h => h.includes('categoria') || h.includes('categoría') || h.includes('category') || h === 'cat');
      let skuIndex = headers.findIndex(h => h.includes('clave') || h.includes('sku') || h.includes('codigo') || h.includes('código') || h === 'code');
      let descIndex = headers.findIndex(h => h.includes('descripcion') || h.includes('descripción') || h.includes('description') || h === 'desc');

      // Fallbacks
      if (catIndex === -1) catIndex = 0;
      if (skuIndex === -1) skuIndex = 1;
      if (descIndex === -1) descIndex = 2;

      const toInsert: BarcodeLabelRecord[] = [];

      dataLines.forEach((line, index) => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/"/g, ''));
        const rowNum = index + 2;

        const rawCat = values[catIndex] || '';
        const rawSku = values[skuIndex] || '';
        const rawDesc = values[descIndex] || '';

        if (!rawSku) {
          validationErrors.push(`Fila ${rowNum}: La columna Clave/SKU está vacía.`);
        }

        const cleanSku = rawSku.toUpperCase();
        const cleanDesc = rawDesc.replace(/[_"]/g, '');

        toInsert.push({
          id: `barcode-${Date.now()}-${index}`,
          sku: cleanSku,
          fichaTecnica: 'Ficha Tecnica.',
          categoria: rawCat || 'General',
          description: cleanDesc || 'Sin descripción',
          cantCama: 0,
          numEstiba: 0,
          totalCajas: 0,
          pzCaja: 0,
          pzTarima: 0,
          logoUrl: barcodeForm.logoUrl || '',
          logoSize: barcodeForm.logoSize || 36,
          logoAlign: barcodeForm.logoAlign || 'center',
          logoPosition: barcodeForm.logoPosition || 'header',
          orientation: barcodeForm.orientation || 'vertical',
          cornerFocus: barcodeForm.cornerFocus !== undefined ? barcodeForm.cornerFocus : true,
          designStyle: barcodeForm.designStyle || 'modern',
          barcodeType: barcodeForm.barcodeType || 'CODE128',
          barcodeScaleX: barcodeForm.barcodeScaleX !== undefined ? barcodeForm.barcodeScaleX : 1.0,
          barcodeScaleY: barcodeForm.barcodeScaleY !== undefined ? barcodeForm.barcodeScaleY : 1.0,
          labelFontSize: barcodeForm.labelFontSize !== undefined ? barcodeForm.labelFontSize : 7.0,
          valueFontSize: barcodeForm.valueFontSize !== undefined ? barcodeForm.valueFontSize : 12.0,
          createdAt: new Date().toISOString()
        });
      });

      if (validationErrors.length > 0) {
        alert(`⚠️ ERROR DE VALIDACIÓN EN EXCEL/CSV\n\n${validationErrors.slice(0, 5).join('\n')}${validationErrors.length > 5 ? `\n... y ${validationErrors.length - 5} errores más.` : ''}`);
        return;
      }

      if (toInsert.length > 0) {
        setDbStatus('connecting');
        
        // Save locally first
        setBarcodeHistory(prev => {
          const next = [...toInsert, ...prev];
          localStorage.setItem('cv_barcode_labels_history', JSON.stringify(next));
          return next;
        });

        // Automatically load the first imported marbete so they can see and configure its quantitative parameters (which start at 0)
        handleLoadBarcodeLabelToForm(toInsert[0]);

        // Save to Supabase
        try {
          const dbRows = toInsert.map(mapToSupabase);
          const { error } = await supabase.from('barcode_labels').upsert(dbRows, { onConflict: 'id' });
          if (error) {
            console.error("Error syncing CSV with Supabase:", error);
            alert(`Cargado localmente en tu navegador (${toInsert.length} registros).\n\nNota: No se pudo registrar en Supabase de forma permanente.`);
            setDbStatus('offline');
          } else {
            alert(`✅ ¡Importación Exitosa!\n\nSe han guardado ${toInsert.length} marbetes en el historial y sincronizado con Supabase.`);
            setDbStatus('online');
            fetchBarcodeHistory();
          }
        } catch (dbErr) {
          console.error("Supabase connection error on CSV import:", dbErr);
          alert(`Cargado localmente en tu navegador (${toInsert.length} registros).\n\nNota: Sin conexión con Supabase.`);
          setDbStatus('offline');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [barcodeForm, fetchBarcodeHistory, handleLoadBarcodeLabelToForm]);

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

  const handleSaveDefaultDesign = useCallback(async () => {
    setDbStatus('connecting');
    try {
      // 1. Guardar en la tabla dedicada (Opción 2)
      const dedicatedRecord = {
        id: 'active-design',
        logo_url: barcodeForm.logoUrl || null,
        logo_size: barcodeForm.logoSize || 36,
        logo_align: barcodeForm.logoAlign || 'center',
        logo_position: barcodeForm.logoPosition || 'header',
        orientation: barcodeForm.orientation || 'vertical',
        corner_focus: barcodeForm.cornerFocus !== undefined ? barcodeForm.cornerFocus : true,
        design_style: barcodeForm.designStyle || 'modern',
        barcode_type: barcodeForm.barcodeType || 'CODE128',
        barcode_scalex: barcodeForm.barcodeScaleX !== undefined ? barcodeForm.barcodeScaleX : 1.0,
        barcode_scaley: barcodeForm.barcodeScaleY !== undefined ? barcodeForm.barcodeScaleY : 1.0,
        label_font_size: barcodeForm.labelFontSize !== undefined ? barcodeForm.labelFontSize : 7.0,
        value_font_size: barcodeForm.valueFontSize !== undefined ? barcodeForm.valueFontSize : 12.0
      };

      const { error: dedicatedErr } = await supabase
        .from('barcode_design_config')
        .upsert([dedicatedRecord], { onConflict: 'id' });

      // 2. Guardar en la tabla general (Opción 1)
      const defaultRecord = {
        id: 'default-design-config',
        sku: 'DEFAULT',
        ficha_tecnica: 'DISEÑO_PREDETERMINADO',
        categoria: 'DISEÑO',
        description: 'Configuración de diseño por defecto',
        cant_cama: 0,
        num_estiba: 0,
        total_cajas: 0,
        pz_caja: 0,
        pz_tarima: 0,
        logo_url: barcodeForm.logoUrl || null,
        logo_size: barcodeForm.logoSize || 36,
        logo_align: barcodeForm.logoAlign || 'center',
        logo_position: barcodeForm.logoPosition || 'header',
        orientation: barcodeForm.orientation || 'vertical',
        corner_focus: barcodeForm.cornerFocus !== undefined ? barcodeForm.cornerFocus : true,
        design_style: barcodeForm.designStyle || 'modern',
        barcode_type: barcodeForm.barcodeType || 'CODE128',
        barcode_scalex: barcodeForm.barcodeScaleX !== undefined ? barcodeForm.barcodeScaleX : 1.0,
        barcode_scaley: barcodeForm.barcodeScaleY !== undefined ? barcodeForm.barcodeScaleY : 1.0,
        label_font_size: barcodeForm.labelFontSize !== undefined ? barcodeForm.labelFontSize : 7.0,
        value_font_size: barcodeForm.valueFontSize !== undefined ? barcodeForm.valueFontSize : 12.0
      };

      const { error: generalErr } = await supabase
        .from('barcode_labels')
        .upsert([defaultRecord], { onConflict: 'id' });

      // Guardar localmente
      localStorage.setItem('cv_barcode_default_design', JSON.stringify(barcodeForm));

      if (dedicatedErr && generalErr) {
        console.error("Error saving default design to Supabase:", dedicatedErr, generalErr);
        alert("Guardado localmente. Nota: No se pudo registrar en Supabase (Verifica si copiaste y ejecutaste el código SQL).");
        setDbStatus('offline');
      } else {
        alert("Diseño predeterminado guardado y sincronizado con Supabase exitosamente.");
        setDbStatus('online');
      }
    } catch (err) {
      console.error(err);
      localStorage.setItem('cv_barcode_default_design', JSON.stringify(barcodeForm));
      alert("Guardado localmente de respaldo. Nota: Sin conexión con Supabase.");
      setDbStatus('offline');
    }
  }, [barcodeForm]);

  const handleNewBarcodeForm = useCallback(() => {
    setEditingId(null);
    const baseState = {
      sku: '',
      fichaTecnica: '',
      categoria: 'Cocina',
      description: '',
      cantCama: 0,
      numEstiba: 0,
      totalCajas: 0,
      pzCaja: 0,
      pzTarima: 0,
    };
    try {
      const storedDefault = localStorage.getItem('cv_barcode_default_design');
      if (storedDefault) {
        const parsed = JSON.parse(storedDefault);
        setBarcodeForm({
          ...baseState,
          logoUrl: parsed.logoUrl || '',
          logoSize: parsed.logoSize || 36,
          logoAlign: parsed.logoAlign || 'center',
          logoPosition: parsed.logoPosition || 'header',
          orientation: parsed.orientation || 'vertical',
          cornerFocus: parsed.cornerFocus !== undefined ? parsed.cornerFocus : true,
          designStyle: parsed.designStyle || 'modern',
          barcodeType: parsed.barcodeType || 'CODE128',
          barcodeScaleX: parsed.barcodeScaleX !== undefined ? parsed.barcodeScaleX : 1.0,
          barcodeScaleY: parsed.barcodeScaleY !== undefined ? parsed.barcodeScaleY : 1.0,
          labelFontSize: parsed.labelFontSize !== undefined ? parsed.labelFontSize : 7.0,
          valueFontSize: parsed.valueFontSize !== undefined ? parsed.valueFontSize : 12.0
        });
        return;
      }
    } catch (e) {
      console.error("Error applying default design config:", e);
    }
    
    setBarcodeForm({
      ...baseState,
      logoUrl: '',
      logoSize: 36,
      logoAlign: 'center',
      logoPosition: 'header',
      orientation: 'vertical',
      cornerFocus: true,
      designStyle: 'modern',
      barcodeType: 'CODE128',
      barcodeScaleX: 1.0,
      barcodeScaleY: 1.0,
      labelFontSize: 7.0,
      valueFontSize: 12.0
    });
  }, []);

  const handleAddBarcodeLabel = useCallback(async () => {
    if (!barcodeForm.sku.trim()) {
      alert("Por favor ingrese la Clave / SKU.");
      return;
    }
    const isEditing = editingId !== null;
    const targetId = isEditing ? editingId : `barcode-${Date.now()}`;

    const newRecord: BarcodeLabelRecord = {
      id: targetId,
      ...barcodeForm,
      createdAt: new Date().toISOString()
    };

    // Update locally instantly (Optimistic UI)
    setBarcodeHistory(prev => {
      let next;
      if (isEditing) {
        next = prev.map(item => item.id === targetId ? newRecord : item);
      } else {
        next = [newRecord, ...prev];
      }
      localStorage.setItem('cv_barcode_labels_history', JSON.stringify(next));
      return next;
    });

    // Also update in selected list if it was already selected
    setSelectedBarcodeItems(prev => {
      if (prev.has(targetId)) {
        const next = new Map(prev);
        next.set(targetId, newRecord);
        return next;
      }
      return prev;
    });

    try {
      const { error } = await supabase
        .from('barcode_labels')
        .upsert([mapToSupabase(newRecord)], { onConflict: 'id' });

      if (error) {
        console.error("Supabase upsert error:", error);
        alert("Guardado localmente. Nota: No se pudo registrar en la base de datos de Supabase. (¿Ya ejecutaste el script SQL?)");
      } else {
        alert(isEditing ? "Etiqueta actualizada y sincronizada con Supabase exitosamente." : "Etiqueta guardada en el historial y sincronizada con Supabase exitosamente.");
        fetchBarcodeHistory();
        if (isEditing) {
          setEditingId(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Guardado en historial local de respaldo. Nota: Sin conexión con Supabase.");
    }
  }, [barcodeForm, fetchBarcodeHistory, editingId]);

  const handleDeleteBarcodeLabel = useCallback(async (id: string) => {
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

    try {
      const { error } = await supabase
        .from('barcode_labels')
        .delete()
        .eq('id', id);
      if (error) {
        console.error("Supabase delete error:", error);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleClearBarcodeHistory = useCallback(async () => {
    if (confirm("¿Estás seguro de que deseas vaciar todo el historial de códigos de barras, tanto localmente como en Supabase?")) {
      setBarcodeHistory([]);
      localStorage.removeItem('cv_barcode_labels_history');
      setSelectedBarcodeItems(new Map());

      try {
        const { error } = await supabase
          .from('barcode_labels')
          .delete()
          .not('id', 'eq', 'nonexistent-placeholder-id');
        if (error) {
          console.error("Supabase clear error:", error);
        } else {
          alert("Historial vaciado correctamente.");
        }
      } catch (err) {
        console.error(err);
      }
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

  const handleDownloadSingleBarcodeImage = useCallback(async (item: any) => {
    const el = document.getElementById(`preview-barcode-container-${item.id || 'current'}`);
    if (!el) {
      alert("No se pudo previsualizar la imagen del marbete para descarga.");
      return;
    }
    try {
      const dataUrl = await toJpeg(el, {
        quality: 0.95,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true
      });
      const link = document.createElement('a');
      link.download = `MARBETE_BARRAS_${item.sku || 'NUEVO'}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error downloading barcode JPEG:", err);
      alert("Error al descargar la imagen.");
    }
  }, []);

  const handleDownloadAllBarcodeImages = useCallback(async (items: any[]) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const el = document.getElementById(`preview-barcode-container-${item.id || 'current'}`);
      if (el) {
        try {
          const dataUrl = await toJpeg(el, {
            quality: 0.95,
            pixelRatio: 3,
            backgroundColor: '#ffffff',
            cacheBust: true
          });
          const link = document.createElement('a');
          link.download = `MARBETE_BARRAS_${item.sku || 'NUEVO'}_${i + 1}.jpg`;
          link.href = dataUrl;
          link.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          console.error("Error downloading", item.sku, err);
        }
      }
    }
  }, []);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* PANEL DE CONTROL IZQUIERDO */}
      <div className="lg:col-span-7 flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-[3rem] overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col min-h-[680px]">
          {/* Nav de pestañas */}
          <nav className="flex bg-black/40 border-b border-zinc-800/60 p-3 gap-2 overflow-x-auto">
            <button 
              onClick={() => setBarcodeActiveTab('content')} 
              className={`flex items-center gap-3 px-8 py-4 text-[11px] font-black uppercase rounded-2xl transition-all ${barcodeActiveTab === 'content' ? 'bg-blue-600 text-white shadow-xl' : 'text-zinc-500 hover:bg-white/5'}`}
            >
              <ClipboardList size={18} />
              <span>Captura de Marbetes</span>
            </button>
            <button 
              onClick={() => setBarcodeActiveTab('logo')} 
              className={`flex items-center gap-3 px-8 py-4 text-[11px] font-black uppercase rounded-2xl transition-all ${barcodeActiveTab === 'logo' ? 'bg-blue-600 text-white shadow-xl' : 'text-zinc-500 hover:bg-white/5'}`}
            >
              <Sparkles size={18} />
              <span>Diseño</span>
            </button>
            <button 
              onClick={() => setBarcodeActiveTab('database')} 
              className={`flex items-center gap-3 px-8 py-4 text-[11px] font-black uppercase rounded-2xl transition-all ${barcodeActiveTab === 'database' ? 'bg-blue-600 text-white shadow-xl' : 'text-zinc-500 hover:bg-white/5'}`}
            >
              <Database size={18} />
              <span>Historial de Marbetes ({barcodeHistory.length})</span>
            </button>
          </nav>

          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            {barcodeActiveTab === 'content' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                {editingId && (
                  <div className="bg-blue-600/10 border border-blue-500/30 p-5 rounded-2xl flex items-center justify-between text-xs font-bold text-blue-400 gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-blue-500 animate-pulse" size={16} />
                      <span className="uppercase tracking-wider">Modo Edición: Modificando "{barcodeForm.sku}"</span>
                    </div>
                    <button 
                      type="button"
                      onClick={handleNewBarcodeForm} 
                      className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] px-3.5 py-2 rounded-xl tracking-wider transition-all shadow-md shadow-blue-900/10"
                    >
                      Nuevo Marbete / Limpiar
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Clave / SKU */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">CLAVE / SKU</label>
                    <input 
                      type="text" 
                      value={barcodeForm.sku} 
                      onChange={e => setBarcodeForm(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))} 
                      className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-[1.5rem] font-mono text-lg outline-none focus:border-blue-500/50 transition-all text-white" 
                      placeholder="C0605-00" 
                    />
                  </div>

                  {/* Categoría */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">CATEGORÍA</label>
                    <input 
                      type="text" 
                      value={barcodeForm.categoria} 
                      onChange={e => setBarcodeForm(prev => ({ ...prev, categoria: e.target.value }))} 
                      className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-[1.5rem] font-sans text-lg outline-none focus:border-blue-500/50 transition-all text-white" 
                      placeholder="Cocina" 
                    />
                  </div>

                  {/* Ficha Técnica */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">FICHA TÉCNICA</label>
                    <input 
                      type="text" 
                      value={barcodeForm.fichaTecnica} 
                      onChange={e => setBarcodeForm(prev => ({ ...prev, fichaTecnica: e.target.value }))} 
                      className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-[1.5rem] font-sans text-lg outline-none focus:border-blue-500/50 transition-all text-white" 
                      placeholder="Ficha Tecnica." 
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-3 sm:col-span-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">DESCRIPCIÓN DEL ARTÍCULO</label>
                    <input 
                      type="text" 
                      value={barcodeForm.description} 
                      onChange={e => setBarcodeForm(prev => ({ ...prev, description: e.target.value }))} 
                      className="w-full bg-zinc-950 border border-zinc-800 p-5 rounded-[1.5rem] font-sans text-lg outline-none focus:border-blue-500/50 transition-all text-white" 
                      placeholder="JADE ESSENTIALS BATERIA 11 PZS" 
                    />
                  </div>

                </div>

                {/* Quantitative Data Grid */}
                <div className="border-t border-zinc-850 pt-6">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">DISTRIBUCIÓN CUANTITATIVA POR TARIMA</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    
                    {/* Cant x Cama */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase">CANT X CAMA</label>
                      <input 
                        type="number" 
                        value={barcodeForm.cantCama || ''} 
                        onChange={e => handleCantCamaChange(parseInt(e.target.value, 10) || 0)} 
                        className="w-full bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl font-mono text-center outline-none focus:border-blue-500/50 text-white" 
                      />
                    </div>

                    {/* Num x Estiba */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase">NUM X ESTIBA</label>
                      <input 
                        type="number" 
                        value={barcodeForm.numEstiba || ''} 
                        onChange={e => handleNumEstibaChange(parseInt(e.target.value, 10) || 0)} 
                        className="w-full bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl font-mono text-center outline-none focus:border-blue-500/50 text-white" 
                      />
                    </div>

                    {/* Total Cajas */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1">TOTAL CAJAS <span className="text-zinc-600 text-[8px]">(AUTO)</span></label>
                      <input 
                        type="number" 
                        value={barcodeForm.totalCajas || ''} 
                        onChange={e => handleTotalCajasChange(parseInt(e.target.value, 10) || 0)} 
                        className="w-full bg-zinc-950 border border-zinc-800/80 p-3.5 rounded-xl font-mono text-center outline-none focus:border-blue-500/50 text-white" 
                      />
                    </div>

                    {/* PZ x Caja */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase">PZ X CAJA</label>
                      <input 
                        type="number" 
                        value={barcodeForm.pzCaja || ''} 
                        onChange={e => handlePzCajaChange(parseInt(e.target.value, 10) || 0)} 
                        className="w-full bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl font-mono text-center outline-none focus:border-blue-500/50 text-white" 
                      />
                    </div>

                    {/* PZ x Tarima */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1">PZ X TARIMA <span className="text-zinc-600 text-[8px]">(AUTO)</span></label>
                      <input 
                        type="number" 
                        value={barcodeForm.pzTarima || ''} 
                        onChange={e => handlePzTarimaChange(parseInt(e.target.value, 10) || 0)} 
                        className="w-full bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl font-mono text-center outline-none focus:border-blue-500/50 text-white font-extrabold text-blue-400" 
                      />
                    </div>

                  </div>
                </div>

                {/* Acciones de captura */}
                <div className="pt-6 border-t border-zinc-850">
                  <button 
                    onClick={handleAddBarcodeLabel}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs py-5 rounded-2xl tracking-wider active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20"
                  >
                    <Plus size={18} />
                    <span>{editingId ? 'Guardar Cambios en Historial' : 'Guardar en Historial'}</span>
                  </button>
                </div>
              </div>
            )}

            {barcodeActiveTab === 'logo' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <div className="bg-zinc-950/40 border border-zinc-800/80 p-6 rounded-[2.5rem] space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="text-blue-500 animate-pulse" size={18} />
                      <h4 className="text-[11px] font-black text-white uppercase tracking-widest">DISEÑO DE LA ETIQUETA</h4>
                    </div>
                    {barcodeForm.logoUrl && (
                      <button 
                        onClick={() => setBarcodeForm(prev => ({ ...prev, logoUrl: '' }))}
                        className="text-[9px] font-bold text-red-500 hover:text-red-400 uppercase tracking-wider"
                      >
                        Quitar Logo
                      </button>
                    )}
                  </div>

                  {/* Orientación de Etiqueta */}
                  <div className="space-y-3 pb-6 border-b border-zinc-900">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">ORIENTACIÓN DE LA ETIQUETA</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setBarcodeForm(prev => ({ ...prev, orientation: 'vertical' }))}
                        className={`flex flex-col items-center justify-center p-5 rounded-[1.5rem] border transition-all gap-2 ${
                          barcodeForm.orientation === 'vertical'
                            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/10'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider">Vertical (Por Defecto)</span>
                        <span className="text-[9px] font-bold opacity-80">10.1 x 15.2 CM (4" x 6")</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBarcodeForm(prev => ({ ...prev, orientation: 'horizontal' }))}
                        className={`flex flex-col items-center justify-center p-5 rounded-[1.5rem] border transition-all gap-2 ${
                          barcodeForm.orientation === 'horizontal'
                            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/10'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider">Horizontal</span>
                        <span className="text-[9px] font-bold opacity-80">15.2 x 10.1 CM (6" x 4")</span>
                      </button>
                    </div>
                  </div>

                  {/* Marco y Enfoque Industrial */}
                  <div className="space-y-3 pb-6 border-b border-zinc-900">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">MARCO Y ENFOQUE DE LA ETIQUETA</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setBarcodeForm(prev => ({ ...prev, cornerFocus: false }))}
                        className={`flex flex-col items-center justify-center p-5 rounded-[1.5rem] border transition-all gap-2 ${
                          !barcodeForm.cornerFocus
                            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/10'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider">Borde Simple</span>
                        <span className="text-[9px] font-bold opacity-80 font-mono">Borde de Línea Negra</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBarcodeForm(prev => ({ ...prev, cornerFocus: true }))}
                        className={`flex flex-col items-center justify-center p-5 rounded-[1.5rem] border transition-all gap-2 ${
                          barcodeForm.cornerFocus
                            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/10'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse inline-block" />
                          Borde Industrial
                        </span>
                        <span className="text-[9px] font-bold opacity-80">Con Esquinas Rojas de Alta Visibilidad</span>
                      </button>
                    </div>
                  </div>

                  {/* Estilo de Diseño de Marbete */}
                  <div className="space-y-3 pb-6 border-b border-zinc-900">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">ESTILO DE DISEÑO DEL MARBETE</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setBarcodeForm(prev => ({ ...prev, designStyle: 'modern' }))}
                        className={`flex flex-col items-center justify-center p-5 rounded-[1.5rem] border transition-all gap-2 ${
                          barcodeForm.designStyle === 'modern'
                            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/10'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-center">
                          <Sparkles size={14} className={barcodeForm.designStyle === 'modern' ? 'text-white' : 'text-blue-500'} />
                          Estilo Moderno y Limpio
                        </span>
                        <span className="text-[9px] font-bold opacity-80">Intuitivo, agradable a la vista y bordes suaves</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBarcodeForm(prev => ({ ...prev, designStyle: 'industrial' }))}
                        className={`flex flex-col items-center justify-center p-5 rounded-[1.5rem] border transition-all gap-2 ${
                          barcodeForm.designStyle === 'industrial'
                            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/10'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-center">
                          <Layers size={14} className={barcodeForm.designStyle === 'industrial' ? 'text-white' : 'text-orange-500'} />
                          Estilo Industrial Clásico
                        </span>
                        <span className="text-[9px] font-bold opacity-80">Rejilla tradicional de alta visibilidad</span>
                      </button>
                    </div>
                  </div>

                  {/* Tipo y Tamaño de Código de Barras */}
                  <div className="space-y-4 pb-6 border-b border-zinc-900">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">AJUSTES DE CÓDIGO DE BARRAS (TIPO Y TAMAÑO)</label>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-400 uppercase block">Tipo de Código de Barras</label>
                      <select
                        value={barcodeForm.barcodeType || 'CODE128'}
                        onChange={(e) => setBarcodeForm(prev => ({ ...prev, barcodeType: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl font-bold outline-none focus:border-blue-500/50 text-white"
                      >
                        <option value="CODE128">CODE128 (Recomendado - Texto y Números)</option>
                        <option value="CODE39">CODE39 (Alfanumérico Industrial)</option>
                        <option value="EAN13">EAN-13 (Sólo números, longitud 12-13)</option>
                        <option value="UPC">UPC-A (Sólo números, longitud 11-12)</option>
                        <option value="ITF">ITF-14 (Interleaved 2 of 5, sólo números, longitud par)</option>
                        <option value="codabar">Codabar (Sistemas de biblioteca y envíos)</option>
                      </select>
                      <p className="text-[9px] text-zinc-600 font-medium">Nota: Si seleccionas un formato numérico rígido y el valor no es válido, se usará automáticamente CODE128 para evitar errores de renderizado.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Ancho (Eje X) */}
                      <div className="space-y-2 bg-zinc-950/60 p-4 rounded-xl border border-zinc-900">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black text-zinc-400 uppercase">Ancho (Eje X)</label>
                          <span className="text-[10px] font-mono font-black text-blue-500 bg-blue-950/40 px-2 py-0.5 rounded-md">
                            {Math.round((barcodeForm.barcodeScaleX || 1.0) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={barcodeForm.barcodeScaleX !== undefined ? barcodeForm.barcodeScaleX : 1.0}
                          onChange={(e) => setBarcodeForm(prev => ({ ...prev, barcodeScaleX: parseFloat(e.target.value) }))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-[8px] font-bold text-zinc-600">
                          <span>0.5x (Compacto)</span>
                          <span>1.0x (Estándar)</span>
                          <span>2.5x (Ancho)</span>
                        </div>
                      </div>

                      {/* Largo/Alto (Eje Y) */}
                      <div className="space-y-2 bg-zinc-950/60 p-4 rounded-xl border border-zinc-900">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black text-zinc-400 uppercase">Largo / Alto (Eje Y)</label>
                          <span className="text-[10px] font-mono font-black text-blue-500 bg-blue-950/40 px-2 py-0.5 rounded-md">
                            {Math.round((barcodeForm.barcodeScaleY || 1.0) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={barcodeForm.barcodeScaleY !== undefined ? barcodeForm.barcodeScaleY : 1.0}
                          onChange={(e) => setBarcodeForm(prev => ({ ...prev, barcodeScaleY: parseFloat(e.target.value) }))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-[8px] font-bold text-zinc-600">
                          <span>Pequeño (0.5x)</span>
                          <span>Estándar (1.0x)</span>
                          <span>Alto (2.5x)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tamaño de Fuentes */}
                  <div className="space-y-4 pb-6 border-b border-zinc-900">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">AJUSTES DE TAMAÑO DE FUENTE DE TEXTOS</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Tamaño Títulos (Gris) */}
                      <div className="space-y-2 bg-zinc-950/60 p-4 rounded-xl border border-zinc-900">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black text-zinc-400 uppercase">Títulos en Gris</label>
                          <span className="text-[10px] font-mono font-black text-blue-500 bg-blue-950/40 px-2 py-0.5 rounded-md">
                            {barcodeForm.labelFontSize || 7}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="4"
                          max="14"
                          step="0.5"
                          value={barcodeForm.labelFontSize !== undefined ? barcodeForm.labelFontSize : 7}
                          onChange={(e) => setBarcodeForm(prev => ({ ...prev, labelFontSize: parseFloat(e.target.value) }))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-[8px] font-bold text-zinc-600">
                          <span>4px</span>
                          <span>7px (Por defecto)</span>
                          <span>14px</span>
                        </div>
                      </div>

                      {/* Tamaño Contenido */}
                      <div className="space-y-2 bg-zinc-950/60 p-4 rounded-xl border border-zinc-900">
                        <div className="flex items-center justify-between">
                          <label className="text-[9px] font-black text-zinc-400 uppercase">Contenido debajo de Títulos</label>
                          <span className="text-[10px] font-mono font-black text-blue-500 bg-blue-950/40 px-2 py-0.5 rounded-md">
                            {barcodeForm.valueFontSize || 12}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="22"
                          step="0.5"
                          value={barcodeForm.valueFontSize !== undefined ? barcodeForm.valueFontSize : 12}
                          onChange={(e) => setBarcodeForm(prev => ({ ...prev, valueFontSize: parseFloat(e.target.value) }))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-[8px] font-bold text-zinc-600">
                          <span>8px</span>
                          <span>12px (Por defecto)</span>
                          <span>22px</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo Source: Upload / URL */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cargar Imagen del Logo</label>
                      <div className="flex flex-col gap-3">
                        <input 
                          type="file" 
                          accept="image/*" 
                          ref={fileInputRef} 
                          onChange={handleLogoUpload} 
                          className="hidden" 
                        />
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs py-4 px-5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="rotate-180 text-blue-500" size={16} />
                          <span>{barcodeForm.logoUrl ? 'Cambiar Imagen' : 'Subir Imagen (PNG/JPG)'}</span>
                        </button>
                        
                        <div className="relative">
                          <input 
                            type="text" 
                            value={barcodeForm.logoUrl.startsWith('data:') ? 'Imagen Cargada (Base64)' : barcodeForm.logoUrl} 
                            onChange={e => {
                              const val = e.target.value;
                              if (!val.startsWith('Imagen Cargada')) {
                                setBarcodeForm(prev => ({ ...prev, logoUrl: val }));
                              }
                            }} 
                            placeholder="O ingresa URL pública del logo..." 
                            className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl font-sans text-xs outline-none text-zinc-300 focus:border-blue-500/50" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Align & Position */}
                    <div className="space-y-4">
                      {/* Tamaño del Logo */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-zinc-500">Alto del Logo</span>
                          <span className="text-blue-400 font-mono">{barcodeForm.logoSize}px</span>
                        </div>
                        <input 
                          type="range" 
                          min="15" 
                          max="80" 
                          value={barcodeForm.logoSize} 
                          onChange={e => setBarcodeForm(prev => ({ ...prev, logoSize: parseInt(e.target.value, 10) }))} 
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Alineación */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Alineación</label>
                          <div className="flex bg-zinc-950 border border-zinc-850 p-1 rounded-xl">
                            {(['left', 'center', 'right'] as const).map((align) => (
                              <button
                                key={align}
                                type="button"
                                onClick={() => setBarcodeForm(prev => ({ ...prev, logoAlign: align }))}
                                className={`flex-1 text-[8px] font-black uppercase py-2 rounded-lg transition-all ${
                                  barcodeForm.logoAlign === align 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                {align === 'left' ? 'Izq' : align === 'center' ? 'Cen' : 'Der'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Posición */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Ubicación</label>
                          <select
                            value={barcodeForm.logoPosition}
                            onChange={e => setBarcodeForm(prev => ({ ...prev, logoPosition: e.target.value as any }))}
                            className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 font-bold text-[10px] uppercase p-2 rounded-xl outline-none focus:border-blue-500/50"
                          >
                            <option value="header">Encabezado</option>
                            <option value="footer">Pie de Página</option>
                            <option value="watermark">Marca de Agua</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950/20 border border-zinc-850 p-6 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <HelpCircle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-wider">¿Cómo funciona?</span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed">
                    Elige la orientación de la etiqueta (Vertical para marbetes de 10.1 x 15.2 cm u Horizontal para 15.2 x 10.1 cm) y configura las propiedades de tu logotipo. Sube una imagen o ingresa su URL, luego decide si colocarlo en el encabezado, en el pie de página o como marca de agua de fondo. El diseño se reflejará en tiempo real en la vista previa.
                  </p>
                </div>

                {/* Back to content and Save Default buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleSaveDefaultDesign}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs py-5 rounded-2xl tracking-wider active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20"
                  >
                    <Database size={18} />
                    <span>Guardar Diseño Predeterminado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBarcodeActiveTab('content')}
                    className="w-full bg-zinc-850 hover:bg-zinc-800 text-white font-black uppercase text-xs py-5 rounded-2xl tracking-wider active:scale-95 transition-all flex items-center justify-center gap-3 border border-zinc-800"
                  >
                    <span>Regresar a Captura de Datos</span>
                  </button>
                </div>
              </div>
            )}

            {barcodeActiveTab === 'database' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                {/* Search & Actions Header */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2">
                  <div className="relative flex-1 w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"><Search size={18} /></span>
                    <input 
                      type="text" 
                      value={barcodeSearchTerm} 
                      onChange={e => setBarcodeSearchTerm(e.target.value)} 
                      placeholder="Buscar en el historial por Clave, Categoría o Descripción..." 
                      className="w-full bg-zinc-950 border border-zinc-800 pl-12 pr-5 py-4 rounded-xl outline-none text-xs font-bold text-white uppercase focus:border-blue-500/50 transition-all"
                    />
                  </div>

                  <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
                    <button 
                      type="button"
                      onClick={() => setShowBarcodeUploadRules(true)} 
                      className="flex-1 md:flex-initial px-5 py-4 bg-[#0a1e12]/80 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <UploadCloud size={14} />
                      <span>Subir Template</span>
                    </button>

                    {barcodeHistory.length > 0 && (
                      <button 
                        type="button"
                        onClick={handleClearBarcodeHistory}
                        className="flex-1 md:flex-initial px-5 py-4 bg-red-600/15 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/10 hover:border-red-500/30 text-[10px] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Trash size={14} />
                        <span>Vaciar Historial</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Table or list */}
                {(() => {
                  const filtered = barcodeHistory.filter(item => {
                    const s = barcodeSearchTerm.toLowerCase();
                    return (
                      (item.sku || '').toLowerCase().includes(s) ||
                      (item.categoria || '').toLowerCase().includes(s) ||
                      (item.description || '').toLowerCase().includes(s)
                    );
                  });

                  const isAllFilteredSelected = filtered.length > 0 && filtered.every(item => selectedBarcodeItems.has(item.id));

                  if (barcodeHistory.length === 0) {
                    return (
                      <div className="bg-zinc-950/40 border border-zinc-850 rounded-[2rem] p-16 text-center text-zinc-500">
                        <ClipboardList className="mx-auto mb-4 opacity-25" size={48} />
                        <p className="text-xs font-black uppercase tracking-widest">El historial de códigos de barras está vacío.</p>
                        <p className="text-[10px] text-zinc-600 uppercase mt-2 font-bold">Guarda un marbete desde la pestaña Captura para verlo aquí.</p>
                      </div>
                    );
                  }

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-zinc-950/40 border border-zinc-850 rounded-[2rem] p-16 text-center text-zinc-500">
                        <Search className="mx-auto mb-4 opacity-25" size={48} />
                        <p className="text-xs font-black uppercase tracking-widest">No se encontraron resultados para "{barcodeSearchTerm}".</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {/* Selection actions header */}
                      <div className="flex justify-between items-center bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl px-5 text-[10px] font-black">
                        <span className="text-zinc-500 uppercase tracking-wider">{selectedBarcodeItems.size} de {filtered.length} seleccionados</span>
                        <div className="flex gap-4">
                          {isAllFilteredSelected ? (
                            <button onClick={() => handleDeselectAllBarcodeFiltered(filtered)} className="text-blue-500 hover:text-blue-400 uppercase">Deseleccionar Todo</button>
                          ) : (
                            <button onClick={() => handleSelectAllBarcodeFiltered(filtered)} className="text-blue-500 hover:text-blue-400 uppercase">Seleccionar Todo</button>
                          )}
                        </div>
                      </div>

                      {/* List of items */}
                      <div className="grid grid-cols-1 gap-3 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                        {filtered.map(item => {
                          const isSelected = selectedBarcodeItems.has(item.id);
                          return (
                            <div 
                              key={item.id}
                              onClick={() => handleLoadBarcodeLabelToForm(item)}
                              className={`group bg-zinc-950/30 hover:bg-zinc-900/40 border ${isSelected ? 'border-blue-500/50 bg-blue-500/5' : 'border-zinc-850'} p-5 rounded-2xl flex items-center justify-between transition-all cursor-pointer gap-4`}
                            >
                              <div className="flex items-center gap-4 min-w-0 flex-1">
                                {/* Checkbox */}
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleBarcodeSelection(item);
                                  }}
                                  className="p-1 cursor-pointer text-zinc-500 hover:text-white"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="text-blue-500" size={20} />
                                  ) : (
                                    <Square size={20} />
                                  )}
                                </div>

                                {/* Main info */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono font-black text-sm text-white tracking-wider">{item.sku}</span>
                                    <span className="bg-zinc-800 text-zinc-400 font-bold text-[8px] uppercase px-2 py-0.5 rounded-md">{item.categoria}</span>
                                    {item.logoUrl && <span className="bg-blue-900/40 text-blue-400 font-bold text-[8px] uppercase px-2 py-0.5 rounded-md flex items-center gap-1"><Sparkles size={10} /> Logo</span>}
                                  </div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase truncate mt-1">{item.description}</p>
                                  <div className="flex gap-4 text-[9px] text-zinc-500 uppercase font-black mt-2">
                                    <span>Total Cajas: {item.totalCajas}</span>
                                    <span>Pz x Tarima: {item.pzTarima}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Action items on hover */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBarcodeLabel(item.id);
                                  }}
                                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PANEL DE VISTA PREVIA DERECHO */}
      <div className="lg:col-span-5 lg:sticky lg:top-6 h-fit flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-[3rem] p-6 flex flex-col items-center justify-between gap-6 min-h-[680px] w-full shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex justify-between items-center w-full px-4 border-b border-zinc-800/40 pb-4">
            <div className="flex items-center gap-3">
              <Layers className="text-blue-500 animate-pulse" size={18} />
              <span className="text-[11px] font-black uppercase tracking-wider text-white">VISTA PREVIA DE ETIQUETA</span>
            </div>
            <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full uppercase tracking-widest shrink-0">
              {barcodeForm.orientation === 'horizontal' ? '15.2 X 10.1 CM (6" X 4")' : '10.1 X 15.2 CM (4" X 6")'}
            </span>
          </div>

          {/* Contenedor central de previsualización física */}
          <div className="flex-1 flex items-center justify-center w-full py-6 select-none bg-zinc-950/30 rounded-[2rem] border border-zinc-850/50 p-4 min-h-[420px]">
            <div 
              ref={barcodePreviewRef}
              className="shadow-2xl bg-white rounded-lg overflow-hidden border border-zinc-200 p-0 m-0 relative flex items-center justify-center transition-all shrink-0" 
              style={{ 
                width: barcodeForm.orientation === 'horizontal' ? '380px' : '252.5px', 
                height: barcodeForm.orientation === 'horizontal' ? '252.5px' : '380px', 
              }}
            >
              <div 
                className="origin-center scale-[0.66] absolute"
                style={{ 
                  width: barcodeForm.orientation === 'horizontal' ? '15.2cm' : '10.1cm', 
                  height: barcodeForm.orientation === 'horizontal' ? '10.1cm' : '15.2cm' 
                }}
              >
                <PrintableBarcodeLabel product={barcodeForm} />
              </div>
            </div>
          </div>

          {/* Resumen e información del formato */}
          <div className="w-full bg-black/40 border border-zinc-850 p-5 rounded-2xl flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Dimensiones de Salida</span>
              <span className="font-mono font-black text-white">
                {barcodeForm.orientation === 'horizontal' ? '152.4 mm x 101.6 mm' : '101.6 mm x 152.4 mm'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Tipo de Papel Soportado</span>
              <span className="font-sans font-black text-blue-400">Térmico Directo / Transferencia</span>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="w-full">
            <button 
              onClick={() => setShowBarcodePreview(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[11px] py-4.5 rounded-xl transition-all tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10 active:scale-95 duration-150"
            >
              <Printer size={16} />
              <span>PREVISUALIZAR MARBETE(S)</span>
            </button>
          </div>

        </div>
      </div>

      {/* OVERLAY DE LOTES SELECCIONADOS */}
      {selectedBarcodeItems.size > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-zinc-900/95 border border-blue-500/30 px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-12 backdrop-blur-2xl animate-in slide-in-from-bottom-20 duration-500">
          <span className="text-white font-black text-lg uppercase">{selectedBarcodeItems.size} MARBETES SELECCIONADOS</span>
          <button 
            onClick={() => {
              setShowBarcodePreview(true);
            }} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-4 shadow-xl"
          >
            <Printer size={20} /> PREVISUALIZAR LOTE ({selectedBarcodeItems.size})
          </button>
          <button onClick={() => setSelectedBarcodeItems(new Map())} className="p-5 text-zinc-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
      )}

      {/* ÁREA DE IMPRESIÓN PORTAL DE CÓDIGOS DE BARRAS */}
      {ReactDOM.createPortal(
        <div id="print-barcode-area" className="hidden fixed top-0 left-0 bg-white" style={{ zIndex: -100 }}>
          {barcodePrintList.map((item) => (
            <div key={item.id} className="print-barcode-page-container bg-white p-0 m-0">
              <PrintableBarcodeLabel product={item} />
            </div>
          ))}
        </div>,
        document.body
      )}

      {/* BARCODE PREVIEW MODAL */}
      {showBarcodePreview && (
        <div className="fixed inset-0 z-[400] bg-zinc-950 flex flex-col items-center justify-center p-6 backdrop-blur-2xl animate-in fade-in duration-205">
          <div className="w-full max-w-6xl h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Printer className="text-blue-500" />
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">PREVISUALIZACIÓN DE MARBETES DE BARRAS</h3>
              </div>
              <button 
                onClick={() => setShowBarcodePreview(false)} 
                className="bg-white/5 p-3 rounded-full hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Main view container */}
            <div className="flex-1 bg-zinc-900/50 rounded-[3rem] border border-white/5 flex flex-col overflow-hidden p-6">
              {/* Info row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 mb-4 gap-4">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  {selectedBarcodeItems.size > 0 
                    ? `MOSTRANDO LOTE DE HISTORIAL (${selectedBarcodeItems.size} MARBETES)` 
                    : "PREVISUALIZANDO MARBETE EN CAPTURA"
                  }
                </span>
                <div className="flex items-center gap-4">
                  {/* Zoom controls */}
                  <div className="flex items-center gap-1.5 bg-black/40 border border-zinc-800 p-1.5 rounded-xl">
                    <button 
                      onClick={() => setPreviewZoom(prev => Math.max(0.4, prev - 0.05))} 
                      className="p-1 text-zinc-500 hover:text-white transition-all hover:bg-white/5 rounded"
                      title="Reducir tamaño"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-[10px] font-mono font-black text-zinc-400 w-12 text-center select-none">
                      {Math.round(previewZoom * 100)}%
                    </span>
                    <button 
                      onClick={() => setPreviewZoom(prev => Math.min(1.5, prev + 0.05))} 
                      className="p-1 text-zinc-500 hover:text-white transition-all hover:bg-white/5 rounded"
                      title="Aumentar tamaño"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider">
                    {selectedBarcodeItems.size > 0 ? selectedBarcodeItems.size : 1} {selectedBarcodeItems.size === 1 || selectedBarcodeItems.size === 0 ? 'ETIQUETA' : 'ETIQUETAS'}
                  </span>
                </div>
              </div>
              
              {/* Scrollable area with the labels */}
              <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar flex items-start gap-8 p-6 bg-black/20 rounded-[2rem] border border-zinc-800/40">
                {(() => {
                  const itemsToPreview = selectedBarcodeItems.size > 0 
                    ? Array.from(selectedBarcodeItems.values()) 
                    : [barcodeForm];

                  return itemsToPreview.map((item, idx) => {
                    const isHorizontal = item.orientation === 'horizontal';
                    const widthPx = isHorizontal ? 380 : 252.5;
                    const heightPx = isHorizontal ? 252.5 : 380;
                    
                    const isActiveEditing = editingId ? (item.id === editingId) : (!item.id);

                    return (
                      <div 
                        key={item.id || `current-${idx}`} 
                        className={`flex flex-col items-center gap-4 shrink-0 p-5 rounded-2xl relative transition-all group select-none border ${
                          isActiveEditing 
                            ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30 bg-emerald-950/10' 
                            : 'border-zinc-800/60 bg-[#121215]/60 hover:border-zinc-700/80'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                              MARBETE {idx + 1}
                            </span>
                            {isActiveEditing && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-md text-[7px] font-black tracking-widest text-emerald-400 uppercase">
                                ACTIVO
                              </span>
                            )}
                          </div>
                          <span className="text-[8px] font-mono font-black text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded uppercase">
                            {item.sku}
                          </span>
                        </div>
                        
                        {/* Printable element container */}
                        <div 
                          id={`preview-barcode-container-${item.id || 'current'}`}
                          className="shadow-2xl bg-white rounded-lg overflow-hidden border border-zinc-200 flex items-center justify-center relative shrink-0" 
                          style={{ 
                            width: `${widthPx * previewZoom}px`, 
                            height: `${heightPx * previewZoom}px`,
                            transition: 'width 0.1s ease, height 0.1s ease'
                          }}
                        >
                          <div 
                            className="origin-center absolute"
                            style={{ 
                              width: isHorizontal ? '15.2cm' : '10.1cm', 
                              height: isHorizontal ? '10.1cm' : '15.2cm',
                              transform: `scale(${0.66 * previewZoom})`,
                              transition: 'transform 0.1s ease'
                            }}
                          >
                            <PrintableBarcodeLabel product={item} />
                          </div>
                        </div>

                        {/* Individual Actions inside Modal */}
                        <div className="w-full mt-1.5 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleLoadBarcodeLabelToForm(item);
                            }}
                            className={`w-full py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] border ${
                              isActiveEditing
                                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-500/40 text-emerald-400'
                                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/10 text-white shadow-lg shadow-emerald-900/20'
                            }`}
                            title="Seleccionar este marbete para ingresar datos cuantitativos"
                          >
                            <PlusSquare size={12} className={isActiveEditing ? 'text-emerald-400' : 'text-emerald-200'} />
                            <span>{isActiveEditing ? 'CAPTURA ACTIVA' : 'SELECCIONAR PARA CAPTURA'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleBarcodeImage(item)}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-750 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                            title="Descargar imagen individual"
                          >
                            <Download size={12} />
                            <span>DESCARGAR JPG</span>
                          </button>

                          {/* PANEL DE CAPTURA RÁPIDA DE DATOS CUANTITATIVOS */}
                          {isActiveEditing && (
                            <div className="w-full mt-3 p-3 bg-zinc-950/80 rounded-xl border border-emerald-500/20 space-y-3 text-left">
                              <div className="flex items-center gap-1.5 border-b border-zinc-800/80 pb-1.5 mb-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                                <span className="text-[9px] font-black uppercase text-zinc-300 tracking-wider">DATOS DE EMBALAJE</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-zinc-400 uppercase tracking-wide">CANT CAMA</label>
                                  <input
                                    type="number"
                                    value={barcodeForm.cantCama === 0 ? "" : barcodeForm.cantCama}
                                    onChange={e => handleCantCamaChange(parseInt(e.target.value, 10) || 0)}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-center py-1 rounded text-xs font-mono font-bold text-white focus:border-emerald-500/50 outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-zinc-400 uppercase tracking-wide">NUM ESTIBA</label>
                                  <input
                                    type="number"
                                    value={barcodeForm.numEstiba === 0 ? "" : barcodeForm.numEstiba}
                                    onChange={e => handleNumEstibaChange(parseInt(e.target.value, 10) || 0)}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-center py-1 rounded text-xs font-mono font-bold text-white focus:border-emerald-500/50 outline-none"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-zinc-400 uppercase tracking-wide">TOTAL CAJAS</label>
                                  <input
                                    type="number"
                                    value={barcodeForm.totalCajas === 0 ? "" : barcodeForm.totalCajas}
                                    onChange={e => handleTotalCajasChange(parseInt(e.target.value, 10) || 0)}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-center py-1 rounded text-xs font-mono font-bold text-white focus:border-emerald-500/50 outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-zinc-400 uppercase tracking-wide">PZ X CAJA</label>
                                  <input
                                    type="number"
                                    value={barcodeForm.pzCaja === 0 ? "" : barcodeForm.pzCaja}
                                    onChange={e => handlePzCajaChange(parseInt(e.target.value, 10) || 0)}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-center py-1 rounded text-xs font-mono font-bold text-white focus:border-emerald-500/50 outline-none"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-zinc-400 uppercase tracking-wide block">PIEZAS POR TARIMA</label>
                                <input
                                  type="number"
                                  value={barcodeForm.pzTarima === 0 ? "" : barcodeForm.pzTarima}
                                  onChange={e => handlePzTarimaChange(parseInt(e.target.value, 10) || 0)}
                                  className="w-full bg-zinc-900 border border-zinc-800 text-center py-1.5 rounded text-xs font-mono font-bold text-emerald-400 focus:border-emerald-500/50 outline-none"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={async () => {
                                  await handleAddBarcodeLabel();
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[8px] tracking-wider py-1.5 rounded transition-all mt-1 active:scale-95 flex items-center justify-center gap-1 shadow-md shadow-emerald-950/40"
                              >
                                <Database size={10} />
                                <span>Guardar en Base de Datos</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            
            {/* Global actions at the bottom of the modal */}
            <div className="mt-8">
              <button 
                onClick={() => {
                  const items = selectedBarcodeItems.size > 0 
                    ? Array.from(selectedBarcodeItems.values()) 
                    : [barcodeForm];
                  handleDownloadAllBarcodeImages(items);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3.5 tracking-wider shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
              >
                <Download size={18} />
                <span>DESCARGAR LOTE EN JPG ({selectedBarcodeItems.size > 0 ? selectedBarcodeItems.size : 1})</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* INPUT FILE HIDDEN PARA CSV */}
      <input 
        type="file" 
        ref={barcodeCsvInputRef} 
        onChange={handleImportBarcodeCSV} 
        accept=".csv" 
        className="hidden" 
      />

      {/* MODAL REQUISITOS DEL TEMPLATE DE MARBETES BARRAS */}
      {showBarcodeUploadRules && (
        <div className="fixed inset-0 z-[500] bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#121215] border border-zinc-800/80 p-8 md:p-10 rounded-[2.5rem] max-w-2xl w-full space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Background decorative cloud icon */}
            <div className="absolute -top-4 -right-4 text-zinc-800/10 pointer-events-none">
              <UploadCloud size={160} strokeWidth={1} />
            </div>

            {/* Header */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Info size={28} className="text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-extrabold uppercase tracking-tight text-white leading-none">IMPORTACIÓN DE MARBETES</h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5">REGLAS DE FORMATO EXCEL / CSV</p>
              </div>
            </div>

            {/* Rules Cards Container */}
            <div className="space-y-4 relative z-10">
              
              {/* Card 1: Columnas requeridas */}
              <div className="bg-[#18181c] p-5 rounded-2xl border border-zinc-800/60 flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-500">
                  <Layers size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Estructura de Columnas</h4>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold leading-relaxed">
                    Tu archivo <span className="text-emerald-400 font-extrabold">CSV o Excel</span> debe contener exactamente estas tres columnas en la primera fila (encabezado):
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-mono text-zinc-300 font-bold uppercase">Categoria</span>
                    <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-mono text-zinc-300 font-bold uppercase">Clave</span>
                    <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-mono text-zinc-300 font-bold uppercase">Descripción</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Entrada manual de datos cuantitativos */}
              <div className="bg-[#18181c] p-5 rounded-2xl border border-zinc-800/60 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20 text-blue-500">
                  <Database size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Distribución Cuantitativa</h4>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold leading-relaxed">
                    Los campos numéricos (<span className="text-blue-400 font-extrabold">Cama, Estiba, Piezas por Caja</span>) iniciarán en cero (0) y los editarás manualmente para cada clave cargada. Los totales de cajas y tarima se calcularán automáticamente al editar.
                  </p>
                </div>
              </div>

              {/* Card 3: Botón para plantilla */}
              <div className="bg-[#1a1510] p-5 rounded-2xl border border-amber-500/20 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">¿No tienes el archivo listo?</h4>
                  <p className="text-[9px] text-zinc-400 uppercase font-bold leading-normal">Descarga nuestra plantilla oficial en CSV con datos de muestra.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBarcodeTemplate}
                  className="px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 transition-colors"
                >
                  Plantilla CSV
                </button>
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 relative z-10 pt-2">
              <button 
                type="button"
                onClick={() => { setShowBarcodeUploadRules(false); setTimeout(() => barcodeCsvInputRef.current?.click(), 100); }} 
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 tracking-wider transition-colors text-white"
              >
                <UploadCloud size={16} />
                <span>Entendido, Seleccionar Archivo CSV</span>
              </button>
              <button 
                type="button"
                onClick={() => setShowBarcodeUploadRules(false)} 
                className="w-full bg-zinc-900 hover:bg-zinc-800/80 active:bg-zinc-850 py-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-colors text-zinc-400"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BarcodeStudio;
