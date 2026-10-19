/* Model names for the captured asset library, shared by the asset page and the project panel.
   Models 0-19 are the Agent project's asset list; later ones were matched to its canvas
   cards by thumbnail. Older captures without a known name fall back to type + number. */
(() => {
  const models = window.MeshyAssetLibrary?.models || [];
  const known = {0:'黄色猫耳女孩',1:'黄色猫耳女孩白模',2:'卡通兔子',3:'卡通兔子白模',4:'红裙女孩',5:'洋楼摆件',6:'古董挂钟',7:'洋楼摆件低模',8:'古董挂钟低模',9:'洋楼白模',10:'挂钟白模',11:'牵牛花',12:'牵牛花低模',13:'牵牛花白模',14:'玻璃花瓶',15:'玻璃花瓶低模',16:'玻璃花瓶变体',17:'玻璃花瓶白模',18:'玻璃花瓶白模变体',19:'吊灯白模',20:'长椅 · 拓扑贴图 2',21:'长椅 · 拓扑贴图',22:'长椅 · 拓扑贴图',24:'长椅 · 拓扑白模',26:'吊灯 · 多视贴图',27:'吊灯 · 拓扑贴图',29:'吊灯 · 拓扑白模',30:'衣柜 · 拓扑贴图',31:'衣柜 · 智能拓扑',32:'衣柜 · 智能拓扑',33:'衣柜 · 拓扑白模',34:'衣柜 · 拓扑白模',35:'衣柜 · 平涂减面 2',36:'衣柜 · 平涂减面 1',37:'衣柜 · 平涂高精',38:'衣柜 · 减面',39:'吊灯 · 减面',40:'吊灯 · 多视高精',41:'吊灯 · 多视白模 2',42:'吊灯 · 多视白模',44:'吊灯 · 高精模型',45:'衣柜 · 减面',50:'红裙女孩',51:'红裙女孩',52:'红裙女孩'};
  const typeNames = {textured: '贴图模型', geometry: '白模', animated: '动画'};
  const counters = {};
  const list = models.map((item, index) => known[index] || (item.sample ? `${item.sample} · ${typeNames[item.type]}` : `${typeNames[item.type]} ${String(counters[item.type] = (counters[item.type] || 0) + 1).padStart(2, '0')}`));
  window.MeshyAssetNames = {list, known: index => Boolean(known[index])};
})();
