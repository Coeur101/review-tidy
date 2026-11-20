import { analyze,exportCSV,categories } from './core.mjs';
const el=id=>document.getElementById(id);let items=[];
const sample='评价,评分\n包装有破损，已联系售后,2\n物流比较慢，商品使用正常,3\n颜色和图片接近，使用正常,5\n客服回复清楚，问题已处理,4\n有一点异味，需要再核对,2\n包装有破损，已联系售后,2\n价格比上次高，先观察,3';
function demo(){document.querySelector('.demo').hidden=false;el('csv').value=sample;}
function render(result){
 items=result.items;document.querySelector('.result').hidden=false;
 el('metrics').replaceChildren();for(const [label,value] of [['有效评价',items.length],['合并重复',result.duplicates],['待人工分类',items.filter(v=>v.category==='待人工分类').length]]){const box=document.createElement('div'),number=document.createElement('strong'),name=document.createElement('span');number.textContent=value;name.textContent=label;box.append(number,name);el('metrics').append(box);}
 el('rows').replaceChildren();items.slice(0,100).forEach((item,i)=>{const tr=document.createElement('tr'),text=document.createElement('td'),category=document.createElement('td'),evidence=document.createElement('td'),select=document.createElement('select');text.textContent=item.text;evidence.textContent=item.evidence||'—';select.setAttribute('aria-label','第'+(i+1)+'条评价分类');for(const value of categories){const option=new Option(value,value);option.selected=value===item.category;select.append(option);}select.onchange=()=>{item.category=select.value;el('metrics').children[2].querySelector('strong').textContent=items.filter(v=>v.category==='待人工分类').length;};category.append(select);tr.append(text,category,evidence);el('rows').append(tr);});
 el('page-note').textContent=items.length>100?'页面展示前100条供核对，导出包含全部'+items.length+'条；其余评价请在导出表中继续核对。':'共'+items.length+'条；可逐条核对后导出。';
}
el('csv').oninput=()=>{document.querySelector('.demo').hidden=true;document.querySelector('.result').hidden=true;};
el('sample').onclick=()=>{demo();el('error').textContent='';};
el('analyze').onclick=()=>{try{render(analyze(el('csv').value));el('error').textContent='';}catch(error){el('error').textContent=error.message;document.querySelector('.result').hidden=true;}};
el('file').onchange=async()=>{const file=el('file').files[0];if(!file)return;if(file.size>2*1024*1024){el('error').textContent='请使用2MB以内的CSV';return;}try{el('csv').value=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());document.querySelector('.demo').hidden=true;el('error').textContent='';}catch{el('error').textContent='文件不是有效UTF-8，请转换编码后重试。';}};
el('export').onclick=()=>{const url=URL.createObjectURL(new Blob([exportCSV(items)],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='评价整理清单.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);};
if(new URLSearchParams(location.search).get('demo')==='1')demo();
fetch('version.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(v=>{if(v?.sha)el('version').textContent=v.sha;}).catch(()=>{});
