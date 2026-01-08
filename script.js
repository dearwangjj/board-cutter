// 城市参数数据库（来自 GB/T 39598-2021 附录 A + 修正系数计算）
const cityData = {
  haerbin:   { name: "哈尔滨", T: 5.0,  RH: 63, n: 0.5, K: 0.38 },
  beijing:   { name: "北京",   T: 13.0, RH: 52, n: 0.5, K: 0.62 },
  xian:      { name: "西安",   T: 14.0, RH: 63, n: 0.5, K: 0.70 },
  shanghai:  { name: "上海",   T: 17.0, RH: 75, n: 0.5, K: 0.95 },
  wuhan:     { name: "武汉",   T: 17.0, RH: 76, n: 0.5, K: 0.97 },
  guangzhou: { name: "广州",   T: 22.0, RH: 73, n: 0.5, K: 1.25 },
  chengdu:   { name: "成都",   T: 16.0, RH: 82, n: 0.5, K: 1.05 },
  urumqi:    { name: "乌鲁木齐", T: 7.0, RH: 57, n: 0.5, K: 0.48 },
  kunming:   { name: "昆明",   T: 15.0, RH: 73, n: 0.5, K: 0.88 },
  haikou:    { name: "海口",   T: 24.0, RH: 84, n: 0.5, K: 1.48 }
};

// 显示/隐藏自定义环境输入
document.getElementById('citySelect').addEventListener('change', function() {
  const customDiv = document.getElementById('customEnv');
  customDiv.style.display = this.value === 'custom' ? 'block' : 'none';
});

// 板材等级映射（单位：mg/m²·h）
const gradeMap = { enf: 0.03, e0: 0.06, e1: 0.15 };

function calculate() {
  // === 获取房间尺寸 ===
  const L = parseFloat(document.getElementById('roomL').value);
  const W = parseFloat(document.getElementById('roomW').value);
  const H = parseFloat(document.getElementById('roomH').value);
  if (!L || !W || !H || L <= 0 || W <= 0 || H <= 0) {
    alert("请填写有效的房间尺寸！");
    return;
  }
  const V = L * W * H;

  // === 获取环境参数 ===
  let T, RH, n, K_env;
  const city = document.getElementById('citySelect').value;
  
  if (city && city !== 'custom') {
    const data = cityData[city];
    T = data.T;
    RH = data.RH;
    n = data.n;
    K_env = data.K;
  } else {
    // 自定义环境
    T = parseFloat(document.getElementById('temperature').value);
    RH = parseFloat(document.getElementById('humidity').value);
    n = parseFloat(document.getElementById('airChange').value);
    if (!T || !RH || !n || RH < 0 || RH > 100 || n <= 0) {
      alert("请填写有效的环境参数！");
      return;
    }
    // 动态计算 K_env（简化模型）
    const a = 0.12, b = 0.015;
    const T0 = 23, RH0 = 50;
    K_env = Math.exp(a * (T - T0) + b * (RH - RH0));
  }

  // === 获取板材释放率 ===
  const grade = document.getElementById('boardGrade').value;
  let E_lab;
  if (grade === 'custom_grade') {
    E_lab = parseFloat(document.getElementById('customE').value);
    if (!E_lab || E_lab <= 0) {
      alert("请输入有效的甲醛释放率！");
      return;
    }
  } else {
    E_lab = gradeMap[grade];
  }

  // === 应用环境修正：实际释放率 = 实验室释放率 × K_env ===
  const E_actual = E_lab * K_env;

  // === 核心公式：S_max = (C_indoor * n * V) / E_actual ===
  const C_indoor = 0.08; // mg/m³
  const S_max = (C_indoor * n * V) / E_actual;

  // === 显示结果 ===
  const cityName = cityData[city]?.name || "自定义环境";
  document.getElementById('result').innerHTML = `
    <h3>✅ 计算完成（依据 GB/T 39598-2021 附录A）</h3>
    <p><strong>所在城市：</strong>${cityName}</p>
    <p><strong>环境参数：</strong>${T}°C, ${RH}% RH, 换气${n}次/小时</p>
    <p><strong>修正系数 K：</strong>${K_env.toFixed(2)}</p>
    <p><strong>房间体积：</strong>${V.toFixed(1)} m³</p>
    <p style="font-size:1.3em; color:#d32f2f;">
      最大安全使用面积：<strong>${S_max.toFixed(1)} 平方米</strong>
    </p>
    <p>📌 注：高温高湿地区（如海口）需大幅减少用量，寒冷干燥地区（如哈尔滨）可适当增加。</p>
  `;
  document.getElementById('result').classList.add('show');
}