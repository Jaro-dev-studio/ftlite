// Combat rendering (projectiles, effects) - FTL style

import { Projectile } from '@/utils/types';
import { COLORS } from '@/utils/constants';

// Draw a single projectile with FTL-style visuals
export function drawProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
  if (projectile.state !== 'flying') return;

  const { x, y } = projectile.position;
  const angle = Math.atan2(
    projectile.endPosition.y - projectile.startPosition.y,
    projectile.endPosition.x - projectile.startPosition.x
  );

  if (projectile.weaponType === 'laser') {
    // Laser bolt - elongated glowing projectile
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Outer glow
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
    gradient.addColorStop(0, 'rgba(231, 76, 60, 0.6)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Laser bolt body (elongated)
    ctx.fillStyle = COLORS.PROJECTILE_LASER;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  } else if (projectile.weaponType === 'missile') {
    // Missile - detailed with trail
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Exhaust trail
    const trailGradient = ctx.createLinearGradient(-25, 0, -5, 0);
    trailGradient.addColorStop(0, 'transparent');
    trailGradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.4)');
    trailGradient.addColorStop(1, 'rgba(249, 115, 22, 0.8)');
    ctx.fillStyle = trailGradient;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-25, -6);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-25, 6);
    ctx.closePath();
    ctx.fill();

    // Missile body glow
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    glowGradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // Missile body
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();

    // Missile tip
    ctx.fillStyle = COLORS.PROJECTILE_MISSILE;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(6, -3);
    ctx.lineTo(6, 3);
    ctx.closePath();
    ctx.fill();

    // Engine glow
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(-5, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Draw all projectiles
export function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const projectile of projectiles) {
    drawProjectile(ctx, projectile);
  }
}

// Draw hit effect (explosion)
export function drawHitEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 25,
  progress: number = 0.5
): void {
  const alpha = 1 - progress;
  const currentRadius = radius * (0.5 + progress);

  // Outer ring
  ctx.beginPath();
  ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 200, 100, ${alpha * 0.5})`;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner flash
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius * 0.6);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  gradient.addColorStop(0.5, `rgba(255, 200, 100, ${alpha * 0.6})`);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, currentRadius * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

// Draw miss indicator
export function drawMissEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number = 0.5
): void {
  const alpha = 1 - progress;
  const offsetY = progress * -20;

  ctx.fillStyle = `rgba(150, 150, 150, ${alpha})`;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MISS', x, y + offsetY);
}

// Draw damage number
export function drawDamageNumber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  damage: number,
  progress: number = 0.5
): void {
  const alpha = 1 - progress;
  const offsetY = progress * -30;

  ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`-${damage}`, x, y + offsetY);
}

// Draw shield block effect
export function drawShieldBlockEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number = 0.5
): void {
  const alpha = 1 - progress;
  const radius = 20 + progress * 15;

  // Blue shield flash
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(52, 152, 219, ${alpha})`);
  gradient.addColorStop(0.5, `rgba(52, 152, 219, ${alpha * 0.5})`);
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Ripple ring
  ctx.strokeStyle = `rgba(52, 152, 219, ${alpha * 0.7})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
  ctx.stroke();
}
