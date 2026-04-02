export function applyCombatImpact(game, attacker, target, isCrit = false) {
    const now = performance.now();
    if (now - game.lastImpactAt < game.config.impactCooldownMs) return;
    game.lastImpactAt = now;

    const bonus = isCrit ? game.config.critBonusFrames : 0;
    game.globalHitstopFrames = Math.max(
        game.globalHitstopFrames,
        game.config.hitstopFrames + bonus
    );

    if (attacker && attacker.endLagFrames !== undefined) {
        attacker.endLagFrames = Math.max(
            attacker.endLagFrames,
            game.config.attackerEndLagFrames + bonus
        );
    }

    if (target && target.hitStunFrames !== undefined) {
        target.hitStunFrames = Math.max(
            target.hitStunFrames,
            game.config.targetHitStunFrames + bonus
        );
    }
}

export function tryMeleeHit(game, attacker, attackDirection, damage, range = 4, coneDotMin = 0.3, isCrit = false) {
    if (!game.boss || !game.boss.isAlive || !attacker) return false;

    const toBoss = game.boss.position.clone().sub(attacker.position);
    const distance = toBoss.length();
    if (distance > range) return false;

    toBoss.y = 0;
    if (toBoss.lengthSq() <= 0) return false;
    toBoss.normalize();

    const dir = attackDirection.clone();
    dir.y = 0;
    if (dir.lengthSq() <= 0) return false;
    dir.normalize();

    const dot = dir.dot(toBoss);
    if (dot < coneDotMin) return false;

    game.damageEnemy(game.boss, damage, isCrit);
    return true;
}
