import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
async function core(){assert.ok(existsSync(new URL('../core.mjs',import.meta.url)),'缺少CSV整理实现');return import('../core.mjs');}
test('保留引号、逗号和跨行原文',async()=>{const c=await core();assert.deepEqual(c.parseCSV('评价,评分\r\n"包装,破损\n申请处理",2'),[['评价','评分'],['包装,破损\n申请处理','2']]);});
test('去重并保留分类依据及未分类内容',async()=>{const c=await core();const r=c.analyze('评价\n包装破损\n包装破损\n一般般');assert.equal(r.items.length,2);assert.equal(r.duplicates,1);assert.equal(r.items[0].category,'包装');assert.equal(r.items[1].category,'待人工分类');assert.equal(r.items[0].evidence,'破损');});
test('导出对公式和原文转义',async()=>{const c=await core();assert.match(c.exportCSV([{text:'=1+1',category:'待人工分类',evidence:''}]),/"'=1\+1"/);});
test('拒绝过量、格式错误、缺失表头',async()=>{const c=await core();assert.throws(()=>c.parseCSV('"不闭合'));assert.throws(()=>c.analyze('其他字段\n文字'));assert.throws(()=>c.analyze('评价\n'+Array(5002).fill('文字').join('\n')));});
