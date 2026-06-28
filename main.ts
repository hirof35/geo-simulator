interface Point {
    x: number;
    y: number;
    radius: number; // ドラッグ判定用の見た目の大きさ
    name: string;
}

// 1. 各種図形データの初期化
const points: Point[] = [
    { x: 150, y: 150, radius: 8, name: 'A' },
    { x: 450, y: 150, radius: 8, name: 'B' },
    { x: 300, y: 320, radius: 8, name: 'C' }, // 円の中心
    { x: 300, y: 220, radius: 8, name: 'D' }  // 円周上の点（半径を決定）
];

const canvas = document.getElementById('simCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let draggedPoint: Point | null = null;

// 2. 交点計算ロジック（先ほどのコード）
function getLineCircleIntersections(A: Point, B: Point, C: Point, r: number): Point[] {
    const intersections: Point[] = [];
    const vx = B.x - A.x;
    const vy = B.y - A.y;
    const acx = A.x - C.x;
    const acy = A.y - C.y;
    
    const a = vx * vx + vy * vy;
    const b = 2 * (acx * vx + acy * vy);
    const c = (acx * acx + acy * acy) - (r * r);
    
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return [];
    
    const sqrtD = Math.sqrt(discriminant);
    const t1 = (-b - sqrtD) / (2 * a);
    const t2 = (-b + sqrtD) / (2 * a);
    
    [t1, t2].forEach(t => {
        if (t >= 0 && t <= 1) {
            intersections.push({ x: A.x + t * vx, y: A.y + t * vy, radius: 6, name: '交点' });
        }
    });
    return intersections;
}

// 3. 描画処理
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const [A, B, C, D] = points;
    
    // 円の半径を計算（中心Cから点Dまでの距離）
    const r = Math.sqrt(Math.pow(D.x - C.x, 2) + Math.pow(D.y - C.y, 2));
    
    // 線分 AB の描画
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 円 C の描画
    ctx.beginPath();
    ctx.arc(C.x, C.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 交点の計算と描画
    const intersections = getLineCircleIntersections(A, B, C, r);
    intersections.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e'; // 緑色
        ctx.fill();
        ctx.strokeStyle = '#white';
        ctx.stroke();
    });
    
    // 操作可能な点 (A, B, C, D) の描画
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p === C ? '#ef4444' : '#1e293b'; // 中心Cだけ赤、他は黒
        ctx.fill();
        
        ctx.fillStyle = '#1e293b';
        ctx.font = '14px sans-serif';
        ctx.fillText(p.name, p.x + 12, p.y + 4);
    });
}

// 4. マウスイベント（ドラッグ＆ドロップ）
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // クリックされた位置に近い点を探す
    draggedPoint = points.find(p => {
        const dist = Math.sqrt(Math.pow(p.x - mouseX, 2) + Math.pow(p.y - mouseY, 2));
        return dist < p.radius + 5;
    }) || null;
});

canvas.addEventListener('mousemove', (e) => {
    if (!draggedPoint) return;
    const rect = canvas.getBoundingClientRect();
    draggedPoint.x = e.clientX - rect.left;
    draggedPoint.y = e.clientY - rect.top;
    draw(); // 位置が変わったら再描画
});

window.addEventListener('mouseup', () => {
    draggedPoint = null;
});

// 初回描画
draw();