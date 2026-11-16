// Reempacota um .gltf.json (buffer embutido): junta vértices repetidos, tira COLOR_0 branco e
// reduz as animações pra metade das chaves. Uso: node repack.js arquivo.gltf.json
const fs=require('fs'); const file=process.argv[2]; const j=JSON.parse(fs.readFileSync(file,'utf8'));
const buf=Buffer.from(j.buffers[0].uri.split(',')[1],'base64');
const CT={5126:Float32Array,5123:Uint16Array,5125:Uint32Array,5121:Uint8Array,5120:Int8Array,5122:Int16Array};
const NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
function read(ai){ const a=j.accessors[ai], bv=j.bufferViews[a.bufferView], T=CT[a.componentType], n=NC[a.type];
  if(bv.byteStride && bv.byteStride!==T.BYTES_PER_ELEMENT*n) throw new Error('stride '+ai);
  const off=(bv.byteOffset||0)+(a.byteOffset||0), len=a.count*n*T.BYTES_PER_ELEMENT; const b=Buffer.from(buf.subarray(off,off+len));
  return {a,n,T,arr:new T(b.buffer,b.byteOffset,a.count*n)}; }
const chunks=[]; let size=0; const views=[], accs=[];
function add(arr,acc,target){ const pad=(4-size%4)%4; if(pad){ chunks.push(Buffer.alloc(pad)); size+=pad; }
  const b=Buffer.from(arr.buffer,arr.byteOffset,arr.byteLength); views.push({buffer:0,byteOffset:size,byteLength:b.length,...(target?{target}:{})}); chunks.push(b); size+=b.length;
  const out={...acc,bufferView:views.length-1}; delete out.byteOffset; accs.push(out); return accs.length-1; }
function minmax(arr,n){ const mn=Array(n).fill(Infinity), mx=Array(n).fill(-Infinity); for(let i=0;i<arr.length;i++){ const c=i%n; if(arr[i]<mn[c]) mn[c]=arr[i]; if(arr[i]>mx[c]) mx[c]=arr[i]; } return {min:mn,max:mx}; }
const map=new Map(); // acessor antigo -> novo (cópia simples)
function copy(ai,target){ if(map.has(ai)) return map.get(ai); const r=read(ai); const a={...r.a}; const ni=add(r.arr,a,target); map.set(ai,ni); return ni; }

let vIn=0,vOut=0;
// malhas: agrupa primitivas que dividem os mesmos atributos e solda os vértices iguais
for(const m of j.meshes){ const groups=new Map();
  for(const p of m.primitives){ const k=JSON.stringify(p.attributes); if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(p); }
  for(const [k,prims] of groups){ const attrs=prims[0].attributes;
    if(attrs.COLOR_0!=null){ const c=read(attrs.COLOR_0); let mn=1; for(const v of c.arr) mn=Math.min(mn,v); if(mn>0.95){ delete attrs.COLOR_0; for(const p of prims) delete p.attributes.COLOR_0; } }
    const names=Object.keys(attrs), data=names.map(n=>read(attrs[n])); const count=data[0].a.count; vIn+=count;
    const key=new Map(), remap=new Uint32Array(count), keep=[];
    for(let v=0;v<count;v++){ let s=''; for(const d of data){ for(let c=0;c<d.n;c++) s+=d.arr[v*d.n+c]+','; s+='|'; }
      let id=key.get(s); if(id===undefined){ id=keep.length; key.set(s,id); keep.push(v); } remap[v]=id; }
    vOut+=keep.length; const newAttr={};
    names.forEach((n,ni)=>{ const d=data[ni]; const out=new d.T(keep.length*d.n); keep.forEach((v,i)=>{ for(let c=0;c<d.n;c++) out[i*d.n+c]=d.arr[v*d.n+c]; });
      const acc={componentType:d.a.componentType,count:keep.length,type:d.a.type}; if(d.a.normalized) acc.normalized=true; if(n==='POSITION') Object.assign(acc,minmax(out,3));
      newAttr[n]=add(out,acc,34962); });
    for(const p of prims){ p.attributes={...newAttr}; if(p.indices!=null){ const r=read(p.indices); const big=keep.length>65535; const out=big?new Uint32Array(r.a.count):new Uint16Array(r.a.count);
        for(let i=0;i<r.a.count;i++) out[i]=remap[r.arr[i]]; p.indices=add(out,{componentType:big?5125:5123,count:r.a.count,type:'SCALAR'},34963); } } } }
// animações: metade das chaves (fica a última)
const animMap=new Map(); let kIn=0,kOut=0;
function half(ai){ if(animMap.has(ai)) return animMap.get(ai); const r=read(ai); const idx=[]; for(let i=0;i<r.a.count;i++) if(i%2===0||i===r.a.count-1) idx.push(i); return {r,idx}; }
for(const an of j.animations||[]){ const inCache=new Map();
  for(const s of an.samplers){ const ri=read(s.input); const idx=[]; for(let i=0;i<ri.a.count;i++) if(i%2===0||i===ri.a.count-1) idx.push(i);
    if(!inCache.has(s.input)){ const out=new Float32Array(idx.map(i=>ri.arr[i])); kIn+=ri.a.count; kOut+=idx.length; inCache.set(s.input,add(out,{componentType:5126,count:idx.length,type:'SCALAR',min:[out[0]],max:[out[out.length-1]]})); }
    const ro=read(s.output); const n=ro.n; const out=new Float32Array(idx.length*n); idx.forEach((v,i)=>{ for(let c=0;c<n;c++) out[i*n+c]=ro.arr[v*n+c]; });
    s.output=add(out,{componentType:5126,count:idx.length,type:ro.a.type}); s.input=inCache.get(s.input); } }
for(const sk of j.skins||[]) if(sk.inverseBindMatrices!=null) sk.inverseBindMatrices=copy(sk.inverseBindMatrices);
j.accessors=accs; j.bufferViews=views; const all=Buffer.concat(chunks); j.buffers=[{byteLength:all.length,uri:'data:application/octet-stream;base64,'+all.toString('base64')}];
const before=fs.statSync(file).size; fs.writeFileSync(file,JSON.stringify(j)); const after=fs.statSync(file).size;
console.log(file.split(/[\\/]/).pop(),'vértices',vIn,'->',vOut,'| chaves',kIn,'->',kOut,'|',(before/1024|0)+'KB ->',(after/1024|0)+'KB');
