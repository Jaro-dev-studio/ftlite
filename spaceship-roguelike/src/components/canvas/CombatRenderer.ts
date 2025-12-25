// Combat rendering (projectiles, effects)

import { Projectile } from '@/utils/types';
import { COLORS } from '@/utils/constants';

// Draw a single projectile
export function drawProjectile(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
  if (projectile.state !== 'flying') return;

  const { x, y } = projectile.position;

  if (projectile.weaponType === 'laser') {
    // Laser - small glowing circle
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.PROJECTILE_LASER;
    ctx.fill();

    // Glow effect
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.fill();
  } else if (projectile.weaponType === 'missile') {
    // Missile - elongated shape with trail
    const angle = Math.atan2(
      projectile.endPosition.y - projectile.startPosition.y,
      projectile.endPosition.x - projectile.startPosition.x
    );

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Missile body
    ctx.fillStyle = COLORS.PROJECTILE_MISSILE;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-6, -4);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();

    // Exhaust trail
    ctx.fillStyle = 'rgba(249, 115, 22, 0.5)';
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-15, -3);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-15, 3);
    ctx.closePath();
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

// Draw hit effect (flash)
export function drawHitEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 20
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();
}

// Draw miss indicator
export function drawMissEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {
  ctx.fillStyle = '#888888';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MISS', x, y);
}
