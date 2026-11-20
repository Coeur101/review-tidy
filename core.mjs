export const categories=['包装','物流','质量','服务','价格','待人工分类'];
const rules=[['包装',['破损','包装','漏液']],['物流',['快递','物流','送达']],['质量',['故障','掉色','异味','质量']],['服务',['客服','售后','退款']],['价格',['价格','涨价','太贵']]];
export function parseCSV(text){
  if(typeof text!=='string'||text.length>2*1024*1024)throw Error('请使用2MB以内的UTF-8 CSV');
  text=text.replace(/^\uFEFF/,'');let rows=[],row=[],cell='',quoted=false,closed=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;}
    else if(c==='"'){if(cell||closed)throw Error('CSV引号位置不正确');quoted=true;}
    else if(c===','){row.push(cell);cell='';closed=false;}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';closed=false;}
    else{if(closed)throw Error('CSV闭合引号后存在多余字符');cell+=c;}
    if(rows.length>5001)throw Error('最多处理5000条评价');
  }
  if(quoted)throw Error('CSV引号未闭合');row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
export function analyze(text){
  const rows=parseCSV(text),header=rows.shift()||[];
  const column=header.findIndex(v=>['评价','评论','评价内容','内容','review','content'].includes(v.trim().toLowerCase()));
  if(column<0)throw Error('请包含“评价”或“content”表头');
  if(rows.length>5000)throw Error('最多处理5000条评价');
  const seen=new Set(),items=[];let duplicates=0,empty=0;
  for(const row of rows){
    if(row.length!==header.length)throw Error('部分行的列数与表头不同，请检查CSV');
    const raw=row[column].trim();if(!raw){empty++;continue;}if(raw.length>10000)throw Error('单条评价超过10000字');
    if(seen.has(raw)){duplicates++;continue;}seen.add(raw);
    let category='待人工分类',evidence='';
    for(const [label,words] of rules){const word=words.find(w=>raw.includes(w));if(word){category=label;evidence=word;break;}}
    items.push({text:raw,category,evidence});
  }
  return {items,duplicates,empty};
}
export function exportCSV(items){
  function safe(v){let text=String(v);if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
  return '\uFEFF'+[['原评价','人工可改分类','命中词（非因果证据）'],...items.map(v=>[v.text,v.category,v.evidence])].map(row=>row.map(safe).join(',')).join('\r\n');
}
