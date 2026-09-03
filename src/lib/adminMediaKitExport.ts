export interface ExportSupport { canonical_id: string; name: string; ciudad: string; tipo_soporte: string; address?: string; description?: string; characteristics?: string; approvedPriceWithTax?: number; imageUrl?: string; image_url?: string; }
export interface ExportLead { name: string; email: string; company?: string; phone?: string; }

const clean=(v:string|undefined)=>(v||'').replace(/\r?\n/g,' ').trim();
const pdfEsc=(v:string)=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
const htmlEsc=(v:string)=>clean(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
const money=(v:number|undefined)=>Number.isFinite(Number(v))&&Number(v)>0?`ARS ${Number(v).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'';
const wrap=(v:string,max=72)=>{const out:string[]=[];let cur='';for(const word of pdfEsc(v).split(/\s+/).filter(Boolean)){const next=cur?`${cur} ${word}`:word;if(next.length>max&&cur){out.push(cur);cur=word;}else cur=next;}if(cur)out.push(cur);return out;};
const escPdf=(v:string)=>pdfEsc(v);

function pdfText(lines:string[],x:number,y:number,size:number,font='F1'){lines.push('BT',`/${font} ${size} Tf`,`${x} ${y} Td`);return lines;}
function rect(lines:string[],x:number,y:number,w:number,h:number,fill:[number,number,number],stroke?:[number,number,number]){lines.push(`${fill[0]} ${fill[1]} ${fill[2]} rg`,`${x} ${y} ${w} ${h} re f`);if(stroke){lines.push(`${stroke[0]} ${stroke[1]} ${stroke[2]} RG`,`${x} ${y} ${w} ${h} re S`);}}
function makePdf(lead:ExportLead,supports:ExportSupport[],requestId:string){
  const pagesData: string[][]=[]; const groups:ExportSupport[][]=[];
  for(let i=0;i<supports.length;i+=4)groups.push(supports.slice(i,i+4)); if(!groups.length)groups.push([]);
  groups.forEach((group,pageIndex)=>{
    const l:string[]=[]; const total=supports.reduce((a,s)=>a+(Number(s.approvedPriceWithTax)||0),0);
    rect(l,0,0,595,842,[0.98,0.98,0.96]); rect(l,0,792,595,50,[0.025,0.263,0.29]);
    pdfText(l,['GRUPO COMUNICARTE'],40,815,16,'F2'); l.push('0.98 0.98 0.96 rg','Tj','ET');
    pdfText(l,['MEDIA KIT'],430,815,9,'F2'); l.push('Tj','ET');
    pdfText(l,[`Solicitud ${escPdf(requestId)}`],40,768,9); l.push('Tj','ET');
    pdfText(l,[`Cliente: ${escPdf(lead.name)}`],40,748,11,'F2'); l.push('Tj','ET');
    if(lead.company){pdfText(l,[`Empresa: ${escPdf(lead.company)}`],40,730,9);l.push('Tj','ET');}
    pdfText(l,[`Soportes seleccionados: ${supports.length}`],370,748,9);l.push('Tj','ET');
    let y=700;
    group.forEach((s,i)=>{
      const h=142; rect(l,40,y-h,515,h,[1,1,1],[0.86,0.88,0.87]);
      rect(l,40,y-h,7,h,[0.03,0.75,0.54]);
      pdfText(l,[`${pageIndex*4+i+1}. ${escPdf(s.name)}`],62,y-25,13,'F2');l.push('Tj','ET');
      pdfText(l,[`${escPdf(s.ciudad)}  ·  ${escPdf(s.tipo_soporte)}`],62,y-45,9);l.push('Tj','ET');
      if(s.address){pdfText(l,[`Direccion: ${escPdf(s.address)}`],62,y-62,8);l.push('Tj','ET');}
      if(s.approvedPriceWithTax){pdfText(l,[escPdf(money(s.approvedPriceWithTax))],400,y-25,11,'F2');l.push('Tj','ET');}
      const desc=wrap(`Descripcion: ${s.description||''}`,64).slice(0,2);let dy=y-82;desc.forEach(t=>{pdfText(l,[t],62,dy,8);l.push('Tj','ET');dy-=11;});
      const chars=wrap(`Caracteristicas: ${s.characteristics||''}`,64).slice(0,2);chars.forEach(t=>{pdfText(l,[t],62,dy,8);l.push('Tj','ET');dy-=11;});
      y-=158;
    });
    if(pageIndex===groups.length-1){
      rect(l,40,42,515,78,[0.93,0.98,0.96]);
      pdfText(l,['RESUMEN DE LA SOLICITUD'],58,98,9,'F2');l.push('Tj','ET');
      pdfText(l,[`Soportes: ${supports.length}`],58,78,8);l.push('Tj','ET');
      if(total>0){pdfText(l,['Inversion estimada'],370,98,8);l.push('Tj','ET');pdfText(l,[escPdf(money(total))],370,78,12,'F2');l.push('Tj','ET');}
      pdfText(l,['Disponibilidad sujeta a confirmacion comercial.'],58,58,7);l.push('Tj','ET');
    }
    l.push('0.3 0.34 0.34 rg');pdfText(l,[`Grupo Comunicarte  ·  Media Kit  ·  Pagina ${pageIndex+1}/${groups.length}`],40,24,7);l.push('Tj','ET');
    pagesData.push(l);
  });
  const o:string[]=[];o[1]='<< /Type /Catalog /Pages 2 0 R >>';o[2]='PAGES';o[3]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';o[4]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';let id=5;const pages:number[]=[];
  pagesData.forEach(lines=>{const c=id++,p=id++;const stream=lines.join('\n');o[c]=`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;o[p]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${c} 0 R >>`;pages.push(p);});
  o[2]=`<< /Type /Pages /Kids [${pages.map(p=>`${p} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  let pdf='%PDF-1.4\n';const offsets=[0];for(let i=1;i<o.length;i++){offsets[i]=pdf.length;pdf+=`${i} 0 obj\n${o[i]}\nendobj\n`;}const x=pdf.length;pdf+=`xref\n0 ${o.length}\n0000000000 65535 f \n`;for(let i=1;i<o.length;i++)pdf+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;pdf+=`trailer\n<< /Size ${o.length} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;return new Blob([new TextEncoder().encode(pdf)],{type:'application/pdf'});
}

function makePpt(lead:ExportLead,supports:ExportSupport[],requestId:string){
  const total=supports.reduce((a,s)=>a+(Number(s.approvedPriceWithTax)||0),0);
  const cover=`<section style="page-break-after:always;width:960px;height:540px;padding:56px;background:#06434A;color:#FAF9F5;font-family:Inter,Arial,sans-serif;box-sizing:border-box"><div style="font-size:15px;font-weight:700;letter-spacing:.08em">GRUPO COMUNICARTE</div><div style="margin-top:120px;font-size:46px;font-weight:800">MEDIA KIT</div><div style="margin-top:18px;font-size:20px;opacity:.85">Solicitud ${htmlEsc(requestId)}</div><div style="margin-top:90px;font-size:15px">${htmlEsc(lead.name)}${lead.company?` · ${htmlEsc(lead.company)}`:''}</div></section>`;
  const slides=supports.map((s,i)=>`<section style="page-break-after:always;width:960px;height:540px;padding:44px;background:#FAF9F5;color:#172120;font-family:Inter,Arial,sans-serif;box-sizing:border-box"><div style="font-size:13px;color:#06434A;font-weight:800;letter-spacing:.08em">GRUPO COMUNICARTE · MEDIA KIT</div><div style="margin-top:26px;padding:28px;background:#fff;border:1px solid #dfe5e3;border-left:7px solid #07BE8A;border-radius:8px"><div style="display:flex;justify-content:space-between;gap:24px"><div><h1 style="font-size:30px;margin:0 0 10px">${htmlEsc(s.name)}</h1><div style="font-size:15px;color:#53615f">${htmlEsc(s.ciudad)} · ${htmlEsc(s.tipo_soporte)}</div></div>${s.approvedPriceWithTax?`<div style="font-size:22px;font-weight:800;color:#06434A">${htmlEsc(money(s.approvedPriceWithTax))}</div>`:''}</div><div style="margin-top:24px;font-size:14px"><b>Dirección:</b> ${htmlEsc(s.address||'No informada')}</div><div style="margin-top:14px;font-size:14px;line-height:1.5"><b>Descripción:</b> ${htmlEsc(s.description||'Sin descripción')}</div><div style="margin-top:12px;font-size:14px;line-height:1.5"><b>Características:</b> ${htmlEsc(s.characteristics||'Sin detalle')}</div></div><div style="margin-top:20px;font-size:11px;color:#73807d">Solicitud ${htmlEsc(requestId)} · Soporte ${i+1} de ${supports.length}</div></section>`).join('');
  const summary=`<section style="width:960px;height:540px;padding:52px;background:#06434A;color:#FAF9F5;font-family:Inter,Arial,sans-serif;box-sizing:border-box"><div style="font-size:13px;font-weight:800;letter-spacing:.08em">RESUMEN</div><h1 style="font-size:38px;margin:24px 0">${supports.length} soportes seleccionados</h1><div style="font-size:20px;opacity:.9">${total>0?`Inversión estimada: <b>${htmlEsc(money(total))}</b>`:'Inversión sujeta a cotización'}</div><div style="margin-top:170px;font-size:13px;opacity:.75">Disponibilidad sujeta a confirmación comercial.</div></section>`;
  return new Blob([`<html><head><meta charset="utf-8"></head><body style="margin:0">${cover}${slides}${summary}</body></html>`],{type:'application/vnd.ms-powerpoint'});
}

export function downloadBlob(blob:Blob,filename:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function downloadMediaKitPdf(lead:ExportLead,supports:ExportSupport[],requestId:string){downloadBlob(makePdf(lead,supports,requestId),`media-kit-${requestId}.pdf`);}
export function downloadMediaKitPpt(lead:ExportLead,supports:ExportSupport[],requestId:string){downloadBlob(makePpt(lead,supports,requestId),`media-kit-${requestId}.ppt`);}
export async function sendMediaKitToLead(lead:ExportLead,supports:ExportSupport[],requestId:string){const pdf=makePdf(lead,supports,requestId),ppt=makePpt(lead,supports,requestId);const files=[new File([pdf],`media-kit-${requestId}.pdf`,{type:'application/pdf'}),new File([ppt],`media-kit-${requestId}.ppt`,{type:'application/vnd.ms-powerpoint'})];if(navigator.share&&(!navigator.canShare||navigator.canShare({files}))){await navigator.share({title:`Media Kit ${requestId}`,text:`Media Kit aprobado para ${lead.name}.`,files});return 'shared';}window.location.href=`mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(`Media Kit ${requestId} - Grupo Comunicarte`)}&body=${encodeURIComponent(`Hola ${lead.name},\n\nAdjuntá el Media Kit aprobado (${requestId}).\n\nSaludos,\nGrupo Comunicarte`)}`;return 'mailto';}
