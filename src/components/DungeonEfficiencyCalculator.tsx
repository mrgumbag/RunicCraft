import React, { useState } from 'react';
import './DungeonEfficiencyCalculator.css';

const DungeonEfficiencyCalculator: React.FC = () => {
    const [weaponType, setWeaponType] = useState('');
    const [playerClass, setPlayerClass] = useState('');
    const [stats, setStats] = useState({
        dungeonLevel: 0,
        attackPower: 0,
        spellPower: 0,
        defense: 0,
        magicResistance: 0,
        mana: 0,
        attackSpeed: 0,
        itemHaste: 0,
        criticalChance: 0,
        criticalDamage: 0,
        recoveryAndShield: 0,
        desiredMovementSpeed: 0,
    });
    const [attackSpeedSkillCoeffs, setAttackSpeedSkillCoeffs] = useState({
        attackPower: 0,
        spellPower: 0,
        defense: 0,
        magicResistance: 0,
        mana: 0,
        attackSpeed: 0,
        itemHaste: 0,
        criticalChance: 0,
        criticalDamage: 0,
        recoveryAndShield: 0,
    });
    const [cooldownSkillCoeffs, setCooldownSkillCoeffs] = useState({
        attackPower: 0,
        spellPower: 0,
        defense: 0,
        magicResistance: 0,
        mana: 0,
        attackSpeed: 0,
        itemHaste: 0,
        criticalChance: 0,
        criticalDamage: 0,
        recoveryAndShield: 0,
    });

    const [magicSwordBaseAttackSpeed, setMagicSwordBaseAttackSpeed] = useState(1.0); // 마법검 기본 공격속도

    const [baseCooldown, setBaseCooldown] = useState(1);
    const [applyCritToAttackSpeedSkill, setApplyCritToAttackSpeedSkill] = useState(false);
    const [applyCritToCooldownSkill, setApplyCritToCooldownSkill] = useState(false);
    const [isItemHasteEnabled, setIsItemHasteEnabled] = useState(false);
    const [skillType, setSkillType] = useState('attackSpeed');
    const [result, setResult] = useState('');

    const weaponTypes = ['단궁', '장궁', '검', '대검 및 도끼', '단검', '지팡이', '마법검'];
    const classes = ['서포터', '탱커', '버서커', '아처', '메이지'];

    const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStats(prevStats => ({
            ...prevStats,
            [name]: Number(value)
        }));
    };

    const handleCoeffChange = (e: React.ChangeEvent<HTMLInputElement>, skillType: 'attackSpeed' | 'cooldown') => {
        const { name, value } = e.target;
        const setter = skillType === 'attackSpeed' ? setAttackSpeedSkillCoeffs : setCooldownSkillCoeffs;
        setter(prevCoeffs => ({
            ...prevCoeffs,
            [name]: Number(value)
        }));
    };

    const handleBaseCooldownChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setBaseCooldown(value > 0 ? value : 1);
    };

    const handleCritChange = (e: React.ChangeEvent<HTMLInputElement>, skillType: 'attackSpeed' | 'cooldown') => {
        if (skillType === 'attackSpeed') {
            setApplyCritToAttackSpeedSkill(e.target.checked);
        } else {
            setApplyCritToCooldownSkill(e.target.checked);
        }
    };

    const handleHasteEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsItemHasteEnabled(e.target.checked);
    };

    const handleMagicSwordSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        setMagicSwordBaseAttackSpeed(value);
    };


    const calculateEfficiency = () => {
        if (!weaponType || !playerClass) {
            setResult('무기 종류와 클래스를 모두 선택해야 합니다.');
            return;
        }

        const effectiveStats = { ...stats };
        const levelMultiplier = 1 + (0.08 * effectiveStats.dungeonLevel);

        effectiveStats.attackPower *= levelMultiplier;
        effectiveStats.spellPower *= levelMultiplier;
        effectiveStats.defense *= levelMultiplier;
        effectiveStats.magicResistance *= levelMultiplier;
        effectiveStats.mana *= levelMultiplier;
        effectiveStats.itemHaste *= levelMultiplier;
        effectiveStats.recoveryAndShield *= levelMultiplier;

        const finalStats = { ...effectiveStats };
        let finalDamageMultiplier = 1;

        switch (playerClass) {
            case '탱커':
                finalStats.defense *= 1.5;
                finalStats.magicResistance *= 1.5;
                break;
            case '서포터':
                finalStats.itemHaste *= 1.25;
                finalStats.recoveryAndShield *= 1.25;
                break;
            case '버서커':
                if (weaponType === '검' || weaponType === '대검 및 도끼' || weaponType === '단검' || weaponType === '마법검') {
                    finalDamageMultiplier *= 1.25;
                } else if (weaponType === '단궁' || weaponType === '장궁') {
                    finalDamageMultiplier *= 0.5;
                }
                break;
            case '아처':
                finalStats.criticalChance += 25;
                finalStats.criticalDamage += 50;
                finalStats.attackSpeed += (16 * 2.5);

                if (weaponType === '단궁') {
                    finalDamageMultiplier *= 1.05;
                } else if (weaponType === '장궁') {
                    finalDamageMultiplier *= 1.25;
                }
                break;
            case '메이지':
                finalStats.spellPower *= 1.5;
                finalStats.mana *= 1.5;
                if (weaponType === '검' || weaponType === '대검 및 도끼' || weaponType === '단검' || weaponType === '마법검') {
                    finalDamageMultiplier *= 0.75;
                }
                break;
        }

        let physicalDamagePerHit = 0;
        let skillDamagePerHit = 0;
        let totalDps = 0;
        let skillDpsResult = 0;

        const critMultiplier = 1 + (finalStats.criticalChance / 100) * (finalStats.criticalDamage / 100);

        // 초당 공격 횟수 계산 (shotsPerSecond)
        let shotsPerSecond;
        switch (weaponType) {
            case '단궁':
                shotsPerSecond = Math.min(finalStats.attackSpeed, 300) / 100;
                break;
            case '장궁':
                shotsPerSecond = 1;
                break;
            case '검':
                shotsPerSecond = 1.6;
                break;
            case '대검 및 도끼':
                shotsPerSecond = 1.2;
                break;
            case '단검':
                shotsPerSecond = 2.0;
                break;
            case '마법검':
                shotsPerSecond = magicSwordBaseAttackSpeed * (finalStats.attackSpeed / 100);
                break;
            case '지팡이':
            default:
                shotsPerSecond = 1;
                break;
        }

        // 물리 피해량 (1회 타격당) 계산
        switch (weaponType) {
            case '단궁':
                physicalDamagePerHit = finalStats.attackPower * 1.0 * critMultiplier;
                break;
            case '장궁':
                physicalDamagePerHit = finalStats.attackPower * 2.4 * critMultiplier;
                break;
            case '검':
            case '대검 및 도끼':
            case '단검':
            case '마법검':
                physicalDamagePerHit = finalStats.attackPower * 1.1 * critMultiplier;
                break;
            case '지팡이':
                physicalDamagePerHit = 0;
                break;
            default:
                setResult('선택된 무기에 대한 계산 공식이 없습니다.');
                return;
        }

        if (skillType === 'attackSpeed') {
            // 공격 속도 스킬 피해량 (1회 타격당) 계산
            skillDamagePerHit =
                (finalStats.attackPower * attackSpeedSkillCoeffs.attackPower) +
                (finalStats.spellPower * attackSpeedSkillCoeffs.spellPower) +
                (finalStats.mana * attackSpeedSkillCoeffs.mana) +
                (finalStats.criticalChance * attackSpeedSkillCoeffs.criticalChance) +
                (finalStats.criticalDamage * attackSpeedSkillCoeffs.criticalDamage) +
                (finalStats.attackSpeed * attackSpeedSkillCoeffs.attackSpeed) +
                (finalStats.itemHaste * attackSpeedSkillCoeffs.itemHaste);

            if (applyCritToAttackSpeedSkill) {
                skillDamagePerHit *= critMultiplier;
            }

            // 최종 DPS 계산: (1회 타격당 물리 피해 + 1회 타격당 스킬 피해) * 초당 공격 횟수
            const totalDamagePerHit = physicalDamagePerHit + skillDamagePerHit;
            totalDps = totalDamagePerHit * shotsPerSecond;
            skillDpsResult = skillDamagePerHit;

        } else { // skillType === 'cooldown'
            // 쿨타임 스킬 피해량 (DPS) 계산
            const totalCooldownSkillDamage =
                (finalStats.attackPower * cooldownSkillCoeffs.attackPower) +
                (finalStats.spellPower * cooldownSkillCoeffs.spellPower) +
                (finalStats.mana * cooldownSkillCoeffs.mana) +
                (finalStats.criticalChance * cooldownSkillCoeffs.criticalChance) +
                (finalStats.criticalDamage * cooldownSkillCoeffs.criticalDamage) +
                (finalStats.attackSpeed * cooldownSkillCoeffs.attackSpeed) +
                (finalStats.itemHaste * cooldownSkillCoeffs.itemHaste);

            if (applyCritToCooldownSkill) {
                totalCooldownSkillDamage *= critMultiplier;
            }

            let finalCooldown = baseCooldown;
            if (isItemHasteEnabled) {
                const reductionRate = finalStats.itemHaste / (finalStats.itemHaste + 100);
                finalCooldown = baseCooldown * (1 - reductionRate);
            }

            let cooldownSkillDps = 0;
            if (finalCooldown > 0) {
                cooldownSkillDps = totalCooldownSkillDamage / finalCooldown;
            }
            skillDpsResult = cooldownSkillDps;

            // 최종 DPS 계산: 물리 DPS + 쿨타임 스킬 DPS
            totalDps = (physicalDamagePerHit * shotsPerSecond) + cooldownSkillDps;
        }

        totalDps *= finalDamageMultiplier;
        const totalDpm = totalDps * 60;

        setResult(`
            <h3>계산 결과</h3>
            <p>선택된 무기: ${weaponType}</p>
            <p>선택된 클래스: ${playerClass}</p>
            <p>물리 피해량 (1회 공격당): ${physicalDamagePerHit.toFixed(2)}</p>
            ${skillType === 'attackSpeed' ? `<p>스킬 피해량 (1회 공격당): ${skillDamagePerHit.toFixed(2)}</p>` : `<p>스킬 DPS: ${skillDpsResult.toFixed(2)}</p>`}
            <p>최종 DPS (초당 피해량): ${totalDps.toFixed(2)}</p>
            <p>최종 DPM (분당 피해량): ${totalDpm.toFixed(2)}</p>
        `);
    };

    return (
        <div className="calculator-container">
            <h2>던전 레벨 / 클래스 효율 계산기</h2>

            <div className="input-group">
                <label htmlFor="weapon-type">무기 종류:</label>
                <select
                    id="weapon-type"
                    value={weaponType}
                    onChange={(e) => setWeaponType(e.target.value)}
                >
                    <option value="">-- 선택 --</option>
                    {weaponTypes.map((weapon) => (
                        <option key={weapon} value={weapon}>{weapon}</option>
                    ))}
                </select>
            </div>

            <div className="input-group">
                <label htmlFor="player-class">클래스:</label>
                <select
                    id="player-class"
                    value={playerClass}
                    onChange={(e) => setPlayerClass(e.target.value)}
                >
                    <option value="">-- 선택 --</option>
                    {classes.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {weaponType === '마법검' && (
                <div className="input-group">
                    <label htmlFor="magic-sword-base-as">마법검 기본 공격속도:</label>
                    <input
                        type="number"
                        id="magic-sword-base-as"
                        value={magicSwordBaseAttackSpeed}
                        onChange={handleMagicSwordSpeedChange}
                        min="0.1"
                        step="0.1"
                    />
                </div>
            )}

            <div className="stats-section">
                <h3>스탯 기입란</h3>
                <div className="stat-input-group">
                    <label htmlFor="dungeon-level">던전 레벨:</label>
                    <input
                        type="number"
                        id="dungeon-level"
                        name="dungeonLevel"
                        value={stats.dungeonLevel}
                        onChange={handleStatChange}
                        min="0"
                    />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="attack-power">공격력:</label>
                    <input type="number" id="attack-power" name="attackPower" value={stats.attackPower} onChange={handleStatChange} min="0" />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="spell-power">주문력:</label>
                    <input type="number" id="spell-power" name="spellPower" value={stats.spellPower} onChange={handleStatChange} min="0" />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="defense">방어력:</label>
                    <input type="number" id="defense" name="defense" value={stats.defense} onChange={handleStatChange} min="0" />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="magic-resistance">마법 저항력:</label>
                    <input type="number" id="magic-resistance" name="magicResistance" value={stats.magicResistance} onChange={handleStatChange} min="0" />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="mana">마나:</label>
                    <input type="number" id="mana" name="mana" value={stats.mana} onChange={handleStatChange} min="0" />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="attack-speed">공격속도:</label>
                    <input type="number" id="attack-speed" name="attackSpeed" value={stats.attackSpeed} onChange={handleStatChange} min="0" />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="item-haste">아이템 가속:</label>
                    <input type="number" id="item-haste" name="itemHaste" value={stats.itemHaste} onChange={handleStatChange} min="0" />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="critical-chance">치명타 확률:</label>
                    <input type="number" id="critical-chance" name="criticalChance" value={stats.criticalChance} onChange={handleStatChange} min="0" />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="critical-damage">치명타 피해:</label>
                    <input type="number" id="critical-damage" name="criticalDamage" value={stats.criticalDamage} onChange={handleStatChange} min="0" />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="recovery-and-shield">회복 및 보호막 효과:</label>
                    <input type="number" id="recovery-and-shield" name="recoveryAndShield" value={stats.recoveryAndShield} onChange={handleStatChange} min="0" />
                </div>
                <div className="stat-input-group">
                    <label htmlFor="desired-movement-speed">희망 이동속도:</label>
                    <input type="number" id="desired-movement-speed" name="desiredMovementSpeed" value={stats.desiredMovementSpeed} onChange={handleStatChange} min="0" />
                </div>
            </div>

            <div className="skill-type-selection">
                <h3>스킬 유형 선택</h3>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="skillType"
                            value="attackSpeed"
                            checked={skillType === 'attackSpeed'}
                            onChange={(e) => setSkillType(e.target.value)}
                        />
                        공격 속도 스킬
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="skillType"
                            value="cooldown"
                            checked={skillType === 'cooldown'}
                            onChange={(e) => setSkillType(e.target.value)}
                        />
                        쿨타임 스킬
                    </label>
                </div>
            </div>

            <div className="coefficients-section">
                <h3>스킬 피해량 계수 기입란</h3>
                {skillType === 'attackSpeed' ? (
                    <div className="skill-type-section">
                        <h4>공격 속도 스킬</h4>
                        <p>공격 1회당 추가적으로 피해를 입히는 스킬입니다.</p>
                        <div className="coefficient-input-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={applyCritToAttackSpeedSkill}
                                    onChange={(e) => handleCritChange(e, 'attackSpeed')}
                                />
                                치명타 적용
                            </label>
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="as-ap-coeff">공격력 계수:</label>
                            <input type="number" id="as-ap-coeff" name="attackPower" value={attackSpeedSkillCoeffs.attackPower} onChange={(e) => handleCoeffChange(e, 'attackSpeed')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="as-sp-coeff">주문력 계수:</label>
                            <input type="number" id="as-sp-coeff" name="spellPower" value={attackSpeedSkillCoeffs.spellPower} onChange={(e) => handleCoeffChange(e, 'attackSpeed')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="as-mana-coeff">마나 계수:</label>
                            <input type="number" id="as-mana-coeff" name="mana" value={attackSpeedSkillCoeffs.mana} onChange={(e) => handleCoeffChange(e, 'attackSpeed')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="as-cc-coeff">치명타 확률 계수:</label>
                            <input type="number" id="as-cc-coeff" name="criticalChance" value={attackSpeedSkillCoeffs.criticalChance} onChange={(e) => handleCoeffChange(e, 'attackSpeed')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="as-cd-coeff">치명타 피해 계수:</label>
                            <input type="number" id="as-cd-coeff" name="criticalDamage" value={attackSpeedSkillCoeffs.criticalDamage} onChange={(e) => handleCoeffChange(e, 'attackSpeed')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="as-as-coeff">공격속도 계수:</label>
                            <input type="number" id="as-as-coeff" name="attackSpeed" value={attackSpeedSkillCoeffs.attackSpeed} onChange={(e) => handleCoeffChange(e, 'attackSpeed')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="as-ih-coeff">아이템 가속 계수:</label>
                            <input type="number" id="as-ih-coeff" name="itemHaste" value={attackSpeedSkillCoeffs.itemHaste} onChange={(e) => handleCoeffChange(e, 'attackSpeed')} step="0.01" />
                        </div>
                    </div>
                ) : (
                    <div className="skill-type-section">
                        <h4>쿨타임 스킬</h4>
                        <p>정해진 쿨타임마다 피해를 입히는 스킬입니다.</p>
                        <div className="coefficient-input-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={applyCritToCooldownSkill}
                                    onChange={(e) => handleCritChange(e, 'cooldown')}
                                />
                                치명타 적용
                            </label>
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="cd-ap-coeff">공격력 계수:</label>
                            <input type="number" id="cd-ap-coeff" name="attackPower" value={cooldownSkillCoeffs.attackPower} onChange={(e) => handleCoeffChange(e, 'cooldown')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="cd-sp-coeff">주문력 계수:</label>
                            <input type="number" id="cd-sp-coeff" name="spellPower" value={cooldownSkillCoeffs.spellPower} onChange={(e) => handleCoeffChange(e, 'cooldown')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="cd-mana-coeff">마나 계수:</label>
                            <input type="number" id="cd-mana-coeff" name="mana" value={cooldownSkillCoeffs.mana} onChange={(e) => handleCoeffChange(e, 'cooldown')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="cd-cc-coeff">치명타 확률 계수:</label>
                            <input type="number" id="cd-cc-coeff" name="criticalChance" value={cooldownSkillCoeffs.criticalChance} onChange={(e) => handleCoeffChange(e, 'cooldown')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="cd-cd-coeff">치명타 피해 계수:</label>
                            <input type="number" id="cd-cd-coeff" name="criticalDamage" value={cooldownSkillCoeffs.criticalDamage} onChange={(e) => handleCoeffChange(e, 'cooldown')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="cd-as-coeff">공격속도 계수:</label>
                            <input type="number" id="cd-as-coeff" name="attackSpeed" value={cooldownSkillCoeffs.attackSpeed} onChange={(e) => handleCoeffChange(e, 'cooldown')} step="0.01" />
                        </div>
                        <div className="coefficient-input-group">
                            <label htmlFor="cd-ih-coeff">아이템 가속 계수:</label>
                            <input type="number" id="cd-ih-coeff" name="itemHaste" value={cooldownSkillCoeffs.itemHaste} onChange={(e) => handleCoeffChange(e, 'cooldown')} step="0.01" />
                        </div>

                        <div className="cooldown-options">
                            <div className="stat-input-group">
                                <label htmlFor="base-cooldown">스킬 기본 쿨타임 (초):</label>
                                <input
                                    type="number"
                                    id="base-cooldown"
                                    value={baseCooldown}
                                    onChange={handleBaseCooldownChange}
                                    step="0.1"
                                    min="0"
                                />
                            </div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isItemHasteEnabled}
                                    onChange={handleHasteEnabledChange}
                                />
                                아이템 가속 적용
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <button onClick={calculateEfficiency} className="calculate-button">효율 계산</button>

            {result && <div className="result-section" dangerouslySetInnerHTML={{ __html: result }} />}
        </div>
    );
};

export default DungeonEfficiencyCalculator;