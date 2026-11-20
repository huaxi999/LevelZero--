import {
    ABYSS_AREAS,
    ABYSS_ASSETS,
    ABYSS_BOSSES,
    ABYSS_CHARACTERS,
    ABYSS_EQUIPMENT,
    ABYSS_MONSTERS,
    ABYSS_RARITIES,
    ABYSS_RARITY_LOOT,
    ABYSS_ITEM_GRADES,
    ABYSS_SLOTS,
    ABYSS_SLOT_LABELS,
} from './abyss-data.js';

export const PEAK_CARD_CATEGORIES = {
    attack: { name: '进攻', color: '#e85945' },
    defense: { name: '防守', color: '#58a8c9' },
    skill: { name: '技能', color: '#c786e4' },
    buff: { name: '增益', color: '#e9b949' },
    special: { name: '特殊', color: '#f06dc5' },
};

export const PEAK_TUTORIAL_CHAPTERS = [
    {
        id: 'objective', code: '01', kicker: 'GETTING STARTED', title: '对决目标',
        summary: '在生命归零前完成全部遭遇，并把本次远征的奖励带回角色养成。',
        points: [
            { title: '选择副本', text: '远征地图会显示推荐等级、体力消耗、敌方强度和掉落。精英与困难副本可能包含连续遭遇。' },
            { title: '准备卡组', text: '每个职业拥有独立卡组。卡组必须包含15至50张牌，并遵守不同稀有度的同名卡上限。' },
            { title: '完成战斗', text: '击败当前遭遇的全部敌人即可结算金币、经验和装备；退出或失败不会返还已消耗体力。' },
        ],
        example: { title: '第一次远征', text: '保留默认卡组，选择微风哨站·普通。确认卡组显示“可用于战斗”且体力足够后开始挑战，先熟悉单场对决再进入连续遭遇。' },
        mistakes: ['只看推荐等级，不检查卡组是否合法', '在不了解敌方行动前直接挑战高难度'],
        tip: '第一次游玩建议使用初始卡组挑战普通难度。',
    },
    {
        id: 'turn', code: '02', kicker: 'TURN FLOW', title: '回合与出牌',
        summary: '先在手牌中规划队列，再统一结算；牌序、MP和目标状态都会影响卡牌能否生效。',
        points: [
            { title: '编排队列', text: '点击手牌查看详情并加入缓冲队列。加入队列的卡牌会预占MP，可在结算前撤回。' },
            { title: '结束回合', text: '确认牌序后结束回合，玩家队列与敌方行动依次结算。没有出牌时也可以跳过回合。' },
            { title: '抽牌节奏', text: '第1回合只使用开局手牌：Lv.1至14基础4张，Lv.15后基础5张。从第2回合开始，Lv.1至35每回合基础抽2张，Lv.36后基础抽3张。启迪天赋会继续叠加：抽牌大师每2回合额外抽1张；卡牌大师1级在该触发时恢复4MP，2级改为每回合额外抽1张并恢复4MP；战术调度开局额外抽2张，先机扩张每级再加1张开局手牌（最多2级）。满天赋时开局最多9张，Lv.36后自然抽牌最多4张/回合（不含临时抽牌）。战术宣言和卡牌效果提供的临时抽牌也会继续叠加。' },
            { title: '整理手牌', text: '手牌上限为12张。超过上限时必须选择多余卡牌丢弃，之后才能继续结算。' },
        ],
        example: { title: '一个稳健回合', text: '先查看敌方意图；若敌方准备进攻，优先加入防守牌，再根据剩余MP安排起手与追击。提交前撤回不合适的牌不会产生损失。' },
        mistakes: ['只按卡牌稀有度出牌，忽略实际MP', '手牌超过12张后没有预留弃牌方案'],
        tip: '敌方意图会显示预计出牌数量、MP消耗和卡牌名称，可据此调整攻防。',
    },
    {
        id: 'states', code: '03', kicker: 'COMBO STATES', title: '连段状态',
        summary: '进攻牌具有明确的目标状态条件。按正确顺序连接站立、击飞、浮空和击倒，才能形成完整连段。',
        points: [
            { title: '站立与击飞', text: '多数起手牌要求目标站立；上挑类卡牌会把目标变为击飞，为空中追击创造条件。' },
            { title: '浮空与击倒', text: '追击牌可将击飞目标转为浮空，终结牌通常将浮空目标击倒。重复使用不接受当前状态的卡牌会被阻止。' },
            { title: '眩晕', text: '眩晕会使目标下一张牌除状态变化外的效果无效。部分防护效果可以抵消眩晕。' },
        ],
        example: { title: '基础空中连段', text: '剑士可用“上挑”，格斗家可用“上勾拳”把站立目标击飞；随后使用“浮空追斩”转为浮空，最后以终结牌击倒。' },
        mistakes: ['目标已经击倒时继续使用只接受站立的起手牌', '把状态文字相似但适用条件不同的牌当成可互换卡牌'],
        tip: '卡牌详情中的“适用状态”会随当前敌方状态即时给出可用性提示。',
    },
    {
        id: 'categories', code: '04', kicker: 'CARD TYPES', title: '五类卡牌',
        summary: '五种类别承担不同战术职责，部分牌会检查本回合此前的类别或整个队列构成。',
        points: [
            { title: '进攻与技能', text: '进攻牌侧重状态连段，技能牌侧重元素、异常与资源转化，两者通常是主要伤害来源。' },
            { title: '防守与增益', text: '防守牌提供护盾、减伤、反击或净化；增益牌强化属性、恢复MP并为后续牌创造条件。' },
            { title: '特殊牌', text: '特殊牌会插入队列最左侧，每回合最多使用一张，适合改变规则或制造关键回合。' },
        ],
        example: { title: '四类协同', text: '增益牌先强化属性，进攻牌改变目标状态，技能牌利用状态造成伤害，防守牌为敌方回合保留生存空间。特殊牌用于改变整回合计划。' },
        mistakes: ['卡组只保留伤害牌，导致MP和防御循环中断', '同一回合尝试使用两张特殊牌'],
        tip: '队列构成牌会检查类别数量、位置或排除条件，出牌前应阅读其触发说明。',
    },
    {
        id: 'resources', code: '05', kicker: 'RESOURCES', title: '生命、MP与状态',
        summary: '生命、MP和手牌都会跨回合变化。合理保留MP、安排抽牌节奏、处理异常和控制手牌，比单回合打出最多卡牌更重要。',
        points: [
            { title: 'MP循环', text: '卡牌按实际消耗扣除MP，回合开始会恢复一定MP。恢复MP的卡牌可以帮助高消耗队列持续运转。' },
            { title: '抽牌与手牌', text: '基础抽牌由角色等级决定；抽牌天赋和卡牌效果会在此基础上额外增加手牌。抽牌受到12张手牌上限限制，接近上限时应提前规划出牌或弃牌。' },
            { title: '护盾与生命', text: '护盾通常优先承受伤害，并会按规则在回合间衰减；治疗不会让生命超过最大值。' },
            { title: '异常状态', text: '灼烧、中毒、冰冻、流血、虚弱和易伤拥有不同触发时点与叠层规则，可通过净化或免疫处理。' },
        ],
        example: { title: '资源取舍', text: '当前MP不足以完成连段时，可以先使用回能增益并保留关键终结牌；面对多层中毒或灼烧时，净化通常比追加少量护盾更有效。' },
        mistakes: ['把全部MP耗尽后没有为下一回合保留恢复手段', '忽略异常状态的回合开始或结束结算时点'],
        tip: '点击战斗中的状态图标和卡牌详情，确认持续时间、层数与结算方式。',
    },
    {
        id: 'growth', code: '06', kicker: 'PROGRESSION', title: '战斗外养成',
        summary: '卡牌、角色、装备与祝福共同决定战斗强度，两个职业的养成进度彼此独立。',
        points: [
            { title: '卡牌升级', text: '卡包中的重复卡会转为升级素材。卡牌升级需要同名卡和金币，最高可升至10级。' },
            { title: '角色装备', text: '副本会掉落不同部位和品质的装备。锁定重要装备后，可安全出售其余物品换取金币。' },
            { title: '祝福路线', text: '角色升级会获得祝福点。英勇、奥术、坚毅和启迪分别强化输出、元素、生存与资源能力；启迪路线还能提高开局手牌或每回合抽牌，且会与等级提供的基础抽牌叠加。' },
        ],
        example: { title: '稳定成长路线', text: '先升级初始卡组中的高频核心牌，再替换装备并投入一条主祝福路线。避免同时升级大量暂时不会进入卡组的卡牌。' },
        mistakes: ['出售未锁定但准备保留的装备', '平均投入所有祝福树，导致关键高阶节点迟迟无法解锁'],
        tip: '新机制上线后会在这里追加独立章节，现有章节顺序和页面结构无需调整。',
    },
    {
        id: 'advanced', code: '07', kicker: 'ADVANCED TACTICS', title: '进阶机制',
        summary: '掌握队列构成、职业专属牌与跨回合效果后，可以围绕明确战术而不是单张强牌构筑卡组。',
        points: [
            { title: '队列构成', text: '部分牌检查此前类别数量、连续攻击流派或自身所处位置。结算顺序从队列左侧开始，特殊牌通常会自动置于最左侧。' },
            { title: '职业专属', text: '职业增伤只作用于对应职业的专属进攻或技能牌，不会强化通用牌。上挑属于剑士，上勾拳属于格斗家。' },
            { title: '跨回合效果', text: '预定卡牌、下一回合增伤和延迟恢复会在后续自身回合开始时触发；“亮出你的剑”一类整场效果则会持续到本次战斗结束。' },
        ],
        example: { title: '格斗家蓄势回合', text: '本回合使用“秣兵历马”准备增伤；下一回合再打出格斗家专属进攻或技能牌。“连环勾拳”则会连续三个回合提供同等级上勾拳。' },
        mistakes: ['用通用进攻牌测试职业专属增伤，误以为效果没有生效', '忽略延迟效果，在触发前退出战斗或改变整个回合计划'],
        tip: '构筑时先确定一条核心触发链，再用回能、防守和检索牌保证它能稳定出现。',
    },
];

export const PEAK_CARD_RARITIES = {
    common: { name: '普通', color: '#d9e0e7', deckLimit: 3 },
    excellent: { name: '优秀', color: '#59d18d', deckLimit: 3 },
    rare: { name: '稀有', color: '#59a9ff', deckLimit: 2 },
    scarce: { name: '罕见', color: '#b46cff', deckLimit: 2 },
    legendary: { name: '传说', color: '#ff9a45', deckLimit: 1 },
    epic: { name: '史诗', color: '#ffe06c', deckLimit: 1 },
    mythic: { name: '神话', color: '#f0b7ff', deckLimit: 1, reserved: true },
};

const blessing = (id, name, tree, tier, maxRank, goldBase, goldGrowth, description, effects, requires = []) => ({
    id, name, tree, tier, maxRank, goldBase, goldGrowth, description, effects, requires,
});

const HEROIC_BLESSINGS = [
    blessing('heroic_strength', '力量锤炼', 'heroic', 1, 3, 80, 40, '每级提高4点力量。', [{ type: 'stat', stat: 'strength', value: 4 }]),
    blessing('heroic_edge', '兵刃研习', 'heroic', 1, 3, 80, 40, '每级提高4点物理攻击。', [{ type: 'stat', stat: 'physicalAttack', value: 4 }]),
    blessing('heroic_precision', '弱点瞄准', 'heroic', 2, 3, 220, 100, '每级提高2点物理暴击。', [{ type: 'stat', stat: 'physicalCrit', value: 2 }], ['heroic_strength']),
    blessing('heroic_breaker', '破甲训练', 'heroic', 2, 3, 220, 100, '每级获得3%物理穿透。', [{ type: 'stat', stat: 'physicalPenetration', value: 3 }], ['heroic_edge']),
    blessing('heroic_fervor', '决胜战意', 'heroic', 3, 2, 520, 260, '每级提高3点暴击伤害与2点伤害增加。', [{ type: 'stat', stat: 'criticalDamage', value: 3 }, { type: 'stat', stat: 'damageIncrease', value: 2 }], ['heroic_precision']),
    blessing('heroic_force', '百炼劲力', 'heroic', 3, 2, 520, 260, '每级提高6点独立攻击与2点技能攻击。', [{ type: 'stat', stat: 'independentAttack', value: 6 }, { type: 'stat', stat: 'skillAttack', value: 2 }], ['heroic_breaker']),
    blessing('heroic_execution', '必杀一击', 'heroic', 4, 1, 1100, 0, '每回合首张进攻牌必定暴击。', [{ type: 'firstAttackGuaranteedCrit', value: 1 }], ['heroic_fervor']),
    blessing('heroic_mastery', '连锁破军', 'heroic', 4, 1, 1100, 0, '出牌队列第3张牌造成的伤害提高50%。', [{ type: 'queueDamageBonus', position: 3, value: 50 }], ['heroic_force']),
    blessing('heroic_warlord', '必杀锋芒', 'heroic', 5, 2, 1500, 700, '每级使必杀一击的暴击伤害额外提高10%。', [{ type: 'firstAttackCritDamage', value: 10 }], ['heroic_execution']),
    blessing('heroic_annihilation', '破军深化', 'heroic', 5, 2, 1500, 700, '1级使第3张牌增伤提高至60%；2级再使第2张牌伤害提高15%。', [{ type: 'queueDamageUpgrade', values: [{ 3: 60 }, { 2: 15, 3: 60 }] }], ['heroic_mastery']),
    blessing('heroic_apex', '战神降临', 'heroic', 6, 1, 3500, 0, '所有进攻牌伤害提高12%，必杀一击额外获得20%暴击伤害。', [{ type: 'categoryDamageBonus', category: 'attack', value: 12 }, { type: 'firstAttackCritDamage', value: 20 }], ['heroic_warlord', 'heroic_annihilation']),
];

const ARCANE_BLESSINGS = [
    blessing('arcane_intellect', '炽暗刻印', 'arcane', 1, 3, 80, 40, '每级提高6点火属性强化与6点暗属性强化。', [{ type: 'stat', stat: 'fireElement', value: 6 }, { type: 'stat', stat: 'darkElement', value: 6 }]),
    blessing('arcane_focus', '元素凝核', 'arcane', 1, 3, 80, 40, '每级提高5点独立攻击。', [{ type: 'stat', stat: 'independentAttack', value: 5 }]),
    blessing('arcane_precision', '寒光刻印', 'arcane', 2, 3, 220, 100, '每级提高6点冰属性强化与6点光属性强化。', [{ type: 'stat', stat: 'iceElement', value: 6 }, { type: 'stat', stat: 'lightElement', value: 6 }], ['arcane_intellect']),
    blessing('arcane_piercing', '灵能穿透', 'arcane', 2, 3, 220, 100, '每级获得4%元素穿透。', [{ type: 'stat', stat: 'elementalPenetration', value: 4 }], ['arcane_focus']),
    blessing('arcane_resonance', '元素共振', 'arcane', 3, 2, 520, 260, '每级提高5点全属性强化与3%元素穿透。', [{ type: 'stat', stat: 'allElement', value: 5 }, { type: 'stat', stat: 'elementalPenetration', value: 3 }], ['arcane_precision']),
    blessing('arcane_core', '奥能回路', 'arcane', 3, 2, 520, 260, '每级提高3点技能攻击与4点全属性强化。', [{ type: 'stat', stat: 'skillAttack', value: 3 }, { type: 'stat', stat: 'allElement', value: 4 }], ['arcane_piercing']),
    blessing('arcane_overload', '元素蔓延', 'arcane', 4, 1, 1100, 0, '施加负面状态时，层数额外增加1层。', [{ type: 'harmfulStatusStackBonus', value: 1 }], ['arcane_resonance']),
    blessing('arcane_rupture', '奥能虹吸', 'arcane', 4, 1, 1100, 0, '每回合首张技能牌的MP消耗减半。', [{ type: 'firstSkillMpDiscount', value: 50 }], ['arcane_core']),
    blessing('arcane_archmage', '蔓延深化', 'arcane', 5, 2, 1500, 700, '1级使负面状态再额外增加1层；2级再使持续时间增加1回合。', [{ type: 'statusSpreadUpgrade', values: [{ stacks: 1, duration: 0 }, { stacks: 1, duration: 1 }] }], ['arcane_overload']),
    blessing('arcane_void', '虹吸增幅', 'arcane', 5, 2, 1500, 700, '首张技能牌MP消耗依次降低65%/80%。', [{ type: 'firstSkillMpDiscount', values: [65, 80] }], ['arcane_rupture']),
    blessing('arcane_apex', '奥术奇点', 'arcane', 6, 1, 3500, 0, '所有技能牌伤害提高12%，并额外获得10%元素穿透。', [{ type: 'categoryDamageBonus', category: 'skill', value: 12 }, { type: 'stat', stat: 'elementalPenetration', value: 10 }], ['arcane_archmage', 'arcane_void']),
];

const FORTITUDE_BLESSINGS = [
    blessing('fortitude_vitality', '体魄训练', 'fortitude', 1, 3, 80, 40, '每级提高4点体力。', [{ type: 'stat', stat: 'vitality', value: 4 }]),
    blessing('fortitude_spirit', '精神壁垒', 'fortitude', 1, 3, 80, 40, '每级提高4点精神。', [{ type: 'stat', stat: 'spirit', value: 4 }]),
    blessing('fortitude_armor', '钢铁皮肤', 'fortitude', 2, 3, 220, 100, '每级提高12点物理防御。', [{ type: 'stat', stat: 'physicalDefense', value: 12 }], ['fortitude_vitality']),
    blessing('fortitude_ward', '魔力抗性', 'fortitude', 2, 3, 220, 100, '每级提高12点魔法防御。', [{ type: 'stat', stat: 'magicalDefense', value: 12 }], ['fortitude_spirit']),
    blessing('fortitude_life', '生命拓展', 'fortitude', 3, 2, 520, 260, '每级提高60点生命与1点伤害减免。', [{ type: 'stat', stat: 'hp', value: 60 }, { type: 'stat', stat: 'damageReduction', value: 1 }], ['fortitude_armor']),
    blessing('fortitude_mana', '深层灵池', 'fortitude', 3, 2, 520, 260, '每级提高10点MP与1点伤害减免。', [{ type: 'stat', stat: 'mp', value: 10 }, { type: 'stat', stat: 'damageReduction', value: 1 }], ['fortitude_ward']),
    blessing('fortitude_reduction', '不破壁垒', 'fortitude', 4, 1, 1100, 0, '回合结束时保留100%剩余护盾至下回合。', [{ type: 'shieldRetentionPercent', value: 100 }], ['fortitude_life']),
    blessing('fortitude_guard', '灵能转化', 'fortitude', 4, 1, 1100, 0, '自身回合结束时，将剩余MP的50%转化为护盾。', [{ type: 'endTurnMpShieldPercent', value: 50 }], ['fortitude_mana']),
    blessing('fortitude_colossus', '壁垒增幅', 'fortitude', 5, 2, 1500, 700, '继承护盾时，使保留量依次提高10%/20%，最高不超过最大生命。', [{ type: 'shieldCarryAmplify', values: [10, 20] }], ['fortitude_reduction']),
    blessing('fortitude_bastion', '转化增幅', 'fortitude', 5, 2, 1500, 700, '灵能转化比例依次提高至70%/90%。', [{ type: 'endTurnMpShieldPercent', values: [70, 90] }], ['fortitude_guard']),
    blessing('fortitude_apex', '不灭之躯', 'fortitude', 6, 1, 3500, 0, '每场战斗首次受到致命伤害时保留1点生命，并获得15%最大生命护盾。', [{ type: 'blessingLastStand', shieldPercent: 15 }], ['fortitude_colossus', 'fortitude_bastion']),
];

const INSIGHT_BLESSINGS = [
    blessing('insight_gold', '寻宝直觉', 'insight', 1, 3, 60, 30, '每级提高1%副本金币收益。', [{ type: 'goldBonus', value: 1 }]),
    blessing('insight_xp', '求知若渴', 'insight', 1, 3, 60, 30, '每级提高1%角色经验收益。', [{ type: 'xpBonus', value: 1 }]),
    blessing('insight_elements', '广博学识', 'insight', 2, 3, 220, 100, '每级提高2点全属性强化。', [{ type: 'stat', stat: 'allElement', value: 2 }], ['insight_gold']),
    blessing('insight_resource', '资源规划', 'insight', 2, 3, 220, 100, '每级提高5点MP。', [{ type: 'stat', stat: 'mp', value: 5 }], ['insight_xp']),
    blessing('insight_cycle', '战术循环', 'insight', 3, 2, 520, 260, '每级提高3点独立攻击与2点技能攻击。', [{ type: 'stat', stat: 'independentAttack', value: 3 }, { type: 'stat', stat: 'skillAttack', value: 2 }], ['insight_elements']),
    blessing('insight_balance', '攻守兼备', 'insight', 3, 2, 520, 260, '每级提高2点伤害增加与2点伤害减免。', [{ type: 'stat', stat: 'damageIncrease', value: 2 }, { type: 'stat', stat: 'damageReduction', value: 2 }], ['insight_resource']),
    blessing('insight_draw_master', '抽牌大师', 'insight', 4, 1, 1100, 0, '每2回合额外抽1张牌。', [{ type: 'drawInterval', value: 2 }], ['insight_cycle']),
    blessing('insight_composure', '战术调度', 'insight', 4, 1, 1100, 0, '开局额外抽2张牌。', [{ type: 'openingHandBonus', value: 2 }], ['insight_balance']),
    blessing('insight_card_master', '卡牌大师', 'insight', 5, 2, 1500, 700, '1级在抽牌大师触发时恢复4MP；2级升级为每回合额外抽1张牌。', [{ type: 'drawMasterUpgrade', values: [{ interval: 2, restoreMp: 4 }, { interval: 1, restoreMp: 4 }] }], ['insight_draw_master']),
    blessing('insight_sage', '先机扩张', 'insight', 5, 2, 1500, 700, '每级使战术调度的开局额外抽牌数增加1张。', [{ type: 'openingHandBonus', value: 1 }], ['insight_composure']),
    blessing('insight_apex', '全知领域', 'insight', 6, 1, 3500, 0, '每回合打出的第一张牌少消耗5MP，并提高2%金币与经验收益。', [{ type: 'firstCardMpReduction', value: 5 }, { type: 'goldBonus', value: 2 }, { type: 'xpBonus', value: 2 }], ['insight_card_master', 'insight_sage']),
];

export const PEAK_BLESSING_TREES = {
    heroic: { id: 'heroic', name: '英勇', subtitle: '物理专精', color: '#e85e4f', nodes: HEROIC_BLESSINGS },
    arcane: { id: 'arcane', name: '奥术', subtitle: '元素与状态专精', color: '#8f7ee7', nodes: ARCANE_BLESSINGS },
    fortitude: { id: 'fortitude', name: '坚毅', subtitle: '生存专精', color: '#58a98b', nodes: FORTITUDE_BLESSINGS },
    insight: { id: 'insight', name: '启迪', subtitle: '通用专精', color: '#d6ad4f', nodes: INSIGHT_BLESSINGS },
};
export const PEAK_BLESSING_BY_ID = Object.fromEntries(Object.values(PEAK_BLESSING_TREES).flatMap((tree) => tree.nodes).map((node) => [node.id, node]));

export const PEAK_COMBAT_STATES = {
    standing: '站立',
    launched: '击飞',
    airborne: '浮空',
    knockedDown: '击倒',
    stunned: '眩晕',
};

export const PEAK_TACTICAL_DECLARATIONS = Object.freeze([
    {
        id: 'measured_sequence', name: '严整序列', tone: '#71c5d8',
        description: '本回合实际结算的卡牌正好为4张。',
        condition: { type: 'exactCards', value: 4 },
        rewards: [{ type: 'shield', value: 32 }, { type: 'guard', reduction: 30, uses: 1, duration: 2 }], rewardText: '获得32护盾与1次30%格挡',
    },
    {
        id: 'combined_arms', name: '合式调度', tone: '#b58bdd',
        description: '本回合实际结算至少3种不同卡牌类别。',
        condition: { type: 'distinctCategories', value: 3 },
        rewards: [{ type: 'restoreMp', value: 15 }, { type: 'nextTurnDraw', value: 1 }], rewardText: '恢复15MP，下回合额外抽1张',
    },
    {
        id: 'pure_assault', name: '纯攻压制', tone: '#e97867',
        description: '本回合至少结算3张牌，且全部为进攻牌。',
        condition: { type: 'allCategory', category: 'attack', minimum: 3 },
        rewards: [{ type: 'nextTurnDraw', value: 2 }, { type: 'empower', category: 'attack', value: 20, uses: 1 }], rewardText: '下回合多抽2张，下一张进攻牌+20%',
    },
    {
        id: 'aerial_route', name: '升空连段', tone: '#e1b85a',
        description: '本回合完成站立→击飞→浮空的状态路线。',
        condition: { type: 'stateRoute', route: ['standing', 'launched', 'airborne'] },
        rewards: [{ type: 'empower', category: 'skill', value: 25, uses: 2 }], rewardText: '后续2张技能牌伤害提高25%',
    },
    {
        id: 'iron_bastion', name: '坚壁枪阵', tone: '#6fa4c8',
        description: '本回合至少结算2张牌，且全部为防守牌。',
        condition: { type: 'allCategory', category: 'defense', minimum: 2 },
        rewards: [{ type: 'shield', value: 24 }, { type: 'guard', reduction: 45, uses: 1, duration: 2 }], rewardText: '获得24护盾与1次45%格挡',
    },
    {
        id: 'arcane_barrage', name: '术式齐发', tone: '#c982e8',
        description: '本回合至少结算3张牌，且全部为技能牌。',
        condition: { type: 'allCategory', category: 'skill', minimum: 3 },
        rewards: [{ type: 'statusWard', value: 2, duration: 2 }, { type: 'restoreMp', value: 12 }], rewardText: '获得2次异常屏障并恢复12MP',
    },
    {
        id: 'relentless_combo', name: '连击如潮', tone: '#ef8b62',
        description: '本回合对目标累计命中至少4次。',
        condition: { type: 'minimumHits', value: 4 },
        rewards: [{ type: 'empower', category: 'attack', value: 25, uses: 2 }], rewardText: '后续2张进攻牌伤害提高25%',
    },
    {
        id: 'break_the_line', name: '一鼓破阵', tone: '#e4c45f',
        description: '本回合累计伤害达到目标最大生命的20%。',
        condition: { type: 'damagePercent', value: 20 },
        rewards: [{ type: 'healPercent', value: 10 }, { type: 'cleanse', value: 2 }], rewardText: '恢复10%最大生命并净化2种异常',
    },
]);

const stateAfterCard = (card, currentState) => card.attackState?.to || card.effects?.reduce((state, effect) => effect.type === 'setState' ? effect.value : state, currentState) || currentState;

export const validatePeakCardTargetState = (card, currentState = 'standing') => {
    const nextState = stateAfterCard(card, currentState);
    if (card.category === 'attack') {
        const allowedStates = card.attackState?.from || ['standing'];
        if (!allowedStates.includes(currentState)) return { valid: false, nextState, allowedStates, reason: 'stateNotAccepted' };
        if (currentState !== 'standing' && nextState === currentState && !card.attackState?.allowSame) return { valid: false, nextState, allowedStates, reason: 'stateUnchanged' };
        return { valid: true, nextState, allowedStates };
    }
    const allowedStates = card.requiresTargetState || [];
    return { valid: !allowedStates.length || allowedStates.includes(currentState), nextState, allowedStates, reason: 'stateNotAccepted' };
};

export const getPeakCardResultState = (card, currentState = 'standing') => stateAfterCard(card, currentState);

export const PEAK_STATUS_EFFECTS = {
    burn: { name: '灼烧', color: '#ff7043', harmful: true, maxStacks: 12, description: '回合开始受到每层1%当前生命的物理伤害，随后层数减半（最多12层）。' },
    poison: { name: '中毒', color: '#77cb65', harmful: true, maxStacks: 10, description: '回合开始受到每层0.6%最大生命的魔法伤害，随后层数减半（最多10层）。' },
    frozen: { name: '冰冻', color: '#71d9f1', harmful: true, maxStacks: 8, description: '每层使造成的伤害降低3%，自身回合结束时层数减半（最多8层）。' },
    bleed: { name: '流血', color: '#e85962', harmful: true, description: '回合结束时受到无视防御的伤害。' },
    weak: { name: '虚弱', color: '#9aa7b0', harmful: true, maxStacks: 1, description: '造成的伤害降低15%；强度不叠加，重复施加刷新持续时间。' },
    vulnerable: { name: '易伤', color: '#f0a15a', harmful: true, maxStacks: 1, description: '受到的伤害提高20%；强度不叠加，重复施加刷新持续时间。' },
    regeneration: { name: '再生', color: '#59d18d', harmful: false, description: '回合结束时恢复生命。' },
};

export const PEAK_CARD_BALANCE = {
    common: { base: 24, scaling: 1.2, sustainBase: 22, sustainScaling: 1.15, buff: 6, stacks: 1, duration: 2, condition: .1, draw: 1, cleanse: 1, mpRecovery: 12, missingHeal: 5, retainShield: 12, empower: 5, convert: 0, recycle: 1, costFloor: 2, cost: 3, growth: .04 },
    excellent: { base: 38, scaling: 1.75, sustainBase: 34, sustainScaling: 1.65, buff: 9, stacks: 2, duration: 3, condition: .14, draw: 2, cleanse: 1, mpRecovery: 14, missingHeal: 7, retainShield: 18, empower: 7, convert: 15, recycle: 1, costFloor: 4, cost: 6, growth: .046 },
    rare: { base: 55, scaling: 2.45, sustainBase: 49, sustainScaling: 2.2, buff: 13, stacks: 3, duration: 3, condition: .18, draw: 2, cleanse: 1, mpRecovery: 18, missingHeal: 10, retainShield: 22, empower: 10, convert: 20, recycle: 1, costFloor: 7, cost: 9, growth: .05 },
    scarce: { base: 68, scaling: 2.85, sustainBase: 59, sustainScaling: 2.5, buff: 15, stacks: 3, duration: 4, condition: .2, draw: 2, cleanse: 2, mpRecovery: 20, missingHeal: 12, retainShield: 25, empower: 12, convert: 23, recycle: 2, costFloor: 8, cost: 11, growth: .052 },
    legendary: { base: 80, scaling: 3.2, sustainBase: 68, sustainScaling: 2.8, buff: 18, stacks: 4, duration: 4, condition: .22, draw: 2, cleanse: 2, mpRecovery: 22, missingHeal: 13, retainShield: 28, empower: 13, convert: 25, recycle: 2, costFloor: 10, cost: 14, growth: .055 },
    epic: { base: 108, scaling: 4.1, sustainBase: 92, sustainScaling: 3.5, buff: 24, stacks: 5, duration: 4, condition: .25, draw: 3, cleanse: 2, mpRecovery: 26, missingHeal: 17, retainShield: 35, empower: 17, convert: 30, recycle: 2, costFloor: 14, cost: 18, growth: .06 },
};
const balanceScaling = (scaling, maximum) => {
    const entries = Object.entries(scaling || {});
    const total = entries.reduce((sum, [, value]) => sum + Math.max(0, Number(value) || 0), 0);
    const factor = total > maximum ? maximum / total : 1;
    return Object.fromEntries(entries.map(([stat, value]) => [stat, Math.round(Math.max(0, Number(value) || 0) * factor * 1000) / 1000]));
};
const scaleBalancedScaling = (scaling, maximum, factor) => Object.fromEntries(
    Object.entries(balanceScaling(scaling, maximum)).map(([stat, value]) => [stat, Math.round(value * factor * 1000) / 1000]),
);
const SPELL_CHARGE_BUDGET_STACKS = 5;
const CLASS_MECHANIC_CAPS = {
    common: { charge: 0, chargeMax: 0, perCharge: 0, fuseTurns: 0, vowGain: 0, vowMax: 0, vowPerStack: 0, bleedPerStack: 0, blessingTurns: 0, vowShieldPerStack: 0, bleedHarvestPerStack: 0, cascadePerCharge: 0, blessingHastenBonus: 0 },
    excellent: { charge: 0, chargeMax: 0, perCharge: 0, fuseTurns: 0, vowGain: 0, vowMax: 0, vowPerStack: 0, bleedPerStack: 0, blessingTurns: 0, vowShieldPerStack: 0, bleedHarvestPerStack: 0, cascadePerCharge: 0, blessingHastenBonus: 0 },
    rare: { charge: 1, chargeMax: 3, perCharge: 10, fuseTurns: 3, vowGain: 1, vowMax: 5, vowPerStack: 8, bleedPerStack: 6, blessingTurns: 3, vowShieldPerStack: 7, bleedHarvestPerStack: 8, cascadePerCharge: 9, blessingHastenBonus: 12 },
    scarce: { charge: 2, chargeMax: 4, perCharge: 13, fuseTurns: 3, vowGain: 2, vowMax: 5, vowPerStack: 10, bleedPerStack: 7, blessingTurns: 3, vowShieldPerStack: 9, bleedHarvestPerStack: 10, cascadePerCharge: 11, blessingHastenBonus: 16 },
    legendary: { charge: 2, chargeMax: 5, perCharge: 16, fuseTurns: 2, vowGain: 2, vowMax: 5, vowPerStack: 12, bleedPerStack: 9, blessingTurns: 2, vowShieldPerStack: 11, bleedHarvestPerStack: 12, cascadePerCharge: 13, blessingHastenBonus: 20 },
    epic: { charge: 3, chargeMax: 6, perCharge: 20, fuseTurns: 2, vowGain: 3, vowMax: 5, vowPerStack: 15, bleedPerStack: 10, blessingTurns: 2, vowShieldPerStack: 14, bleedHarvestPerStack: 15, cascadePerCharge: 16, blessingHastenBonus: 25 },
};
const effectUtilityWeight = (effect) => {
    if (effect.type === 'setState' && effect.value === 'stunned') return .18;
    if (effect.type === 'status') {
        const stacks = Math.min(PEAK_STATUS_EFFECTS[effect.status]?.maxStacks || 99, Math.max(1, effect.stacks || 1));
        if (effect.status === 'burn') return .14 + (stacks - 1) * .045;
        if (effect.status === 'poison') return .15 + (stacks - 1) * .05;
        if (effect.status === 'frozen') return .11 + (stacks - 1) * .035;
        return PEAK_STATUS_EFFECTS[effect.status]?.harmful ? .08 + (stacks - 1) * .025 : .06;
    }
    if (effect.type === 'draw' || effect.type === 'drawCategory' || effect.type === 'recoverDiscard') return .16;
    if (effect.type === 'guard') return .12 + Math.max(0, (effect.reduction || 0) - 10) * .004 + Math.max(0, (effect.uses || 1) - 1) * .08;
    if (effect.type === 'statusWard') return .14 + Math.max(0, (effect.value || 1) - 1) * .08;
    if (effect.type === 'lastStand') return .34;
    if (effect.type === 'manaBarrier') return .16 + Math.max(0, (effect.ratio || 0) - 25) * .003;
    if (effect.type === 'thorns') return .14 + Math.max(0, (effect.ratio || 0) - 12) * .003;
    if (effect.type === 'damageCap') return .28;
    if (effect.type === 'shieldBreak') return .2 + Math.max(0, (effect.draw || 0) - 1) * .06;
    if (effect.type === 'restoreMp') return .11;
    if (effect.type === 'buff' || effect.type === 'empower') return .1;
    if (effect.type === 'heal' || effect.type === 'healMissing' || effect.type === 'shield') return .14;
    if (effect.type === 'cleanse' || effect.type === 'retainShield' || effect.type === 'shieldToMp') return .08;
    if (effect.type === 'spellCharge') return .06 + Math.max(0, (effect.value || 1) - 1) * .05;
    if (effect.type === 'spellChargeSpend') return Math.min(.18, Math.max(0, effect.perCharge || 0) * Math.max(1, effect.maxStacks || SPELL_CHARGE_BUDGET_STACKS) * .0018);
    if (effect.type === 'timedFuse') return Math.min(.26, Math.max(0, effect.fuseShare || 0) * .52 * Math.max(.55, 1 - Math.max(0, (effect.turns || 2) - 1) * .16));
    if (effect.type === 'vowGain') return .04 + Math.max(0, (effect.value || 1) - 1) * .03;
    if (effect.type === 'vowSpend') return Math.min(.16, Math.max(0, effect.perStack || 0) * Math.max(1, effect.maxStacks || 5) * .0016);
    if (effect.type === 'bleedAmplify') return Math.min(.12, Math.max(0, effect.perStack || 0) * Math.max(1, effect.maxStacks || 3) * .002);
    if (effect.type === 'comboEscalate') return Math.min(.11, Math.max(0, effect.perCard || 0) * Math.max(1, effect.maxCards || 4) * .0017);
    if (effect.type === 'scheduleBlessing') {
        const basePrice = effect.blessingType === 'heal' ? .14 : effect.blessingType === 'shield' ? .14 : .08;
        const delayDiscount = Math.max(.6, 1 - Math.max(0, (effect.turns || 2) - 1) * .14);
        return basePrice * delayDiscount;
    }
    if (effect.type === 'vowShield') return Math.min(.14, Math.max(0, effect.shieldPerStack || 0) * Math.max(1, effect.maxStacks || 5) * .0022);
    if (effect.type === 'bleedHarvest') return Math.min(.2, Math.max(0, effect.damagePerStack || 0) * Math.max(1, effect.maxStacks || 5) * .0026);
    if (effect.type === 'arcaneCascade') return Math.min(.22, Math.max(0, effect.damagePerCharge || 0) * Math.max(1, effect.maxCharges || SPELL_CHARGE_BUDGET_STACKS) * .003);
    if (effect.type === 'blessingHasten') return Math.min(.16, .05 + Math.max(0, effect.turns || 1) * .03 + Math.max(0, effect.bonusPercent || 0) * .0022);
    return 0;
};
const STATUS_STACK_CAPS = {
    burn: { common: 1, excellent: 2, rare: 3, scarce: 4, legendary: 4, epic: 5 },
    poison: { common: 1, excellent: 2, rare: 3, scarce: 4, legendary: 4, epic: 5 },
    frozen: { common: 1, excellent: 2, rare: 2, scarce: 3, legendary: 3, epic: 4 },
};
const getStatusStackCap = (status, rarity, fallback) => STATUS_STACK_CAPS[status]?.[rarity] ?? fallback;
const DEFENSE_MECHANIC_CAPS = {
    common: { guard: 12, uses: 1, duration: 1, counter: 0, triggerMp: 2, wards: 1, lastStandShield: 0 },
    excellent: { guard: 18, uses: 1, duration: 2, counter: 20, triggerMp: 3, wards: 1, lastStandShield: 0 },
    rare: { guard: 25, uses: 1, duration: 2, counter: 35, triggerMp: 4, wards: 1, lastStandShield: 0 },
    scarce: { guard: 29, uses: 2, duration: 3, counter: 42, triggerMp: 4, wards: 2, lastStandShield: 8 },
    legendary: { guard: 32, uses: 2, duration: 3, counter: 50, triggerMp: 5, wards: 2, lastStandShield: 12 },
    epic: { guard: 40, uses: 2, duration: 3, counter: 70, triggerMp: 6, wards: 2, lastStandShield: 20 },
};
const UNIVERSAL_DEFENSE_CAPS = {
    common: { manaRatio: 25, thorns: 12, damageCap: 0, breakHeal: 5, breakDraw: 0, uses: 1, duration: 1 },
    excellent: { manaRatio: 35, thorns: 20, damageCap: 0, breakHeal: 7, breakDraw: 1, uses: 1, duration: 2 },
    rare: { manaRatio: 0, thorns: 35, damageCap: 35, breakHeal: 10, breakDraw: 1, uses: 1, duration: 2 },
    scarce: { manaRatio: 0, thorns: 42, damageCap: 31, breakHeal: 12, breakDraw: 1, uses: 2, duration: 3 },
    legendary: { manaRatio: 0, thorns: 50, damageCap: 28, breakHeal: 15, breakDraw: 1, uses: 2, duration: 3 },
    epic: { manaRatio: 0, thorns: 70, damageCap: 20, breakHeal: 20, breakDraw: 2, uses: 2, duration: 3 },
};
const numericEffectFactor = (effect, effects, cardExtra = {}) => {
    if (!['damage', 'shield', 'heal'].includes(effect.type)) return 1;
    const restrictionCredit = effect.type === 'damage' && cardExtra.requiresTargetState?.length ? .1 : 0;
    const utility = Math.max(0, effects.reduce((total, candidate) => candidate === effect ? total : total + effectUtilityWeight(candidate), 0) - restrictionCredit);
    return Math.max(.72, Math.round((1 - utility) * 100) / 100);
};
const attackVersatilityFactor = (cardExtra = {}) => {
    const state = cardExtra.attackState;
    if (!state?.from?.length) return 1;
    const entryPenalty = state.from.length >= 3 ? .28 : state.from.length === 2 ? .1 : 0;
    const repeatPenalty = state.allowSame ? .06 : 0;
    return Math.max(.62, 1 - entryPenalty - repeatPenalty);
};
const balanceEffects = (effects, profile, cardExtra = {}) => {
    const damageCount = effects.filter((candidate) => candidate.type === 'damage').length;
    const perHit = cardExtra.damageBudget === 'perHit';
    const damageBase = effects.reduce((sum, effect) => sum + (effect.type === 'damage' ? Math.max(0, effect.base || 0) : 0), 0);
    const damageScaling = effects.reduce((sum, effect) => sum + (effect.type === 'damage' ? Object.values(effect.scaling || {}).reduce((total, value) => total + Math.max(0, value), 0) : 0), 0);
    const balanced = effects.map((effect) => {
        const defenseCaps = DEFENSE_MECHANIC_CAPS[cardExtra.rarity] || DEFENSE_MECHANIC_CAPS.common;
        const classCaps = CLASS_MECHANIC_CAPS[cardExtra.rarity] || CLASS_MECHANIC_CAPS.common;
        const versatility = effect.type === 'damage' ? attackVersatilityFactor(cardExtra) : 1;
        const damageShare = effect.type === 'damage' && !perHit ? 1 / Math.max(1, damageCount) : 1;
        const trueDamageFactor = effect.type === 'damage' && effect.damageType === 'true' ? .68 : 1;
        const factor = numericEffectFactor(effect, effects, cardExtra) * versatility * damageShare * trueDamageFactor;
        const sustain = effect.type === 'shield' || effect.type === 'heal';
        const baseCap = effect.type === 'restoreMp' ? profile.mpRecovery : sustain ? profile.sustainBase : profile.base;
        const scalingCap = sustain ? profile.sustainScaling : profile.scaling;
        return {
            ...effect,
            ...(Number.isFinite(effect.base) ? { base: Math.round(Math.min(baseCap, Math.max(0, effect.base) * (perHit && effect.type === 'damage' ? Math.min(1, profile.base / Math.max(1, damageBase)) : 1)) * factor) } : {}),
            ...(effect.scaling ? { scaling: scaleBalancedScaling(effect.scaling, scalingCap, factor * (perHit && effect.type === 'damage' ? Math.min(1, profile.scaling / Math.max(.001, damageScaling)) : 1)) } : {}),
            ...(effect.type === 'buff' ? { value: Math.min(profile.buff, Math.max(0, effect.value || 0)), duration: Math.min(profile.duration, Math.max(1, effect.duration || 1)) } : {}),
            ...(effect.type === 'status' ? { stacks: Math.min(PEAK_STATUS_EFFECTS[effect.status]?.maxStacks || 99, getStatusStackCap(effect.status, cardExtra.rarity, profile.stacks), Math.max(1, effect.stacks || 1)), duration: Math.min(profile.duration, Math.max(1, effect.duration || 1)) } : {}),
            ...(effect.type === 'draw' ? { value: Math.min(profile.draw, Math.max(1, effect.value || 1)) } : {}),
            ...(effect.type === 'drawCategory' ? { value: effects.length === 1 ? profile.draw : Math.min(profile.recycle, Math.max(1, effect.value || 1)) } : {}),
            ...(effect.type === 'recoverDiscard' ? { value: Math.min(profile.recycle, Math.max(1, effect.value || 1)) } : {}),
            ...(effect.type === 'cleanse' ? { value: Math.min(profile.cleanse, Math.max(1, effect.value || 1)) } : {}),
            ...(effect.type === 'healMissing' ? { value: Math.min(profile.missingHeal, Math.max(1, effect.value || 1)) } : {}),
            ...(effect.type === 'retainShield' ? { value: Math.min(profile.retainShield, Math.max(1, effect.value || 1)) } : {}),
            ...(effect.type === 'empower' ? { value: Math.min(profile.empower, Math.max(1, effect.value || 1)), uses: 1 } : {}),
            ...(effect.type === 'shieldToMp' ? { value: Math.min(profile.convert, Math.max(0, effect.value || 0)) } : {}),
            ...(effect.type === 'guard' ? {
                reduction: Math.min(defenseCaps.guard, Math.max(1, effect.reduction || 1)),
                uses: Math.min(defenseCaps.uses, Math.max(1, effect.uses || 1)),
                duration: Math.min(defenseCaps.duration, Math.max(1, effect.duration || 1)),
                counterRatio: Math.min(defenseCaps.counter, Math.max(0, effect.counterRatio || 0)),
                restoreMp: Math.min(defenseCaps.triggerMp, Math.max(0, effect.restoreMp || 0)),
            } : {}),
            ...(effect.type === 'statusWard' ? { value: Math.min(defenseCaps.wards, Math.max(1, effect.value || 1)), duration: Math.min(defenseCaps.duration, Math.max(1, effect.duration || 1)) } : {}),
            ...(effect.type === 'lastStand' ? { value: 1, shieldPercent: Math.min(defenseCaps.lastStandShield, Math.max(0, effect.shieldPercent || 0)), duration: Math.min(defenseCaps.duration, Math.max(1, effect.duration || 1)) } : {}),
            ...(effect.type === 'manaBarrier' ? { ratio: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).manaRatio, Math.max(1, effect.ratio || 1)), uses: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).uses, Math.max(1, effect.uses || 1)), duration: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).duration, Math.max(1, effect.duration || 1)) } : {}),
            ...(effect.type === 'thorns' ? { ratio: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).thorns, Math.max(1, effect.ratio || 1)), uses: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).uses, Math.max(1, effect.uses || 1)), duration: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).duration, Math.max(1, effect.duration || 1)) } : {}),
            ...(effect.type === 'damageCap' ? { ratio: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).damageCap, Math.max(1, effect.ratio || 1)), uses: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).uses, Math.max(1, effect.uses || 1)), duration: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).duration, Math.max(1, effect.duration || 1)) } : {}),
            ...(effect.type === 'shieldBreak' ? { healPercent: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).breakHeal, Math.max(0, effect.healPercent || 0)), draw: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).breakDraw, Math.max(0, effect.draw || 0)), uses: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).uses, Math.max(1, effect.uses || 1)), duration: Math.min((UNIVERSAL_DEFENSE_CAPS[cardExtra.rarity] || UNIVERSAL_DEFENSE_CAPS.common).duration, Math.max(1, effect.duration || 1)) } : {}),
            ...(effect.type === 'spellCharge' ? { value: Math.min(classCaps.charge, Math.max(0, effect.value || 0)), max: Math.min(classCaps.chargeMax, Math.max(1, effect.max || 1)) } : {}),
            ...(effect.type === 'spellChargeSpend' ? { perCharge: Math.min(classCaps.perCharge, Math.max(0, effect.perCharge || 0)) } : {}),
            ...(effect.type === 'timedFuse' ? { turns: Math.min(Math.max(1, classCaps.fuseTurns), Math.max(1, effect.turns || 1)) } : {}),
            ...(effect.type === 'vowGain' ? { value: Math.min(Math.max(1, classCaps.vowGain), Math.max(1, effect.value || 1)), maxStacks: Math.max(1, classCaps.vowMax || 5) } : {}),
            ...(effect.type === 'vowSpend' ? { perStack: Math.min(classCaps.vowPerStack, Math.max(0, effect.perStack || 0)), maxStacks: Math.max(1, classCaps.vowMax || 5) } : {}),
            ...(effect.type === 'bleedAmplify' ? { perStack: Math.min(classCaps.bleedPerStack, Math.max(0, effect.perStack || 0)), maxStacks: Math.max(1, Math.min(9, effect.maxStacks || 5)) } : {}),
            ...(effect.type === 'comboEscalate' ? { perCard: Math.max(1, Math.min(20, Math.floor(effect.perCard || 6))), maxCards: Math.max(1, Math.min(6, Math.floor(effect.maxCards || 4))) } : {}),
            ...(effect.type === 'scheduleBlessing' ? { turns: Math.min(Math.max(1, classCaps.blessingTurns), Math.max(1, effect.turns || 1)) } : {}),
            ...(effect.type === 'vowShield' ? { shieldPerStack: Math.min(classCaps.vowShieldPerStack, Math.max(0, effect.shieldPerStack || 0)), maxStacks: Math.max(1, classCaps.vowMax || 5) } : {}),
            ...(effect.type === 'bleedHarvest' ? { damagePerStack: Math.min(classCaps.bleedHarvestPerStack, Math.max(0, effect.damagePerStack || 0)), maxStacks: Math.max(1, Math.min(9, effect.maxStacks || 5)) } : {}),
            ...(effect.type === 'arcaneCascade' ? { damagePerCharge: Math.min(classCaps.cascadePerCharge, Math.max(0, effect.damagePerCharge || 0)), maxCharges: Math.max(1, Math.min(SPELL_CHARGE_BUDGET_STACKS + 1, effect.maxCharges || SPELL_CHARGE_BUDGET_STACKS)) } : {}),
            ...(effect.type === 'blessingHasten' ? { turns: Math.max(1, Math.min(2, Math.floor(effect.turns || 1))), bonusPercent: Math.min(classCaps.blessingHastenBonus, Math.max(0, effect.bonusPercent || 0)) } : {}),
        };
    });
    if (damageCount > 1) {
        const damageIndexes = balanced.flatMap((effect, index) => effect.type === 'damage' ? [index] : []);
        const baseTotal = damageIndexes.reduce((sum, index) => sum + (balanced[index].base || 0), 0);
        if (baseTotal > profile.base) {
            const index = damageIndexes.at(-1);
            balanced[index].base = Math.max(0, (balanced[index].base || 0) - (baseTotal - profile.base));
        }
        const scalingTotal = damageIndexes.reduce((sum, index) => sum + Object.values(balanced[index].scaling || {}).reduce((inner, value) => inner + value, 0), 0);
        if (scalingTotal > profile.scaling) {
            const scale = profile.scaling / scalingTotal;
            damageIndexes.forEach((index) => {
                balanced[index].scaling = Object.fromEntries(Object.entries(balanced[index].scaling || {}).map(([key, value]) => [key, Math.round(value * scale * 1000) / 1000]));
            });
            let overflowUnits = damageIndexes.reduce((sum, index) => sum + Object.values(balanced[index].scaling || {}).reduce((inner, value) => inner + Math.round(value * 1000), 0), 0) - Math.round(profile.scaling * 1000);
            for (const index of [...damageIndexes].reverse()) {
                if (overflowUnits <= 0) break;
                const entries = Object.entries(balanced[index].scaling || {});
                for (const [key, value] of entries.reverse()) {
                    if (overflowUnits <= 0) break;
                    const valueUnits = Math.round(value * 1000);
                    const reduction = Math.min(valueUnits, overflowUnits);
                    balanced[index].scaling[key] = (valueUnits - reduction) / 1000;
                    overflowUnits -= reduction;
                }
            }
        }
    }
    return balanced;
};
const ATTACK_STATE_REVISIONS = {
    wind_lift: ['launched'], basic_upper_hook: ['standing'], sword_echo_lift: ['launched'], brawler_echo_knee: ['launched'],
    mountain_launcher: ['standing', 'launched'], dragon_kick: ['standing', 'launched'], rising_knee: ['launched'], chain_uppercut: ['launched'],
    sword_guarded_rise: ['standing', 'launched'], brawler_guard_upper: ['standing', 'launched'], blood_battle_knee: ['standing', 'launched'],
    unyielding_sword_soul: ['launched', 'airborne'], skyfire_dragon: ['launched', 'airborne'],
    sword_frost_press: ['launched', 'airborne'], sword_horizon_sever: ['launched', 'airborne'], sword_winter_sentence: ['launched', 'airborne'], sword_oath_execution: ['launched', 'airborne'],
    sword_absolute_burial: ['launched', 'airborne'], sword_ashen_sky: ['launched', 'airborne'], sword_requiem_end: ['launched', 'airborne'],
    brawler_meteor_press: ['launched', 'airborne'], brawler_earthbreaker: ['launched', 'airborne'], brawler_flame_sentence: ['launched', 'airborne'], brawler_oath_crusher: ['launched', 'airborne'],
    brawler_sunfall_burial: ['launched', 'airborne'], brawler_heaven_collapse: ['launched', 'airborne'], brawler_hundred_style_end: ['launched', 'airborne'],
};
const ATTACK_DAMAGE_TYPE_REVISIONS = {
    sword_opening_glint: 'magical', sword_wound_turn: 'magical', sword_varied_cross: 'magical', sword_oath_execution: 'magical', sword_heaven_prison: 'magical',
    brawler_feel_jab: 'magical', brawler_guard_upper: 'magical', brawler_mixed_barrage: 'magical', brawler_oath_crusher: 'magical', brawler_heaven_collapse: 'magical',
    sword_linking_arc: 'true', sword_guarded_rise: 'true', sword_empty_moon: 'true', sword_earth_requiem: 'true', sword_requiem_end: 'true',
    brawler_step_hook: 'true', brawler_fourth_fist: 'true', brawler_sky_turn: 'true', brawler_ground_quake: 'true', brawler_hundred_style_end: 'true',
};
const ATTACK_STYLE_REVISIONS = {
    straight_slash: 'slash', rising_cut: 'launch', brawler_uppercut: 'launch', air_chaser: 'air', ground_sweep: 'finisher',
    mountain_launcher: 'launch', dragon_kick: 'launch', gale_chain_slash: 'slash', iron_mountain_crash: 'strike',
    breaking_wheel_kick: 'kick', crosswind_slash: 'slash', rising_knee: 'launch', crushing_blow: 'finisher',
};
const LEGACY_PER_HIT_CARDS = new Set(['archer_twin_shot', 'archer_arrow_rain', 'archer_storm_volley', 'archer_skyfall', 'storm_hunter_chain_bolt', 'shadow_marksman_night_volley']);
const FIXED_UTILITY_EFFECTS = new Set(['draw', 'drawCategory', 'recoverDiscard', 'status', 'setState', 'guard', 'statusWard', 'thorns', 'damageCap', 'manaBarrier', 'disruptCards', 'borrowDraw', 'cleanse']);

export const getPeakCardCost = (card, level = 1) => {
    const base = Math.max(0, Math.floor(Number(card?.cost) || 0));
    const effectiveLevel = Math.max(1, Math.min(card?.maxLevel || 10, Math.floor(Number(level) || 1)));
    const reduction = (card?.costGrowth || []).reduce((value, step) => effectiveLevel >= step.level ? Math.max(value, step.reduction) : value, 0);
    return base ? Math.max(1, base - reduction) : 0;
};

export const getPeakCardEffects = (card, level = 1) => {
    if (card?.utilityGrowth !== 'defense') return card?.effects || [];
    const effectiveLevel = Math.max(1, Math.min(card.maxLevel || 10, Math.floor(Number(level) || 1)));
    return card.effects.map((effect) => {
        if (effect.type === 'guard') return { ...effect, reduction: Math.min(40, effect.reduction + effectiveLevel - 1), uses: effect.uses + (effectiveLevel >= 10 ? 1 : 0) };
        if (effect.type === 'statusWard') return { ...effect, duration: Math.min(3, effect.duration + (effectiveLevel >= 5 ? 1 : 0)), value: effect.value + (effectiveLevel >= 10 ? 1 : 0) };
        return effect;
    });
};

const card = (id, name, category, rarity, classId, cost, summary, effects, extra = {}) => {
    const styledExtra = ATTACK_STYLE_REVISIONS[id] && !extra.attackStyle ? { ...extra, attackStyle: ATTACK_STYLE_REVISIONS[id] } : extra;
    const revisedFrom = ATTACK_STATE_REVISIONS[id];
    const revisedExtra = revisedFrom && styledExtra.attackState ? { ...styledExtra, attackState: { ...styledExtra.attackState, from: revisedFrom } } : styledExtra;
    const revisedDamageType = ATTACK_DAMAGE_TYPE_REVISIONS[id];
    const normalizedEffects = effects.map((effect) => effect.type === 'damage'
        ? { ...effect, damageType: revisedDamageType || effect.damageType || 'physical' }
        : effect);
    const promotesToSkill = category === 'attack' && normalizedEffects.some((effect) => effect.type === 'damage' && effect.element);
    const normalizedCategory = promotesToSkill ? 'skill' : category;
    const normalizedExtra = promotesToSkill ? (() => {
        const { attackState, ...skillExtra } = revisedExtra;
        return {
            ...skillExtra,
            requiresTargetState: skillExtra.requiresTargetState?.length ? skillExtra.requiresTargetState : [...(attackState?.from || [])],
            promotedFromAttack: true,
        };
    })() : revisedExtra;
    const profile = PEAK_CARD_BALANCE[rarity] || PEAK_CARD_BALANCE.common;
    const conditionalDamage = normalizedExtra.conditionalDamage ? { ...normalizedExtra.conditionalDamage, bonus: Math.min(profile.condition, normalizedExtra.conditionalDamage.bonus) } : undefined;
    const queueMechanic = normalizedExtra.queueMechanic ? {
        ...normalizedExtra.queueMechanic,
        damageBonus: Math.min(profile.condition, Math.max(0, Number(normalizedExtra.queueMechanic.damageBonus) || 0)),
        damageByCategoryCount: normalizedExtra.queueMechanic.damageByCategoryCount
            ? Object.fromEntries(Object.entries(normalizedExtra.queueMechanic.damageByCategoryCount).map(([count, bonus]) => [count, Math.min(profile.condition, Math.max(0, Number(bonus) || 0))]))
            : undefined,
    } : undefined;
    const mpRecovery = normalizedEffects.filter((effect) => effect.type === 'restoreMp').reduce((total, effect) => total + Math.max(0, Number(effect.base) || 0), 0);
    const pureRecovery = normalizedEffects.length === 1 && normalizedEffects[0].type === 'restoreMp';
    const recoveryDiscount = pureRecovery ? Math.ceil(mpRecovery * .35) : 0;
    const adjustedCost = Math.max(0, profile.costFloor + Math.max(0, cost) - recoveryDiscount);
    const balanceExtra = { ...(promotesToSkill ? { ...normalizedExtra, attackState: revisedExtra.attackState } : normalizedExtra), ...(LEGACY_PER_HIT_CARDS.has(id) ? { damageBudget: 'perHit' } : {}) };
    const balancedEffects = balanceEffects(normalizedEffects, profile, { ...balanceExtra, rarity });
    const fixedUtility = balancedEffects.length > 0 && balancedEffects.every((effect) => FIXED_UTILITY_EFFECTS.has(effect.type));
    const defenseGrowth = fixedUtility && balancedEffects.some((effect) => effect.type === 'guard' || effect.type === 'statusWard');
    const finalCost = Math.min(profile.cost, adjustedCost);
    return {
        id, name, category: normalizedCategory, rarity, classId, cost: finalCost, summary,
        effects: balancedEffects, level: 1, maxLevel: 10, requiresTargetState: [], tags: [],
        ...(defenseGrowth ? { utilityGrowth: 'defense' } : fixedUtility && finalCost > 1 ? { costGrowth: finalCost === 2 ? [{ level: 10, reduction: 1 }] : [{ level: 5, reduction: 1 }, { level: 10, reduction: 2 }] } : {}),
        ...normalizedExtra, conditionalDamage, queueMechanic, levelGrowth: profile.growth,
    };
};

const damage = (base, scaling, extra = {}) => ({ type: 'damage', base, scaling, ...extra });
const state = (value) => ({ type: 'setState', value });
const attackData = (style, from, to, extra = {}) => ({ attackStyle: style, attackState: { from, to, ...extra } });
const condition = (type, bonus, description, extra = {}) => ({ type, bonus, description, ...extra });

const PEAK_EXPANSION_CARDS = [
    card('swift_pierce', '迅捷刺', 'attack', 'common', 'sword', 0, '目标生命较高时略微提高伤害。', [damage(18, { physicalAttack: .55, strength: .55 })], { ...attackData('thrust', ['standing'], 'standing'), conditionalDamage: condition('targetHpAbove', .1, '目标生命高于80%时，伤害提高10%。', { threshold: .8 }), tags: ['剑士', '突刺'] }),
    card('scar_slash', '裂伤斩', 'attack', 'common', 'sword', 1, '斩击站立目标并施加轻微流血。', [damage(20, { physicalAttack: .58, strength: .62 }), { type: 'status', status: 'bleed', stacks: 1, duration: 2 }], { ...attackData('slash', ['standing'], 'standing'), tags: ['剑士', '斩击'] }),
    card('wind_lift', '追风挑', 'attack', 'common', 'sword', 1, '轻快上挑，可维持击飞状态。', [damage(18, { physicalAttack: .52, strength: .58 }), state('launched')], { ...attackData('launch', ['standing', 'airborne', 'launched'], 'launched', { allowSame: true }), tags: ['剑士', '击飞'] }),
    card('armor_splitter', '破甲斩', 'attack', 'excellent', 'sword', 2, '破开防御并施加短暂易伤。', [damage(30, { physicalAttack: .75, strength: .9 }), { type: 'status', status: 'vulnerable', stacks: 1, duration: 1 }], { ...attackData('slash', ['standing'], 'standing'), tags: ['剑士', '破甲'] }),
    card('adversity_cleave', '逆境重斩', 'attack', 'excellent', 'sword', 2, '自身生命较低时提高伤害并击倒目标。', [damage(34, { physicalAttack: .82, strength: 1.02 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'airborne'], 'knockedDown'), conditionalDamage: condition('actorHpBelow', .14, '自身生命低于40%时，伤害提高14%。', { threshold: .4 }), tags: ['剑士', '逆境'] }),
    card('chain_uppercut', '连环升斩', 'attack', 'excellent', 'sword', 2, '连续使用击飞类进攻牌时伤害提高。', [damage(29, { physicalAttack: .72, strength: .88 }), state('launched')], { ...attackData('launch', ['standing', 'airborne', 'launched'], 'launched', { allowSame: true }), conditionalDamage: condition('priorAttackStyleOnly', .12, '本回合此前只打出过击飞类进攻牌时，伤害提高12%。', { style: 'launch' }), tags: ['剑士', '击飞'] }),
    card('greatsword_pressure', '巨剑压制', 'attack', 'rare', 'sword', 3, '压制高生命目标并将其击倒。', [damage(45, { physicalAttack: 1.02, strength: 1.28 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'airborne'], 'knockedDown'), conditionalDamage: condition('targetHpAbove', .17, '目标生命高于70%时，伤害提高17%。', { threshold: .7 }), tags: ['剑士', '压制'] }),
    card('blood_cross', '血气十字斩', 'attack', 'rare', 'sword', 3, '低生命时强化十字斩并施加流血。', [damage(43, { physicalAttack: .98, strength: 1.22 }), { type: 'status', status: 'bleed', stacks: 2, duration: 2 }], { ...attackData('slash', ['standing'], 'standing'), conditionalDamage: condition('actorHpBelow', .18, '自身生命低于50%时，伤害提高18%。', { threshold: .5 }), tags: ['剑士', '斩击'] }),
    card('flowing_mind_rise', '流心升', 'attack', 'rare', 'sword', 3, '纯斩击连段后将目标送入浮空。', [damage(42, { physicalAttack: .96, strength: 1.18 }), state('airborne')], { ...attackData('slash', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('priorAttackStyleOnly', .15, '本回合此前只打出过斩击类进攻牌时，伤害提高15%。', { style: 'slash' }), tags: ['剑士', '浮空'] }),
    card('void_draw_slash', '破空拔刀', 'attack', 'legendary', 'sword', 4, '对生命充足的目标发动强力拔刀。', [damage(68, { physicalAttack: 1.38, strength: 1.65 }), state('airborne')], { ...attackData('slash', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('targetHpAbove', .19, '目标生命高于60%时，伤害提高19%。', { threshold: .6 }), tags: ['剑士', '拔刀'] }),
    card('last_blood_frenzy', '残血狂斩', 'attack', 'legendary', 'sword', 4, '生命濒危时爆发连续斩击。', [damage(65, { physicalAttack: 1.32, strength: 1.7 }), { type: 'status', status: 'bleed', stacks: 3, duration: 3 }], { ...attackData('slash', ['standing'], 'standing'), conditionalDamage: condition('actorHpBelow', .22, '自身生命低于35%时，伤害提高22%。', { threshold: .35 }), tags: ['剑士', '逆境'] }),
    card('absolute_frost_fall', '极寒坠刃', 'attack', 'legendary', 'sword', 5, '终结浮空目标并将其击倒。', [damage(72, { physicalAttack: 1.42, strength: 1.72 }, { element: 'ice' }), state('knockedDown')], { ...attackData('finisher', ['standing', 'airborne'], 'knockedDown'), conditionalDamage: condition('priorAttackStyleOnly', .18, '本回合此前只打出过击飞类进攻牌时，伤害提高18%。', { style: 'launch' }), tags: ['剑士', '冰', '终结'] }),
    card('heavenfrost_rift', '天霜裂界', 'attack', 'epic', 'sword', 6, '对高生命目标展开冰属性领域斩击。', [damage(102, { physicalAttack: 1.85, strength: 2.2 }, { element: 'ice' }), state('airborne')], { ...attackData('slash', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('targetHpAbove', .2, '目标生命高于75%时，伤害提高20%。', { threshold: .75 }), tags: ['剑士', '史诗'] }),
    card('unyielding_sword_soul', '不屈剑魂斩', 'attack', 'epic', 'sword', 6, '生命极低时爆发并将目标击飞。', [damage(98, { physicalAttack: 1.78, strength: 2.28 }), state('launched')], { ...attackData('launch', ['standing', 'airborne', 'launched'], 'launched', { allowSame: true }), conditionalDamage: condition('actorHpBelow', .25, '自身生命低于30%时，伤害提高25%。', { threshold: .3 }), tags: ['剑士', '逆境'] }),
    card('myriad_blades_united', '万剑归一', 'attack', 'epic', 'sword', 7, '纯斩击队列的最终爆发。', [damage(108, { physicalAttack: 1.92, strength: 2.35 })], { ...attackData('slash', ['standing'], 'standing'), conditionalDamage: condition('priorAttackStyleOnly', .23, '本回合此前只打出过斩击类进攻牌时，伤害提高23%。', { style: 'slash' }), tags: ['剑士', '史诗'] }),

    card('probing_jab', '试探直拳', 'attack', 'common', 'brawler', 0, '试探高生命目标的快速直拳。', [damage(18, { physicalAttack: .52, strength: .58 })], { ...attackData('strike', ['standing'], 'standing'), conditionalDamage: condition('targetHpAbove', .1, '目标生命高于80%时，伤害提高10%。', { threshold: .8 }), tags: ['格斗家', '拳击'] }),
    card('shatter_step_kick', '碎步踢', 'attack', 'common', 'brawler', 1, '连续踢击站立目标。', [damage(21, { physicalAttack: .58, strength: .64 })], { ...attackData('kick', ['standing'], 'standing'), tags: ['格斗家', '踢击'] }),
    card('basic_upper_hook', '基础上勾拳', 'attack', 'common', 'brawler', 1, '基础击飞拳，可连续衔接。', [damage(18, { physicalAttack: .52, strength: .6 }), state('launched')], { ...attackData('launch', ['standing', 'airborne', 'launched'], 'launched', { allowSame: true }), tags: ['格斗家', '击飞'] }),
    card('collapse_fist', '崩拳', 'attack', 'excellent', 'brawler', 2, '对高生命目标造成额外冲击。', [damage(32, { physicalAttack: .78, strength: .94 })], { ...attackData('strike', ['standing'], 'standing'), conditionalDamage: condition('targetHpAbove', .13, '目标生命高于75%时，伤害提高13%。', { threshold: .75 }), tags: ['格斗家', '拳击'] }),
    card('turning_heel', '旋身追踢', 'attack', 'excellent', 'brawler', 2, '将击飞目标转入浮空状态。', [damage(30, { physicalAttack: .74, strength: .9 }), state('airborne')], { ...attackData('kick', ['standing', 'launched'], 'airborne'), tags: ['格斗家', '浮空'] }),
    card('tiger_charge', '伏虎冲撞', 'attack', 'excellent', 'brawler', 2, '低生命时强化冲撞并击倒目标。', [damage(34, { physicalAttack: .82, strength: 1 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'airborne'], 'knockedDown'), conditionalDamage: condition('actorHpBelow', .14, '自身生命低于40%时，伤害提高14%。', { threshold: .4 }), tags: ['格斗家', '逆境'] }),
    card('thunder_elbow', '雷霆肘击', 'attack', 'rare', 'brawler', 3, '肘击站立目标并施加易伤。', [damage(44, { physicalAttack: 1, strength: 1.24 }), { type: 'status', status: 'vulnerable', stacks: 1, duration: 1 }], { ...attackData('strike', ['standing'], 'standing'), tags: ['格斗家', '破甲'] }),
    card('blood_battle_knee', '血战膝击', 'attack', 'rare', 'brawler', 3, '自身受伤时强化膝击并击飞目标。', [damage(43, { physicalAttack: .98, strength: 1.28 }), state('launched')], { ...attackData('launch', ['standing', 'airborne', 'launched'], 'launched', { allowSame: true }), conditionalDamage: condition('actorHpBelow', .18, '自身生命低于50%时，伤害提高18%。', { threshold: .5 }), tags: ['格斗家', '击飞'] }),
    card('relentless_kicks', '连环疾踢', 'attack', 'rare', 'brawler', 3, '纯踢击连段后将目标送入浮空。', [damage(42, { physicalAttack: .94, strength: 1.2 }), state('airborne')], { ...attackData('kick', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('priorAttackStyleOnly', .15, '本回合此前只打出过踢击类进攻牌时，伤害提高15%。', { style: 'kick' }), tags: ['格斗家', '踢击'] }),
    card('warrior_quake', '武神震脚', 'attack', 'legendary', 'brawler', 4, '震击高生命目标并使其倒地。', [damage(69, { physicalAttack: 1.38, strength: 1.68 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'airborne'], 'knockedDown'), conditionalDamage: condition('targetHpAbove', .19, '目标生命高于60%时，伤害提高19%。', { threshold: .6 }), tags: ['格斗家', '压制'] }),
    card('desperate_burst_fist', '绝境爆拳', 'attack', 'legendary', 'brawler', 4, '濒危时爆发的站立连击。', [damage(66, { physicalAttack: 1.34, strength: 1.72 })], { ...attackData('strike', ['standing'], 'standing'), conditionalDamage: condition('actorHpBelow', .22, '自身生命低于35%时，伤害提高22%。', { threshold: .35 }), tags: ['格斗家', '逆境'] }),
    card('skyfire_dragon', '天火升龙', 'attack', 'legendary', 'brawler', 5, '连续拳击后施展火焰升龙。', [damage(71, { physicalAttack: 1.4, strength: 1.75 }, { element: 'fire' }), state('launched')], { ...attackData('strike', ['standing', 'airborne', 'launched'], 'launched', { allowSame: true }), conditionalDamage: condition('priorAttackStyleOnly', .18, '本回合此前只打出过拳击类进攻牌时，伤害提高18%。', { style: 'strike' }), tags: ['格斗家', '火'] }),
    card('firmament_split_kick', '苍穹裂踢', 'attack', 'epic', 'brawler', 6, '对高生命目标施展浮空裂踢。', [damage(101, { physicalAttack: 1.84, strength: 2.22 }), state('airborne')], { ...attackData('kick', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('targetHpAbove', .2, '目标生命高于75%时，伤害提高20%。', { threshold: .75 }), tags: ['格斗家', '史诗'] }),
    card('bloodrage_collapse', '血怒崩拳', 'attack', 'epic', 'brawler', 6, '低生命时爆发并击倒目标。', [damage(99, { physicalAttack: 1.8, strength: 2.3 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'airborne'], 'knockedDown'), conditionalDamage: condition('actorHpBelow', .25, '自身生命低于30%时，伤害提高25%。', { threshold: .3 }), tags: ['格斗家', '逆境'] }),
    card('hundred_fists', '百烈神拳', 'attack', 'epic', 'brawler', 7, '纯拳击队列的最终爆发。', [damage(107, { physicalAttack: 1.9, strength: 2.38 })], { ...attackData('strike', ['standing'], 'standing'), conditionalDamage: condition('priorAttackStyleOnly', .23, '本回合此前只打出过拳击类进攻牌时，伤害提高23%。', { style: 'strike' }), tags: ['格斗家', '史诗'] }),

    card('field_bandage', '战地绷带', 'defense', 'common', 'all', 0, '恢复少量生命。', [{ type: 'heal', base: 12, scaling: { vitality: .45, spirit: .3 } }], { tags: ['通用', '恢复'] }),
    card('steady_breath', '平稳呼吸', 'buff', 'common', 'all', 0, '恢复MP。', [{ type: 'restoreMp', base: 11 }], { tags: ['通用', 'MP'] }),
    card('emergency_guard', '应急防护', 'defense', 'excellent', 'all', 1, '获得护盾并净化一个负面状态。', [{ type: 'shield', base: 24, scaling: { vitality: .8 } }, { type: 'cleanse', value: 1 }], { tags: ['通用', '净化'] }),
    card('tactical_observation', '战术观察', 'skill', 'excellent', 'all', 0, '从牌库检索两张进攻牌。', [{ type: 'drawCategory', category: 'attack', value: 2 }], { tags: ['通用', '检索'] }),
    card('elemental_resonance', '元素共鸣', 'buff', 'rare', 'all', 2, '提高全属性强化。', [{ type: 'buff', stat: 'allElement', value: 12, duration: 2 }], { tags: ['通用', '元素'] }),
    card('unyielding_barrier', '坚韧壁垒', 'defense', 'rare', 'all', 2, '获得护盾并提高伤害减免。', [{ type: 'shield', base: 38, scaling: { vitality: 1.2 } }, { type: 'buff', stat: 'damageReduction', value: 6, duration: 2 }], { tags: ['通用', '护盾'] }),
    card('life_echo', '生命回响', 'defense', 'legendary', 'all', 3, '恢复生命并获得再生。', [{ type: 'heal', base: 38, scaling: { vitality: 1.1, spirit: .8 } }, { type: 'status', status: 'regeneration', stacks: 3, duration: 3, target: 'self' }], { tags: ['通用', '再生'] }),
    card('weakness_insight', '破绽洞察', 'buff', 'legendary', 'all', 3, '提高伤害与双暴击。', [{ type: 'buff', stat: 'damageIncrease', value: 10, duration: 2 }, { type: 'buff', stat: 'physicalCrit', value: 8, duration: 2 }, { type: 'buff', stat: 'magicalCrit', value: 8, duration: 2 }], { tags: ['通用', '爆发'] }),
    card('fate_rewrite', '命运改写', 'skill', 'epic', 'all', 5, '大量补充手牌与MP。', [{ type: 'draw', value: 3 }, { type: 'restoreMp', base: 24 }], { tags: ['通用', '史诗'] }),
    card('immortal_will', '不灭意志', 'defense', 'epic', 'all', 5, '获得强力护盾、恢复生命并净化负面状态。', [{ type: 'shield', base: 72, scaling: { vitality: 1.8, spirit: .7 } }, { type: 'heal', base: 42, scaling: { vitality: .9, spirit: .8 } }, { type: 'cleanse', value: 2 }], { tags: ['通用', '史诗'] }),

    card('sword_scabbard_guard', '剑鞘格挡', 'defense', 'common', 'sword', 0, '以剑鞘形成基础护盾。', [{ type: 'shield', base: 18, scaling: { vitality: .65, physicalDefense: .1 } }], { tags: ['剑士', '护盾'] }),
    card('frost_breath_focus', '冰息凝神', 'buff', 'common', 'sword', 0, '恢复MP并短暂提高冰属性强化。', [{ type: 'restoreMp', base: 8 }, { type: 'buff', stat: 'iceElement', value: 4, duration: 1 }], { tags: ['剑士', '冰'] }),
    card('frostbody_guard', '寒霜护体', 'defense', 'excellent', 'sword', 1, '获得受冰属性强化加成的护盾。', [{ type: 'shield', base: 26, scaling: { vitality: .8, iceElement: .3 } }], { tags: ['剑士', '护盾'] }),
    card('sword_momentum', '剑势蓄积', 'buff', 'excellent', 'sword', 1, '提高力量与物理攻击。', [{ type: 'buff', stat: 'strength', value: 6, duration: 2 }, { type: 'buff', stat: 'physicalAttack', value: 6, duration: 2 }], { tags: ['剑士', '蓄力'] }),
    card('iceheart_mantra', '冰心诀', 'defense', 'rare', 'sword', 2, '恢复生命并净化负面状态。', [{ type: 'heal', base: 28, scaling: { spirit: .8, vitality: .6 } }, { type: 'cleanse', value: 1 }], { tags: ['剑士', '净化'] }),
    card('edge_insight', '锋芒洞察', 'buff', 'rare', 'sword', 2, '提高物理暴击与技能攻击力。', [{ type: 'buff', stat: 'physicalCrit', value: 7, duration: 2 }, { type: 'buff', stat: 'skillAttack', value: 6, duration: 2 }], { tags: ['剑士', '暴击'] }),
    card('sword_soul_aegis', '剑魂守护', 'defense', 'legendary', 'sword', 3, '展开高强度剑魂护盾。', [{ type: 'shield', base: 55, scaling: { vitality: 1.5, physicalDefense: .25 } }, { type: 'buff', stat: 'damageReduction', value: 7, duration: 2 }], { tags: ['剑士', '守护'] }),
    card('frostbloom_resonance', '霜华共鸣', 'buff', 'legendary', 'sword', 3, '提高冰属性强化与伤害。', [{ type: 'buff', stat: 'iceElement', value: 22, duration: 2 }, { type: 'buff', stat: 'damageIncrease', value: 8, duration: 2 }], { tags: ['剑士', '冰'] }),
    card('myriad_blade_ward', '万剑护阵', 'defense', 'epic', 'sword', 5, '获得巨额护盾并抽牌。', [{ type: 'shield', base: 78, scaling: { vitality: 1.8, physicalDefense: .3 } }, { type: 'draw', value: 2 }], { tags: ['剑士', '史诗'] }),
    card('swordgod_domain', '剑神领域', 'buff', 'epic', 'sword', 5, '全面强化剑士的爆发能力。', [{ type: 'buff', stat: 'physicalAttack', value: 18, duration: 3 }, { type: 'buff', stat: 'skillAttack', value: 12, duration: 3 }, { type: 'buff', stat: 'physicalCrit', value: 10, duration: 3 }], { tags: ['剑士', '史诗'] }),

    card('wrapped_guard', '缠手防御', 'defense', 'common', 'brawler', 0, '摆出防守姿态获得基础护盾。', [{ type: 'shield', base: 19, scaling: { vitality: .7 } }], { tags: ['格斗家', '护盾'] }),
    card('heatup_breath', '热身吐纳', 'buff', 'common', 'brawler', 0, '恢复MP并短暂提高力量。', [{ type: 'restoreMp', base: 8 }, { type: 'buff', stat: 'strength', value: 4, duration: 1 }], { tags: ['格斗家', '蓄力'] }),
    card('ironbody_stance', '铁躯架势', 'defense', 'excellent', 'brawler', 1, '获得护盾并提高物理防御。', [{ type: 'shield', base: 27, scaling: { vitality: .9 } }, { type: 'buff', stat: 'physicalDefense', value: 14, duration: 2 }], { tags: ['格斗家', '防御'] }),
    card('fighting_rhythm', '斗志节奏', 'buff', 'excellent', 'brawler', 1, '提高力量与物理攻击。', [{ type: 'buff', stat: 'strength', value: 6, duration: 2 }, { type: 'buff', stat: 'physicalAttack', value: 6, duration: 2 }], { tags: ['格斗家', '斗志'] }),
    card('meridian_recovery', '经络调息', 'defense', 'rare', 'brawler', 2, '恢复生命并获得再生。', [{ type: 'heal', base: 26, scaling: { vitality: .8, spirit: .6 } }, { type: 'status', status: 'regeneration', stacks: 2, duration: 2, target: 'self' }], { tags: ['格斗家', '恢复'] }),
    card('combat_focus', '搏击专注', 'buff', 'rare', 'brawler', 2, '提高物理暴击与技能攻击力。', [{ type: 'buff', stat: 'physicalCrit', value: 7, duration: 2 }, { type: 'buff', stat: 'skillAttack', value: 6, duration: 2 }], { tags: ['格斗家', '暴击'] }),
    card('vajra_guard', '金刚守势', 'defense', 'legendary', 'brawler', 3, '获得高额护盾与伤害减免。', [{ type: 'shield', base: 56, scaling: { vitality: 1.6 } }, { type: 'buff', stat: 'damageReduction', value: 8, duration: 2 }], { tags: ['格斗家', '守护'] }),
    card('blazing_fighting_spirit', '烈焰斗魂', 'buff', 'legendary', 'brawler', 3, '提高火属性强化与伤害。', [{ type: 'buff', stat: 'fireElement', value: 22, duration: 2 }, { type: 'buff', stat: 'damageIncrease', value: 8, duration: 2 }], { tags: ['格斗家', '火'] }),
    card('warrior_god_aegis', '武神护体', 'defense', 'epic', 'brawler', 5, '获得巨额护盾并恢复MP。', [{ type: 'shield', base: 80, scaling: { vitality: 1.9 } }, { type: 'restoreMp', base: 18 }], { tags: ['格斗家', '史诗'] }),
    card('battle_god_domain', '斗神领域', 'buff', 'epic', 'brawler', 5, '全面强化格斗家的爆发能力。', [{ type: 'buff', stat: 'physicalAttack', value: 18, duration: 3 }, { type: 'buff', stat: 'skillAttack', value: 12, duration: 3 }, { type: 'buff', stat: 'physicalCrit', value: 10, duration: 3 }], { tags: ['格斗家', '史诗'] }),
];

const PEAK_MECHANIC_CARDS = [
    card('sword_opening_glint', '瞬光试锋', 'attack', 'common', 'sword', 0, '作为本回合第一张牌时获得额外伤害。', [damage(18, { physicalAttack: .52, strength: .5 })], { ...attackData('thrust', ['standing'], 'standing'), conditionalDamage: condition('queuePositionEquals', .1, '位于队列第1张时伤害提高10%。', { position: 1 }), tags: ['剑士', '起手'] }),
    card('sword_linking_arc', '回弧连剑', 'attack', 'common', 'sword', 0, '穿插在连段后，将站立或击飞目标转入浮空。', [damage(17, { physicalAttack: .48, strength: .52 }), state('airborne')], { ...attackData('slash', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('queuePositionAtLeast', .1, '位于队列第2张或之后时伤害提高10%。', { position: 2 }), tags: ['剑士', '衔接'] }),
    card('sword_echo_lift', '回声挑剑', 'attack', 'common', 'sword', 1, '承接击飞或浮空结果时强化上挑，并维持击飞。', [damage(18, { physicalAttack: .5, strength: .54 }), state('launched')], { ...attackData('launch', ['standing', 'launched', 'airborne'], 'launched', { allowSame: true }), conditionalDamage: condition('previousResultState', .1, '上一张牌结算后目标为击飞或浮空时伤害提高10%。', { states: ['launched', 'airborne'] }), tags: ['剑士', '击飞'] }),
    card('sword_calm_opening', '静锋起势', 'buff', 'common', 'sword', 0, '作为队列第一张时获得更多物理攻击。', [{ type: 'buff', stat: 'physicalAttack', value: 2, duration: 1, dynamic: { type: 'firstCard', bonus: 2, description: '位于队列第1张时额外获得2点物理攻击。' } }], { tags: ['剑士', '起手增益'] }),

    card('sword_third_beat', '三拍连斩', 'attack', 'excellent', 'sword', 1, '连段进行到第三拍后获得额外伤害。', [damage(31, { physicalAttack: .72, strength: .82 })], { ...attackData('slash', ['standing'], 'standing'), conditionalDamage: condition('queuePositionAtLeast', .13, '位于队列第3张或之后时伤害提高13%。', { position: 3 }), tags: ['剑士', '连斩'] }),
    card('sword_wound_turn', '伤痕回旋', 'attack', 'excellent', 'sword', 1, '目标带有流血或易伤时强化回旋并转入浮空。', [damage(29, { physicalAttack: .68, strength: .8 }), state('airborne')], { ...attackData('slash', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('targetHasStatus', .13, '目标带有流血或易伤时伤害提高13%。', { statuses: ['bleed', 'vulnerable'] }), tags: ['剑士', '异常追击'] }),
    card('sword_guarded_rise', '守势升刃', 'attack', 'excellent', 'sword', 2, '自身拥有足够护盾时强化升刃，并维持击飞。', [damage(30, { physicalAttack: .7, strength: .84 }), state('launched')], { ...attackData('launch', ['standing', 'launched', 'airborne'], 'launched', { allowSame: true }), conditionalDamage: condition('actorShieldRatio', .12, '当前护盾不低于最大生命10%时伤害提高12%。', { threshold: .1 }), tags: ['剑士', '护盾联动'] }),
    card('sword_air_focus', '凌空凝锋', 'buff', 'excellent', 'sword', 1, '在目标击飞或浮空时使用，获得额外物理暴击。', [{ type: 'buff', stat: 'physicalCrit', value: 4, duration: 2, dynamic: { type: 'targetState', states: ['launched', 'airborne'], bonus: 4, description: '目标处于击飞或浮空时额外获得4点物理暴击。' } }], { tags: ['剑士', '空连增益'] }),

    card('sword_varied_cross', '百式交叉', 'attack', 'rare', 'sword', 2, '此前使用过两种攻击流派时强化交叉斩。', [damage(45, { physicalAttack: 1.02, strength: 1.2 })], { ...attackData('slash', ['standing'], 'standing'), conditionalDamage: condition('distinctAttackStyles', .17, '本回合此前使用过至少2种进攻流派时伤害提高17%。', { count: 2 }), tags: ['剑士', '流派联动'] }),
    card('sword_empty_moon', '空月折返', 'attack', 'rare', 'sword', 2, '承接击飞结果时强化折返斩并使目标浮空。', [damage(43, { physicalAttack: .98, strength: 1.18 }), state('airborne')], { ...attackData('slash', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('previousResultState', .17, '上一张牌结算后目标为击飞时伤害提高17%。', { states: ['launched'] }), tags: ['剑士', '浮空衔接'] }),
    card('sword_frost_press', '霜脊压刃', 'attack', 'rare', 'sword', 3, '消耗较多MP后强化下压，将空中目标击倒。', [damage(51, { physicalAttack: 1.08, strength: 1.36 }, { element: 'ice' }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('mpSpentRatio', .16, '本回合已消耗至少30%最大MP时伤害提高16%。', { threshold: .3 }), tags: ['剑士', '小终结'] }),
    card('sword_mixed_rhythm', '混式剑律', 'buff', 'rare', 'sword', 2, '此前使用过两种攻击流派时获得额外技能攻击。', [{ type: 'buff', stat: 'skillAttack', value: 7, duration: 2, dynamic: { type: 'distinctAttackStyles', count: 2, bonus: 6, description: '本回合此前使用过至少2种进攻流派时额外获得6点技能攻击。' } }], { tags: ['剑士', '流派增益'] }),

    card('sword_horizon_sever', '断界横天', 'attack', 'legendary', 'sword', 4, '对高生命目标施展大范围终结斩并击倒。', [damage(75, { physicalAttack: 1.48, strength: 1.72 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('targetHpAbove', .2, '目标生命高于60%时伤害提高20%。', { threshold: .6 }), tags: ['剑士', '终结'] }),
    card('sword_winter_sentence', '凛冬判决', 'attack', 'legendary', 'sword', 4, '处决带有流血或易伤的目标并将其击倒。', [damage(72, { physicalAttack: 1.42, strength: 1.7 }, { element: 'ice' }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('targetHasStatus', .21, '目标带有流血或易伤时伤害提高21%。', { statuses: ['bleed', 'vulnerable'] }), tags: ['剑士', '异常终结'] }),
    card('sword_oath_execution', '剑誓处刑', 'attack', 'legendary', 'sword', 5, '长队列消耗大量MP后发动处刑并击倒目标。', [damage(80, { physicalAttack: 1.52, strength: 1.86 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('mpSpentRatio', .22, '本回合已消耗至少45%最大MP时伤害提高22%。', { threshold: .45 }), tags: ['剑士', '资源终结'] }),
    card('sword_earth_requiem', '裂地追魂斩', 'attack', 'legendary', 'sword', 17, '以贴地剑气追击倒地目标，命中后维持击倒状态。', [damage(66, { physicalAttack: 1.3, strength: 1.52 }), state('knockedDown')], { ...attackData('slash', ['standing', 'knockedDown'], 'knockedDown', { allowSame: true }), conditionalDamage: condition('targetState', .22, '目标处于击倒状态时伤害提高22%。', { states: ['knockedDown'] }), tags: ['剑士', '倒地追击'] }),
    card('sword_frost_nail', '霜钉断脉', 'attack', 'legendary', 'sword', 17, '将霜刃钉入倒地目标并削弱其攻势，命中后维持击倒状态。', [damage(62, { physicalAttack: 1.24, strength: 1.46 }, { element: 'ice' }), state('knockedDown'), { type: 'status', status: 'weak', stacks: 1, duration: 2 }], { ...attackData('thrust', ['standing', 'knockedDown'], 'knockedDown', { allowSame: true }), conditionalDamage: condition('targetState', .2, '目标处于击倒状态时伤害提高20%。', { states: ['knockedDown'] }), tags: ['剑士', '霜冻压制'] }),
    card('sword_aegis_edge', '盾锋合一', 'buff', 'legendary', 'sword', 3, '护盾充足时将守势转化为更强的伤害增益。', [{ type: 'buff', stat: 'damageIncrease', value: 10, duration: 2, dynamic: { type: 'actorShieldRatio', threshold: .15, bonus: 8, description: '当前护盾不低于最大生命15%时额外获得8点伤害增加。' } }], { tags: ['剑士', '护盾增益'] }),

    card('sword_absolute_burial', '绝对零度葬剑', 'attack', 'epic', 'sword', 6, '承接空中状态发动冰葬，将目标彻底击倒。', [damage(106, { physicalAttack: 1.9, strength: 2.28 }, { element: 'ice' }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('previousResultState', .24, '上一张牌结算后目标为击飞或浮空时伤害提高24%。', { states: ['launched', 'airborne'] }), tags: ['剑士', '史诗终结'] }),
    card('sword_ashen_sky', '灰烬裂天式', 'attack', 'epic', 'sword', 7, '在长连段末端斩裂战场并击倒目标。', [damage(110, { physicalAttack: 1.96, strength: 2.34 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('queuePositionAtLeast', .25, '位于队列第4张或之后时伤害提高25%。', { position: 4 }), tags: ['剑士', '长连终结'] }),
    card('sword_requiem_end', '万式终焉曲', 'attack', 'epic', 'sword', 7, '融合多种攻击流派完成最终一击并击倒目标。', [damage(114, { physicalAttack: 2.02, strength: 2.42 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('distinctAttackStyles', .25, '本回合此前使用过至少3种进攻流派时伤害提高25%。', { count: 3 }), tags: ['剑士', '多流派终结'] }),
    card('sword_heaven_prison', '天剑镇狱', 'attack', 'epic', 'sword', 25, '以巨剑镇压倒地目标并撕开防线，命中后维持击倒状态。', [damage(92, { physicalAttack: 1.7, strength: 2.02 }), state('knockedDown'), { type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }], { ...attackData('finisher', ['standing', 'knockedDown'], 'knockedDown', { allowSame: true }), conditionalDamage: condition('targetState', .25, '目标处于击倒状态时伤害提高25%。', { states: ['knockedDown'] }), tags: ['剑士', '史诗追击'] }),
    card('sword_frozen_execution', '极冰断魂刑', 'attack', 'epic', 'sword', 25, '冻结倒地目标后施以断魂斩，使其陷入眩晕并结束追击。', [damage(98, { physicalAttack: 1.78, strength: 2.12 }, { element: 'ice' }), state('stunned')], { ...attackData('finisher', ['standing', 'knockedDown'], 'stunned'), conditionalDamage: condition('targetState', .25, '目标处于击倒状态时伤害提高25%。', { states: ['knockedDown'] }), tags: ['剑士', '倒地处决'] }),
    card('sword_last_movement', '终章剑意', 'buff', 'epic', 'sword', 5, '大量消耗MP后获得更强的终结技增幅。', [{ type: 'buff', stat: 'skillAttack', value: 14, duration: 2, dynamic: { type: 'mpSpentRatio', threshold: .4, bonus: 10, description: '本回合已消耗至少40%最大MP时额外获得10点技能攻击。' } }], { tags: ['剑士', '终章增益'] }),

    card('brawler_feel_jab', '触感刺拳', 'attack', 'common', 'brawler', 0, '作为本回合第一张牌时强化试探刺拳。', [damage(18, { physicalAttack: .5, strength: .52 })], { ...attackData('strike', ['standing'], 'standing'), conditionalDamage: condition('queuePositionEquals', .1, '位于队列第1张时伤害提高10%。', { position: 1 }), tags: ['格斗家', '起手'] }),
    card('brawler_step_hook', '滑步摆拳', 'attack', 'common', 'brawler', 0, '穿插在连段后，将站立或击飞目标打入浮空。', [damage(17, { physicalAttack: .48, strength: .54 }), state('airborne')], { ...attackData('strike', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('queuePositionAtLeast', .1, '位于队列第2张或之后时伤害提高10%。', { position: 2 }), tags: ['格斗家', '衔接'] }),
    card('brawler_echo_knee', '回响升膝', 'attack', 'common', 'brawler', 1, '承接击飞或浮空结果时强化升膝，并维持击飞。', [damage(18, { physicalAttack: .5, strength: .55 }), state('launched')], { ...attackData('launch', ['standing', 'launched', 'airborne'], 'launched', { allowSame: true }), conditionalDamage: condition('previousResultState', .1, '上一张牌结算后目标为击飞或浮空时伤害提高10%。', { states: ['launched', 'airborne'] }), tags: ['格斗家', '击飞'] }),
    card('brawler_ready_stance', '抢攻架势', 'buff', 'common', 'brawler', 0, '作为队列第一张时获得更多力量。', [{ type: 'buff', stat: 'strength', value: 2, duration: 1, dynamic: { type: 'firstCard', bonus: 2, description: '位于队列第1张时额外获得2点力量。' } }], { tags: ['格斗家', '起手增益'] }),

    card('brawler_fourth_fist', '四拍崩拳', 'attack', 'excellent', 'brawler', 1, '在连段第三张之后打出时强化崩拳。', [damage(32, { physicalAttack: .74, strength: .84 })], { ...attackData('strike', ['standing'], 'standing'), conditionalDamage: condition('queuePositionAtLeast', .13, '位于队列第3张或之后时伤害提高13%。', { position: 3 }), tags: ['格斗家', '连拳'] }),
    card('brawler_burning_heel', '灼痕回踢', 'attack', 'excellent', 'brawler', 1, '目标带有灼烧或易伤时强化回踢并使其浮空。', [damage(30, { physicalAttack: .68, strength: .82 }, { element: 'fire' }), state('airborne')], { ...attackData('kick', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('targetHasStatus', .13, '目标带有灼烧或易伤时伤害提高13%。', { statuses: ['burn', 'vulnerable'] }), tags: ['格斗家', '异常追击'] }),
    card('brawler_guard_upper', '铁壁升拳', 'attack', 'excellent', 'brawler', 2, '自身拥有足够护盾时强化升拳，并维持击飞。', [damage(30, { physicalAttack: .7, strength: .86 }), state('launched')], { ...attackData('launch', ['standing', 'launched', 'airborne'], 'launched', { allowSame: true }), conditionalDamage: condition('actorShieldRatio', .12, '当前护盾不低于最大生命10%时伤害提高12%。', { threshold: .1 }), tags: ['格斗家', '护盾联动'] }),
    card('brawler_air_hunt', '凌空猎势', 'buff', 'excellent', 'brawler', 1, '在目标击飞或浮空时使用，获得额外物理暴击。', [{ type: 'buff', stat: 'physicalCrit', value: 4, duration: 2, dynamic: { type: 'targetState', states: ['launched', 'airborne'], bonus: 4, description: '目标处于击飞或浮空时额外获得4点物理暴击。' } }], { tags: ['格斗家', '空连增益'] }),

    card('brawler_mixed_barrage', '混式乱打', 'attack', 'rare', 'brawler', 2, '此前使用过两种攻击流派时强化乱打。', [damage(45, { physicalAttack: 1, strength: 1.22 })], { ...attackData('strike', ['standing'], 'standing'), conditionalDamage: condition('distinctAttackStyles', .17, '本回合此前使用过至少2种进攻流派时伤害提高17%。', { count: 2 }), tags: ['格斗家', '流派联动'] }),
    card('brawler_sky_turn', '翻天追踢', 'attack', 'rare', 'brawler', 2, '承接击飞结果时强化追踢并使目标浮空。', [damage(43, { physicalAttack: .96, strength: 1.2 }), state('airborne')], { ...attackData('kick', ['standing', 'launched'], 'airborne'), conditionalDamage: condition('previousResultState', .17, '上一张牌结算后目标为击飞时伤害提高17%。', { states: ['launched'] }), tags: ['格斗家', '浮空衔接'] }),
    card('brawler_meteor_press', '陨火压膝', 'attack', 'rare', 'brawler', 3, '消耗较多MP后强化压膝，将空中目标击倒。', [damage(51, { physicalAttack: 1.06, strength: 1.38 }, { element: 'fire' }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('mpSpentRatio', .16, '本回合已消耗至少30%最大MP时伤害提高16%。', { threshold: .3 }), tags: ['格斗家', '小终结'] }),
    card('brawler_mixed_tempo', '混式斗拍', 'buff', 'rare', 'brawler', 2, '此前使用过两种攻击流派时获得额外伤害增加。', [{ type: 'buff', stat: 'damageIncrease', value: 7, duration: 2, dynamic: { type: 'distinctAttackStyles', count: 2, bonus: 6, description: '本回合此前使用过至少2种进攻流派时额外获得6点伤害增加。' } }], { tags: ['格斗家', '流派增益'] }),

    card('brawler_earthbreaker', '武极碎陆', 'attack', 'legendary', 'brawler', 4, '对高生命目标施展重拳终结并击倒。', [damage(76, { physicalAttack: 1.48, strength: 1.74 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('targetHpAbove', .2, '目标生命高于60%时伤害提高20%。', { threshold: .6 }), tags: ['格斗家', '终结'] }),
    card('brawler_flame_sentence', '炎狱判刑', 'attack', 'legendary', 'brawler', 4, '处决带有灼烧或易伤的目标并将其击倒。', [damage(72, { physicalAttack: 1.4, strength: 1.74 }, { element: 'fire' }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('targetHasStatus', .21, '目标带有灼烧或易伤时伤害提高21%。', { statuses: ['burn', 'vulnerable'] }), tags: ['格斗家', '异常终结'] }),
    card('brawler_oath_crusher', '斗誓粉碎', 'attack', 'legendary', 'brawler', 5, '长队列消耗大量MP后发动粉碎打击并击倒。', [damage(80, { physicalAttack: 1.5, strength: 1.88 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('mpSpentRatio', .22, '本回合已消耗至少45%最大MP时伤害提高22%。', { threshold: .45 }), tags: ['格斗家', '资源终结'] }),
    card('brawler_ground_quake', '伏地震拳', 'attack', 'legendary', 'brawler', 17, '以震地拳追击倒地目标，命中后维持击倒状态。', [damage(66, { physicalAttack: 1.28, strength: 1.56 }), state('knockedDown')], { ...attackData('strike', ['standing', 'knockedDown'], 'knockedDown', { allowSame: true }), conditionalDamage: condition('targetState', .22, '目标处于击倒状态时伤害提高22%。', { states: ['knockedDown'] }), tags: ['格斗家', '倒地追击'] }),
    card('brawler_blazing_stomp', '炎爆踏', 'attack', 'legendary', 'brawler', 17, '踏击倒地目标并引燃斗气，命中后维持击倒状态。', [damage(62, { physicalAttack: 1.2, strength: 1.5 }, { element: 'fire' }), state('knockedDown'), { type: 'status', status: 'burn', stacks: 1, duration: 2 }], { ...attackData('kick', ['standing', 'knockedDown'], 'knockedDown', { allowSame: true }), conditionalDamage: condition('targetState', .2, '目标处于击倒状态时伤害提高20%。', { states: ['knockedDown'] }), tags: ['格斗家', '烈焰追击'] }),
    card('brawler_aegis_force', '铁壁蓄爆', 'buff', 'legendary', 'brawler', 3, '护盾充足时将守势转化为更强的技能攻击。', [{ type: 'buff', stat: 'skillAttack', value: 10, duration: 2, dynamic: { type: 'actorShieldRatio', threshold: .15, bonus: 8, description: '当前护盾不低于最大生命15%时额外获得8点技能攻击。' } }], { tags: ['格斗家', '护盾增益'] }),

    card('brawler_sunfall_burial', '烈日坠葬', 'attack', 'epic', 'brawler', 6, '承接空中状态发动烈焰坠葬，将目标彻底击倒。', [damage(106, { physicalAttack: 1.88, strength: 2.3 }, { element: 'fire' }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('previousResultState', .24, '上一张牌结算后目标为击飞或浮空时伤害提高24%。', { states: ['launched', 'airborne'] }), tags: ['格斗家', '史诗终结'] }),
    card('brawler_heaven_collapse', '崩天灭阵', 'attack', 'epic', 'brawler', 7, '在长连段末端轰塌战场并击倒目标。', [damage(110, { physicalAttack: 1.94, strength: 2.36 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('queuePositionAtLeast', .25, '位于队列第4张或之后时伤害提高25%。', { position: 4 }), tags: ['格斗家', '长连终结'] }),
    card('brawler_hundred_style_end', '百式归灭', 'attack', 'epic', 'brawler', 7, '融合多种攻击流派完成最终一击并击倒目标。', [damage(114, { physicalAttack: 2, strength: 2.44 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('distinctAttackStyles', .25, '本回合此前使用过至少3种进攻流派时伤害提高25%。', { count: 3 }), tags: ['格斗家', '多流派终结'] }),
    card('brawler_starbreaker_stomp', '武神碎星踏', 'attack', 'epic', 'brawler', 25, '以武神之力重踏倒地目标，命中后维持击倒状态。', [damage(96, { physicalAttack: 1.74, strength: 2.12 }), state('knockedDown')], { ...attackData('kick', ['standing', 'knockedDown'], 'knockedDown', { allowSame: true }), conditionalDamage: condition('targetState', .25, '目标处于击倒状态时伤害提高25%。', { states: ['knockedDown'] }), tags: ['格斗家', '史诗追击'] }),
    card('brawler_hell_cradle', '地狱摇篮', 'attack', 'epic', 'brawler', 25, '锁住倒地目标连续轰击，使其陷入眩晕并结束追击。', [damage(99, { physicalAttack: 1.78, strength: 2.16 }), state('stunned')], { ...attackData('finisher', ['standing', 'knockedDown'], 'stunned'), conditionalDamage: condition('targetState', .25, '目标处于击倒状态时伤害提高25%。', { states: ['knockedDown'] }), tags: ['格斗家', '倒地处决'] }),
    card('brawler_final_round', '终局斗魂', 'buff', 'epic', 'brawler', 5, '大量消耗MP后获得更强的终结技增幅。', [{ type: 'buff', stat: 'damageIncrease', value: 14, duration: 2, dynamic: { type: 'mpSpentRatio', threshold: .4, bonus: 10, description: '本回合已消耗至少40%最大MP时额外获得10点伤害增加。' } }], { tags: ['格斗家', '终局增益'] }),
];

const PEAK_STATE_REWORK_CARDS = [
    card('sword_quickdraw_mark', '踏影快斩', 'attack', 'common', 'sword', 0, '作为第一张牌时强化快速起手斩。', [damage(21, { physicalAttack: .62, strength: .68 })], { ...attackData('slash', ['standing'], 'standing'), conditionalDamage: condition('queuePositionEquals', .1, '位于队列第1张时伤害提高10%。', { position: 1 }), tags: ['剑士', '起手'] }),
    card('sword_rising_echo', '追风回挑', 'attack', 'common', 'sword', 1, '只能承接击飞，以较低伤害维持击飞状态。', [damage(20, { physicalAttack: .58, strength: .64 }), state('launched')], { ...attackData('launch', ['launched'], 'launched', { allowSame: true }), tags: ['剑士', '击飞衔接'] }),
    card('sword_frostbite_edge', '寒痕切', 'attack', 'excellent', 'sword', 2, '斩击站立目标并施加冰冻。', [damage(34, { physicalAttack: .78, strength: .92 }, { element: 'ice' }), { type: 'status', status: 'frozen', stacks: 2, duration: 2 }], { ...attackData('slash', ['standing'], 'standing'), tags: ['剑士', '冰冻'] }),
    card('sword_sky_pin', '击空钉刃', 'attack', 'excellent', 'sword', 2, '只能承接击飞，将目标钉入浮空状态。', [damage(35, { physicalAttack: .8, strength: .95 }), state('airborne')], { ...attackData('thrust', ['launched'], 'airborne'), conditionalDamage: condition('previousResultState', .13, '上一张牌结算后目标为击飞时伤害提高13%。', { states: ['launched'] }), tags: ['剑士', '击飞衔接'] }),
    card('sword_ice_chain', '冰链追斩', 'attack', 'rare', 'sword', 3, '承接击飞并使目标浮空，同时施加冰冻。', [damage(50, { physicalAttack: 1.05, strength: 1.3 }, { element: 'ice' }), state('airborne'), { type: 'status', status: 'frozen', stacks: 2, duration: 3 }], { ...attackData('slash', ['launched'], 'airborne'), tags: ['剑士', '冰冻追击'] }),
    card('sword_moonfall_finish', '坠月断', 'attack', 'rare', 'sword', 3, '只能终结浮空目标，位于长队列时强化伤害。', [damage(55, { physicalAttack: 1.12, strength: 1.33 }), state('knockedDown')], { ...attackData('finisher', ['airborne'], 'knockedDown'), conditionalDamage: condition('queuePositionAtLeast', .18, '位于队列第3张或之后时伤害提高18%。', { position: 3 }), tags: ['剑士', '浮空终结'] }),
    card('sword_frozen_boundary', '寒狱断界', 'attack', 'legendary', 'sword', 4, '斩落空中目标并施加冰冻，已有冰冻时伤害提高。', [damage(78, { physicalAttack: 1.5, strength: 1.76 }, { element: 'ice' }), state('knockedDown'), { type: 'status', status: 'frozen', stacks: 3, duration: 3 }], { ...attackData('finisher', ['launched', 'airborne'], 'knockedDown'), conditionalDamage: condition('targetHasStatus', .22, '目标已有冰冻时伤害提高22%。', { statuses: ['frozen'] }), tags: ['剑士', '冰冻终结'] }),
    card('sword_skyline_pierce', '天穹贯剑', 'attack', 'legendary', 'sword', 4, '只能承接击飞，以高伤害将目标转入浮空。', [damage(80, { physicalAttack: 1.5, strength: 1.7 }), state('airborne')], { ...attackData('thrust', ['launched'], 'airborne'), conditionalDamage: condition('previousResultState', .22, '上一张牌结算后目标为击飞时伤害提高22%。', { states: ['launched'] }), tags: ['剑士', '贯穿追击'] }),
    card('sword_zero_burial', '零度葬界', 'attack', 'epic', 'sword', 6, '冻结并斩落浮空目标，形成强力冰冻终结。', [damage(108, { physicalAttack: 1.95, strength: 2.3 }, { element: 'ice' }), state('knockedDown'), { type: 'status', status: 'frozen', stacks: 4, duration: 4 }], { ...attackData('finisher', ['airborne'], 'knockedDown'), conditionalDamage: condition('targetHasStatus', .25, '目标已有冰冻时伤害提高25%。', { statuses: ['frozen'] }), tags: ['剑士', '史诗冰葬'] }),
    card('sword_starfall_sever', '星陨断空', 'attack', 'epic', 'sword', 7, '只能终结击飞目标，位于长队列末端时爆发。', [damage(108, { physicalAttack: 1.96, strength: 2.14 }), state('knockedDown')], { ...attackData('finisher', ['launched'], 'knockedDown'), conditionalDamage: condition('queuePositionAtLeast', .25, '位于队列第4张或之后时伤害提高25%。', { position: 4 }), tags: ['剑士', '史诗终结'] }),

    card('brawler_chain_jab', '连步刺拳', 'attack', 'common', 'brawler', 0, '作为第一张牌时强化迅捷刺拳。', [damage(21, { physicalAttack: .6, strength: .7 })], { ...attackData('strike', ['standing'], 'standing'), conditionalDamage: condition('queuePositionEquals', .1, '位于队列第1张时伤害提高10%。', { position: 1 }), tags: ['格斗家', '起手'] }),
    card('brawler_air_knee', '追空膝', 'attack', 'common', 'brawler', 1, '只能承接击飞，以较低伤害维持击飞状态。', [damage(20, { physicalAttack: .56, strength: .66 }), state('launched')], { ...attackData('launch', ['launched'], 'launched', { allowSame: true }), tags: ['格斗家', '击飞衔接'] }),
    card('brawler_venom_palm', '毒砂掌', 'attack', 'excellent', 'brawler', 2, '攻击站立目标并施加中毒。', [damage(34, { physicalAttack: .75, strength: .95 }), { type: 'status', status: 'poison', stacks: 2, duration: 2 }], { ...attackData('strike', ['standing'], 'standing'), tags: ['格斗家', '中毒'] }),
    card('brawler_fold_sky_kick', '折空踢', 'attack', 'excellent', 'brawler', 2, '只能承接击飞，将目标踢入浮空状态。', [damage(35, { physicalAttack: .76, strength: .99 }), state('airborne')], { ...attackData('kick', ['launched'], 'airborne'), conditionalDamage: condition('previousResultState', .13, '上一张牌结算后目标为击飞时伤害提高13%。', { states: ['launched'] }), tags: ['格斗家', '击飞衔接'] }),
    card('brawler_serpent_elbow', '蛇牙肘', 'attack', 'rare', 'brawler', 3, '以毒肘击飞站立目标并施加中毒。', [damage(50, { physicalAttack: 1.02, strength: 1.34 }), state('launched'), { type: 'status', status: 'poison', stacks: 2, duration: 3 }], { ...attackData('launch', ['standing'], 'launched'), tags: ['格斗家', '中毒起手'] }),
    card('brawler_falling_stomp', '坠空踏', 'attack', 'rare', 'brawler', 3, '只能终结浮空目标，位于长队列时强化伤害。', [damage(55, { physicalAttack: 1.08, strength: 1.37 }), state('knockedDown')], { ...attackData('finisher', ['airborne'], 'knockedDown'), conditionalDamage: condition('queuePositionAtLeast', .18, '位于队列第3张或之后时伤害提高18%。', { position: 3 }), tags: ['格斗家', '浮空终结'] }),
    card('brawler_burning_chase', '焚身追踢', 'attack', 'legendary', 'brawler', 4, '承接击飞或浮空并施加灼烧，目标已有灼烧时强化。', [damage(78, { physicalAttack: 1.42, strength: 1.84 }, { element: 'fire' }), state('airborne'), { type: 'status', status: 'burn', stacks: 3, duration: 3 }], { ...attackData('kick', ['launched', 'airborne'], 'airborne', { allowSame: true }), conditionalDamage: condition('targetHasStatus', .22, '目标已有灼烧时伤害提高22%。', { statuses: ['burn'] }), tags: ['格斗家', '灼烧追击'] }),
    card('brawler_venom_lock', '蛇影锁喉', 'attack', 'legendary', 'brawler', 4, '锁摔站立或浮空目标并施加中毒。', [damage(78, { physicalAttack: 1.4, strength: 1.86 }), state('knockedDown'), { type: 'status', status: 'poison', stacks: 3, duration: 3 }], { ...attackData('finisher', ['standing', 'airborne'], 'knockedDown'), conditionalDamage: condition('targetHasStatus', .22, '目标已有中毒时伤害提高22%。', { statuses: ['poison'] }), tags: ['格斗家', '中毒终结'] }),
    card('brawler_poison_feast', '毒王终宴', 'attack', 'epic', 'brawler', 6, '引爆毒势并击倒浮空目标，形成强力中毒终结。', [damage(108, { physicalAttack: 1.86, strength: 2.39 }), state('knockedDown'), { type: 'status', status: 'poison', stacks: 5, duration: 4 }], { ...attackData('finisher', ['airborne'], 'knockedDown'), conditionalDamage: condition('targetHasStatus', .25, '目标已有中毒时伤害提高25%。', { statuses: ['poison'] }), tags: ['格斗家', '史诗毒杀'] }),
    card('brawler_inferno_starfall', '炎狱坠星', 'attack', 'epic', 'brawler', 7, '只能终结击飞目标，坠击并施加高层灼烧。', [damage(108, { physicalAttack: 1.84, strength: 2.42 }, { element: 'fire' }), state('knockedDown'), { type: 'status', status: 'burn', stacks: 4, duration: 4 }], { ...attackData('finisher', ['launched'], 'knockedDown'), conditionalDamage: condition('queuePositionAtLeast', .25, '位于队列第4张或之后时伤害提高25%。', { position: 4 }), tags: ['格斗家', '史诗炎坠'] }),
];

const NON_ATTACK_RARITY_CONFIG = [
    { rarity: 'common', cost: 0, shield: 16, missingHeal: 5, retain: 12, empower: 5, buff: 3, duration: 1, recall: 1, fetch: 1, convert: 0 },
    { rarity: 'excellent', cost: 1, shield: 26, missingHeal: 7, retain: 17, empower: 7, buff: 5, duration: 2, recall: 1, fetch: 1, convert: 15 },
    { rarity: 'rare', cost: 2, shield: 40, missingHeal: 10, retain: 22, empower: 10, buff: 8, duration: 2, recall: 1, fetch: 1, convert: 20 },
    { rarity: 'legendary', cost: 3, shield: 57, missingHeal: 13, retain: 28, empower: 13, buff: 11, duration: 3, recall: 2, fetch: 1, convert: 25 },
    { rarity: 'epic', cost: 5, shield: 78, missingHeal: 17, retain: 35, empower: 17, buff: 15, duration: 3, recall: 2, fetch: 2, convert: 30 },
];

const NON_ATTACK_SCOPE_BLUEPRINTS = {
    all: {
        label: '通用', primary: 'damageIncrease', secondary: 'skillAttack', scaling: { vitality: .7, spirit: .45 }, fetch: 'attack',
        names: {
            defense: ['临时掩护', '稳固阵线', '应急壁障', '复合护层', '生息结界', '逆境防线', '不屈阵地', '星辉屏障', '永恒壁垒', '命运庇护'],
            skill: ['战术检索', '回收指令', '精准搜寻', '整备循环', '记忆回溯', '灵活调度', '战局重构', '资源再编', '命运检索', '时序回归'],
            buff: ['临战号令', '蓄势待发', '协同节拍', '攻守转换', '战意共鸣', '灵能激发', '巅峰预演', '超越界限', '胜机锁定', '无限战意'],
        },
    },
    sword: {
        label: '剑士', primary: 'physicalAttack', secondary: 'iceElement', scaling: { vitality: .55, physicalDefense: .18, iceElement: .15 }, fetch: 'attack',
        names: {
            defense: ['横剑护身', '薄霜剑幕', '凝冰甲衣', '回锋架势', '冰心护阵', '剑气环流', '霜魂壁垒', '千刃守域', '极寒剑界', '万剑天幕'],
            skill: ['寻锋诀', '拾剑式', '剑谱速览', '回鞘循环', '旧式重演', '寒刃调度', '剑路重构', '万式归档', '天剑检索', '剑典轮回'],
            buff: ['拔剑凝神', '霜锋预备', '剑步协奏', '攻守剑律', '冰刃共鸣', '剑魂激发', '剑域预演', '人剑合一', '斩机锁定', '无尽剑意'],
        },
    },
    brawler: {
        label: '格斗家', primary: 'strength', secondary: 'fireElement', scaling: { vitality: .8, physicalDefense: .12, fireElement: .15 }, fetch: 'attack',
        names: {
            defense: ['架臂格挡', '热流护体', '铁骨架势', '卸力回身', '气血护层', '斗气环流', '金刚壁垒', '武神守域', '炎躯不灭', '斗神天铠'],
            skill: ['拳路检索', '拾式回想', '招式速览', '吐纳循环', '旧招重演', '连打调度', '拳路重构', '百式归档', '武典检索', '斗技轮回'],
            buff: ['抱架凝神', '燃血预备', '拳步协奏', '攻守节拍', '炎拳共鸣', '斗魂激发', '武域预演', '人拳合一', '胜机锁拳', '无尽斗志'],
        },
    },
};

const nonAttackEffects = (category, variant, config, scope, rarityIndex) => {
    if (category === 'defense' && variant === 0) return [
        { type: 'shield', base: config.shield, scaling: scope.scaling },
        { type: 'retainShield', value: config.retain },
    ];
    if (category === 'defense') return [
        { type: 'healMissing', value: config.missingHeal },
        { type: 'shield', base: Math.round(config.shield * .55), scaling: { vitality: .42, spirit: .28 } },
        ...(rarityIndex >= 2 ? [{ type: 'cleanse', value: rarityIndex >= 4 ? 2 : 1 }] : []),
    ];
    if (category === 'skill' && variant === 0) return [
        { type: 'recoverDiscard', value: config.recall, ...(rarityIndex === 1 ? { category: scope.fetch } : {}) },
        ...(rarityIndex === 1 ? [{ type: 'empower', category: scope.fetch, value: 7, uses: 1 }] : []),
        ...(rarityIndex >= 2 ? [{ type: 'restoreMp', base: 5 + rarityIndex * 3 }] : []),
    ];
    if (category === 'skill') return [
        { type: 'drawCategory', category: scope.fetch, value: config.fetch },
        ...(config.convert ? [{ type: 'shieldToMp', value: config.convert }] : []),
    ];
    if (category === 'buff' && variant === 0) return [
        { type: 'buff', stat: scope.primary, value: config.buff, duration: config.duration },
        { type: 'empower', category: 'attack', value: config.empower, uses: 1 },
    ];
    return [
        { type: 'buff', stat: scope.secondary, value: config.buff, duration: config.duration },
        { type: 'empower', category: 'skill', value: config.empower, uses: 1 },
        ...(rarityIndex >= 3 ? [{ type: 'status', status: 'regeneration', stacks: rarityIndex, duration: 2, target: 'self' }] : []),
    ];
};

const nonAttackSummary = (category, variant, config, scope) => {
    if (category === 'defense' && variant === 0) return `获得护盾，并将其中${config.retain}%保留到下一回合。`;
    if (category === 'defense') return `按已损生命恢复${config.missingHeal}%，并获得护盾。`;
    if (category === 'skill' && variant === 0) return config.rarity === 'excellent'
        ? `从弃牌堆回收一张${scope.fetch === 'attack' ? '进攻' : '技能'}牌，并强化下一张同类牌的伤害。`
        : `从弃牌堆回收${config.recall}张牌${config.recall > 1 ? '，重组本回合资源' : ''}。`;
    if (category === 'skill') return `从牌库检索${config.fetch}张进攻牌${config.convert ? `，并将${config.convert}%护盾转化为MP` : ''}。`;
    if (category === 'buff' && variant === 0) return `提高${scope.primary === 'strength' ? '力量' : scope.primary === 'physicalAttack' ? '物理攻击' : '伤害'}，强化下一张进攻牌。`;
    return `提高${scope.secondary.endsWith('Element') ? '属性强化' : '技能攻击'}，强化下一张技能牌。`;
};

const PEAK_NON_ATTACK_EXPANSION = Object.entries(NON_ATTACK_SCOPE_BLUEPRINTS).flatMap(([classId, scope]) =>
    NON_ATTACK_RARITY_CONFIG.flatMap((config, rarityIndex) => ['defense', 'skill', 'buff'].flatMap((category) => [0, 1].map((variant) => {
        const nameIndex = rarityIndex * 2 + variant;
        return card(
            `utility_${classId}_${category}_${config.rarity}_${variant + 1}`,
            scope.names[category][nameIndex],
            category,
            config.rarity,
            classId,
            category === 'skill' && variant === 0 && config.rarity === 'excellent' ? 0 : config.cost,
            nonAttackSummary(category, variant, config, scope),
            nonAttackEffects(category, variant, config, scope, rarityIndex),
            { tags: [scope.label, PEAK_CARD_CATEGORIES[category].name, '机制牌'] },
        );
    }))));

const ELEMENTAL_SKILL_ELEMENTS = ['fire', 'ice', 'light', 'dark'];
const ELEMENTAL_SKILL_LABELS = { fire: '火', ice: '冰', light: '光', dark: '暗' };
const ELEMENTAL_SKILL_DAMAGE_LABELS = { physical: '物理', magical: '魔法', true: '真实' };
const ELEMENTAL_SKILL_PARTNERS = { fire: 'dark', ice: 'light', light: 'fire', dark: 'ice' };
const ELEMENTAL_SKILL_RARITIES = [
    { rarity: 'common', cost: 0 },
    { rarity: 'excellent', cost: 1 },
    { rarity: 'rare', cost: 2 },
    { rarity: 'legendary', cost: 3 },
    { rarity: 'epic', cost: 5 },
];
const ELEMENTAL_SKILL_NAMES = {
    sword: {
        fire: ['火星斩', '灼刃式', '炎纹突', '赤焰回锋', '烈火剑轮', '焚风剑阵', '红莲断狱', '炎帝天剑', '终焉焚界剑', '万劫红莲葬'],
        ice: ['霜痕剑气', '冰刃式', '寒潮突刺', '凝霜回锋', '冰河剑轮', '极寒剑阵', '永冻断界', '霜帝天剑', '绝对零域剑', '万古冰封葬'],
        light: ['闪光刺', '光刃式', '雷纹突', '曜光回锋', '天雷剑轮', '圣光剑阵', '神罚断空', '光帝天剑', '苍穹雷劫剑', '万象辉光葬'],
        dark: ['影蚀斩', '暗刃式', '冥纹突', '幽影回锋', '深渊剑轮', '夜幕剑阵', '虚无断魂', '暗帝天剑', '永夜寂灭剑', '万渊噬界葬'],
    },
    brawler: {
        fire: ['火花拳', '灼热踢', '炎纹肘', '赤焰回旋', '爆炎连打', '焚风气功', '红莲碎星', '炎帝升龙', '末日焚天拳', '万劫红莲破'],
        ice: ['冰晶拳', '霜寒踢', '寒纹肘', '凝霜回旋', '冰河连打', '极寒气功', '永冻碎星', '霜帝升龙', '绝对零度拳', '万古冰封破'],
        light: ['电光拳', '闪雷踢', '雷纹肘', '曜光回旋', '天雷连打', '圣光气功', '神罚碎星', '光帝升龙', '苍穹雷劫拳', '万象辉光破'],
        dark: ['影袭拳', '暗蚀踢', '冥纹肘', '幽影回旋', '深渊连打', '夜幕气功', '虚无碎星', '暗帝升龙', '永夜寂灭拳', '万渊噬界破'],
    },
    all: {
        fire: ['火苗术', '炽热弹', '炎流冲击', '赤焰环', '爆炎术式', '焚风领域', '红莲天火', '炎界裁决', '终焉炎潮', '万劫焚星'],
        ice: ['冰晶术', '霜寒弹', '寒流冲击', '凝霜环', '冰河术式', '极寒领域', '永冻天霜', '冰界裁决', '绝对零潮', '万古封星'],
        light: ['光弹术', '闪雷弹', '雷光冲击', '曜光环', '天雷术式', '圣光领域', '神罚天雷', '光界裁决', '苍穹雷潮', '万象辉星'],
        dark: ['影蚀术', '暗影弹', '冥流冲击', '幽影环', '深渊术式', '夜幕领域', '虚无天蚀', '暗界裁决', '永夜冥潮', '万渊噬星'],
    },
};

const elementalSkillScaling = (classId, damageType, maximum) => {
    if (classId === 'all') {
        if (damageType === 'magical') return { magicalAttack: maximum * .4, intelligence: maximum * .3, independentAttack: maximum * .3 };
        if (damageType === 'true') return { independentAttack: maximum * .5, strength: maximum * .25, intelligence: maximum * .25 };
        return { physicalAttack: maximum * .4, strength: maximum * .3, independentAttack: maximum * .3 };
    }
    if (damageType === 'magical') return { magicalAttack: maximum * .5, intelligence: maximum * .3, independentAttack: maximum * .2 };
    if (damageType === 'true') return classId === 'sword'
        ? { independentAttack: maximum * .5, strength: maximum * .32, intelligence: maximum * .18 }
        : { independentAttack: maximum * .5, strength: maximum * .4, intelligence: maximum * .1 };
    return classId === 'sword'
        ? { physicalAttack: maximum * .54, strength: maximum * .46 }
        : { physicalAttack: maximum * .46, strength: maximum * .54 };
};

const elementalSkillStatus = (element, rarityIndex) => {
    const duration = Math.min(4, rarityIndex + 1);
    if (element === 'light') return [{ type: 'status', status: 'vulnerable', stacks: 1, duration }];
    const status = { fire: 'burn', ice: 'frozen', dark: 'poison' }[element];
    return status ? [{ type: 'status', status, stacks: Math.max(1, Math.min(4, rarityIndex)), duration }] : [];
};

const elementalSkillRequirements = (rarityIndex, variant) => {
    if (rarityIndex === 1 && variant === 1) return ['standing', 'launched', 'airborne'];
    if (rarityIndex === 2 && variant === 0) return ['standing', 'launched', 'airborne'];
    if (rarityIndex < 3) return [];
    if (rarityIndex === 3) return ['launched', 'airborne'];
    return variant === 0 ? ['airborne'] : ['launched'];
};

const elementalSkillState = (rarityIndex, variant) => {
    if (rarityIndex === 1 && variant === 1) return state('launched');
    if (rarityIndex === 2 && variant === 0) return state('airborne');
    if (rarityIndex >= 3) return state('knockedDown');
    return null;
};

const elementalSkillCondition = (rarityIndex, variant, element, partner) => {
    const profile = PEAK_CARD_BALANCE[ELEMENTAL_SKILL_RARITIES[rarityIndex].rarity];
    if (variant === 1) {
        if (rarityIndex < 2) return condition('previousElement', profile.condition, `上一张牌包含${ELEMENTAL_SKILL_LABELS[partner]}属性时，伤害提高${Math.round(profile.condition * 100)}%。`, { element: partner });
        return condition('distinctElements', profile.condition, `本回合此前已使用${rarityIndex >= 4 ? 3 : 2}种不同属性时，伤害提高${Math.round(profile.condition * 100)}%。`, { count: rarityIndex >= 4 ? 3 : 2 });
    }
    if (rarityIndex === 0) return condition('targetHpAbove', profile.condition, `目标生命高于80%时，伤害提高${Math.round(profile.condition * 100)}%。`, { threshold: .8 });
    const statuses = element === 'light' ? ['vulnerable'] : [{ fire: 'burn', ice: 'frozen', dark: 'poison' }[element]];
    return condition('targetHasStatus', profile.condition, `目标已有${ELEMENTAL_SKILL_LABELS[element]}系异常时，伤害提高${Math.round(profile.condition * 100)}%。`, { statuses });
};

const PEAK_ELEMENTAL_SKILL_CARDS = Object.keys(ELEMENTAL_SKILL_NAMES).flatMap((classId, classIndex) =>
    ELEMENTAL_SKILL_RARITIES.flatMap((config, rarityIndex) => ELEMENTAL_SKILL_ELEMENTS.flatMap((element, elementIndex) => [0, 1].map((variant) => {
        const profile = PEAK_CARD_BALANCE[config.rarity];
        const partner = ELEMENTAL_SKILL_PARTNERS[element];
        const typeOffset = classIndex + rarityIndex + elementIndex;
        const damageTypes = variant === 0
            ? [['physical', 'magical', 'true'][typeOffset % 3]]
            : [['physical', 'magical', 'true'][(typeOffset + 1) % 3], ['physical', 'magical', 'true'][(typeOffset + 2) % 3]];
        const elements = variant === 0 ? [element] : [element, partner];
        const damageEffects = elements.map((damageElement, index) => damage(
            profile.base,
            elementalSkillScaling(classId, damageTypes[index], profile.scaling),
            { element: damageElement, damageType: damageTypes[index] },
        ));
        const requirements = elementalSkillRequirements(rarityIndex, variant);
        const stateEffect = elementalSkillState(rarityIndex, variant);
        const stateEffects = stateEffect ? [stateEffect] : [];
        const statusEffects = variant === 0 ? elementalSkillStatus(element, rarityIndex) : [];
        const damageDescription = damageTypes.map((type) => ELEMENTAL_SKILL_DAMAGE_LABELS[type]).join('与');
        const elementDescription = elements.map((entry) => ELEMENTAL_SKILL_LABELS[entry]).join('与');
        const summary = variant === 0
            ? `凝聚${elementDescription}属性造成${damageDescription}伤害${statusEffects.length ? '并施加对应异常' : ''}${stateEffect ? `，使目标${PEAK_COMBAT_STATES[stateEffect.value]}` : ''}。`
            : `交织${elementDescription}属性，分别造成${damageDescription}伤害${stateEffect ? `并使目标${PEAK_COMBAT_STATES[stateEffect.value]}` : ''}。`;
        return card(
            `elemental_${classId}_${config.rarity}_${element}_${variant + 1}`,
            ELEMENTAL_SKILL_NAMES[classId][element][rarityIndex * 2 + variant],
            'skill',
            config.rarity,
            classId,
            config.cost,
            summary,
            [...damageEffects, ...statusEffects, ...stateEffects],
            {
                requiresTargetState: requirements,
                conditionalDamage: elementalSkillCondition(rarityIndex, variant, element, partner),
                primaryElement: element,
                elementMode: variant === 0 ? 'single' : 'mixed',
                elementalExpansion: true,
                tags: [{ sword: '剑士', brawler: '格斗家', all: '通用' }[classId], `${ELEMENTAL_SKILL_LABELS[element]}系`, variant === 0 ? '单属性' : '双属性'],
            },
        );
    }))));

const REACTIVE_DEFENSE_CONFIG = [
    { rarity: 'common', cost: 0, shield: 16, guard: 12, uses: 1, duration: 1, counter: 0, triggerMp: 2, wards: 1, lastStandShield: 0 },
    { rarity: 'excellent', cost: 1, shield: 27, guard: 18, uses: 1, duration: 2, counter: 20, triggerMp: 3, wards: 1, lastStandShield: 0 },
    { rarity: 'rare', cost: 2, shield: 42, guard: 25, uses: 1, duration: 2, counter: 35, triggerMp: 4, wards: 1, lastStandShield: 0 },
    { rarity: 'legendary', cost: 3, shield: 62, guard: 32, uses: 2, duration: 3, counter: 50, triggerMp: 5, wards: 2, lastStandShield: 12 },
    { rarity: 'epic', cost: 5, shield: 86, guard: 40, uses: 2, duration: 3, counter: 70, triggerMp: 6, wards: 2, lastStandShield: 20 },
];
const REACTIVE_DEFENSE_SCOPES = {
    sword: {
        label: '剑士', scaling: { vitality: .62, physicalDefense: .24, spirit: .14 },
        names: ['偏斜架势', '净刃护式', '回锋剑壁', '寒铁护印', '镜刃反制', '剑心不染', '天剑回护', '不灭剑魄', '万剑归防', '剑神不坠'],
    },
    brawler: {
        label: '格斗家', scaling: { vitality: .72, physicalDefense: .2, spirit: .08 },
        names: ['架臂卸力', '闭气守神', '铁山护势', '金刚吐纳', '震劲反甲', '百毒不侵', '武神铁壁', '血气不灭', '斗神反震', '金身不坏'],
    },
};

const reactiveDefenseEffects = (classId, config, rarityIndex, variant) => {
    const shieldEffect = { type: 'shield', base: config.shield, scaling: REACTIVE_DEFENSE_SCOPES[classId].scaling };
    if (variant === 0) return [
        shieldEffect,
        {
            type: 'guard',
            reduction: config.guard,
            uses: config.uses,
            duration: config.duration,
            counterRatio: classId === 'brawler' ? config.counter : Math.round(config.counter * .7),
            restoreMp: classId === 'sword' ? config.triggerMp : 0,
        },
    ];
    if (rarityIndex < 3) return [
        shieldEffect,
        { type: 'statusWard', value: config.wards, duration: config.duration },
        ...(rarityIndex === 1 ? [{ type: 'retainShield', value: 12 }] : []),
        ...(rarityIndex === 2 ? [{ type: 'cleanse', value: 1 }] : []),
    ];
    return [
        shieldEffect,
        { type: 'lastStand', value: 1, shieldPercent: config.lastStandShield, duration: config.duration },
        ...(rarityIndex >= 4 ? [{ type: 'statusWard', value: config.wards, duration: config.duration }] : []),
    ];
};

const reactiveDefenseSummary = (classId, config, rarityIndex, variant) => {
    if (variant === 0) {
        const trigger = classId === 'sword' ? `并恢复${config.triggerMp}MP` : config.counter ? `并以减免量的${config.counter}%反震攻击者` : '';
        return `获得护盾，接下来${config.uses}次受到伤害时减免${config.guard}%${trigger}。`;
    }
    if (rarityIndex < 3) return `获得护盾，并抵消接下来${config.wards}次有害异常。`;
    return `获得护盾，${config.duration}回合内首次受到致命伤时保留1点生命，并获得最大生命${config.lastStandShield}%的护盾。`;
};

const PEAK_REACTIVE_DEFENSE_CARDS = Object.entries(REACTIVE_DEFENSE_SCOPES).flatMap(([classId, scope]) =>
    REACTIVE_DEFENSE_CONFIG.flatMap((config, rarityIndex) => [0, 1].map((variant) => card(
        `reactive_defense_${classId}_${config.rarity}_${variant + 1}`,
        scope.names[rarityIndex * 2 + variant],
        'defense',
        config.rarity,
        classId,
        config.cost,
        reactiveDefenseSummary(classId, config, rarityIndex, variant),
        reactiveDefenseEffects(classId, config, rarityIndex, variant),
        { reactiveDefense: true, tags: [scope.label, variant === 0 ? '格挡反制' : rarityIndex < 3 ? '异常屏障' : '不屈'] },
    ))));

const UNIVERSAL_DEFENSE_CONFIG = [
    { rarity: 'common', cost: 0, shield: 18, manaRatio: 25, thorns: 12, damageCap: 0, breakHeal: 0, breakDraw: 0, uses: 1, duration: 1 },
    { rarity: 'excellent', cost: 1, shield: 30, manaRatio: 35, thorns: 20, damageCap: 0, breakHeal: 0, breakDraw: 0, uses: 1, duration: 2 },
    { rarity: 'rare', cost: 2, shield: 46, manaRatio: 0, thorns: 35, damageCap: 35, breakHeal: 10, breakDraw: 1, uses: 1, duration: 2 },
    { rarity: 'legendary', cost: 3, shield: 66, manaRatio: 0, thorns: 0, damageCap: 28, breakHeal: 15, breakDraw: 1, uses: 2, duration: 3 },
    { rarity: 'epic', cost: 5, shield: 90, manaRatio: 0, thorns: 70, damageCap: 20, breakHeal: 20, breakDraw: 2, uses: 2, duration: 3 },
];
const UNIVERSAL_DEFENSE_NAMES = ['魔力护层', '荆棘护甲', '虚能屏障', '反伤棘甲', '限界屏障', '战术护阵', '绝伤领域', '崩解回生', '绝对领域', '时序回环'];
const UNIVERSAL_DEFENSE_SCALING = { vitality: .5, spirit: .35, physicalDefense: .08, magicalDefense: .07 };

const universalDefenseEffects = (config, rarityIndex, variant) => {
    const shieldEffect = { type: 'shield', base: config.shield, scaling: UNIVERSAL_DEFENSE_SCALING };
    if (variant === 0) return rarityIndex < 2
        ? [shieldEffect, { type: 'manaBarrier', ratio: config.manaRatio, uses: config.uses, duration: config.duration }]
        : [shieldEffect, { type: 'damageCap', ratio: config.damageCap, uses: config.uses, duration: config.duration }];
    return [
        shieldEffect,
        ...(config.thorns ? [{ type: 'thorns', ratio: config.thorns, uses: config.uses, duration: config.duration }] : []),
        ...(config.breakHeal || config.breakDraw ? [{ type: 'shieldBreak', healPercent: config.breakHeal, draw: config.breakDraw, uses: config.uses, duration: config.duration }] : []),
    ];
};

const universalDefenseSummary = (config, rarityIndex, variant) => {
    if (variant === 0 && rarityIndex < 2) return `获得护盾，接下来${config.uses}次受伤时消耗MP吸收其中${config.manaRatio}%的伤害。`;
    if (variant === 0) return `获得护盾，接下来${config.uses}次受到的单次伤害不超过最大生命的${config.damageCap}%。`;
    if (config.breakHeal || config.breakDraw) return `获得护盾${config.thorns ? '并反伤' : ''}；护盾被击破时恢复${config.breakHeal}%已损生命并抽${config.breakDraw}张牌。`;
    return `获得护盾，接下来${config.uses}次受伤时反弹所受伤害的${config.thorns}%作为真实伤害。`;
};

const PEAK_UNIVERSAL_DEFENSE_CARDS = UNIVERSAL_DEFENSE_CONFIG.flatMap((config, rarityIndex) => [0, 1].map((variant) => card(
    `universal_defense_${config.rarity}_${variant + 1}`,
    UNIVERSAL_DEFENSE_NAMES[rarityIndex * 2 + variant],
    'defense',
    config.rarity,
    'all',
    config.cost,
    universalDefenseSummary(config, rarityIndex, variant),
    universalDefenseEffects(config, rarityIndex, variant),
    { universalDefense: true, tags: ['通用', variant === 0 ? rarityIndex < 2 ? '魔力护壁' : '伤害上限' : config.breakHeal || config.breakDraw ? '护盾回响' : '反伤荆棘'] },
)));

const TACTICAL_DEFENSE_NAMES = {
    sword: ['守势余锋', '聚气剑障', '藏锋护阵', '观隙剑围', '灵池剑幕', '无极剑域'],
    brawler: ['负伤架臂', '察势护体', '血气铁衣', '蓄气金身', '伤极不倒', '百战神躯'],
};
const TACTICAL_DEFENSE_CONFIG = [
    {
        rarity: 'common', cost: 0,
        sword: { rule: 'handCount', minValue: 1, maxValue: 2, countCap: 3, capPercent: 2 },
        brawler: { rule: 'missingHpPercent', minValue: 3, maxValue: 5, capPercent: 2 },
    },
    {
        rarity: 'excellent', cost: 1,
        sword: { rule: 'currentMpPercent', minValue: 5, maxValue: 8, capPercent: 3 },
        brawler: { rule: 'enemyStatusCount', minValue: 4, maxValue: 6, countCap: 2, capPercent: 3 },
    },
    {
        rarity: 'rare', cost: 2,
        sword: { rule: 'handCount', minValue: 3, maxValue: 5, countCap: 4, capPercent: 4 },
        brawler: { rule: 'missingHpPercent', minValue: 6, maxValue: 8, capPercent: 4 },
    },
    {
        rarity: 'scarce', cost: 3,
        sword: { rule: 'enemyStatusCount', minValue: 7, maxValue: 10, countCap: 3, capPercent: 5 },
        brawler: { rule: 'currentMpPercent', minValue: 8, maxValue: 12, capPercent: 5 },
    },
    {
        rarity: 'legendary', cost: 4,
        sword: { rule: 'currentMpPercent', minValue: 10, maxValue: 15, capPercent: 6 },
        brawler: { rule: 'missingHpPercent', minValue: 9, maxValue: 12, capPercent: 7 },
    },
    {
        rarity: 'epic', cost: 6,
        sword: { rule: 'handCount', minValue: 8, maxValue: 12, countCap: 5, capPercent: 8 },
        brawler: { rule: 'enemyStatusCount', minValue: 14, maxValue: 20, countCap: 4, capPercent: 8 },
    },
];
const tacticalDefenseScaling = (classId, amount) => classId === 'sword'
    ? { vitality: amount * .5, physicalDefense: amount * .32, spirit: amount * .18 }
    : { vitality: amount * .62, physicalDefense: amount * .28, spirit: amount * .1 };
const tacticalDefenseUtility = (classId, rarityIndex) => {
    if (rarityIndex === 0) return classId === 'sword' ? [{ type: 'retainShield', value: 8 }] : [{ type: 'thorns', ratio: 10, uses: 1, duration: 1 }];
    if (rarityIndex === 1) return [{ type: 'guard', reduction: classId === 'sword' ? 16 : 18, uses: 1, duration: 2, counterRatio: classId === 'brawler' ? 18 : 0, restoreMp: classId === 'sword' ? 3 : 0 }];
    if (rarityIndex === 2) return classId === 'sword' ? [{ type: 'statusWard', value: 1, duration: 2 }] : [{ type: 'cleanse', value: 1 }];
    if (rarityIndex === 3) return classId === 'sword' ? [{ type: 'retainShield', value: 25 }] : [{ type: 'guard', reduction: 29, uses: 2, duration: 3, counterRatio: 42 }];
    if (rarityIndex === 4) return classId === 'sword' ? [{ type: 'damageCap', ratio: 28, uses: 2, duration: 3 }] : [{ type: 'thorns', ratio: 50, uses: 2, duration: 3 }];
    return classId === 'sword'
        ? [{ type: 'shieldBreak', healPercent: 20, draw: 2, uses: 2, duration: 3 }]
        : [{ type: 'lastStand', value: 1, shieldPercent: 20, duration: 3 }, { type: 'statusWard', value: 2, duration: 3 }];
};
const conditionalShieldText = (effect) => {
    if (effect.rule === 'handCount') return `按手牌数追加护盾，每张${effect.minValue}-${effect.maxValue}点，最多${effect.countCap}张`;
    if (effect.rule === 'missingHpPercent') return `按已损生命的${effect.minValue}%-${effect.maxValue}%追加护盾`;
    if (effect.rule === 'currentMpPercent') return `按当前MP的${effect.minValue}%-${effect.maxValue}%追加护盾`;
    return `按敌方负面状态种类追加护盾，每种${effect.minValue}-${effect.maxValue}点，最多${effect.countCap}种`;
};
const PEAK_TACTICAL_DEFENSE_CARDS = ['sword', 'brawler'].flatMap((classId) => TACTICAL_DEFENSE_CONFIG.map((config, rarityIndex) => {
    const profile = PEAK_CARD_BALANCE[config.rarity];
    const conditional = { type: 'conditionalShield', ...config[classId] };
    return card(
        `tactical_defense_${classId}_${config.rarity}`,
        TACTICAL_DEFENSE_NAMES[classId][rarityIndex],
        'defense', config.rarity, classId, config.cost,
        `获得基础护盾，并${conditionalShieldText(conditional)}；额外护盾不超过最大生命${conditional.capPercent}%。`,
        [
            { type: 'shield', base: profile.sustainBase * .55, scaling: tacticalDefenseScaling(classId, profile.sustainScaling * .55) },
            conditional,
            ...tacticalDefenseUtility(classId, rarityIndex),
        ],
        { tacticalDefenseExpansion: true, tags: [classId === 'sword' ? '剑士' : '格斗家', '条件护盾', rarityIndex >= 4 ? '高阶防御' : '战术防御'] },
    );
}));

const MECHANIC_ATTACK_RARITIES = ['common', 'excellent', 'rare', 'scarce', 'legendary', 'epic'];
const MECHANIC_ATTACK_NAMES = {
    sword: [
        ['收势斩', '剑痕伏笔', '影刃引式', '三连轻斩'],
        ['殿后横斩', '裂隙剑印', '剑影唤回', '流派应剑'],
        ['压轴断流', '血痕刻印', '残像剑式', '回锋追斩'],
        ['终幕升刃', '破势剑标', '灵剑衍生', '疾风六斩'],
        ['天幕终斩', '灭魂剑印', '剑界化身', '流派裁决'],
        ['万刃压轴', '末日剑痕', '剑神残响', '终焉裁断'],
    ],
    brawler: [
        ['收招直拳', '暗劲伏笔', '拳影引式', '连环轻拳'],
        ['殿后扫踢', '震劲印记', '斗气唤回', '流派应击'],
        ['压轴崩拳', '内伤刻印', '残像拳式', '回身追打'],
        ['终幕升膝', '爆裂劲标', '武魂衍生', '疾风八打'],
        ['天崩终拳', '碎魂劲印', '武极化身', '流派处刑'],
        ['百式压轴', '灭世拳印', '武神残响', '终焉轰杀'],
    ],
};
const MECHANIC_DERIVED_NAMES = {
    sword: ['剑影追斩', '裂风剑影', '回锋残像', '灵剑突袭', '剑界化刃', '剑神余响'],
    brawler: ['拳影追打', '震劲残拳', '回身残像', '武魂突袭', '武极化拳', '武神余响'],
};
const mechanicScaling = (classId, amount) => classId === 'sword'
    ? { physicalAttack: amount * .54, strength: amount * .46 }
    : { physicalAttack: amount * .46, strength: amount * .54 };
const multiHitDamage = (hits, base, scaling, onHitStatus = null, damageExtra = {}) => Array.from({ length: hits }, (_, hitIndex) => damage(
    base,
    scaling,
    { ...damageExtra, hitIndex: hitIndex + 1, hitCount: hits, ...(onHitStatus ? { onHitStatus } : {}) },
));

const PEAK_DERIVED_ATTACK_CARDS = ['sword', 'brawler'].flatMap((classId) => MECHANIC_ATTACK_RARITIES.map((rarity, rarityIndex) => {
    const profile = PEAK_CARD_BALANCE[rarity];
    const style = classId === 'sword' ? 'slash' : 'strike';
    return card(
        `derived_${classId}_${rarity}`,
        MECHANIC_DERIVED_NAMES[classId][rarityIndex],
        'attack', rarity, classId, 0,
        `仅由卡牌效果生成的临时追击牌；造成较低伤害，战斗结束后消失。`,
        [damage(profile.base * .34, mechanicScaling(classId, profile.scaling * .34))],
        { ...attackData(style, ['standing'], 'standing'), generatedOnly: true, temporary: true, exhaustOnUse: true, tags: [classId === 'sword' ? '剑士' : '格斗家', '衍生', '临时'] },
    );
}));

const PEAK_MECHANIC_ATTACK_CARDS = ['sword', 'brawler'].flatMap((classId) => MECHANIC_ATTACK_RARITIES.flatMap((rarity, rarityIndex) => {
    const profile = PEAK_CARD_BALANCE[rarity];
    const names = MECHANIC_ATTACK_NAMES[classId][rarityIndex];
    const mainStyle = classId === 'sword' ? 'slash' : 'strike';
    const alternateStyle = classId === 'sword' ? 'thrust' : 'kick';
    const className = classId === 'sword' ? '剑士' : '格斗家';
    const endState = rarityIndex >= 4 ? 'knockedDown' : 'standing';
    const positionBonus = 4 + rarityIndex;
    const delayedRatio = .28 + rarityIndex * .015;
    const sourceRatio = .48 + rarityIndex * .02;
    const generatedId = `derived_${classId}_${rarity}`;

    const positionCard = card(
        `mechanic_${classId}_${rarity}_position`, names[0], 'attack', rarity, classId, rarityIndex,
        `必须位于队列最后；此前每张进攻牌使本牌伤害提高${positionBonus}%，最多计算4张。`,
        [damage(profile.base * .62, mechanicScaling(classId, profile.scaling * .62)), ...(endState === 'knockedDown' ? [state('knockedDown')] : [])],
        { ...attackData(rarityIndex >= 4 ? 'finisher' : mainStyle, rarityIndex >= 4 ? ['standing', 'launched', 'airborne'] : ['standing'], endState), requiresQueueLast: true, positionScaling: { category: 'attack', perPrior: positionBonus, maxStacks: 4 }, tags: [className, '位置攻击', '压轴'] },
    );

    const delayedCard = card(
        `mechanic_${classId}_${rarity}_delayed`, names[1], 'attack', rarity, classId, rarityIndex,
        `造成较低伤害并埋下延迟爆发标记；下一次受到卡牌命中时引爆。`,
        [damage(profile.base * .42, mechanicScaling(classId, profile.scaling * .42)), { type: 'delayedBurst', base: profile.base * delayedRatio, scaling: mechanicScaling(classId, profile.scaling * delayedRatio), damageType: 'physical' }],
        { ...attackData(alternateStyle, ['standing'], 'standing'), tags: [className, '延迟爆发', '标记'] },
    );

    const derivedCard = card(
        `mechanic_${classId}_${rarity}_derived`, names[2], 'attack', rarity, classId, rarityIndex,
        `造成伤害，并获得1张同稀有度的临时衍生追击牌。`,
        [damage(profile.base * sourceRatio, mechanicScaling(classId, profile.scaling * sourceRatio)), { type: 'generateCard', cardId: generatedId, temporary: true }],
        { ...attackData(mainStyle, ['standing'], 'standing'), tags: [className, '衍生', '临时牌'] },
    );

    let mechanismEffects;
    let mechanismExtra;
    let mechanismSummary;
    if (rarityIndex === 0 || rarityIndex === 3) {
        const hits = rarityIndex === 0 ? 3 : 6;
        const onHitStatus = { status: 'bleed', chance: rarityIndex === 0 ? 18 : 28, stacks: 1, duration: 2 };
        mechanismEffects = multiHitDamage(hits, profile.base * .76, mechanicScaling(classId, profile.scaling * .76), onHitStatus);
        mechanismExtra = { ...attackData(alternateStyle, ['standing'], 'standing'), tags: [className, '多段命中', `${hits}段`] };
        mechanismSummary = `${hits}段独立伤害，每段独立暴击并有${onHitStatus.chance}%几率施加1层流血。`;
    } else if (rarityIndex === 1) {
        const styleRules = classId === 'sword'
            ? { slash: { damageBonus: 12, status: 'bleed', stacks: 1, duration: 2 }, launch: { damageBonus: 7, status: 'vulnerable', stacks: 1, duration: 1 }, thrust: { damageBonus: 10 } }
            : { strike: { damageBonus: 12, status: 'vulnerable', stacks: 1, duration: 1 }, kick: { damageBonus: 10, status: 'bleed', stacks: 1, duration: 2 }, launch: { damageBonus: 7 } };
        mechanismEffects = [damage(profile.base * .68, mechanicScaling(classId, profile.scaling * .68))];
        mechanismExtra = { ...attackData(mainStyle, ['standing'], 'standing'), styleFollowUp: styleRules, tags: [className, '流派追击'] };
        mechanismSummary = `根据前一张进攻牌的攻击流派，触发不同的增伤或负面状态。`;
    } else if (rarityIndex === 2) {
        mechanismEffects = [damage(profile.base * .7, mechanicScaling(classId, profile.scaling * .7))];
        mechanismExtra = { ...attackData(mainStyle, ['standing'], 'standing'), recycleOnResolve: { states: ['launched', 'airborne'], damagePenalty: 30 }, tags: [className, '回收追击', '再利用'] };
        mechanismSummary = `结算后进入追击区；目标变为击飞或浮空时返回手牌，再次使用时伤害降低30%。`;
    } else {
        const threshold = rarityIndex === 4 ? 2 : 3;
        const markBonus = rarityIndex === 4 ? 24 : 32;
        mechanismEffects = [damage(profile.base * .72, mechanicScaling(classId, profile.scaling * .72)), state('knockedDown')];
        mechanismExtra = { ...attackData('finisher', ['standing', 'launched', 'airborne'], 'knockedDown'), consumeStyleChain: { style: mainStyle, threshold, damageBonus: markBonus }, tags: [className, '终结标记', '终结'] };
        mechanismSummary = `此前连续使用${threshold}张${mainStyle === 'slash' ? '斩击' : '拳击'}流派进攻牌时消耗终结标记，伤害提高${markBonus}%并击倒目标。`;
    }

    const mechanismCard = card(
        `mechanic_${classId}_${rarity}_mechanism`, names[3], 'attack', rarity, classId, rarityIndex,
        mechanismSummary, mechanismEffects, mechanismExtra,
    );
    return [positionCard, delayedCard, derivedCard, mechanismCard];
}));

const QUEUE_ATTACK_SCOPES = {
    all: {
        label: '通用',
        names: [
            ['并肩直击', '简式连打'], ['无隙冲拳', '交错追身'], ['专注猛击', '三式合攻'],
            ['纯武连环', '万策破势'], ['孤锋镇阵', '四象终击'], ['武道归一', '森罗决胜'],
        ],
    },
    sword: {
        label: '剑士',
        names: [
            ['素刃横切', '变式双斩'], ['纯剑升势', '战术回锋'], ['无术疾斩', '三策剑舞'],
            ['剑阵连星', '百变流光'], ['唯剑断岳', '四式天坠'], ['万剑无杂', '森罗剑葬'],
        ],
    },
    brawler: {
        label: '格斗家',
        names: [
            ['朴实直拳', '变招二连'], ['纯武上勾', '战术旋踢'], ['无备崩拳', '三式乱打'],
            ['拳路连震', '百变连环'], ['唯武镇地', '四式陨击'], ['百拳归宗', '森罗武极'],
        ],
    },
};

const QUEUE_ATTACK_CONFIG = [
    {
        rarity: 'common', cost: 0, ratios: [.72, .66], hits: [1, 2],
        states: [{ from: ['standing'], to: 'standing' }, { from: ['standing'], to: 'standing' }],
        mechanics: [
            { condition: { type: 'exclude', categories: ['skill', 'defense'], excludeRecovery: true }, damageBonus: .08 },
            { condition: { type: 'variety', minimum: 2 }, damageByCategoryCount: { 2: .06, 3: .08, 4: .1 } },
        ],
    },
    {
        rarity: 'excellent', cost: 1, ratios: [.74, .68], hits: [1, 2],
        states: [{ from: ['standing'], to: 'launched' }, { from: ['launched'], to: 'airborne' }],
        mechanics: [
            { condition: { type: 'allCategory', category: 'attack' }, damageBonus: .11, reward: { type: 'restoreMp', minValue: 2, maxValue: 4 } },
            { condition: { type: 'includesCategories', categories: ['attack', 'buff'] }, damageBonus: .1, reward: { type: 'shield', minValue: 6, maxValue: 10 } },
        ],
    },
    {
        rarity: 'rare', cost: 2, ratios: [.78, .72], hits: [1, 3],
        states: [{ from: ['standing'], to: 'standing' }, { from: ['launched'], to: 'airborne' }],
        mechanics: [
            { condition: { type: 'exclude', categories: ['skill', 'defense'], excludeRecovery: true }, damageBonus: .15, reward: { type: 'classStatus', stacks: 1, duration: 1 } },
            { condition: { type: 'variety', minimum: 2 }, damageByCategoryCount: { 2: .1, 3: .15, 4: .18 } },
        ],
    },
    {
        rarity: 'scarce', cost: 3, ratios: [.8, .74], hits: [4, 3],
        states: [{ from: ['standing'], to: 'launched' }, { from: ['launched'], to: 'airborne' }],
        mechanics: [
            { condition: { type: 'allCategory', category: 'attack' }, damageBonus: .17, reward: { type: 'shield', minValue: 18, maxValue: 28 } },
            { condition: { type: 'distinctCategoriesAtLeast', count: 3 }, damageBonus: .17, reward: { type: 'restoreMp', minValue: 5, maxValue: 8 } },
        ],
    },
    {
        rarity: 'legendary', cost: 4, ratios: [.84, .76], hits: [1, 4],
        states: [{ from: ['launched', 'airborne'], to: 'knockedDown' }, { from: ['launched', 'airborne'], to: 'knockedDown' }],
        mechanics: [
            { condition: { type: 'allCategory', category: 'attack' }, damageBonus: .19, reward: { type: 'restoreMp', minValue: 7, maxValue: 11 } },
            { condition: { type: 'variety', minimum: 3 }, damageByCategoryCount: { 3: .17, 4: .22 }, reward: { type: 'classStatus', stacks: 1, duration: 2 } },
        ],
    },
    {
        rarity: 'epic', cost: 6, ratios: [.86, .78], hits: [5, 6],
        states: [{ from: ['launched', 'airborne'], to: 'knockedDown' }, { from: ['launched', 'airborne'], to: 'knockedDown' }],
        mechanics: [
            { condition: { type: 'allCategory', category: 'attack' }, damageBonus: .22, reward: { type: 'classStatus', stacks: 2, duration: 2 } },
            { condition: { type: 'variety', minimum: 3 }, damageByCategoryCount: { 3: .19, 4: .25 }, reward: { type: 'shield', minValue: 32, maxValue: 48 } },
        ],
    },
];

const queueAttackScaling = (classId, amount) => {
    if (classId === 'sword') return { physicalAttack: amount * .56, strength: amount * .44 };
    if (classId === 'brawler') return { physicalAttack: amount * .44, strength: amount * .56 };
    return { physicalAttack: amount * .5, strength: amount * .5 };
};
const queueAttackStyle = (classId, state, variant) => {
    if (state.to === 'knockedDown') return 'finisher';
    if (state.to === 'launched') return 'launch';
    if (state.to === 'airborne') return classId === 'brawler' ? 'kick' : 'air';
    if (classId === 'sword') return variant ? 'thrust' : 'slash';
    if (classId === 'brawler') return variant ? 'kick' : 'strike';
    return variant ? 'strike' : 'slash';
};
const queueRewardFor = (reward, classId) => {
    if (!reward) return undefined;
    if (reward.type !== 'classStatus') return { ...reward };
    return {
        type: 'status',
        status: classId === 'sword' ? 'bleed' : classId === 'brawler' ? 'vulnerable' : 'weak',
        stacks: reward.stacks,
        duration: reward.duration,
    };
};
const queueConditionText = (mechanic) => {
    const condition = mechanic.condition;
    if (condition.type === 'exclude') return '本回合队列中没有技能牌、恢复牌或防御牌';
    if (condition.type === 'allCategory') return '本回合队列全部为进攻牌';
    if (condition.type === 'includesCategories') return '本回合队列同时包含进攻牌与增益牌';
    if (condition.type === 'distinctCategoriesAtLeast') return `本回合队列至少包含${condition.count}种卡牌类别`;
    if (condition.type === 'variety') return `本回合队列包含至少${condition.minimum}种卡牌类别，类别越多增伤越高`;
    return '满足队列构成条件';
};
const queueRewardText = (reward) => {
    if (!reward) return '';
    if (reward.type === 'restoreMp') return `并恢复${reward.minValue}-${reward.maxValue}MP`;
    if (reward.type === 'shield') return `并获得${reward.minValue}-${reward.maxValue}点护盾`;
    if (reward.type === 'status') return `并施加${reward.stacks}层${PEAK_STATUS_EFFECTS[reward.status]?.name || reward.status}`;
    return '';
};
const queueDamageText = (mechanic) => mechanic.damageByCategoryCount
    ? Object.entries(mechanic.damageByCategoryCount).map(([count, bonus]) => `${count}种+${Math.round(bonus * 100)}%`).join('、')
    : `伤害提高${Math.round(mechanic.damageBonus * 100)}%`;

const PEAK_QUEUE_COMPOSITION_ATTACK_CARDS = Object.entries(QUEUE_ATTACK_SCOPES).flatMap(([classId, scope]) =>
    QUEUE_ATTACK_CONFIG.flatMap((config, rarityIndex) => [0, 1].map((variant) => {
        const profile = PEAK_CARD_BALANCE[config.rarity];
        const stateRule = config.states[variant];
        const hits = config.hits[variant];
        const mechanic = { ...config.mechanics[variant], reward: queueRewardFor(config.mechanics[variant].reward, classId) };
        const effects = hits > 1
            ? multiHitDamage(hits, profile.base * config.ratios[variant], queueAttackScaling(classId, profile.scaling * config.ratios[variant]))
            : [damage(profile.base * config.ratios[variant], queueAttackScaling(classId, profile.scaling * config.ratios[variant]))];
        if (stateRule.to !== 'standing') effects.push(state(stateRule.to));
        const rewardText = queueRewardText(mechanic.reward);
        const summary = `${hits > 1 ? `${hits}段独立伤害；` : ''}${queueConditionText(mechanic)}时，${queueDamageText(mechanic)}${rewardText ? `，${rewardText}` : ''}${stateRule.to === 'knockedDown' ? '，最后将目标击倒' : ''}。`;
        return card(
            `queue_attack_${classId}_${config.rarity}_${variant + 1}`,
            scope.names[rarityIndex][variant],
            'attack', config.rarity, classId, config.cost,
            summary,
            effects,
            {
                ...attackData(queueAttackStyle(classId, stateRule, variant), stateRule.from, stateRule.to),
                queueMechanic: { ...mechanic, description: queueConditionText(mechanic) },
                requiresQueueLast: rarityIndex >= 4,
                queueCompositionExpansion: true,
                tags: [scope.label, '队列构成', hits > 1 ? '多段命中' : stateRule.to === 'knockedDown' ? '终结' : '连段'],
            },
        );
    })));

const PEAK_SCARCE_CLASS_CARDS = [
    card('sword_scarce_sky_reversal', '断空回锋', 'attack', 'scarce', 'sword', 2, '衔接站立或浮空目标，以回锋斩终结连段并将其击倒。', [damage(68, { physicalAttack: 1.45, strength: 1.4 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'airborne'], 'knockedDown'), conditionalDamage: condition('targetState', .2, '目标处于浮空状态时，伤害提高20%。', { states: ['airborne'] }), tags: ['剑士', '终结', '罕见'] }),
    card('brawler_scarce_mountain_pursuit', '震岳追身', 'attack', 'scarce', 'brawler', 2, '追身重击站立或击飞目标，连段中使用时造成更高伤害并将其击倒。', [damage(68, { physicalAttack: 1.35, strength: 1.5 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'launched'], 'knockedDown'), conditionalDamage: condition('targetState', .2, '目标处于击飞状态时，伤害提高20%。', { states: ['launched'] }), tags: ['格斗家', '终结', '罕见'] }),
    card('sword_scarce_flowing_aegis', '流光剑幕', 'defense', 'scarce', 'sword', 2, '展开剑幕获得护盾，并在接下来两次受击时减免伤害。', [{ type: 'shield', base: 59, scaling: { vitality: 1.7, physicalDefense: .65 } }, { type: 'guard', reduction: 29, uses: 2, duration: 3 }], { tags: ['剑士', '护盾', '减伤'] }),
    card('brawler_scarce_vajra_armor', '金刚震甲', 'defense', 'scarce', 'brawler', 2, '以斗气凝成护甲，获得护盾并反弹接下来两次受到的伤害。', [{ type: 'shield', base: 59, scaling: { vitality: 1.8, physicalDefense: .55 } }, { type: 'thorns', ratio: 42, uses: 2, duration: 3 }], { tags: ['格斗家', '护盾', '反伤'] }),
    card('sword_scarce_rainbow_intent', '剑意贯虹', 'buff', 'scarce', 'sword', 1, '凝聚剑意，提高物理攻击与物理暴击。', [{ type: 'buff', stat: 'physicalAttack', value: 15, duration: 3 }, { type: 'buff', stat: 'physicalCrit', value: 7, duration: 3 }], { tags: ['剑士', '物攻', '暴击'] }),
    card('brawler_scarce_boiling_blood', '百炼沸血', 'buff', 'scarce', 'brawler', 1, '激发气血，提高力量与伤害增加。', [{ type: 'buff', stat: 'strength', value: 15, duration: 3 }, { type: 'buff', stat: 'damageIncrease', value: 7, duration: 3 }], { tags: ['格斗家', '力量', '增伤'] }),
    card('sword_scarce_frost_prison', '霜天剑狱', 'skill', 'scarce', 'sword', 3, '以寒霜剑气攻击目标并施加冰冻。', [damage(68, { physicalAttack: 1.45, strength: 1.1, iceElement: .3 }, { element: 'ice' }), { type: 'status', status: 'frozen', stacks: 3, duration: 3 }], { tags: ['剑士', '冰', '冰冻'] }),
    card('brawler_scarce_flame_dragon', '炎龙崩山', 'skill', 'scarce', 'brawler', 3, '以炎龙斗气轰击目标，施加灼烧并将其击倒。', [damage(68, { independentAttack: 1.35, strength: 1.2, fireElement: .3 }, { element: 'fire' }), { type: 'status', status: 'burn', stacks: 3, duration: 3 }, state('knockedDown')], { tags: ['格斗家', '火', '灼烧'] }),

    card('sword_scarce_guarding_sword_form', '守心剑架', 'defense', 'scarce', 'sword', 2, '架剑守心，获得护盾并抵消下一次有害异常。', [{ type: 'shield', base: 55, scaling: { vitality: 1.35, physicalDefense: .65 } }, { type: 'statusWard', value: 1, duration: 3 }], { baseScarceClassExpansion: true, tags: ['剑士', '基础', '异常屏障'] }),
    card('sword_scarce_rebounding_parry', '卸锋回震', 'defense', 'scarce', 'sword', 2, '卸开攻势形成护盾，接下来两次格挡会反震被减免的伤害。', [{ type: 'shield', base: 48, scaling: { vitality: 1.25, physicalDefense: .55 } }, { type: 'guard', reduction: 27, uses: 2, duration: 3, counterRatio: 36 }], { baseScarceClassExpansion: true, tags: ['剑士', '基础', '反震'] }),
    card('brawler_scarce_circulating_guard', '周天护体', 'defense', 'scarce', 'brawler', 2, '运转气血形成护盾，并净化自身两个负面状态。', [{ type: 'shield', base: 52, scaling: { vitality: 1.45, spirit: .55 } }, { type: 'cleanse', value: 2 }], { baseScarceClassExpansion: true, tags: ['格斗家', '基础', '净化'] }),
    card('brawler_scarce_iron_elbow_gate', '铁肘封门', 'defense', 'scarce', 'brawler', 2, '以铁肘封住攻势，获得护盾；接下来两次格挡会恢复MP。', [{ type: 'shield', base: 46, scaling: { vitality: 1.35, physicalDefense: .55 } }, { type: 'guard', reduction: 29, uses: 2, duration: 3, restoreMp: 4 }], { baseScarceClassExpansion: true, tags: ['格斗家', '基础', '格挡回能'] }),

    card('sword_scarce_thunder_wheel_rise', '雷轮升剑', 'skill', 'scarce', 'sword', 3, '以光属性剑弧攻击站立目标，施加易伤并将其击飞。', [damage(60, { physicalAttack: 1.3, strength: 1.15, lightElement: .35 }, { element: 'light' }), { type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }, state('launched')], { requiresTargetState: ['standing'], baseScarceClassExpansion: true, tags: ['剑士', '基础', '光', '击飞'] }),
    card('sword_scarce_frost_ring_chase', '霜环追刃', 'skill', 'scarce', 'sword', 3, '以三段冰属性剑气追击击飞目标，每段均有几率施加冰冻，最后使其浮空。', [...multiHitDamage(3, 62, { physicalAttack: 1.3, strength: 1.15, iceElement: .35 }, { status: 'frozen', stacks: 1, duration: 2, chance: 30 }, { element: 'ice' }), state('airborne')], { requiresTargetState: ['launched'], baseScarceClassExpansion: true, tags: ['剑士', '基础', '三段', '浮空'] }),
    card('brawler_scarce_shockwave_uppercut', '震电脉冲', 'skill', 'scarce', 'brawler', 3, '以光属性斗气冲击站立目标，施加虚弱并将其击飞。', [damage(60, { independentAttack: 1.3, strength: 1.2, lightElement: .35 }, { damageType: 'magical', element: 'light' }), { type: 'status', status: 'weak', stacks: 1, duration: 2 }, state('launched')], { requiresTargetState: ['standing'], baseScarceClassExpansion: true, tags: ['格斗家', '基础', '光', '击飞'] }),
    card('brawler_scarce_venom_combo', '毒雾连拳', 'skill', 'scarce', 'brawler', 3, '以三段暗属性拳劲追击击飞目标，每段均有几率施加中毒，最后使其浮空。', [...multiHitDamage(3, 62, { independentAttack: 1.3, strength: 1.2, darkElement: .35 }, { status: 'poison', stacks: 1, duration: 2, chance: 30 }, { damageType: 'magical', element: 'dark' }), state('airborne')], { requiresTargetState: ['launched'], baseScarceClassExpansion: true, tags: ['格斗家', '基础', '三段', '浮空'] }),

    card('sword_scarce_breathing_blade_cycle', '剑息周天', 'buff', 'scarce', 'sword', 1, '调整呼吸恢复MP，并短暂提高物理攻击。', [{ type: 'restoreMp', base: 16 }, { type: 'buff', stat: 'physicalAttack', value: 10, duration: 2 }], { baseScarceClassExpansion: true, tags: ['剑士', '基础', '回能'] }),
    card('sword_scarce_clear_blade_mind', '洞彻剑心', 'buff', 'scarce', 'sword', 1, '洞察攻防间隙，提高物理穿透与伤害减免。', [{ type: 'buff', stat: 'physicalPenetration', value: 12, duration: 3 }, { type: 'buff', stat: 'damageReduction', value: 9, duration: 3 }], { baseScarceClassExpansion: true, tags: ['剑士', '基础', '攻守'] }),
    card('brawler_scarce_centered_breath', '蓄气归元', 'buff', 'scarce', 'brawler', 1, '调匀气血，按已损生命恢复并提高力量。', [{ type: 'healMissing', value: 10 }, { type: 'buff', stat: 'strength', value: 10, duration: 2 }], { baseScarceClassExpansion: true, tags: ['格斗家', '基础', '恢复'] }),
    card('brawler_scarce_combat_rhythm', '疾战节拍', 'buff', 'scarce', 'brawler', 1, '进入连续作战节奏，提高独立攻击与物理暴击。', [{ type: 'buff', stat: 'independentAttack', value: 12, duration: 3 }, { type: 'buff', stat: 'physicalCrit', value: 10, duration: 3 }], { baseScarceClassExpansion: true, tags: ['格斗家', '基础', '爆发'] }),
];

const PEAK_UNIVERSAL_BLUE_PURPLE_CARDS = [
    card('universal_rare_breakline_strike', '破阵冲击', 'attack', 'rare', 'all', 3, '冲击站立目标并施加易伤，为后续伤害创造窗口。', [damage(55, { physicalAttack: 1.15, strength: 1.3 }), { type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }], { ...attackData('strike', ['standing'], 'standing'), universalBluePurpleExpansion: true, tags: ['通用', '破阵'] }),
    card('universal_rare_aerial_crash', '凌空追坠', 'attack', 'rare', 'all', 3, '追击击飞或浮空目标，以重击结束空中连段。', [damage(55, { physicalAttack: 1.2, strength: 1.25 }), state('knockedDown')], { ...attackData('finisher', ['launched', 'airborne'], 'knockedDown'), universalBluePurpleExpansion: true, tags: ['通用', '终结'] }),
    card('universal_scarce_chain_lift', '连势升击', 'attack', 'scarce', 'all', 3, '从多种状态衔接升击，并维持目标的击飞状态。', [damage(68, { physicalAttack: 1.35, strength: 1.5 }), state('launched')], { ...attackData('launch', ['standing', 'airborne', 'launched'], 'launched', { allowSame: true }), universalBluePurpleExpansion: true, tags: ['通用', '击飞'] }),
    card('universal_scarce_grounding_finish', '镇地终击', 'attack', 'scarce', 'all', 3, '重击站立或浮空目标；终结浮空目标时伤害进一步提高。', [damage(68, { physicalAttack: 1.4, strength: 1.45 }), state('knockedDown')], { ...attackData('finisher', ['standing', 'airborne'], 'knockedDown'), conditionalDamage: condition('targetState', .2, '目标处于浮空状态时，伤害提高20%。', { states: ['airborne'] }), universalBluePurpleExpansion: true, tags: ['通用', '终结'] }),

    card('universal_rare_tactical_deflection', '战术偏转', 'defense', 'rare', 'all', 3, '获得护盾，并以格挡降低下一次伤害并进行反震。', [{ type: 'shield', base: 49, scaling: { vitality: 1.5, physicalDefense: .55 } }, { type: 'guard', reduction: 25, uses: 1, duration: 2, counterRatio: 35 }], { universalBluePurpleExpansion: true, tags: ['通用', '格挡'] }),
    card('universal_rare_purifying_layer', '净化护层', 'defense', 'rare', 'all', 3, '获得护盾并净化一个负面状态。', [{ type: 'shield', base: 49, scaling: { vitality: 1.5, magicalDefense: .55 } }, { type: 'cleanse', value: 1 }], { universalBluePurpleExpansion: true, tags: ['通用', '净化'] }),
    card('universal_scarce_immovable_bastion', '不动壁垒', 'defense', 'scarce', 'all', 3, '获得护盾，并限制接下来两次受到的单次伤害。', [{ type: 'shield', base: 59, scaling: { vitality: 1.75, physicalDefense: .65 } }, { type: 'damageCap', ratio: 31, uses: 2, duration: 3 }], { universalBluePurpleExpansion: true, tags: ['通用', '伤害上限'] }),
    card('universal_scarce_echoing_ward', '回响护阵', 'defense', 'scarce', 'all', 3, '获得护盾；护盾被击破时按已损生命恢复并抽牌。', [{ type: 'shield', base: 59, scaling: { vitality: 1.7, spirit: .7 } }, { type: 'shieldBreak', healPercent: 12, draw: 1, uses: 2, duration: 3 }], { universalBluePurpleExpansion: true, tags: ['通用', '破盾回响'] }),

    card('universal_rare_psionic_pull', '灵能牵引', 'skill', 'rare', 'all', 3, '以灵能冲击目标并将其牵引至击飞状态。', [damage(55, { independentAttack: 1.25, strength: .7, intelligence: .7 }), state('launched')], { requiresTargetState: ['standing', 'airborne'], universalBluePurpleExpansion: true, tags: ['通用', '击飞'] }),
    card('universal_rare_rift_pulse', '裂隙脉冲', 'skill', 'rare', 'all', 3, '释放暗属性脉冲造成魔法伤害并施加虚弱。', [damage(55, { independentAttack: 1.25, intelligence: 1.2 }, { damageType: 'magical', element: 'dark' }), { type: 'status', status: 'weak', stacks: 1, duration: 2 }], { universalBluePurpleExpansion: true, tags: ['通用', '暗', '虚弱'] }),
    card('universal_scarce_prismatic_impact', '四象冲击', 'skill', 'scarce', 'all', 3, '汇聚光属性能量造成魔法伤害并施加易伤。', [damage(68, { independentAttack: 1.45, intelligence: 1.4 }, { damageType: 'magical', element: 'light' }), { type: 'status', status: 'vulnerable', stacks: 1, duration: 3 }], { universalBluePurpleExpansion: true, tags: ['通用', '光', '易伤'] }),
    card('universal_scarce_gravity_collapse', '重力坍缩', 'skill', 'scarce', 'all', 3, '以暗属性重力场造成魔法伤害并将目标压倒。', [damage(68, { independentAttack: 1.45, intelligence: 1.4 }, { damageType: 'magical', element: 'dark' }), state('knockedDown')], { universalBluePurpleExpansion: true, tags: ['通用', '暗', '击倒'] }),

    card('universal_rare_offense_calibration', '攻势校准', 'buff', 'rare', 'all', 3, '同步校准武器与术式，提高物理攻击和魔法攻击。', [{ type: 'buff', stat: 'physicalAttack', value: 13, duration: 2 }, { type: 'buff', stat: 'magicalAttack', value: 13, duration: 2 }], { universalBluePurpleExpansion: true, tags: ['通用', '双攻'] }),
    card('universal_rare_psionic_cycle', '灵能循环', 'buff', 'rare', 'all', 3, '恢复MP并提高独立攻击，使高消耗队列更易连续运转。', [{ type: 'restoreMp', base: 18 }, { type: 'buff', stat: 'independentAttack', value: 8, duration: 2 }], { universalBluePurpleExpansion: true, tags: ['通用', '回能'] }),
    card('universal_scarce_limit_focus', '极限专注', 'buff', 'scarce', 'all', 3, '进入极限专注，提高伤害增加与暴击伤害。', [{ type: 'buff', stat: 'damageIncrease', value: 12, duration: 3 }, { type: 'buff', stat: 'criticalDamage', value: 15, duration: 3 }], { universalBluePurpleExpansion: true, tags: ['通用', '爆发'] }),
    card('universal_scarce_offense_defense_resonance', '攻守共鸣', 'buff', 'scarce', 'all', 3, '协调攻防节奏，同时提高伤害增加与伤害减免。', [{ type: 'buff', stat: 'damageIncrease', value: 12, duration: 3 }, { type: 'buff', stat: 'damageReduction', value: 12, duration: 3 }], { universalBluePurpleExpansion: true, tags: ['通用', '攻守'] }),
];

const PEAK_ADVANCEMENT_CARDS = [
    card('ice_shadow_frost_lift', '寒痕升斩', 'attack', 'common', 'sword', 1, '以冷冽剑势将站立或浮空目标击飞，为冰系技能创造衔接。', [damage(21, { physicalAttack: .62, strength: .68 }), state('launched')], { ...attackData('launch', ['standing', 'airborne'], 'launched'), requiredAdvancement: { pathId: 'ice_shadow', minTier: 1 }, advancementCard: true, tags: ['冰影', '击飞'] }),
    card('ice_shadow_frost_mirror', '霜镜剑守', 'defense', 'excellent', 'sword', 2, '凝成霜镜护盾，并以格挡减轻下一次伤害。', [{ type: 'shield', base: 34, scaling: { vitality: 1.25, spirit: .45 } }, { type: 'guard', reduction: 18, uses: 1, duration: 2 }], { requiredAdvancement: { pathId: 'ice_shadow', minTier: 1 }, advancementCard: true, tags: ['冰影', '护盾'] }),
    card('ice_shadow_wheel_combo', '冰轮连斩', 'skill', 'rare', 'sword', 3, '以三段冰刃追击击飞或浮空目标，维持浮空并施加冰冻。', [...multiHitDamage(3, 55, { physicalAttack: 1.2, strength: .95, iceElement: .3 }, null, { element: 'ice' }), { type: 'status', status: 'frozen', stacks: 2, duration: 2 }, state('airborne')], { requiresTargetState: ['launched', 'airborne'], requiredAdvancement: { pathId: 'ice_shadow', minTier: 1 }, advancementCard: true, tags: ['冰影', '多段', '冰冻'] }),
    card('ice_shadow_prison_domain', '霜狱封界', 'buff', 'legendary', 'sword', 5, '展开霜狱领域，提高冰属性强化，并强化下一张技能牌。', [{ type: 'buff', stat: 'iceElement', value: 18, duration: 3 }, { type: 'empower', category: 'skill', value: 13, uses: 1 }], { requiredAdvancement: { pathId: 'ice_shadow', minTier: 2 }, advancementCard: true, tags: ['霜狱剑魂', '冰强'] }),
    card('ice_shadow_soul_burial', '霜狱葬魂剑', 'skill', 'epic', 'sword', 7, '斩落浮空目标；目标已有冰冻时造成更高伤害并将其击倒。', [damage(108, { physicalAttack: 2, strength: 1.8, iceElement: .3 }, { element: 'ice' }), { type: 'status', status: 'frozen', stacks: 4, duration: 4 }, state('knockedDown')], { requiresTargetState: ['airborne'], conditionalDamage: condition('targetHasStatus', .25, '目标已有冰冻时伤害提高25%。', { statuses: ['frozen'] }), requiredAdvancement: { pathId: 'ice_shadow', minTier: 2 }, advancementCard: true, tags: ['霜狱剑魂', '终结'] }),

    card('light_guardian_returning_slash', '返光剑式', 'attack', 'common', 'sword', 1, '斩击站立目标；作为本回合第一张进攻牌时略微提高伤害。', [damage(24, { physicalAttack: .68, strength: .72 })], { ...attackData('slash', ['standing'], 'standing'), conditionalDamage: condition('queuePosition', .08, '作为队列首张牌时伤害提高8%。', { position: 1 }), requiredAdvancement: { pathId: 'light_guardian', minTier: 1 }, advancementCard: true, tags: ['神光剑卫', '起手'] }),
    card('light_guardian_sacred_wall', '圣辉剑壁', 'defense', 'excellent', 'sword', 2, '获得护盾并使部分护盾保留至下一回合。', [{ type: 'shield', base: 34, scaling: { vitality: 1.35, lightElement: .25 } }, { type: 'retainShield', value: 18 }], { requiredAdvancement: { pathId: 'light_guardian', minTier: 1 }, advancementCard: true, tags: ['神光剑卫', '护盾保留'] }),
    card('light_guardian_radiant_charge', '曜光突进', 'skill', 'rare', 'sword', 3, '以光剑突进站立或击飞目标，使其进入浮空并施加易伤。', [damage(55, { physicalAttack: 1.15, strength: .95, lightElement: .35 }, { element: 'light' }), { type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }, state('airborne')], { requiresTargetState: ['standing', 'launched'], requiredAdvancement: { pathId: 'light_guardian', minTier: 1 }, advancementCard: true, tags: ['神光剑卫', '光', '浮空'] }),
    card('light_guardian_emperor_array', '皇曜剑阵', 'buff', 'legendary', 'sword', 5, '展开皇曜剑阵，获得护盾并提高伤害减免。', [{ type: 'shield', base: 68, scaling: { vitality: 1.5, lightElement: .45 } }, { type: 'buff', stat: 'damageReduction', value: 13, duration: 3 }], { requiredAdvancement: { pathId: 'light_guardian', minTier: 2 }, advancementCard: true, tags: ['曜光剑皇', '剑阵'] }),
    card('light_guardian_heaven_verdict', '曜光天裁', 'skill', 'epic', 'sword', 7, '以曜光裁决浮空目标，造成三段光属性伤害并将其击倒。', [...multiHitDamage(3, 108, { physicalAttack: 1.85, strength: 1.65, lightElement: .6 }, null, { element: 'light' }), state('knockedDown')], { requiresTargetState: ['airborne'], requiredAdvancement: { pathId: 'light_guardian', minTier: 2 }, advancementCard: true, tags: ['曜光剑皇', '多段', '终结'] }),

    card('flame_brawler_heated_jab', '升温直拳', 'attack', 'common', 'brawler', 1, '以迅猛直拳攻击站立目标，作为连续进攻的稳定起手。', [damage(24, { physicalAttack: .65, strength: .78 })], { ...attackData('strike', ['standing'], 'standing'), requiredAdvancement: { pathId: 'flame_brawler', minTier: 1 }, advancementCard: true, tags: ['炎拳斗士', '起手'] }),
    card('flame_brawler_magma_guard', '熔岩护体', 'defense', 'excellent', 'brawler', 2, '凝聚高温斗气形成护盾，并反弹下一次受到的伤害。', [{ type: 'shield', base: 34, scaling: { vitality: 1.45 } }, { type: 'thorns', ratio: 20, uses: 1, duration: 2 }], { requiredAdvancement: { pathId: 'flame_brawler', minTier: 1 }, advancementCard: true, tags: ['炎拳斗士', '反伤'] }),
    card('flame_brawler_burst_combo', '爆炎连拳', 'skill', 'rare', 'brawler', 3, '对站立目标发动四段火焰拳击，每段独立暴击并可能施加灼烧。', [...multiHitDamage(4, 55, { independentAttack: 1.1, strength: 1.15, fireElement: .2 }, { status: 'burn', stacks: 1, duration: 2, chance: 35 }, { element: 'fire' })], { requiresTargetState: ['standing'], requiredAdvancement: { pathId: 'flame_brawler', minTier: 1 }, advancementCard: true, tags: ['炎拳斗士', '多段', '灼烧'] }),
    card('flame_brawler_inferno_blood', '炼狱沸血', 'buff', 'legendary', 'brawler', 5, '点燃战意，提高力量、物理暴击和火属性强化。', [{ type: 'buff', stat: 'strength', value: 18, duration: 3 }, { type: 'buff', stat: 'physicalCrit', value: 9, duration: 3 }, { type: 'buff', stat: 'fireElement', value: 12, duration: 3 }], { requiredAdvancement: { pathId: 'flame_brawler', minTier: 2 }, advancementCard: true, tags: ['炼狱拳皇', '爆发'] }),
    card('flame_brawler_hell_crusher', '煌狱崩拳', 'skill', 'epic', 'brawler', 7, '引爆拳势轰落浮空目标，施加大量灼烧并将其击倒。', [damage(108, { independentAttack: 1.9, strength: 1.95, fireElement: .25 }, { element: 'fire' }), { type: 'status', status: 'burn', stacks: 5, duration: 4 }, state('knockedDown')], { requiresTargetState: ['airborne'], conditionalDamage: condition('targetHasStatus', .25, '目标已有灼烧时伤害提高25%。', { statuses: ['burn'] }), requiredAdvancement: { pathId: 'flame_brawler', minTier: 2 }, advancementCard: true, tags: ['炼狱拳皇', '终结'] }),

    card('shadow_fist_step_stab', '影步刺拳', 'attack', 'common', 'brawler', 1, '从暗影中刺击站立目标并施加轻微流血。', [damage(21, { physicalAttack: .62, strength: .7 }), { type: 'status', status: 'bleed', stacks: 1, duration: 2 }], { ...attackData('thrust', ['standing'], 'standing'), requiredAdvancement: { pathId: 'shadow_fist', minTier: 1 }, advancementCard: true, tags: ['暗影之拳', '流血'] }),
    card('shadow_fist_phantom_guard', '潜影架势', 'defense', 'excellent', 'brawler', 2, '进入潜影架势，格挡下一次伤害并抵消一次有害异常。', [{ type: 'guard', reduction: 18, uses: 1, duration: 2 }, { type: 'statusWard', value: 1, duration: 2 }], { requiredAdvancement: { pathId: 'shadow_fist', minTier: 1 }, advancementCard: true, tags: ['暗影之拳', '异常屏障'] }),
    card('shadow_fist_venom_fangs', '毒影连牙', 'skill', 'rare', 'brawler', 3, '以三段暗属性攻击撕开目标，每段可能施加中毒。', [...multiHitDamage(3, 55, { independentAttack: 1.15, strength: .9, darkElement: .3 }, { status: 'poison', stacks: 1, duration: 2, chance: 45 }, { element: 'dark' })], { requiresTargetState: ['standing', 'launched'], requiredAdvancement: { pathId: 'shadow_fist', minTier: 1 }, advancementCard: true, tags: ['暗影之拳', '多段', '中毒'] }),
    card('shadow_fist_nether_mark', '幽冥蚀印', 'buff', 'legendary', 'brawler', 5, '强化幽冥之力，提高暗属性强化和伤害增加。', [{ type: 'buff', stat: 'darkElement', value: 18, duration: 3 }, { type: 'buff', stat: 'damageIncrease', value: 13, duration: 3 }], { requiredAdvancement: { pathId: 'shadow_fist', minTier: 2 }, advancementCard: true, tags: ['幽冥拳宗', '暗强'] }),
    card('shadow_fist_nether_judgment', '幽冥断罪', 'skill', 'epic', 'brawler', 7, '处决浮空目标；目标带有中毒或流血时造成更高暗属性伤害并将其击倒。', [damage(108, { independentAttack: 1.95, strength: 1.75, darkElement: .35 }, { element: 'dark' }), { type: 'status', status: 'poison', stacks: 4, duration: 4 }, state('knockedDown')], { requiresTargetState: ['airborne'], conditionalDamage: condition('targetHasStatus', .25, '目标带有中毒或流血时伤害提高25%。', { statuses: ['poison', 'bleed'] }), requiredAdvancement: { pathId: 'shadow_fist', minTier: 2 }, advancementCard: true, tags: ['幽冥拳宗', '终结'] }),
];

const PEAK_ROUTE_SPECIAL_COSTS = { common: 0, excellent: 0, rare: 0, scarce: 0, legendary: 0, epic: 0 };
const PEAK_ROUTE_SPECIAL_META = {
    ice_shadow: { classId: 'sword', firstName: '冰影', secondName: '霜狱剑魂' },
    light_guardian: { classId: 'sword', firstName: '神光剑卫', secondName: '曜光剑皇' },
    flame_brawler: { classId: 'brawler', firstName: '炎拳斗士', secondName: '炼狱拳皇' },
    shadow_fist: { classId: 'brawler', firstName: '暗影之拳', secondName: '幽冥拳宗' },
};
const routeSpecial = (pathId, rarity, name, summary, effects, extra = {}) => {
    const meta = PEAK_ROUTE_SPECIAL_META[pathId];
    const minTier = ['legendary', 'epic'].includes(rarity) ? 2 : 1;
    const { tags = [], ...rest } = extra;
    return card(`route_special_${pathId}_${rarity}`, name, 'special', rarity, meta.classId, PEAK_ROUTE_SPECIAL_COSTS[rarity], summary, effects, {
        requiredAdvancement: { pathId, minTier }, advancementCard: true, routeSpecialExpansion: true,
        tags: [minTier >= 2 ? meta.secondName : meta.firstName, '路线特殊牌', ...tags],
        ...rest,
    });
};

const PEAK_SWORD_BRAWLER_ROUTE_SPECIALS = [
    routeSpecial('ice_shadow', 'common', '寒印归息', '恢复MP；目标已有冰冻时额外获得1-2层寒霜印记。', [
        { type: 'restoreMp', base: 6 },
        { type: 'conditionalRouteResource', condition: 'targetStatus', statuses: ['frozen'], minValue: 1, maxValue: 2 },
    ], { tags: ['冰冻', '回能'] }),
    routeSpecial('ice_shadow', 'excellent', '霜步牵影', '以霜步重置连段，将目标牵引至击飞并施加冰冻，同时获得1-2层寒霜印记。', [
        state('launched'), { type: 'status', status: 'frozen', stacks: 1, duration: 2 },
        { type: 'conditionalRouteResource', condition: 'targetStatus', statuses: ['frozen'], minValue: 1, maxValue: 2 },
    ], { tags: ['连段重置', '冰冻'] }),
    routeSpecial('ice_shadow', 'rare', '冰轮复写', '从弃牌堆回收最近1-2张冰属性进攻牌或技能牌。', [
        { type: 'filteredRecall', categories: ['attack', 'skill'], elements: ['ice'], minValue: 1, maxValue: 2 },
    ], { tags: ['冰属性', '回收'] }),
    routeSpecial('ice_shadow', 'scarce', '霜痕延刻', '为目标冰冻追加1-2层并延长2-3回合；若尚未冰冻则种下冰冻，同时获得寒霜印记。', [
        { type: 'statusExtend', statuses: ['frozen'], minDuration: 2, maxDuration: 3, minStacks: 1, maxStacks: 2, seedStatus: 'frozen', gainRoutePerStatus: 1 },
    ], { tags: ['冰冻延长', '印记'] }),
    routeSpecial('ice_shadow', 'legendary', '霜狱封印', '寒霜印记立即充满；接下来1-2次触发满印增伤后不消耗印记。', [
        { type: 'gainRouteResource', value: 99 }, { type: 'routeResourcePreserve', minUses: 1, maxUses: 2 },
    ], { tags: ['满印', '双重爆发'] }),
    routeSpecial('ice_shadow', 'epic', '绝对零度·碎时', '收割目标全部冰冻层数造成真实伤害，并将目标冻结在眩晕状态。', [
        { type: 'statusHarvest', statuses: ['frozen'], maxStacks: 6, damagePerStack: 22, damageType: 'true', consume: true },
        state('stunned'),
    ], { tags: ['冰冻收割', '真实伤害', '眩晕'] }),

    routeSpecial('light_guardian', 'common', '守光纳辉', '获得基础护盾；护盾达到生命上限5%时额外获得1-2层神光。', [
        { type: 'shield', base: 14, scaling: { vitality: .45, lightElement: .12 } },
        { type: 'conditionalRouteResource', condition: 'actorShield', threshold: .05, minValue: 1, maxValue: 2 },
    ], { tags: ['护盾', '神光'] }),
    routeSpecial('light_guardian', 'excellent', '辉盾回流', '将当前护盾的30%-45%转化为MP，并获得1层神光。', [
        { type: 'shieldToMp', minValue: 30, maxValue: 45 }, { type: 'gainRouteResource', value: 1 },
    ], { tags: ['护盾转化', '回能'] }),
    routeSpecial('light_guardian', 'rare', '圣壁反照', '以当前护盾为镜，对敌人造成不消耗护盾的真实反照伤害。', [
        { type: 'shieldStrike', minRatio: 32, maxRatio: 48, capPercent: 20, consumePercent: 0, element: 'light', bossFactor: .5 },
    ], { tags: ['护盾反击', '真实伤害'] }),
    routeSpecial('light_guardian', 'scarce', '神光换阵', '消耗全部神光，按层获得护盾与MP，并抽取1张牌完成攻守换阵。', [
        { type: 'routeResourcePayoff', shieldPerMark: 11, mpPerMark: 2, consume: true }, { type: 'draw', value: 1 },
    ], { tags: ['神光兑现', '换阵'] }),
    routeSpecial('light_guardian', 'legendary', '皇曜先见', '预判敌方下一张伤害牌，大幅减伤，并把减免量转化为护盾。', [
        { type: 'forecastGuard', categories: ['attack', 'skill'], minReduction: 36, maxReduction: 52, minShieldRatio: 70, maxShieldRatio: 100, uses: 1 },
    ], { tags: ['预判', '护盾反制'] }),
    routeSpecial('light_guardian', 'epic', '天穹圣裁', '献出一半护盾发动圣裁，以献出的护盾造成高额真实伤害。', [
        { type: 'shieldStrike', minRatio: 140, maxRatio: 190, capPercent: 45, consumePercent: 50, element: 'light', bossFactor: .5 },
    ], { tags: ['护盾献祭', '真实伤害'] }),

    routeSpecial('flame_brawler', 'common', '热身开场', '根据本回合队列中的进攻牌数量积累热意，最多获得2-3层。', [
        { type: 'conditionalRouteResource', condition: 'queueCategoryCount', category: 'attack', perCard: 1, minCap: 2, maxCap: 3 },
    ], { tags: ['连拳', '热意'] }),
    routeSpecial('flame_brawler', 'excellent', '燃血升温', '消耗当前生命（Lv.1为12%，Lv.10降至6%），立即将热意推至上限。', [
        { type: 'sacrificeCurrentHp', minValue: 12, maxValue: 6 }, { type: 'gainRouteResource', value: 99 },
    ], { tags: ['燃血', '满热意'] }),
    routeSpecial('flame_brawler', 'rare', '爆炎续拳', '本回合接下来2-3次施加灼烧时额外增加1-2层灼烧。', [
        { type: 'statusEcho', statuses: ['burn'], minBonusStacks: 1, maxBonusStacks: 2, durationBonus: 0, minUses: 2, maxUses: 3 },
    ], { tags: ['灼烧增幅', '连续进攻'] }),
    routeSpecial('flame_brawler', 'scarce', '沸点封存', '热意立即充满；接下来1-2次触发满热意增伤后不消耗热意。', [
        { type: 'gainRouteResource', value: 99 }, { type: 'routeResourcePreserve', minUses: 1, maxUses: 2 },
    ], { tags: ['热意封存', '连续爆发'] }),
    routeSpecial('flame_brawler', 'legendary', '炼狱回炉', '收回目标最多5层灼烧，每层转化为1层热意和2MP，并强化本回合拳技。', [
        { type: 'statusHarvest', statuses: ['burn'], maxStacks: 5, damagePerStack: 0, consume: true, restoreRoutePerStack: 1, restoreMpPerStack: 2 },
        { type: 'classCategoryRoundDamageBoost', classId: 'brawler', categories: ['attack', 'skill'], minValue: 14, maxValue: 24 },
    ], { tags: ['灼烧回收', '热意循环'] }),
    routeSpecial('flame_brawler', 'epic', '焚天·终焉爆拳', '引爆目标全部灼烧，以每层灼烧造成一段无视防御的终焉伤害并击倒目标。', [
        { type: 'statusHarvest', statuses: ['burn'], maxStacks: 10, damagePerStack: 24, damageType: 'true', consume: true },
        state('knockedDown'),
    ], { tags: ['灼烧引爆', '真实伤害', '终结'] }),

    routeSpecial('shadow_fist', 'common', '影痕潜取', '检索1张进攻牌；目标带有中毒或流血时额外获得1-2层幽影印记。', [
        { type: 'drawCategory', category: 'attack', value: 1 },
        { type: 'conditionalRouteResource', condition: 'targetStatus', statuses: ['poison', 'bleed'], minValue: 1, maxValue: 2 },
    ], { tags: ['破绽', '检索'] }),
    routeSpecial('shadow_fist', 'excellent', '毒血易形', '将目标层数最高的中毒或流血转换成另一种异常，保留层数与持续时间，并获得1-2层幽影印记。', [
        { type: 'statusTransmute', mapping: { poison: 'bleed', bleed: 'poison' } },
        { type: 'conditionalRouteResource', condition: 'targetStatus', statuses: ['poison', 'bleed'], minValue: 1, maxValue: 2 },
    ], { tags: ['毒血转化', '异常操控'] }),
    routeSpecial('shadow_fist', 'rare', '残影窃招', '从弃牌堆找到最近1-2张施加中毒或流血的牌，获得其临时复制。', [
        { type: 'filteredRecall', statuses: ['poison', 'bleed'], categories: ['attack', 'skill'], minValue: 1, maxValue: 2, copy: true, temporary: true, exhaustAfterUse: true },
    ], { tags: ['窃招', '临时复制'] }),
    routeSpecial('shadow_fist', 'scarce', '幽痕续命', '将目标的中毒与流血延长2-3回合；每种成功延长的异常各提供1层幽影印记。', [
        { type: 'statusExtend', statuses: ['poison', 'bleed'], minDuration: 2, maxDuration: 3, minStacks: 0, maxStacks: 0, gainRoutePerStatus: 1 },
    ], { tags: ['异常延长', '幽影印记'] }),
    routeSpecial('shadow_fist', 'legendary', '万影叠毒', '本回合接下来2-3次施加中毒或流血时，额外增加2-3层并延长1回合。', [
        { type: 'statusEcho', statuses: ['poison', 'bleed'], minBonusStacks: 2, maxBonusStacks: 3, durationBonus: 1, minUses: 2, maxUses: 3 },
    ], { tags: ['异常复制', '叠层'] }),
    routeSpecial('shadow_fist', 'epic', '无间·毒血葬', '收割目标全部中毒与流血层数，造成真实伤害，并按收割层数恢复MP。', [
        { type: 'statusHarvest', statuses: ['poison', 'bleed'], maxStacks: 12, damagePerStack: 20, damageType: 'true', consume: true, restoreMpPerStack: 1 },
    ], { tags: ['毒血收割', '真实伤害', '回能'] }),
];

const PEAK_ADVANCEMENT_EXPANSION_RARITIES = ['common', 'excellent', 'rare', 'scarce', 'legendary', 'epic'];
const PEAK_ADVANCEMENT_EXPANSION_COSTS = [0, 1, 2, 3, 5, 7];
const PEAK_ADVANCEMENT_EXPANSION_CONFIG = {
    ice_shadow: {
        classId: 'sword', firstName: '冰影', secondName: '霜狱剑魂', element: 'ice', status: 'frozen', statusName: '冰冻',
        attackStyle: 'slash', scaling: 'physicalAttack', skillDamageType: 'physical', epicSkillStates: ['airborne'],
        attackNames: ['冷月刺', '霜痕双升', '冰影回风', '寒锋伏印', '霜狱压轴', '万寒归鞘'],
        skillNames: ['冰息剑芒', '凝霜挑月', '霜轮三叠', '寒镜追爆', '冰狱回环', '绝对零度·葬剑'],
        defenseNames: ['寒息护手', '霜步回锋', '冰镜净心', '寒狱剑幕', '霜魂不灭', '永冻圣域'],
        buffNames: ['冰脉吐纳', '寒锋蓄意', '冻气共鸣', '霜痕增幅', '冰狱解放', '零度剑心'],
    },
    light_guardian: {
        classId: 'sword', firstName: '神光剑卫', secondName: '曜光剑皇', element: 'light', status: 'vulnerable', statusName: '易伤',
        attackStyle: 'slash', scaling: 'physicalAttack', skillDamageType: 'physical', epicSkillStates: ['airborne'], shieldRoute: true,
        attackNames: ['守光横斩', '盾势升锋', '回光三式', '圣痕伏剑', '皇曜破军', '神域裁断'],
        skillNames: ['光痕剑气', '曜辉升阵', '圣光三裁', '镜光追爆', '皇曜回天阵', '天穹神罚'],
        defenseNames: ['晨辉剑护', '圣盾回锋', '净光壁垒', '曜辉守域', '皇曜圣铠', '神域不坠'],
        buffNames: ['光辉引导', '守望剑意', '圣光共鸣', '曜痕蓄势', '皇曜敕令', '天穹剑意'],
    },
    flame_brawler: {
        classId: 'brawler', firstName: '炎拳斗士', secondName: '炼狱拳皇', element: 'fire', status: 'burn', statusName: '灼烧',
        attackStyle: 'strike', scaling: 'independentAttack', skillDamageType: 'physical', epicSkillStates: ['airborne'],
        attackNames: ['焦热短拳', '焰势升膝', '沸点连打', '爆心伏劲', '炼狱压阵', '六道爆拳'],
        skillNames: ['火星冲拳', '熔炎升龙', '爆炎追身', '灼狱连环', '焚城陨击', '末日熔核拳'],
        defenseNames: ['热流护腕', '爆炎架势', '赤心卸力', '熔核护体', '炼狱反震', '不灭炎躯'],
        buffNames: ['点火', '沸血强身', '爆炎斗志', '炼狱蓄势', '拳皇解放', '极限沸腾'],
    },
    shadow_fist: {
        classId: 'brawler', firstName: '暗影之拳', secondName: '幽冥拳宗', element: 'dark', status: 'poison', statusName: '中毒',
        attackStatus: 'bleed', attackStatusName: '流血', attackStyle: 'thrust', scaling: 'independentAttack', skillDamageType: 'magical', epicSkillStates: ['airborne', 'knockedDown'],
        attackNames: ['切影刺', '毒脉踢', '影牙三闪', '伏影追猎', '幽步索命', '冥狱处刑'],
        skillNames: ['蚀影弹', '暗蚀上袭', '冥牙轮舞', '影蚀追爆', '幽冥锁魂', '无间断罪'],
        defenseNames: ['影衣', '潜踪架势', '蚀毒净血', '幽幕护身', '冥影替身', '无间幻身'],
        buffNames: ['藏锋', '暗劲蓄势', '毒影共鸣', '幽冥聚气', '冥狱解放', '万影归宗'],
    },
    storm_hunter: {
        classId: 'archer', firstName: '风暴猎手', secondName: '天穹神射手', element: 'light', status: 'vulnerable', statusName: '易伤',
        attackStyle: 'shot', scaling: 'physicalAttack', skillDamageType: 'physical', epicSkillStates: ['airborne'],
        attackNames: ['顺风轻矢', '雷羽双升', '风暴追空', '鸣弦伏印', '天穹压轴', '万雷归弦'],
        skillNames: ['电光箭', '雷鸣升矢', '风轮三叠', '闪电追爆', '天穹回旋', '九霄雷狩'],
        defenseNames: ['风羽护手', '疾风回避', '雷幕净心', '暴风护阵', '天穹屏障', '万象风域'],
        buffNames: ['引风', '雷弦蓄势', '风暴共鸣', '天穹聚能', '神射解放', '万雷同调'],
    },
    shadow_marksman: {
        classId: 'archer', firstName: '幽影游侠', secondName: '蚀星神射手', element: 'dark', status: 'poison', statusName: '中毒',
        attackStatus: 'bleed', attackStatusName: '流血', attackStyle: 'snipe', scaling: 'physicalAttack', skillDamageType: 'magical', epicSkillStates: ['airborne', 'knockedDown'],
        attackNames: ['暗羽轻射', '毒矢双升', '夜鸦追空', '蚀影伏印', '幽猎压轴', '永夜绝弦'],
        skillNames: ['幽影蚀矢', '幽毒升矢', '暗羽轮舞', '夜幕追爆', '蚀星回环', '永夜星蚀'],
        defenseNames: ['暗羽披风', '潜踪闪避', '毒雾净身', '幽幕护阵', '蚀影替身', '无光领域'],
        buffNames: ['敛息', '暗弦蓄势', '毒羽共鸣', '幽猎聚气', '蚀星解放', '万影归弦'],
    },
};

const advancementExpansionScaling = (config, amount, elemental = false) => {
    const primaryRatio = elemental ? .46 : .5;
    const result = { [config.scaling]: amount * primaryRatio, strength: amount * (elemental ? .39 : .5) };
    if (elemental) result[`${config.element}Element`] = amount * .15;
    return result;
};

const advancementExpansionExtra = (pathId, config, rarityIndex, extra = {}) => ({
    ...extra,
    requiredAdvancement: { pathId, minTier: rarityIndex >= 4 ? 2 : 1 },
    advancementCard: true,
    advancementExpansion: true,
    tags: [...new Set([rarityIndex >= 4 ? config.secondName : config.firstName, ...(extra.tags || [])])],
});

const buildAdvancementAttackCard = (pathId, config, rarity, rarityIndex) => {
    const profile = PEAK_CARD_BALANCE[rarity];
    const scaling = (ratio) => advancementExpansionScaling(config, profile.scaling * ratio);
    const attackStatus = config.attackStatus || config.status;
    const attackStatusName = config.attackStatusName || config.statusName;
    const damageType = rarity === 'epic' && pathId === 'shadow_fist' ? 'true' : 'physical';
    const damageExtra = { damageType };
    let effects;
    let summary;
    let extra;
    if (rarityIndex === 0) {
        effects = [damage(profile.base * .74, scaling(.74), damageExtra)];
        summary = '攻击站立目标；目标生命高于80%时伤害提高10%，适合作为稳定起手。';
        extra = { ...attackData(config.attackStyle, ['standing'], 'standing'), conditionalDamage: condition('targetHpAbove', .1, '目标生命高于80%时伤害提高10%。', { threshold: .8 }), tags: ['起手'] };
    } else if (rarityIndex === 1) {
        effects = [...multiHitDamage(2, profile.base * .76, scaling(.76), null, damageExtra), state('launched')];
        summary = '从站立状态发动两段攻击并击飞目标，前一张牌也造成击飞时伤害提高12%。';
        extra = { ...attackData('launch', ['standing', 'launched'], 'launched', { allowSame: true }), conditionalDamage: condition('previousResultState', .12, '前一张牌将目标变为击飞时伤害提高12%。', { states: ['launched'] }), tags: ['两段', '击飞'] };
    } else if (rarityIndex === 2) {
        effects = [...multiHitDamage(3, profile.base * .82, scaling(.82), { status: attackStatus, stacks: 1, duration: 2, chance: 28 }, damageExtra), state('airborne')];
        summary = `三段追击击飞目标并使其浮空，每段有28%几率施加1层${attackStatusName}。`;
        extra = { ...attackData(config.attackStyle, ['launched'], 'airborne'), conditionalDamage: condition('queuePositionAtLeast', .16, '位于队列第3张或之后时伤害提高16%。', { position: 3 }), tags: ['三段', '浮空'] };
    } else if (rarityIndex === 3) {
        effects = [damage(profile.base * .52, scaling(.52), damageExtra), { type: 'status', status: attackStatus, stacks: 2, duration: 3 }, { type: 'delayedBurst', base: profile.base * .3, scaling: scaling(.3), damageType }];
        summary = `攻击站立目标并施加${attackStatusName}，埋下由后续命中引爆的延迟标记。`;
        extra = { ...attackData(config.attackStyle, ['standing'], 'standing'), conditionalDamage: condition('targetHasStatus', .2, `目标已有${attackStatusName}时伤害提高20%。`, { statuses: [attackStatus] }), tags: [attackStatusName, '延迟爆发'] };
    } else if (rarityIndex === 4) {
        effects = [damage(profile.base * .82, scaling(.82), damageExtra), state('knockedDown')];
        summary = '必须位于队列最后；此前每张进攻牌使本牌伤害提高6%，并将空中目标击倒。';
        extra = { ...attackData('finisher', ['launched', 'airborne'], 'knockedDown'), requiresQueueLast: true, positionScaling: { category: 'attack', perPrior: 6, maxStacks: 4 }, tags: ['压轴', '击倒'] };
    } else {
        effects = [...multiHitDamage(5, profile.base, scaling(1), null, damageExtra), state('knockedDown')];
        summary = `五段终结攻击；此前连续使用2张${config.attackStyle === 'strike' ? '拳击' : config.attackStyle === 'thrust' ? '突刺' : '斩击'}流派进攻牌时，伤害提高25%。`;
        extra = { ...attackData('finisher', ['airborne'], 'knockedDown'), consumeStyleChain: { style: config.attackStyle, threshold: 2, damageBonus: 25 }, tags: ['五段', '终结'] };
    }
    if (config.shieldRoute && rarityIndex >= 2 && rarityIndex <= 3) {
        extra.conditionalDamage = condition('actorShieldRatio', PEAK_CARD_BALANCE[rarity].condition, `自身护盾不低于最大生命10%时伤害提高${Math.round(PEAK_CARD_BALANCE[rarity].condition * 100)}%。`, { threshold: .1 });
        summary += ' 自身护盾不低于最大生命10%时额外强化。';
    }
    return card(`adv_${pathId}_attack_${rarity}`, config.attackNames[rarityIndex], 'attack', rarity, config.classId, PEAK_ADVANCEMENT_EXPANSION_COSTS[rarityIndex], summary, effects, advancementExpansionExtra(pathId, config, rarityIndex, extra));
};

const buildAdvancementSkillCard = (pathId, config, rarity, rarityIndex) => {
    const profile = PEAK_CARD_BALANCE[rarity];
    const scaling = (ratio) => advancementExpansionScaling(config, profile.scaling * ratio, true);
    const damageExtra = { element: config.element, damageType: config.skillDamageType };
    let effects;
    let summary;
    let extra;
    if (rarityIndex === 0) {
        effects = [damage(profile.base * .66, scaling(.66), damageExtra), { type: 'status', status: config.status, stacks: 1, duration: 2 }, state('standing')];
        summary = `以${config.element === 'ice' ? '冰' : config.element === 'light' ? '光' : config.element === 'fire' ? '火' : '暗'}属性技能攻击站立目标，施加1层${config.statusName}并保持站立。`;
        extra = { requiresTargetState: ['standing'], tags: [config.statusName, '起手'] };
    } else if (rarityIndex === 1) {
        effects = [damage(profile.base * .72, scaling(.72), damageExtra), { type: 'status', status: config.status, stacks: 1, duration: 2 }, state('launched')];
        summary = `攻击站立目标，施加${config.statusName}并将其击飞，为空中连段创造条件。`;
        extra = { requiresTargetState: ['standing'], tags: [config.statusName, '击飞'] };
    } else if (rarityIndex === 2) {
        effects = [...multiHitDamage(3, profile.base * .8, scaling(.8), { status: config.status, stacks: 1, duration: 2, chance: 35 }, damageExtra), state('airborne')];
        summary = `三段追击击飞目标并使其浮空，每段有35%几率施加1层${config.statusName}。`;
        extra = { requiresTargetState: ['launched'], tags: ['三段', config.statusName, '浮空'] };
    } else if (rarityIndex === 3) {
        effects = [damage(profile.base * .48, scaling(.48), damageExtra), { type: 'status', status: config.status, stacks: 2, duration: 3 }, { type: 'delayedBurst', base: profile.base * .34, scaling: scaling(.34), element: config.element, damageType: config.skillDamageType }, state('standing')];
        summary = `施加2层${config.statusName}并留下属性爆发标记，由后续卡牌命中引爆。`;
        extra = { requiresTargetState: ['standing'], conditionalDamage: condition('targetHasStatus', .2, `目标已有${config.statusName}时伤害提高20%。`, { statuses: [config.status] }), tags: [config.statusName, '延迟爆发'] };
    } else if (rarityIndex === 4) {
        effects = [...multiHitDamage(4, profile.base * .84, scaling(.84), { status: config.status, stacks: 1, duration: 3, chance: 40 }, damageExtra), state('airborne')];
        summary = `四段空中追击并维持浮空；结算后进入追击区，再次使用时伤害降低35%。`;
        extra = { requiresTargetState: ['launched', 'airborne'], recycleOnResolve: { states: ['launched', 'airborne'], damagePenalty: 35 }, tags: ['四段', '回收追击'] };
    } else {
        effects = [...multiHitDamage(5, profile.base, scaling(1), { status: config.status, stacks: 1, duration: 4, chance: 45 }, damageExtra), state('knockedDown')];
        summary = `五段属性终结技；目标已有${config.statusName}时伤害提高25%，最终将目标击倒。`;
        extra = { requiresTargetState: config.epicSkillStates, conditionalDamage: condition('targetHasStatus', .25, `目标已有${config.statusName}时伤害提高25%。`, { statuses: [config.status] }), tags: ['五段', config.statusName, '终结'] };
    }
    if (config.shieldRoute && rarityIndex >= 3) {
        extra.conditionalDamage = condition('actorShieldRatio', PEAK_CARD_BALANCE[rarity].condition, `自身护盾不低于最大生命10%时伤害提高${Math.round(PEAK_CARD_BALANCE[rarity].condition * 100)}%。`, { threshold: .1 });
        summary += ' 自身持有高额护盾时额外强化。';
    }
    return card(`adv_${pathId}_skill_${rarity}`, config.skillNames[rarityIndex], 'skill', rarity, config.classId, PEAK_ADVANCEMENT_EXPANSION_COSTS[rarityIndex], summary, effects, advancementExpansionExtra(pathId, config, rarityIndex, extra));
};

const advancementDefenseScaling = (pathId, amount) => {
    if (pathId === 'ice_shadow') return { vitality: amount * .48, spirit: amount * .32, iceElement: amount * .2 };
    if (pathId === 'light_guardian') return { vitality: amount * .48, physicalDefense: amount * .32, lightElement: amount * .2 };
    if (pathId === 'flame_brawler') return { vitality: amount * .6, physicalDefense: amount * .4 };
    if (pathId === 'storm_hunter') return { vitality: amount * .44, spirit: amount * .36, lightElement: amount * .2 };
    if (pathId === 'shadow_marksman') return { vitality: amount * .42, spirit: amount * .38, darkElement: amount * .2 };
    return { vitality: amount * .46, spirit: amount * .36, darkElement: amount * .18 };
};

const advancementDefenseUtility = (pathId, rarityIndex) => {
    const utilities = {
        ice_shadow: [
            [{ type: 'retainShield', value: 10 }],
            [{ type: 'guard', reduction: 16, uses: 1, duration: 2, restoreMp: 3 }],
            [{ type: 'statusWard', value: 1, duration: 2 }, { type: 'restoreMp', base: 8 }],
            [{ type: 'retainShield', value: 25 }, { type: 'statusWard', value: 1, duration: 3 }],
            [{ type: 'damageCap', ratio: 28, uses: 2, duration: 3 }],
            [{ type: 'shieldBreak', healPercent: 20, draw: 2, uses: 2, duration: 3 }],
        ],
        light_guardian: [
            [{ type: 'retainShield', value: 12 }],
            [{ type: 'guard', reduction: 18, uses: 1, duration: 2 }],
            [{ type: 'cleanse', value: 1 }],
            [{ type: 'damageCap', ratio: 31, uses: 2, duration: 3 }],
            [{ type: 'statusWard', value: 2, duration: 3 }, { type: 'retainShield', value: 28 }],
            [{ type: 'lastStand', value: 1, shieldPercent: 20, duration: 3 }, { type: 'statusWard', value: 2, duration: 3 }],
        ],
        flame_brawler: [
            [{ type: 'thorns', ratio: 10, uses: 1, duration: 1 }],
            [{ type: 'guard', reduction: 18, uses: 1, duration: 2, counterRatio: 18 }],
            [{ type: 'guard', reduction: 25, uses: 1, duration: 2, counterRatio: 35 }],
            [{ type: 'thorns', ratio: 42, uses: 2, duration: 3 }],
            [{ type: 'thorns', ratio: 50, uses: 2, duration: 3 }],
            [{ type: 'lastStand', value: 1, shieldPercent: 20, duration: 3 }, { type: 'thorns', ratio: 70, uses: 2, duration: 3 }],
        ],
        shadow_fist: [
            [{ type: 'statusWard', value: 1, duration: 1 }],
            [{ type: 'manaBarrier', ratio: 35, uses: 1, duration: 2 }],
            [{ type: 'cleanse', value: 1 }, { type: 'shieldBreak', healPercent: 10, draw: 1, uses: 1, duration: 2 }],
            [{ type: 'guard', reduction: 29, uses: 2, duration: 3, counterRatio: 42 }],
            [{ type: 'shieldBreak', healPercent: 15, draw: 1, uses: 2, duration: 3 }],
            [{ type: 'damageCap', ratio: 20, uses: 2, duration: 3 }, { type: 'statusWard', value: 2, duration: 3 }],
        ],
        storm_hunter: [
            [{ type: 'retainShield', value: 8 }],
            [{ type: 'guard', reduction: 16, uses: 1, duration: 2, restoreMp: 3 }],
            [{ type: 'cleanse', value: 1 }],
            [{ type: 'retainShield', value: 24 }, { type: 'statusWard', value: 1, duration: 3 }],
            [{ type: 'damageCap', ratio: 28, uses: 2, duration: 3 }],
            [{ type: 'shieldBreak', healPercent: 18, draw: 2, uses: 2, duration: 3 }],
        ],
        shadow_marksman: [
            [{ type: 'statusWard', value: 1, duration: 1 }],
            [{ type: 'manaBarrier', ratio: 30, uses: 1, duration: 2 }],
            [{ type: 'cleanse', value: 1 }, { type: 'shieldBreak', healPercent: 8, draw: 1, uses: 1, duration: 2 }],
            [{ type: 'guard', reduction: 27, uses: 2, duration: 3 }],
            [{ type: 'shieldBreak', healPercent: 15, draw: 1, uses: 2, duration: 3 }],
            [{ type: 'damageCap', ratio: 21, uses: 2, duration: 3 }, { type: 'statusWard', value: 2, duration: 3 }],
        ],
    };
    return utilities[pathId][rarityIndex];
};

const buildAdvancementDefenseCard = (pathId, config, rarity, rarityIndex) => {
    const profile = PEAK_CARD_BALANCE[rarity];
    const ratios = [.66, .72, .78, .84, .9, 1];
    const routeSummary = {
        ice_shadow: ['保留部分护盾至下回合。', '格挡下一次伤害，触发时恢复少量MP。', '抵消有害异常并恢复MP。', '大幅保留护盾并抵消一次有害异常。', '限制接下来两次受到的单次伤害。', '护盾被击破时恢复生命并抽牌。'],
        light_guardian: ['保留部分护盾至下回合。', '以剑盾格挡下一次伤害。', '净化一个负面状态。', '限制接下来两次受到的单次伤害。', '保留护盾并抵消有害异常。', '获得一次致命伤害保护并抵消有害异常。'],
        flame_brawler: ['下次受伤时反弹部分真实伤害。', '格挡并反击下一次伤害。', '强化格挡并以真实伤害反击。', '反弹接下来两次受到的伤害。', '获得高额反伤架势。', '获得一次致命伤害保护和强力反伤。'],
        shadow_fist: ['抵消下一次有害异常。', '消耗MP吸收下一次伤害。', '净化负面状态，护盾破裂时恢复并抽牌。', '连续格挡并以暗劲反击。', '护盾破裂时恢复生命并抽牌。', '限制致命重击并抵消有害异常。'],
        storm_hunter: ['保留少量护盾。', '回避下一次伤害并恢复MP。', '净化一个负面状态。', '保留护盾并抵消一次有害异常。', '限制接下来两次受到的单次伤害。', '护盾破裂时恢复生命并抽牌。'],
        shadow_marksman: ['抵消下一次有害异常。', '消耗MP吸收下一次伤害。', '净化负面状态，护盾破裂时恢复并抽牌。', '连续闪避两次攻击。', '护盾破裂时恢复生命并抽牌。', '限制致命重击并抵消有害异常。'],
    };
    const ratio = ratios[rarityIndex];
    const effects = [
        { type: 'shield', base: profile.sustainBase * ratio, scaling: advancementDefenseScaling(pathId, profile.sustainScaling * ratio) },
        ...advancementDefenseUtility(pathId, rarityIndex),
    ];
    const summary = `获得路线专属护盾，并${routeSummary[pathId][rarityIndex]}`;
    return card(`adv_${pathId}_defense_${rarity}`, config.defenseNames[rarityIndex], 'defense', rarity, config.classId, PEAK_ADVANCEMENT_EXPANSION_COSTS[rarityIndex], summary, effects, advancementExpansionExtra(pathId, config, rarityIndex, { tags: ['路线防御'] }));
};

const advancementBuffDefinition = (pathId, profile, rarityIndex) => {
    const duration = Math.min(profile.duration, rarityIndex < 2 ? 2 : rarityIndex < 4 ? 3 : 4);
    const definitions = {
        ice_shadow: [
            { effects: [{ type: 'buff', stat: 'iceElement', value: 4, duration }], summary: '提高冰属性强化，为寒霜连段预热。' },
            { effects: [{ type: 'restoreMp', base: 10 }, { type: 'empower', category: 'skill', value: 6, uses: 1 }], summary: '恢复MP并强化下一张技能牌。' },
            { effects: [{ type: 'buff', stat: 'iceElement', value: 10, duration }, { type: 'buff', stat: 'skillAttack', value: 5, duration }], summary: '同时提高冰属性强化与技能攻击。' },
            { effects: [{ type: 'buff', stat: 'iceElement', value: 12, duration }, { type: 'buff', stat: 'damageIncrease', value: 8, duration }], summary: '扩大霜痕，提高冰属性强化与伤害。' },
            { effects: [{ type: 'buff', stat: 'iceElement', value: 16, duration }, { type: 'empower', category: 'skill', value: 13, uses: 1 }], summary: '解放冰狱之力，并强化下一张技能牌。' },
            { effects: [{ type: 'buff', stat: 'iceElement', value: 20, duration }, { type: 'buff', stat: 'skillAttack', value: 12, duration }, { type: 'empower', category: 'skill', value: 17, uses: 1 }], summary: '进入零度剑心，全面强化冰系技能爆发。' },
        ],
        light_guardian: [
            { effects: [{ type: 'buff', stat: 'damageReduction', value: 4, duration }], summary: '引导神光，短暂提高伤害减免。' },
            { effects: [{ type: 'buff', stat: 'physicalAttack', value: 6, duration }, { type: 'empower', category: 'attack', value: 6, uses: 1 }], summary: '提高物理攻击并强化下一张进攻牌。' },
            { effects: [{ type: 'buff', stat: 'lightElement', value: 10, duration }, { type: 'buff', stat: 'damageReduction', value: 6, duration }], summary: '兼顾光属性强化与伤害减免。' },
            { effects: [{ type: 'buff', stat: 'damageIncrease', value: 10, duration }, { type: 'buff', stat: 'criticalDamage', value: 10, duration }], summary: '将守势转为稳定增伤与暴击伤害。' },
            { effects: [{ type: 'buff', stat: 'physicalAttack', value: 15, duration }, { type: 'buff', stat: 'lightElement', value: 15, duration }], summary: '获得皇曜敕令，提高物理攻击与光属性强化。' },
            { effects: [{ type: 'buff', stat: 'skillAttack', value: 14, duration }, { type: 'buff', stat: 'damageReduction', value: 14, duration }, { type: 'empower', category: 'skill', value: 17, uses: 1 }], summary: '攻守合一，并强化下一张技能牌。' },
        ],
        flame_brawler: [
            { effects: [{ type: 'buff', stat: 'strength', value: 4, duration }, { type: 'buff', stat: 'physicalCrit', value: 2, duration }], summary: '点燃斗志，提高力量与物理暴击。' },
            { effects: [{ type: 'buff', stat: 'physicalAttack', value: 6, duration }, { type: 'empower', category: 'attack', value: 6, uses: 1 }], summary: '强健气血，并强化下一张进攻牌。' },
            { effects: [{ type: 'buff', stat: 'fireElement', value: 10, duration }, { type: 'buff', stat: 'physicalCrit', value: 5, duration }], summary: '提高火属性强化与物理暴击。' },
            { effects: [{ type: 'buff', stat: 'damageIncrease', value: 10, duration }, { type: 'buff', stat: 'criticalDamage', value: 12, duration }], summary: '积蓄炼狱拳势，提高伤害与暴击伤害。' },
            { effects: [{ type: 'buff', stat: 'strength', value: 16, duration }, { type: 'buff', stat: 'fireElement', value: 14, duration }], summary: '解放拳皇之力，提高力量与火属性强化。' },
            { effects: [{ type: 'buff', stat: 'damageIncrease', value: 18, duration }, { type: 'buff', stat: 'criticalDamage', value: 20, duration }, { type: 'empower', category: 'attack', value: 17, uses: 1 }], summary: '进入极限沸腾，强化进攻牌的终局爆发。' },
        ],
        shadow_fist: [
            { effects: [{ type: 'buff', stat: 'independentAttack', value: 4, duration }], summary: '隐藏杀意，提高独立攻击。' },
            { effects: [{ type: 'buff', stat: 'darkElement', value: 6, duration }, { type: 'empower', category: 'skill', value: 6, uses: 1 }], summary: '积蓄暗劲并强化下一张技能牌。' },
            { effects: [{ type: 'buff', stat: 'damageIncrease', value: 8, duration }, { type: 'buff', stat: 'skillAttack', value: 5, duration }], summary: '借毒影共鸣提高伤害与技能攻击。' },
            { effects: [{ type: 'buff', stat: 'independentAttack', value: 12, duration }, { type: 'buff', stat: 'darkElement', value: 12, duration }], summary: '汇聚幽冥气息，提高独立攻击与暗属性强化。' },
            { effects: [{ type: 'buff', stat: 'damageIncrease', value: 15, duration }, { type: 'empower', category: 'skill', value: 13, uses: 1 }], summary: '解放冥狱之力并强化下一张技能牌。' },
            { effects: [{ type: 'buff', stat: 'darkElement', value: 20, duration }, { type: 'buff', stat: 'skillAttack', value: 15, duration }, { type: 'empower', category: 'skill', value: 17, uses: 1 }], summary: '万影归宗，全面强化暗系技能爆发。' },
        ],
        storm_hunter: [
            { effects: [{ type: 'buff', stat: 'physicalCrit', value: 3, duration }], summary: '引导顺风，提高物理暴击。' },
            { effects: [{ type: 'restoreMp', base: 10 }, { type: 'empower', category: 'attack', value: 6, uses: 1 }], summary: '恢复MP并强化下一张进攻牌。' },
            { effects: [{ type: 'buff', stat: 'lightElement', value: 10, duration }, { type: 'buff', stat: 'physicalCrit', value: 5, duration }], summary: '提高光属性强化与物理暴击。' },
            { effects: [{ type: 'buff', stat: 'physicalAttack', value: 12, duration }, { type: 'buff', stat: 'damageIncrease', value: 8, duration }], summary: '聚集风暴，提高物理攻击与伤害。' },
            { effects: [{ type: 'buff', stat: 'lightElement', value: 16, duration }, { type: 'empower', category: 'skill', value: 13, uses: 1 }], summary: '解放天穹之力并强化下一张技能牌。' },
            { effects: [{ type: 'buff', stat: 'lightElement', value: 20, duration }, { type: 'buff', stat: 'skillAttack', value: 14, duration }, { type: 'empower', category: 'skill', value: 17, uses: 1 }], summary: '万雷同调，全面强化雷矢爆发。' },
        ],
        shadow_marksman: [
            { effects: [{ type: 'buff', stat: 'physicalAttack', value: 4, duration }], summary: '收敛气息，提高物理攻击。' },
            { effects: [{ type: 'buff', stat: 'darkElement', value: 6, duration }, { type: 'empower', category: 'attack', value: 6, uses: 1 }], summary: '积蓄暗弦并强化下一张进攻牌。' },
            { effects: [{ type: 'buff', stat: 'damageIncrease', value: 8, duration }, { type: 'buff', stat: 'criticalDamage', value: 6, duration }], summary: '借毒羽共鸣提高伤害与暴击伤害。' },
            { effects: [{ type: 'buff', stat: 'physicalAttack', value: 12, duration }, { type: 'buff', stat: 'darkElement', value: 12, duration }], summary: '汇聚幽猎气息，提高攻击与暗属性强化。' },
            { effects: [{ type: 'buff', stat: 'damageIncrease', value: 15, duration }, { type: 'empower', category: 'skill', value: 13, uses: 1 }], summary: '解放蚀星之力并强化下一张技能牌。' },
            { effects: [{ type: 'buff', stat: 'darkElement', value: 20, duration }, { type: 'buff', stat: 'criticalDamage', value: 18, duration }, { type: 'empower', category: 'skill', value: 17, uses: 1 }], summary: '万影归弦，强化暗影神射的终局爆发。' },
        ],
    };
    return definitions[pathId][rarityIndex];
};

const buildAdvancementBuffCard = (pathId, config, rarity, rarityIndex) => {
    const definition = advancementBuffDefinition(pathId, PEAK_CARD_BALANCE[rarity], rarityIndex);
    return card(`adv_${pathId}_buff_${rarity}`, config.buffNames[rarityIndex], 'buff', rarity, config.classId, PEAK_ADVANCEMENT_EXPANSION_COSTS[rarityIndex], definition.summary, definition.effects, advancementExpansionExtra(pathId, config, rarityIndex, { tags: ['路线增益'] }));
};

const PEAK_ADVANCEMENT_EXPANSION_CARDS = Object.entries(PEAK_ADVANCEMENT_EXPANSION_CONFIG).flatMap(([pathId, config]) =>
    PEAK_ADVANCEMENT_EXPANSION_RARITIES.flatMap((rarity, rarityIndex) => [
        buildAdvancementAttackCard(pathId, config, rarity, rarityIndex),
        buildAdvancementSkillCard(pathId, config, rarity, rarityIndex),
        buildAdvancementDefenseCard(pathId, config, rarity, rarityIndex),
        buildAdvancementBuffCard(pathId, config, rarity, rarityIndex),
    ]));

const PEAK_ROUTE_TAGS = Object.freeze({
    ice_shadow: '冰影系',
    light_guardian: '神光系',
    flame_brawler: '炎拳系',
    shadow_fist: '暗影系',
    storm_hunter: '风暴系',
    shadow_marksman: '幽影系',
});

const legacyAdvancementRouteFor = (entry) => {
    if (entry.requiredAdvancement || !['sword', 'brawler'].includes(entry.classId)) return '';
    const explicitlyThemedScarce = {
        sword_scarce_frost_prison: 'ice_shadow',
        brawler_scarce_flame_dragon: 'flame_brawler',
    };
    if (explicitlyThemedScarce[entry.id]) return explicitlyThemedScarce[entry.id];
    if (!['legendary', 'epic'].includes(entry.rarity)) return '';

    const primaryElement = entry.effects.find((effect) => effect.type === 'damage' && effect.element)?.element || '';
    if (entry.classId === 'sword' && primaryElement) return ['ice', 'dark'].includes(primaryElement) ? 'ice_shadow' : 'light_guardian';
    if (entry.classId === 'brawler' && primaryElement) return ['fire', 'light'].includes(primaryElement) ? 'flame_brawler' : 'shadow_fist';

    if (entry.classId === 'sword') {
        if (/^utility_sword_/.test(entry.id)) return /_1$/.test(entry.id) ? 'ice_shadow' : 'light_guardian';
        if (/^mechanic_sword_/.test(entry.id)) return /_(delayed|derived)$/.test(entry.id) ? 'ice_shadow' : 'light_guardian';
        if (/^queue_attack_sword_/.test(entry.id)) return /_1$/.test(entry.id) ? 'ice_shadow' : 'light_guardian';
        if (/^(reactive_defense|tactical_defense)_sword_/.test(entry.id) || entry.category === 'defense') return 'light_guardian';
        if (/(frost|winter|frozen|zero|requiem|ashen|last_blood|skyline)/.test(entry.id)) return 'ice_shadow';
        return 'light_guardian';
    }

    if (/^utility_brawler_/.test(entry.id)) return /_1$/.test(entry.id) ? 'flame_brawler' : 'shadow_fist';
    if (/^mechanic_brawler_/.test(entry.id)) return /_(delayed|derived)$/.test(entry.id) ? 'shadow_fist' : 'flame_brawler';
    if (/^queue_attack_brawler_/.test(entry.id)) return /_1$/.test(entry.id) ? 'flame_brawler' : 'shadow_fist';
    if (/^reactive_defense_brawler_/.test(entry.id)) return /_1$/.test(entry.id) ? 'flame_brawler' : 'shadow_fist';
    if (/(venom|poison|shadow|nether|snake|phantom)/.test(entry.id)) return 'shadow_fist';
    if (/(desperate|firmament|bloodrage|hundred|oath|ground|heaven_collapse|starbreaker|hell_cradle|final_round|tactical_defense)/.test(entry.id)) return 'shadow_fist';
    return 'flame_brawler';
};

const UNIVERSAL_FIVE_RARITIES = ['common', 'excellent', 'rare', 'scarce', 'legendary', 'epic'];
const UNIVERSAL_FIVE_NAMES = {
    attack: [
        ['稳步直击', '基础升击', '空隙追打', '落势重压', '伏地震击'], ['连步突进', '回身上袭', '追空连打', '坠势重斩', '压地追击'],
        ['战术穿刺', '折返升击', '浮空追猎', '破势坠击', '倒地压制'], ['秘仪贯穿', '逆流升锋', '空域连袭', '断势终击', '镇地回斩'],
        ['王权破阵', '天穹升锋', '万象追空', '裁决坠落', '终局踏杀'], ['巅峰贯星', '无垠升华', '九霄追猎', '末式天坠', '大地终鸣'],
    ],
    defense: [
        ['木盾架势', '沉肩格挡', '应急包扎', '净息护层', '反震护腕'], ['坚壁回身', '卸力护架', '战地疗愈', '清心屏障', '震返护甲'],
        ['战术壁垒', '蓄势格挡', '伤口封缄', '驱秽护幕', '反击护壳'], ['秘仪护界', '化劲回环', '生命续接', '净化领域', '荆棘壁垒'],
        ['王者壁垒', '不动关山', '战损回生', '圣洁护幕', '万钧反震'], ['巅峰城塞', '绝对卸力', '命脉重塑', '无垢结界', '天穹反壁'],
    ],
    skill: [
        ['战况研判', '简易调度', '破绽标记', '旧招回想', '震荡术式'], ['战术测算', '快速调牌', '弱点锁定', '记忆回收', '冲击术式'],
        ['局势推演', '精准调度', '裂隙标记', '弃牌重拾', '震荡共鸣'], ['秘仪解析', '连续调度', '破绽洞悉', '时机回收', '共振冲击'],
        ['王权演算', '全域调度', '致命标记', '战局回溯', '霸势冲击'], ['巅峰推演', '无界调度', '终极洞悉', '因果回收', '寰宇震荡'],
    ],
    buff: [
        ['沉着呼吸', '聚能准备', '穿甲预备', '强身姿态', '协同起势'], ['稳心蓄力', '灵能预热', '破防准备', '坚韧姿态', '连携起势'],
        ['战意凝聚', '能量校准', '穿透调谐', '韧性强化', '攻守同调'], ['秘仪蓄势', '灵流激发', '破界调谐', '不屈领域', '战术共振'],
        ['王者战令', '高能激发', '贯界指令', '钢筋铁骨', '攻守圣谕'], ['巅峰号令', '超限激发', '无垢穿界', '永恒意志', '万式同调'],
    ],
};
const universalFiveProfile = (rarity, index) => ({ profile: PEAK_CARD_BALANCE[rarity], ratio: [.72, .78, .82, .86, .9][index], cost: Math.max(0, index - 1) });

const UNIVERSAL_FIVE_UNLOCKED = ['rare', 'scarce', 'legendary', 'epic'];
const universalFiveAttackCards = UNIVERSAL_FIVE_RARITIES.flatMap((rarity, rarityIndex) => UNIVERSAL_FIVE_NAMES.attack[rarityIndex].map((name, index) => {
    const { profile, ratio, cost } = universalFiveProfile(rarity, index);
    const unlocked = UNIVERSAL_FIVE_UNLOCKED.includes(rarity);
    const rules = [
        ['strike', ['standing'], 'standing', condition('targetHpAbove', profile.condition, '目标生命较高时伤害提高。', { threshold: .8 })],
        ['launch', ['standing', 'airborne'], 'launched', condition('queuePositionAtLeast', profile.condition, '位于队列后段时伤害提高。', { position: 2 })],
        ['air', ['launched'], 'airborne', condition('previousResultState', profile.condition, '承接击飞后伤害提高。', { states: ['launched'] })],
        ['finisher', ['airborne'], 'knockedDown', condition('targetHasStatus', profile.condition, '目标带有负面状态时伤害提高。', { statuses: ['vulnerable', 'weak'] })],
        ['ground', ['standing', 'knockedDown'], 'knockedDown', condition('targetState', profile.condition, '追击倒地目标时伤害提高。', { states: ['knockedDown'] }), true],
    ][index];
    const [style, from, to, conditional, allowSame] = rules;
    const chainPerCard = 4 + Math.floor(rarityIndex / 2);
    const mechanic = !unlocked ? [] : [
        [{ type: 'empower', category: 'attack', value: profile.empower, uses: 1 }],
        [{ type: 'drawCategory', category: 'attack', value: 1 }],
        [{ type: 'comboEscalate', perCard: chainPerCard, maxCards: 4 }],
        [{ type: 'comboEscalate', perCard: chainPerCard + 1, maxCards: 4 }],
        [{ type: 'restoreMp', base: profile.mpRecovery * .3 }],
    ][index];
    const mechanicText = !unlocked ? '' : [
        '并强化下一张进攻牌。', '并检索一张进攻牌接上连段。', '连段每多接一段伤害提高。',
        '连段每多接一段伤害提高。', '并回收少量MP。',
    ][index];
    const mechanicTag = !unlocked ? [] : [['连段起手'], ['连段续接'], ['连段增伤'], ['连段增伤'], ['连段收势']][index];
    return card(`universal_five_attack_${rarity}_${index + 1}`, name, 'attack', rarity, 'all', cost,
        `${['稳定攻击站立目标', '将目标击飞', '承接击飞并追入浮空', '终结浮空目标', '追击倒地目标'][index]}，满足条件时伤害提高${unlocked ? `，${mechanicText}` : '。'}`,
        [...mechanic.filter((effect) => effect.type === 'comboEscalate'),
            damage(profile.base * ratio, { physicalAttack: profile.scaling * .52, strength: profile.scaling * .48 }),
            ...mechanic.filter((effect) => effect.type !== 'comboEscalate'),
            ...(to === 'standing' ? [] : [state(to)])],
        { ...attackData(style, from, to, allowSame ? { allowSame: true } : {}), conditionalDamage: conditional, universalFiveExpansion: true, tags: ['通用', '基础连段', ...mechanicTag] });
}));

const universalFiveDefenseCards = UNIVERSAL_FIVE_RARITIES.flatMap((rarity, rarityIndex) => UNIVERSAL_FIVE_NAMES.defense[rarityIndex].map((name, index) => {
    const { profile, cost } = universalFiveProfile(rarity, index);
    const unlocked = UNIVERSAL_FIVE_UNLOCKED.includes(rarity);
    const duration = Math.min(profile.duration, 1 + Math.floor(index / 2));
    const baseEffects = [
        [{ type: 'shield', base: profile.sustainBase * .82, scaling: { vitality: profile.sustainScaling * .7, spirit: profile.sustainScaling * .3 } }, { type: 'retainShield', value: profile.retainShield }],
        [{ type: 'shield', base: profile.sustainBase * .78, scaling: { vitality: profile.sustainScaling * .65, physicalDefense: profile.sustainScaling * .35 } }, { type: 'guard', reduction: 10 + rarityIndex * 5, uses: 1, duration }],
        [{ type: 'healMissing', value: profile.missingHeal }, { type: 'shield', base: profile.sustainBase * .62, scaling: { vitality: profile.sustainScaling * .55, spirit: profile.sustainScaling * .25 } }],
        [{ type: 'shield', base: profile.sustainBase * .72, scaling: { vitality: profile.sustainScaling * .6, spirit: profile.sustainScaling * .25 } }, { type: 'statusWard', value: rarityIndex >= 3 ? 2 : 1, duration }],
        [{ type: 'shield', base: profile.sustainBase * .68, scaling: { vitality: profile.sustainScaling * .6, physicalDefense: profile.sustainScaling * .25 } }, { type: 'thorns', ratio: 10 + rarityIndex * 10, uses: 1, duration }],
    ][index];
    const mechanic = !unlocked ? [] : [
        [{ type: 'nextTurnDraw', value: 1 }],
        [{ type: 'thorns', ratio: 10 + rarityIndex * 8, uses: 1, duration }],
        [{ type: 'statusWard', value: 1, duration }],
        [{ type: 'cleanse', value: 1 }],
        [{ type: 'guard', reduction: 8 + rarityIndex * 4, uses: 1, duration }],
    ][index];
    const mechanicText = !unlocked ? '' : [
        '，并在下回合多抽一张牌。', '，并反弹部分伤害。', '，并抵御一次负面效果。', '，并立刻净化一层负面状态。', '，并格挡下一次伤害。',
    ][index];
    const mechanicTag = !unlocked ? [] : [['续手'], ['反刺'], ['异常防护'], ['即时净化'], ['格挡']][index];
    const effects = [...baseEffects, ...mechanic];
    return card(`universal_five_defense_${rarity}_${index + 1}`, name, 'defense', rarity, 'all', cost,
        `${['获得护盾并保留部分护盾', '获得护盾并格挡下一次伤害', '恢复已损生命并获得护盾', '获得护盾并抵御一次负面效果', '获得护盾并反弹部分伤害'][index]}${unlocked ? mechanicText : '。'}`, effects,
        { universalFiveExpansion: true, tags: ['通用', '基础防守', ...mechanicTag] });
}));

const universalFiveSkillCards = UNIVERSAL_FIVE_RARITIES.flatMap((rarity, rarityIndex) => UNIVERSAL_FIVE_NAMES.skill[rarityIndex].map((name, index) => {
    const { profile, ratio, cost } = universalFiveProfile(rarity, index);
    const unlocked = UNIVERSAL_FIVE_UNLOCKED.includes(rarity);
    const duration = Math.min(profile.duration, 1 + Math.floor(rarityIndex / 2));
    const effects = [
        [{ type: 'drawCategory', category: 'attack', value: profile.recycle }, ...(rarityIndex >= 2 ? [{ type: 'restoreMp', base: profile.mpRecovery * .35 }] : [])],
        [{ type: 'draw', value: profile.draw }],
        [damage(profile.base * ratio * .62, { physicalAttack: profile.scaling * .3, strength: profile.scaling * .28, independentAttack: profile.scaling * .28 }), { type: 'status', status: 'vulnerable', stacks: 1, duration }],
        [{ type: 'recoverDiscard', value: profile.recycle }, { type: 'restoreMp', base: profile.mpRecovery * .45 }],
        [damage(profile.base * ratio * .78, { physicalAttack: profile.scaling * .36, strength: profile.scaling * .32, independentAttack: profile.scaling * .32 })],
    ][index];
    const mechanic = !unlocked || index === 0 ? [] : [
        [],
        [{ type: 'nextTurnDraw', value: 1 }],
        [{ type: 'status', status: 'weak', stacks: 1, duration }],
        [{ type: 'drawCategory', category: 'defense', value: 1 }],
        [{ type: 'empower', category: 'attack', value: profile.empower, uses: 1 }],
    ][index];
    const mechanicText = !unlocked || index === 0 ? '' : [
        '', '并在下回合多抽一张牌。', '并施加虚弱。', '并检索一张防守牌。', '并强化下一张进攻牌。',
    ][index];
    const mechanicTag = !unlocked || index === 0 ? [] : [[], ['续手'], ['双减益'], ['检索防守'], ['连段起手']][index];
    const extra = index === 2 || index === 4 ? { requiresTargetState: ['standing'], conditionalDamage: condition('targetHpAbove', profile.condition, '目标生命较高时伤害提高。', { threshold: .75 }) } : {};
    return card(`universal_five_skill_${rarity}_${index + 1}`, name, 'skill', rarity, 'all', cost,
        `${['从牌库检索进攻牌。', `抽取${profile.draw}张牌。`, '造成伤害并施加易伤。', '回收弃牌并恢复MP。', '造成通用物理伤害。'][index].replace(/。$/, '')}${mechanicText ? `，${mechanicText}` : '。'}`,
        [...effects, ...mechanic],
        { ...extra, universalFiveExpansion: true, tags: ['通用', '战术技能', ...mechanicTag] });
}));

const universalFiveBuffCards = UNIVERSAL_FIVE_RARITIES.flatMap((rarity, rarityIndex) => UNIVERSAL_FIVE_NAMES.buff[rarityIndex].map((name, index) => {
    const { profile, cost } = universalFiveProfile(rarity, index);
    const unlocked = UNIVERSAL_FIVE_UNLOCKED.includes(rarity);
    const duration = Math.min(profile.duration, 1 + Math.floor(index / 2));
    const baseEffects = [
        [{ type: 'buff', stat: 'damageIncrease', value: profile.buff, duration }, { type: 'empower', category: 'attack', value: profile.empower, uses: 1 }],
        [{ type: 'buff', stat: 'skillAttack', value: profile.buff, duration }, { type: 'empower', category: 'skill', value: profile.empower, uses: 1 }],
        [{ type: 'buff', stat: 'physicalPenetration', value: Math.round(profile.buff * .55), duration }, { type: 'buff', stat: 'magicalPenetration', value: Math.round(profile.buff * .45), duration }],
        [{ type: 'buff', stat: 'damageReduction', value: Math.max(2, Math.round(profile.buff * .45)), duration }, { type: 'buff', stat: 'vitality', value: Math.round(profile.buff * .55), duration }],
        [{ type: 'buff', stat: 'independentAttack', value: Math.round(profile.buff * .8), duration }, { type: 'empower', category: 'attack', value: profile.empower, uses: 1 }],
    ][index];
    const mechanic = !unlocked ? [] : [
        [{ type: 'buff', stat: 'criticalDamage', value: Math.round(profile.buff * .5), duration }],
        [{ type: 'restoreMp', base: profile.mpRecovery * .3 }],
        [{ type: 'nextTurnDraw', value: 1 }],
        [{ type: 'statusWard', value: 1, duration }],
        [{ type: 'buff', stat: 'strength', value: Math.round(profile.buff * .5), duration }],
    ][index];
    const mechanicText = !unlocked ? '' : [
        '，并提高暴击伤害。', '，并回收少量MP。', '，并在下回合多抽一张牌。', '，并抵御一次负面效果。', '，并提高力量。',
    ][index];
    const mechanicTag = !unlocked ? [] : [['暴伤'], ['回能'], ['续手'], ['异常防护'], ['力量']][index];
    const effects = [...baseEffects, ...mechanic];
    return card(`universal_five_buff_${rarity}_${index + 1}`, name, 'buff', rarity, 'all', cost,
        `${['提高伤害并强化下一张进攻牌', '提高技能攻击并强化下一张技能牌', '同时提高物理和魔法穿透', '提高伤害减免和体力', '提高独立攻击并强化下一张进攻牌'][index]}${unlocked ? mechanicText : '。'}`, effects,
        { universalFiveExpansion: true, tags: ['通用', '战术增益', ...mechanicTag] });
}));

const PEAK_ARCHER_CARDS = [
    card('archer_quick_shot', '疾风箭', 'attack', 'common', 'archer', 0, '快速射击站立目标。', [damage(18, { physicalAttack: .62, strength: .42 })], { ...attackData('shot', ['standing'], 'standing'), tags: ['弓箭手', '射击'] }),
    card('archer_rising_arrow', '升空箭', 'attack', 'common', 'archer', 1, '射中站立或浮空目标并将其击飞。', [damage(19, { physicalAttack: .58, strength: .48 }), state('launched')], { ...attackData('launch', ['standing', 'airborne'], 'launched'), tags: ['弓箭手', '击飞'] }),
    card('archer_hunter_guard', '猎手掩护', 'defense', 'common', 'archer', 0, '借助地形获得护盾。', [{ type: 'shield', base: 18, scaling: { vitality: .52, physicalDefense: .14, spirit: .18 } }], { tags: ['弓箭手', '护盾'] }),
    card('archer_steady_aim', '沉着瞄准', 'buff', 'common', 'archer', 0, '提高物理攻击并强化下一张进攻牌。', [{ type: 'buff', stat: 'physicalAttack', value: 4, duration: 1 }, { type: 'empower', category: 'attack', value: 6, uses: 1 }], { tags: ['弓箭手', '瞄准'] }),

    card('archer_twin_shot', '双矢连射', 'attack', 'excellent', 'archer', 1, '连续射出两箭，并把击飞目标送入浮空。', [damage(15, { physicalAttack: .4, strength: .28 }, { hitIndex: 1, hitCount: 2 }), damage(15, { physicalAttack: .4, strength: .28 }, { hitIndex: 2, hitCount: 2 }), state('airborne')], { ...attackData('volley', ['launched'], 'airborne'), tags: ['弓箭手', '连射', '浮空'] }),
    card('archer_piercing_arrow', '贯甲箭', 'attack', 'excellent', 'archer', 2, '贯穿站立目标并施加易伤。', [damage(31, { physicalAttack: .82, strength: .66 }), { type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }], { ...attackData('snipe', ['standing'], 'standing'), tags: ['弓箭手', '破甲'] }),
    card('archer_windstep', '风行步', 'defense', 'excellent', 'archer', 1, '获得护盾并减轻下一次伤害。', [{ type: 'shield', base: 26, scaling: { vitality: .48, spirit: .3 } }, { type: 'guard', reduction: 16, uses: 1, duration: 2 }], { tags: ['弓箭手', '闪避'] }),
    card('archer_eagle_focus', '鹰眼专注', 'buff', 'excellent', 'archer', 1, '提高物理暴击并强化下一张技能牌。', [{ type: 'buff', stat: 'physicalCrit', value: 6, duration: 2 }, { type: 'empower', category: 'skill', value: 8, uses: 1 }], { tags: ['弓箭手', '暴击'] }),

    card('archer_arrow_rain', '箭雨', 'skill', 'rare', 'archer', 2, '以三段箭雨攻击站立目标。', [damage(18, { physicalAttack: .42, independentAttack: .26 }, { hitIndex: 1, hitCount: 3 }), damage(18, { physicalAttack: .42, independentAttack: .26 }, { hitIndex: 2, hitCount: 3 }), damage(18, { physicalAttack: .42, independentAttack: .26 }, { hitIndex: 3, hitCount: 3 })], { requiresTargetState: ['standing'], tags: ['弓箭手', '箭雨', '多段'] }),
    card('archer_pin_down', '钉影箭', 'attack', 'rare', 'archer', 2, '终结浮空目标并将其击倒。', [damage(52, { physicalAttack: 1.08, strength: .9 }), state('knockedDown')], { ...attackData('finisher', ['airborne'], 'knockedDown'), tags: ['弓箭手', '终结'] }),
    card('archer_camouflage', '林影伪装', 'defense', 'rare', 'archer', 2, '获得护盾并清除一项负面状态。', [{ type: 'shield', base: 42, scaling: { vitality: .55, spirit: .4 } }, { type: 'cleanse', value: 1 }], { tags: ['弓箭手', '净化'] }),
    card('archer_rapid_reload', '快速装填', 'skill', 'rare', 'archer', 2, '抽取两张进攻牌并恢复少量MP。', [{ type: 'drawCategory', category: 'attack', value: 2 }, { type: 'restoreMp', base: 5 }], { tags: ['弓箭手', '检索'] }),

    card('archer_storm_volley', '暴风连矢', 'skill', 'scarce', 'archer', 3, '四段射击压制目标，最后使其浮空。', [damage(17, { physicalAttack: .42, independentAttack: .3 }, { hitIndex: 1, hitCount: 4 }), damage(17, { physicalAttack: .42, independentAttack: .3 }, { hitIndex: 2, hitCount: 4 }), damage(17, { physicalAttack: .42, independentAttack: .3 }, { hitIndex: 3, hitCount: 4 }), damage(17, { physicalAttack: .42, independentAttack: .3 }, { hitIndex: 4, hitCount: 4 }), state('airborne')], { requiresTargetState: ['standing', 'launched'], tags: ['弓箭手', '连射', '浮空'] }),
    card('archer_shadow_arrow', '蚀影箭', 'skill', 'scarce', 'archer', 3, '暗属性箭矢造成伤害并施加中毒。', [damage(58, { physicalAttack: 1.04, independentAttack: .86 }, { element: 'dark' }), { type: 'status', status: 'poison', stacks: 2, duration: 3 }], { requiresTargetState: ['standing'], tags: ['弓箭手', '暗', '中毒'] }),
    card('archer_feather_guard', '翎羽护阵', 'defense', 'scarce', 'archer', 3, '获得护盾，并保留部分护盾到下一回合。', [{ type: 'shield', base: 58, scaling: { vitality: .7, spirit: .48 } }, { type: 'retainShield', value: 24 }], { tags: ['弓箭手', '护盾保留'] }),
    card('archer_hunting_rhythm', '狩猎节奏', 'buff', 'scarce', 'archer', 3, '提高物理攻击与暴击伤害。', [{ type: 'buff', stat: 'physicalAttack', value: 12, duration: 2 }, { type: 'buff', stat: 'criticalDamage', value: 10, duration: 2 }], { tags: ['弓箭手', '爆发'] }),

    card('archer_skyfall', '天穹箭瀑', 'skill', 'legendary', 'archer', 4, '五段箭矢轰击并使目标击倒。', [damage(19, { physicalAttack: .44, independentAttack: .34 }, { hitIndex: 1, hitCount: 5 }), damage(19, { physicalAttack: .44, independentAttack: .34 }, { hitIndex: 2, hitCount: 5 }), damage(19, { physicalAttack: .44, independentAttack: .34 }, { hitIndex: 3, hitCount: 5 }), damage(19, { physicalAttack: .44, independentAttack: .34 }, { hitIndex: 4, hitCount: 5 }), damage(19, { physicalAttack: .44, independentAttack: .34 }, { hitIndex: 5, hitCount: 5 }), state('knockedDown')], { requiresTargetState: ['airborne'], tags: ['弓箭手', '箭雨', '终结'] }),
    card('archer_void_snipe', '虚空狙击', 'attack', 'legendary', 'archer', 4, '对带有负面状态的目标发动高伤害狙击。', [damage(82, { physicalAttack: 1.58, strength: 1.18 })], { ...attackData('snipe', ['standing'], 'standing'), conditionalDamage: condition('targetHasStatus', .22, '目标带有负面状态时伤害提高22%。', { statuses: ['vulnerable', 'poison', 'bleed', 'burn', 'weak'] }), tags: ['弓箭手', '狙击'] }),
    card('archer_mirage_escape', '幻影脱身', 'defense', 'legendary', 'archer', 4, '获得高额护盾与状态免疫。', [{ type: 'shield', base: 72, scaling: { vitality: .82, spirit: .54 } }, { type: 'statusWard', value: 2, duration: 3 }], { tags: ['弓箭手', '免疫'] }),
    card('archer_perfect_focus', '绝对瞄准', 'buff', 'legendary', 'archer', 4, '强化下一张进攻牌并提高物理穿透。', [{ type: 'empower', category: 'attack', value: 18, uses: 1 }, { type: 'buff', stat: 'physicalPenetration', value: 12, duration: 2 }], { tags: ['弓箭手', '穿透'] }),

    card('archer_starbreaker', '贯星神矢', 'skill', 'epic', 'archer', 7, '弓箭手史诗终结技，贯穿浮空目标。', [damage(142, { physicalAttack: 2.25, strength: 1.7, independentAttack: 1.05 }, { element: 'light' }), { type: 'status', status: 'vulnerable', stacks: 2, duration: 3 }, state('knockedDown')], { requiresTargetState: ['airborne'], tags: ['弓箭手', '史诗', '光'] }),
    card('archer_endless_hunt', '无尽狩猎', 'buff', 'epic', 'archer', 6, '大幅提高攻击、暴击与技能伤害。', [{ type: 'buff', stat: 'physicalAttack', value: 20, duration: 3 }, { type: 'buff', stat: 'physicalCrit', value: 12, duration: 3 }, { type: 'buff', stat: 'skillAttack', value: 12, duration: 3 }], { tags: ['弓箭手', '史诗', '爆发'] }),

    card('storm_hunter_gale_arrow', '逐风箭', 'attack', 'common', 'archer', 0, '风暴猎手的轻灵射击。', [damage(22, { physicalAttack: .66, strength: .42 }, { element: 'light' })], { ...attackData('shot', ['standing'], 'standing'), requiredAdvancement: { pathId: 'storm_hunter', minTier: 1 }, tags: ['风暴猎手', '光'] }),
    card('storm_hunter_chain_bolt', '连锁雷矢', 'skill', 'rare', 'archer', 2, '三段雷矢攻击并施加易伤。', [damage(18, { physicalAttack: .38, independentAttack: .3 }, { element: 'light', hitIndex: 1, hitCount: 3 }), damage(18, { physicalAttack: .38, independentAttack: .3 }, { element: 'light', hitIndex: 2, hitCount: 3 }), damage(18, { physicalAttack: .38, independentAttack: .3 }, { element: 'light', hitIndex: 3, hitCount: 3 }), { type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }], { requiresTargetState: ['standing'], requiredAdvancement: { pathId: 'storm_hunter', minTier: 1 }, tags: ['风暴猎手', '光', '多段'] }),
    card('storm_hunter_tempest_guard', '风暴护幕', 'defense', 'rare', 'archer', 2, '获得护盾并保留部分护盾。', [{ type: 'shield', base: 48, scaling: { vitality: .58, spirit: .45 } }, { type: 'retainShield', value: 20 }], { requiredAdvancement: { pathId: 'storm_hunter', minTier: 1 }, tags: ['风暴猎手', '护盾'] }),
    card('storm_hunter_tailwind', '顺风之势', 'buff', 'rare', 'archer', 2, '提高光属性强化并额外抽牌。', [{ type: 'buff', stat: 'lightElement', value: 10, duration: 2 }, { type: 'nextTurnDraw', value: 1 }], { requiredAdvancement: { pathId: 'storm_hunter', minTier: 1 }, tags: ['风暴猎手', '光'] }),
    card('storm_hunter_sky_judgment', '苍穹雷狩', 'skill', 'epic', 'archer', 7, '天穹神射手的雷霆终结。', [damage(150, { physicalAttack: 2.2, independentAttack: 1.45, lightElement: .8 }, { element: 'light' }), state('knockedDown')], { requiresTargetState: ['airborne'], requiredAdvancement: { pathId: 'storm_hunter', minTier: 2 }, tags: ['天穹神射手', '史诗', '光'] }),

    card('shadow_marksman_venom_arrow', '毒影箭', 'attack', 'common', 'archer', 0, '幽影游侠的淬毒射击。', [damage(20, { physicalAttack: .6, strength: .4 }), { type: 'status', status: 'poison', stacks: 1, duration: 2 }], { ...attackData('shot', ['standing'], 'standing'), requiredAdvancement: { pathId: 'shadow_marksman', minTier: 1 }, tags: ['幽影游侠', '中毒'] }),
    card('shadow_marksman_night_volley', '夜幕连矢', 'skill', 'rare', 'archer', 2, '三段暗箭攻击中毒目标。', [damage(19, { physicalAttack: .4, independentAttack: .28 }, { element: 'dark', hitIndex: 1, hitCount: 3 }), damage(19, { physicalAttack: .4, independentAttack: .28 }, { element: 'dark', hitIndex: 2, hitCount: 3 }), damage(19, { physicalAttack: .4, independentAttack: .28 }, { element: 'dark', hitIndex: 3, hitCount: 3 })], { requiresTargetState: ['standing'], conditionalDamage: condition('targetHasStatus', .18, '目标中毒时伤害提高18%。', { statuses: ['poison'] }), requiredAdvancement: { pathId: 'shadow_marksman', minTier: 1 }, tags: ['幽影游侠', '暗', '多段'] }),
    card('shadow_marksman_smoke_screen', '暗羽烟幕', 'defense', 'rare', 'archer', 2, '获得护盾并清除负面状态。', [{ type: 'shield', base: 44, scaling: { vitality: .55, spirit: .48 } }, { type: 'cleanse', value: 1 }], { requiredAdvancement: { pathId: 'shadow_marksman', minTier: 1 }, tags: ['幽影游侠', '净化'] }),
    card('shadow_marksman_killing_intent', '猎杀意志', 'buff', 'rare', 'archer', 2, '提高暗属性强化和暴击伤害。', [{ type: 'buff', stat: 'darkElement', value: 10, duration: 2 }, { type: 'buff', stat: 'criticalDamage', value: 9, duration: 2 }], { requiredAdvancement: { pathId: 'shadow_marksman', minTier: 1 }, tags: ['幽影游侠', '暗'] }),
    card('shadow_marksman_eclipse', '永夜蚀星箭', 'skill', 'epic', 'archer', 7, '蚀星神射手的暗影终结。', [damage(148, { physicalAttack: 2.05, independentAttack: 1.55, darkElement: .8 }, { element: 'dark' }), { type: 'status', status: 'poison', stacks: 5, duration: 4 }, state('knockedDown')], { requiresTargetState: ['airborne'], requiredAdvancement: { pathId: 'shadow_marksman', minTier: 2 }, tags: ['蚀星神射手', '史诗', '暗'] }),
];

const PEAK_ARCHER_GENERAL_RARITIES = ['common', 'excellent', 'rare', 'scarce', 'legendary', 'epic'];
const PEAK_ARCHER_GENERAL_TARGETS = { attack: 3, defense: 3, skill: 3, buff: 3, special: 2 };
const PEAK_ARCHER_GENERAL_NAMES = {
    common: {
        attack: ['逐猎箭'],
        defense: ['侧身格挡', '苇叶护身'],
        skill: ['散射', '牵制射击', '回收箭囊'],
        buff: ['猎人呼吸', '风羽节律'],
        special: ['试射信号', '预留箭袋'],
    },
    excellent: {
        attack: ['回旋追矢'],
        defense: ['林间庇护', '滑步卸力'],
        skill: ['穿林箭阵', '鸣镝破空', '鹰隼取箭'],
        buff: ['高地视野', '弦音共鸣'],
        special: ['游猎号令', '风羽蓄势'],
    },
    rare: {
        attack: ['折返飞矢', '裂风抛射'],
        defense: ['猎装加固', '影叶障眼'],
        skill: ['流星三连'],
        buff: ['致命校准', '猎场直觉', '迅羽装填'],
        special: ['猎场主宰', '伏击预案'],
    },
    scarce: {
        attack: ['贯叶强弓', '追魂抛矢', '鹰坠箭'],
        defense: ['风羽壁垒', '猎鹰守望'],
        skill: ['千羽散华'],
        buff: ['百步凝神', '风痕共振'],
        special: ['百步穿杨', '暗羽潜伏'],
    },
    legendary: {
        attack: ['逐日贯虹', '星轨回旋'],
        defense: ['天风护猎', '幻羽替身'],
        skill: ['苍穹箭阵', '落星穿云'],
        buff: ['神射心眼', '猎王威仪'],
        special: ['箭域统御', '星落预兆'],
    },
    epic: {
        attack: ['破晓神箭', '逐星连矢', '天羽坠杀'],
        defense: ['不落羽城', '星辉猎幕', '神鹰护命'],
        skill: ['万箭天穹', '寂夜星陨'],
        buff: ['超越视界', '无尽箭意'],
        special: ['万矢敕令', '终末狩猎'],
    },
};

const ARCHER_ATTACK_WEIGHTS = {
    common: { base: .86, scaling: { physicalAttack: .60, strength: .34 } },
    excellent: { base: .88, scaling: { physicalAttack: .52, strength: .42 } },
    rare: { base: .84, scaling: { physicalAttack: .50, strength: .30, independentAttack: .14 } },
    scarce: { base: .82, scaling: { physicalAttack: .46, strength: .26, independentAttack: .22 } },
    legendary: { base: .80, scaling: { physicalAttack: .42, strength: .24, independentAttack: .28 } },
    epic: { base: .78, scaling: { physicalAttack: .40, strength: .22, independentAttack: .32 } },
};
const ARCHER_SKILL_WEIGHTS = {
    common: { physicalAttack: .54, independentAttack: .36 },
    excellent: { physicalAttack: .48, independentAttack: .42 },
    rare: { physicalAttack: .44, independentAttack: .44, strength: .06 },
    scarce: { physicalAttack: .38, independentAttack: .48, strength: .08 },
    legendary: { physicalAttack: .32, independentAttack: .52, strength: .10 },
    epic: { physicalAttack: .28, independentAttack: .56, strength: .12 },
};
const scaledWeights = (weights, scaling, factor = 1) => Object.fromEntries(
    Object.entries(weights).map(([stat, weight]) => [stat, scaling * weight * factor]),
);
const ARCHER_SUSTAIN_WEIGHTS = {
    common: { vitality: .62, spirit: .32 },
    excellent: { vitality: .58, spirit: .38 },
    rare: { vitality: .52, spirit: .38, physicalDefense: .08 },
    scarce: { vitality: .48, spirit: .40, physicalDefense: .12 },
    legendary: { vitality: .44, spirit: .42, physicalDefense: .16 },
    epic: { vitality: .40, spirit: .44, physicalDefense: .20 },
};
const MAGE_SUSTAIN_WEIGHTS = {
    common: { intelligence: .64, spirit: .40 },
    excellent: { intelligence: .48, spirit: .42 },
    rare: { intelligence: .44, spirit: .40, magicalDefense: .08 },
    scarce: { intelligence: .40, spirit: .40, magicalDefense: .14 },
    legendary: { intelligence: .36, spirit: .42, magicalDefense: .18 },
    epic: { intelligence: .32, spirit: .44, magicalDefense: .22 },
};
const KNIGHT_SUSTAIN_WEIGHTS = {
    common: { vitality: .68, physicalDefense: .22 },
    excellent: { vitality: .64, physicalDefense: .28 },
    rare: { vitality: .58, physicalDefense: .26, spirit: .08 },
    scarce: { vitality: .54, physicalDefense: .28, spirit: .12 },
    legendary: { vitality: .50, physicalDefense: .30, spirit: .16 },
    epic: { vitality: .46, physicalDefense: .32, spirit: .20 },
};
const LANCER_SUSTAIN_WEIGHTS = {
    common: { vitality: .58, physicalDefense: .28 },
    excellent: { vitality: .54, physicalDefense: .32 },
    rare: { vitality: .50, physicalDefense: .30, strength: .08 },
    scarce: { vitality: .46, physicalDefense: .30, strength: .14 },
    legendary: { vitality: .42, physicalDefense: .32, strength: .18 },
    epic: { vitality: .38, physicalDefense: .34, strength: .22 },
};
const PRIEST_SUSTAIN_WEIGHTS = {
    common: { spirit: .58, vitality: .26 },
    excellent: { spirit: .54, vitality: .32 },
    rare: { spirit: .50, vitality: .30, magicalDefense: .08 },
    scarce: { spirit: .48, vitality: .28, magicalDefense: .14 },
    legendary: { spirit: .46, vitality: .26, magicalDefense: .20 },
    epic: { spirit: .44, vitality: .24, magicalDefense: .26 },
};
const KNIGHT_ATTACK_WEIGHTS = {
    common: { base: .82, scaling: { physicalAttack: .52, strength: .34 } },
    excellent: { base: .84, scaling: { physicalAttack: .48, strength: .40 } },
    rare: { base: .82, scaling: { physicalAttack: .46, strength: .32, vitality: .14 } },
    scarce: { base: .82, scaling: { physicalAttack: .44, strength: .30, vitality: .18 } },
    legendary: { base: .80, scaling: { physicalAttack: .42, strength: .28, vitality: .22 } },
    epic: { base: .78, scaling: { physicalAttack: .40, strength: .26, vitality: .26 } },
};
const LANCER_ATTACK_WEIGHTS = {
    common: { base: .84, scaling: { physicalAttack: .56, strength: .36 } },
    excellent: { base: .86, scaling: { physicalAttack: .52, strength: .42 } },
    rare: { base: .84, scaling: { physicalAttack: .50, strength: .34, independentAttack: .12 } },
    scarce: { base: .84, scaling: { physicalAttack: .46, strength: .32, independentAttack: .18 } },
    legendary: { base: .82, scaling: { physicalAttack: .44, strength: .30, independentAttack: .22 } },
    epic: { base: .80, scaling: { physicalAttack: .42, strength: .28, independentAttack: .26 } },
};
const MAGE_ROUTE_ATTACK_WEIGHTS = {
    common: { base: .80, scaling: { magicalAttack: .56, intelligence: .32 } },
    excellent: { base: .82, scaling: { magicalAttack: .50, intelligence: .40 } },
    rare: { base: .80, scaling: { magicalAttack: .46, intelligence: .32, magicalCrit: .14 } },
    scarce: { base: .80, scaling: { magicalAttack: .44, intelligence: .30, magicalCrit: .18 } },
    legendary: { base: .78, scaling: { magicalAttack: .42, intelligence: .28, magicalCrit: .22 } },
    epic: { base: .76, scaling: { magicalAttack: .40, intelligence: .26, magicalCrit: .26 } },
};
const PRIEST_ATTACK_WEIGHTS = {
    common: { base: .80, scaling: { magicalAttack: .54, intelligence: .34 } },
    excellent: { base: .82, scaling: { magicalAttack: .50, intelligence: .40 } },
    rare: { base: .80, scaling: { magicalAttack: .46, intelligence: .32, spirit: .16 } },
    scarce: { base: .80, scaling: { magicalAttack: .44, intelligence: .30, spirit: .20 } },
    legendary: { base: .78, scaling: { magicalAttack: .42, intelligence: .28, spirit: .24 } },
    epic: { base: .76, scaling: { magicalAttack: .40, intelligence: .26, spirit: .28 } },
};
const timedFuseEffect = (profile, weights, { turns, share, element = '', name = '' }) => ({
    type: 'timedFuse',
    turns,
    fuseShare: share,
    base: profile.base * share,
    scaling: scaledWeights(weights, profile.scaling, share),
    ...(element ? { element } : {}),
    ...(name ? { name } : {}),
});

const createPeakArcherGeneralCard = (rarity, category, name, index) => {
    const profile = PEAK_CARD_BALANCE[rarity];
    const rarityIndex = PEAK_ARCHER_GENERAL_RARITIES.indexOf(rarity);
    const id = `archer_general_${rarity}_${category}_${index + 1}`;
    const commonExtra = { archerGeneralExpansion: true, tags: ['弓箭手', '基础通用'] };
    const universalCaps = UNIVERSAL_DEFENSE_CAPS[rarity];
    const unlocked = rarityIndex >= 2;
    if (category === 'attack') {
        const attackProfiles = [
            { style: 'shot', from: ['standing'], to: 'standing', summary: '稳定射击站立目标。' },
            { style: 'launch', from: ['standing', 'airborne'], to: 'launched', summary: '射穿目标重心并将其击飞。' },
            { style: 'volley', from: ['standing', 'launched'], to: 'airborne', summary: '以连续箭势将目标送入浮空。' },
        ];
        const attack = attackProfiles[index % attackProfiles.length];
        const weights = ARCHER_ATTACK_WEIGHTS[rarity];
        const fuseShare = .28 + rarityIndex * .02;
        const fuse = !unlocked || attack.to === 'standing'
            ? []
            : rarityIndex >= 4
                ? [timedFuseEffect(profile, weights.scaling, { turns: 1, share: fuseShare * .45, name: '追猎引信' }),
                    timedFuseEffect(profile, weights.scaling, { turns: 2, share: fuseShare * .55, name: '追猎余震' })]
                : [timedFuseEffect(profile, weights.scaling, { turns: 3, share: fuseShare, name: '追猎引信' })];
        return card(id, name, category, rarity, 'archer', 0,
            fuse.length > 1 ? `${attack.summary}箭创连珠发作，先后两度撕裂伤口。` : fuse.length ? `${attack.summary}箭创会延迟发作。` : attack.summary,
            [damage(profile.base * (weights.base + index * .05), scaledWeights(weights.scaling, profile.scaling)), ...fuse, ...(attack.to === 'standing' ? [] : [state(attack.to)])],
            { ...attackData(attack.style, attack.from, attack.to), ...commonExtra, tags: [...commonExtra.tags, '箭术', ...(fuse.length ? [fuse.length > 1 ? '连珠引信' : '延迟引信'] : [])] });
    }
    if (category === 'defense') {
        const defenseIndex = index % 3;
        const sustain = ARCHER_SUSTAIN_WEIGHTS[rarity];
        const effects = [
            [{ type: 'shield', base: profile.sustainBase, scaling: scaledWeights(sustain, profile.sustainScaling) },
                ...(unlocked ? [{ type: 'retainShield', value: 15 + rarityIndex * 5 }] : [])],
            [{ type: 'shield', base: profile.sustainBase * .88, scaling: scaledWeights(sustain, profile.sustainScaling, .86) },
                { type: 'guard', reduction: 12 + rarityIndex * 4, uses: 1, duration: 2, ...(unlocked ? { counterRatio: 18 + rarityIndex * 6, restoreMp: 1 + Math.floor(rarityIndex / 2) } : {}) }],
            [{ type: 'shield', base: profile.sustainBase * .82, scaling: scaledWeights(sustain, profile.sustainScaling, .8) },
                unlocked
                    ? { type: 'shieldBreak', healPercent: universalCaps.breakHeal, draw: universalCaps.breakDraw, uses: universalCaps.uses, duration: universalCaps.duration }
                    : { type: 'statusWard', value: 1 + Math.floor(rarityIndex / 3), duration: 2 }],
        ][defenseIndex];
        return card(id, name, category, rarity, 'archer', 0,
            [unlocked ? '获得稳定护盾，并将部分护盾保留到下一回合。' : '获得稳定护盾。',
                unlocked ? '获得护盾，以架势减伤并反击来袭者。' : '获得护盾并减轻下一次伤害。',
                unlocked ? '获得护盾，护盾被击破时回复生命并补牌。' : '获得护盾与异常防护。'][defenseIndex], effects,
            { ...commonExtra, tags: [...commonExtra.tags, '生存', ...(unlocked ? [['留盾', '架势反击', '护盾回响'][defenseIndex]] : [])] });
    }
    if (category === 'skill') {
        const skillIndex = index % 3;
        const weights = ARCHER_SKILL_WEIGHTS[rarity];
        const hitCount = rarityIndex >= 4 ? 3 : rarityIndex >= 2 ? 2 : 1;
        const effects = [
            Array.from({ length: hitCount }, (_, hitIndex) => damage(
                profile.base * .92,
                scaledWeights(weights, profile.scaling),
                hitCount > 1 ? { hitIndex: hitIndex + 1, hitCount } : {},
            )),
            [damage(profile.base * .82, scaledWeights(weights, profile.scaling, .92), { element: index % 2 ? 'dark' : 'light' }),
                { type: 'status', status: index % 2 ? 'poison' : 'vulnerable', stacks: 1 + Math.floor(rarityIndex / 2), duration: 2 + Math.floor(rarityIndex / 3) },
                ...(unlocked ? [{ type: 'status', status: index % 2 ? 'vulnerable' : 'poison', stacks: 1, duration: 2 }] : [])],
            [{ type: 'drawCategory', category: 'attack', value: 1 + Math.floor(rarityIndex / 3) }, { type: 'restoreMp', base: profile.mpRecovery * .45 },
                ...(unlocked ? [{ type: 'empower', category: 'attack', value: profile.empower, uses: 1 }] : [])],
        ][skillIndex];
        const extra = skillIndex < 2 ? { requiresTargetState: skillIndex === 0 ? ['standing'] : ['standing', 'launched'] } : {};
        return card(id, name, category, rarity, 'archer', 0,
            [hitCount > 1 ? `释放${hitCount}段箭术造成技能伤害。` : '以箭术造成稳定技能伤害。',
                unlocked ? '以属性箭造成伤害并同时施加两种负面状态。' : '以属性箭造成伤害并施加负面状态。',
                unlocked ? '检索进攻牌、恢复少量MP，并强化下一张进攻牌。' : '检索进攻牌并恢复少量MP。'][skillIndex], effects,
            { ...extra, ...commonExtra, tags: [...commonExtra.tags, skillIndex === 2 ? '箭囊' : '战技', ...(skillIndex === 0 && hitCount > 1 ? ['多段'] : [])] });
    }
    if (category === 'buff') {
        const buffIndex = index % 3;
        const duration = Math.min(profile.duration, 2 + Math.floor(rarityIndex / 2));
        const effects = [
            [{ type: 'buff', stat: 'physicalAttack', value: profile.buff, duration }, { type: 'buff', stat: 'physicalCrit', value: Math.ceil(profile.buff * .5), duration },
                ...(unlocked ? [{ type: 'buff', stat: 'independentAttack', value: Math.ceil(profile.buff * .6), duration }] : [])],
            [{ type: 'buff', stat: 'criticalDamage', value: profile.buff, duration }, { type: 'empower', category: 'attack', value: profile.empower, uses: 1 },
                ...(unlocked ? [{ type: 'restoreMp', base: profile.mpRecovery * .35 }] : [])],
            [{ type: 'buff', stat: 'independentAttack', value: profile.buff, duration }, { type: 'nextTurnDraw', value: 1 },
                ...(unlocked ? [{ type: 'buff', stat: 'physicalCrit', value: Math.ceil(profile.buff * .6), duration }] : [])],
        ][buffIndex];
        return card(id, name, category, rarity, 'archer', 0,
            [unlocked ? '提高物理攻击、暴击与独立攻击。' : '提高物理攻击与暴击。',
                unlocked ? '提高暴击伤害，强化下一张进攻牌并回复少量MP。' : '提高暴击伤害并强化下一张进攻牌。',
                unlocked ? '提高独立攻击与暴击，并准备额外抽牌。' : '提高独立攻击并准备额外抽牌。'][buffIndex], effects,
            { ...commonExtra, tags: [...commonExtra.tags, '狩猎增益'] });
    }
    const minValue = 4 + rarityIndex * 3;
    const maxValue = minValue + 4 + rarityIndex;
    const specialUnlock = index === 0
        ? (unlocked ? [{ type: 'drawCategory', category: 'attack', value: 1 + Math.floor(rarityIndex / 3) }] : [])
        : (unlocked ? [{ type: 'empower', category: 'attack', value: profile.empower, uses: 1 }] : []);
    const effects = index === 0
        ? [{ type: 'classCategoryRoundDamageBoost', classId: 'archer', categories: ['attack', 'skill'], minValue, maxValue }, ...specialUnlock]
        : [{ type: 'nextTurnClassCategoryDamageBoost', classId: 'archer', categories: ['attack', 'skill'], minValue, maxValue }, ...specialUnlock];
    return card(id, name, category, rarity, 'archer', 0,
        index === 0
            ? (specialUnlock.length ? '本回合提高弓箭手专属进攻牌与技能牌的伤害，并检索一张进攻牌。' : '本回合提高弓箭手专属进攻牌与技能牌的伤害。')
            : (specialUnlock.length ? '为下一回合蓄势提高弓箭手牌伤害，并强化下一张进攻牌。' : '为下一回合蓄势，提高弓箭手专属进攻牌与技能牌的伤害。'), effects,
        { ...commonExtra, tags: [...commonExtra.tags, '特殊牌', index === 0 ? '职业增伤' : '蓄势增伤'] });
};

const PEAK_ARCHER_GENERAL_CARDS = PEAK_ARCHER_GENERAL_RARITIES.flatMap((rarity) => Object.entries(PEAK_ARCHER_GENERAL_TARGETS).flatMap(([category, target]) => {
    const existing = PEAK_ARCHER_CARDS.filter((entry) => entry.classId === 'archer' && !entry.requiredAdvancement && entry.rarity === rarity && entry.category === category).length;
    const names = PEAK_ARCHER_GENERAL_NAMES[rarity][category];
    if (names.length !== target - existing) throw new Error(`弓箭手${rarity}/${category}基础卡数量配置错误`);
    return names.map((name, index) => createPeakArcherGeneralCard(rarity, category, name, index));
}));

const PEAK_ARCHER_ROUTE_MASTERY_CONFIG = {
    storm_hunter: { firstName: '风暴猎手', secondName: '天穹神射手', prefix: '风猎', element: 'light', status: 'vulnerable', resourceTag: '风暴印记' },
    shadow_marksman: { firstName: '幽影游侠', secondName: '蚀星神射手', prefix: '影狩', element: 'dark', status: 'poison', resourceTag: '猎杀印记' },
};
const PEAK_ARCHER_ROUTE_CARD_NAMES = {
    storm_hunter: {
        common: {
            attack: { t1_1: '掠风矢', t1_2: '扬弓挑月', t2_1: '回风追矢', t2_2: '托箭上云', t2_3: '落隼坠杀' },
            defense: { t1_1: '借风侧闪', t1_2: '引弦格锋', t2_1: '逆风滑步', t2_2: '弓身横架', t2_3: '风痕聚盾' },
            skill: { t1_1: '三连速射', t2_1: '疾风叠射', t2_2: '散矢覆野', t2_3: '连珠攒印' },
            buff: { t1_1: '猎意渐起', t1_2: '屏息定神', t2_1: '风势助弓', t2_2: '审风定距', t2_3: '步随风律' },
            special: { t1_1: '猎哨传信', t1_2: '风向读算', t2_1: '围猎指令' },
        },
        excellent: {
            attack: { t1_1: '锐羽穿风', t1_2: '翻羽引空', t2_1: '长风贯的', t2_2: '抬弓惊鸿', t2_3: '鹰扑折翼' },
            defense: { t1_1: '收羽蓄势', t1_2: '铁弦护腕', t2_1: '顺风卸力', t2_2: '铁臂支弓', t2_3: '聚风成壁' },
            skill: { t1_1: '四矢急连', t1_2: '风墙箭幕', t2_1: '锐风连珠', t2_2: '密矢压制', t2_3: '弦鸣三叠' },
            buff: { t1_1: '锐意上扬', t1_2: '凝眸聚锋', t2_1: '羽息增劲', t2_2: '定息合弦', t2_3: '猎步如风' },
            special: { t1_1: '锐锋号角', t1_2: '风路推演', t2_1: '合围之号' },
        },
        rare: {
            attack: { t1_1: '惊雷点射', t1_2: '引雷升空', t2_1: '雷鸣叩关', t2_2: '卷云挑击', t2_3: '雷坠贯顶' },
            defense: { t1_1: '雷影错身', t2_1: '引雷入弦', t2_2: '电弧封锋', t2_3: '雷印回护' },
            skill: { t1_1: '五矢雷连', t2_1: '电光穿石', t2_2: '雷雨箭幕', t2_3: '雷伏三矢' },
            buff: { t1_1: '雷心激涌', t2_1: '雷息聚劲', t2_2: '电目锁定', t2_3: '雷步律动' },
            special: { t1_1: '雷云传令', t1_2: '雷路测算', t2_1: '雷阵合围' },
        },
        scarce: {
            attack: { t1_1: '一箭破晓', t1_2: '扶摇直上', t2_1: '千里追锋', t2_2: '摧云仰击', t2_3: '陨隼重坠' },
            defense: { t1_1: '风眼独立', t1_2: '飓幕环身', t2_1: '气旋偏锋', t2_2: '铁弓封路', t2_3: '飓印成垒' },
            skill: { t1_1: '骤雨连珠', t1_2: '断云箭潮', t2_1: '啸弦裂空', t2_2: '罡风乱矢', t2_3: '三叠聚风' },
            buff: { t1_1: '战魂鼓荡', t1_2: '灵眸澄明', t2_1: '罡风附弦', t2_2: '心镜无波', t2_3: '踏风成韵' },
            special: { t1_1: '飓风战令', t1_2: '天象洞察', t2_1: '罡风围杀' },
        },
        legendary: {
            attack: { t1_1: '长空一线', t1_2: '拔云问天', t1_3: '天罚落隼', t2_1: '贯日之矢', t2_2: '破晓腾空' },
            defense: { t1_1: '云台不动', t1_2: '穹顶偏转', t1_3: '风纹结垒', t2_1: '御风消劫', t2_2: '雷云环甲' },
            skill: { t1_1: '万矢朝天', t1_2: '苍穹箭瀑', t1_3: '穿霄三绝', t2_1: '天倾箭雨', t2_2: '云海覆射' },
            buff: { t1_1: '凌云之志', t1_2: '天目通明', t1_3: '御风踏韵', t2_1: '穹风灌弦', t2_2: '澄心入定' },
            special: { t1_1: '苍穹敕令', t1_2: '天机演算', t2_1: '穹顶围歼' },
        },
        epic: {
            attack: { t1_1: '万里独行矢', t1_2: '擎天引弦', t1_3: '天谴一坠', t2_1: '贯彻九霄', t2_2: '曦光腾射' },
            defense: { t1_1: '神风消劫', t1_2: '天幕圣障', t1_3: '风神铸垒', t2_1: '不动如岳', t2_2: '雷穹圣甲' },
            skill: { t1_1: '诸天万矢', t1_2: '神授箭雨', t1_3: '弑星三射', t2_1: '天倾箭潮' },
            buff: { t1_1: '神授猎心', t1_2: '神目洞天', t1_3: '与风共律', t2_1: '神风盈弦', t2_2: '神识澄然' },
            special: { t1_1: '神授敕令', t1_2: '天命推演', t2_1: '诸天围歼' },
        },
    },
    shadow_marksman: {
        common: {
            attack: { t1_1: '涂毒一矢', t2_1: '影随追杀', t2_2: '暗爪撩空', t2_3: '缢影坠贯' },
            defense: { t1_1: '敛形入暗', t1_2: '影纱遮面', t2_1: '潜踪错步', t2_2: '袖箭封身', t2_3: '伏影攒印' },
            skill: { t1_1: '毒矢速连', t1_2: '散影乱矢', t2_1: '连环毒射', t2_2: '暗影三列', t2_3: '无声聚印' },
            buff: { t1_1: '杀意萌生', t1_2: '屏息潜伏', t2_1: '影气缠弦', t2_2: '冷眼锁猎', t2_3: '暗步无声' },
            special: { t1_1: '影狩暗号', t1_2: '猎径勘算', t2_1: '暗影猎令' },
        },
        excellent: {
            attack: { t1_1: '毒牙咬喉', t1_2: '掀影引空', t2_1: '循影索命', t2_2: '暗刃撩星', t2_3: '折骨坠影' },
            defense: { t1_1: '吞声匿形', t1_2: '毒纱缠腕', t2_1: '雾散离身', t2_2: '暗弓封路', t2_3: '毒印回护' },
            skill: { t1_1: '四矢蚀连', t1_2: '毒雾箭幕', t2_1: '蚀骨连珠', t2_2: '暗影压制', t2_3: '寂灭三叠' },
            buff: { t1_1: '毒意渐浓', t1_2: '暗瞳凝视', t2_1: '毒气附矢', t2_2: '静息藏形', t2_3: '影步渐疾' },
            special: { t1_1: '毒牙号令', t1_2: '暗路推算', t2_1: '蚀影合围' },
        },
        rare: {
            attack: { t1_1: '腐血穿喉', t1_2: '拽影升渊', t2_1: '溃烂索命', t2_2: '渊蚀仰击', t2_3: '腐骨压顶' },
            defense: { t1_1: '腐雾散形', t2_1: '引渊入弦', t2_2: '腐痕封锋', t2_3: '渊印聚护' },
            skill: { t1_1: '五矢腐连', t2_1: '腐雨成潮', t2_2: '渊影压制', t2_3: '腐寂三矢' },
            buff: { t1_1: '腐心涌动', t2_1: '腐气灌弦', t2_2: '渊瞳锁魂', t2_3: '腐步潜律' },
            special: { t1_1: '渊影传令', t1_2: '腐径演算', t2_1: '腐蚀围杀' },
        },
        scarce: {
            attack: { t1_1: '一矢摄魂', t1_2: '幽冥举魄', t2_1: '千里索魂', t2_2: '冥焰撩空', t2_3: '陨魂压骨' },
            defense: { t1_1: '幽冥独立', t1_2: '噬影环身', t2_1: '冥雾离锋', t2_2: '骨弓封路', t2_3: '冥印成垒' },
            skill: { t1_1: '噬魂连珠', t1_2: '断魄箭潮', t2_1: '绝寂裂空', t2_2: '幽冥乱矢', t2_3: '三叠摄冥' },
            buff: { t1_1: '噬魂战意', t1_2: '幽瞳澄冷', t2_1: '冥气附弦', t2_2: '心寂无痕', t2_3: '踏冥成韵' },
            special: { t1_1: '幽冥战令', t1_2: '冥机洞察', t2_1: '噬魂围杀' },
        },
        legendary: {
            attack: { t1_1: '长夜一线', t1_2: '掀天暗引', t1_3: '星陨摧骨', t2_1: '蚀日之矢', t2_2: '暗夜腾空' },
            defense: { t1_1: '冥台不动', t1_2: '星影偏转', t1_3: '蚀纹结垒', t2_1: '御暗消劫', t2_2: '冥渊环甲' },
            skill: { t1_1: '万矢蚀星', t1_2: '暗天箭瀑', t1_3: '穿冥三绝', t2_1: '冥倾箭雨', t2_2: '冥海覆射' },
            buff: { t1_1: '堕星之志', t1_2: '冥目通幽', t1_3: '御暗踏韵', t2_1: '星蚀灌弦', t2_2: '寂心入定' },
            special: { t1_1: '蚀星敕令', t1_2: '冥机演算', t2_1: '暗天围歼' },
        },
        epic: {
            attack: { t1_1: '长夜独行矢', t1_2: '擎渊引弦', t1_3: '神堕一坠', t2_1: '贯彻九幽', t2_2: '暝光腾射' },
            defense: { t1_1: '冥神消劫', t1_2: '暗幕圣障', t1_3: '冥神铸垒', t2_1: '不动如渊', t2_2: '渊冥圣甲' },
            skill: { t1_1: '诸冥万矢', t1_2: '神授毒雨', t1_3: '弑星三蚀', t2_1: '冥倾箭潮' },
            buff: { t1_1: '神授杀心', t1_2: '冥目洞天', t1_3: '与暗共律', t2_1: '蚀气盈弦', t2_2: '冥识澄然' },
            special: { t1_1: '冥神敕令', t1_2: '冥命推演', t2_1: '诸冥围歼' },
        },
    },
};
const peakArcherExistingRouteCards = (pathId) => [
    ...PEAK_ADVANCEMENT_CARDS,
    ...PEAK_ADVANCEMENT_EXPANSION_CARDS,
    ...PEAK_ARCHER_CARDS,
].filter((entry) => entry.requiredAdvancement?.pathId === pathId);

const createPeakArcherRouteMasteryCard = (pathId, rarity, category, tier, index) => {
    const config = PEAK_ARCHER_ROUTE_MASTERY_CONFIG[pathId];
    const profile = PEAK_CARD_BALANCE[rarity];
    const rarityIndex = PEAK_ARCHER_GENERAL_RARITIES.indexOf(rarity);
    const tierName = tier === 1 ? config.firstName : config.secondName;
    const id = `archer_route_${pathId}_${rarity}_${category}_t${tier}_${index + 1}`;
    const name = PEAK_ARCHER_ROUTE_CARD_NAMES[pathId]?.[rarity]?.[category]?.[`t${tier}_${index + 1}`];
    if (!name) throw new Error(`弓箭手转职卡缺少卡名：${id}`);
    const commonExtra = {
        requiredAdvancement: { pathId, minTier: tier },
        advancementCard: true,
        archerRouteMasteryExpansion: true,
        tags: [tierName, config.resourceTag, tier === 1 ? '一转卡' : '二转卡'],
    };
    if (category === 'attack') {
        const attackProfiles = [
            { style: 'shot', from: ['standing'], to: 'standing' },
            { style: 'launch', from: ['standing', 'airborne'], to: 'launched' },
            { style: 'finisher', from: ['airborne'], to: 'knockedDown' },
        ];
        const attack = attackProfiles[index % 3];
        const weights = ARCHER_ATTACK_WEIGHTS[rarity];
        const statusEffect = pathId === 'shadow_marksman' && index === 0
            ? [{ type: 'status', status: config.status, stacks: 1 + Math.floor(rarityIndex / 2), duration: 2 + Math.floor(rarityIndex / 3) }]
            : [];
        const fuseEffect = rarityIndex >= 2 && attack.to === 'knockedDown'
            ? [timedFuseEffect(profile, weights.scaling, { turns: rarityIndex >= 4 ? 2 : 3, share: .3 + rarityIndex * .02, element: config.element, name: '猎杀引信' })]
            : [];
        const summary = attack.to === 'standing' ? '射击站立目标并积累路线优势。'
            : attack.to === 'launched' ? '以路线箭术将目标击飞。'
            : fuseEffect.length ? '终结浮空目标并将其击倒，同时埋下延迟引信。' : '终结浮空目标并将其击倒。';
        return card(id, name, category, rarity, 'archer', tier - 1, summary,
            [damage(profile.base * (weights.base + tier * .05), scaledWeights(weights.scaling, profile.scaling)), ...statusEffect, ...fuseEffect, ...(attack.to === 'standing' ? [] : [state(attack.to)])],
            { ...attackData(attack.style, attack.from, attack.to), ...commonExtra, tags: [...commonExtra.tags, '路线进攻', ...(fuseEffect.length ? ['延迟引信'] : [])] });
    }
    if (category === 'defense') {
        const defenseIndex = index % 3;
        const sustain = ARCHER_SUSTAIN_WEIGHTS[rarity];
        const counterGuard = rarityIndex >= 2;
        const overchargePayoff = rarityIndex >= 2;
        const effects = [
            [{ type: 'shield', base: profile.sustainBase, scaling: scaledWeights(sustain, profile.sustainScaling, .96) }, { type: 'gainRouteResource', value: tier },
                ...(counterGuard ? [{ type: 'retainShield', value: 15 + rarityIndex * 5 }] : [])],
            [{ type: 'shield', base: profile.sustainBase * .88, scaling: scaledWeights(sustain, profile.sustainScaling, .84) }, { type: 'guard', reduction: 12 + rarityIndex * 4 + tier * 2, uses: 1, duration: 2, ...(counterGuard ? { counterRatio: 20 + rarityIndex * 6, restoreMp: tier } : {}) }],
            [{ type: 'shield', base: profile.sustainBase * .78, scaling: scaledWeights(sustain, profile.sustainScaling, .78) }, { type: 'routeResourcePayoff', shieldPerMark: 3 + rarityIndex * 2 + tier, mpPerMark: tier >= 2 ? 1 : 0, consume: overchargePayoff }],
        ][defenseIndex];
        return card(id, name, category, rarity, 'archer', tier - 1,
            [counterGuard ? '获得护盾、积累路线印记，并将部分护盾保留到下一回合。' : '获得护盾并直接积累路线印记。',
                counterGuard ? '获得护盾，以架势减伤并反击来袭者。' : '获得护盾并以架势减轻下一次伤害。',
                overchargePayoff ? '消耗全部路线印记，换取成倍的护盾与MP。' : '根据当前路线印记获得额外护盾。'][defenseIndex], effects,
            { ...commonExtra, tags: [...commonExtra.tags, '路线防御', defenseIndex === 2 ? (overchargePayoff ? '印记超量消费' : '印记联动') : ''] });
    }
    if (category === 'skill') {
        const skillIndex = index % 3;
        const bonusHits = rarityIndex >= 4 ? 2 : rarityIndex >= 2 ? 1 : 0;
        const hitCount = skillIndex + 1 + bonusHits;
        const weights = ARCHER_SKILL_WEIGHTS[rarity];
        const hitEffects = Array.from({ length: hitCount }, (_, hitIndex) => damage(
            profile.base * (.82 + tier * .04),
            scaledWeights(weights, profile.scaling),
            { element: config.element, hitIndex: hitIndex + 1, hitCount },
        ));
        const utility = skillIndex === 1
            ? [{ type: 'status', status: config.status, stacks: 1 + Math.floor(rarityIndex / 2), duration: 2 + Math.floor(rarityIndex / 3) }]
            : skillIndex === 2 ? [{ type: 'gainRouteResource', value: tier }] : [];
        return card(id, name, category, rarity, 'archer', tier - 1,
            skillIndex === 0 ? `释放${hitCount}段属性箭造成稳定伤害。` : skillIndex === 1 ? `${hitCount}段属性箭命中并施加路线负面状态。` : `${hitCount}段属性箭命中并额外积累路线印记。`,
            [...hitEffects, ...utility],
            { requiresTargetState: skillIndex === 2 ? ['standing', 'launched'] : ['standing'], ...commonExtra, tags: [...commonExtra.tags, '路线技能', '多段'] });
    }
    if (category === 'buff') {
        const buffIndex = index % 3;
        const duration = Math.min(profile.duration, 2 + Math.floor(rarityIndex / 2));
        const enriched = rarityIndex >= 2;
        const effects = [
            [{ type: 'buff', stat: pathId === 'storm_hunter' ? 'lightElement' : 'darkElement', value: profile.buff, duration }, { type: 'gainRouteResource', value: tier },
                ...(enriched ? [{ type: 'buff', stat: 'allElement', value: Math.ceil(profile.buff * .5), duration }] : [])],
            [{ type: 'buff', stat: 'physicalAttack', value: profile.buff, duration }, { type: 'empower', category: 'skill', value: profile.empower, uses: 1 },
                ...(enriched ? [{ type: 'restoreMp', base: profile.mpRecovery * .35 }] : [])],
            [{ type: 'buff', stat: 'criticalDamage', value: profile.buff, duration }, { type: 'nextTurnDraw', value: tier },
                ...(enriched ? [{ type: 'buff', stat: 'independentAttack', value: Math.ceil(profile.buff * .6), duration }] : [])],
        ][buffIndex];
        return card(id, name, category, rarity, 'archer', tier - 1,
            [enriched ? '提高路线属性与全属性强化，并直接积累路线印记。' : '提高路线属性并直接积累路线印记。',
                enriched ? '提高物理攻击，强化下一张技能牌并回复少量MP。' : '提高物理攻击并强化下一张技能牌。',
                enriched ? '提高暴击伤害与独立攻击，并准备额外抽牌。' : '提高暴击伤害并准备额外抽牌。'][buffIndex], effects,
            { ...commonExtra, tags: [...commonExtra.tags, '路线增益'] });
    }
    const specialIndex = index % 3;
    const ambushFuse = rarityIndex >= 2
        ? [timedFuseEffect(profile, ARCHER_SKILL_WEIGHTS[rarity], { turns: rarityIndex >= 4 ? 2 : 3, share: .34 + rarityIndex * .02, element: config.element, name: '埋伏引信' })]
        : [];
    const burnMarks = rarityIndex >= 2;
    const minValue = 5 + rarityIndex * 3 + tier * 2;
    const maxValue = minValue + 4 + rarityIndex;
    const effects = [
        [{ type: 'gainRouteResource', value: tier === 1 ? 2 : 99 }, ...ambushFuse],
        [{ type: 'routeResourcePayoff', shieldPerMark: (burnMarks ? 4 : 2) + rarityIndex * 2 + tier, mpPerMark: 1 + Math.floor(rarityIndex / 2), consume: burnMarks }],
        [{ type: 'gainRouteResource', value: 99 }, { type: 'nextTurnClassCategoryDamageBoost', classId: 'archer', categories: ['attack', 'skill'], minValue, maxValue }],
    ][specialIndex];
    return card(id, name, category, rarity, 'archer', tier - 1,
        specialIndex === 0 ? (ambushFuse.length ? '积累路线印记，并在目标身上埋下延迟引信。' : '立即积累路线印记，为爆发牌创造条件。')
            : specialIndex === 1 ? '消耗全部路线印记，将其转化为护盾和MP。' : '填满路线印记，并强化下一回合的弓箭手攻势。', effects,
        { ...commonExtra, tags: [...commonExtra.tags, '路线特殊牌', specialIndex === 1 ? '印记转化' : '印记充能', ...(specialIndex === 0 && ambushFuse.length ? ['延迟引信'] : [])] });
};

const PEAK_ARCHER_ROUTE_MASTERY_CARDS = Object.keys(PEAK_ARCHER_ROUTE_MASTERY_CONFIG).flatMap((pathId) => {
    const existingCards = peakArcherExistingRouteCards(pathId);
    return PEAK_ARCHER_GENERAL_RARITIES.flatMap((rarity) => Object.keys(PEAK_CARD_CATEGORIES).flatMap((category) => [1, 2].flatMap((tier) => {
        const target = category === 'special' ? (tier === 1 ? 2 : 1) : 3;
        const existing = existingCards.filter((entry) => entry.rarity === rarity && entry.category === category && entry.requiredAdvancement?.minTier === tier).length;
        const missing = target - existing;
        if (missing < 0) throw new Error(`弓箭手路线${pathId}/${rarity}/${category}/T${tier}已有卡牌超过目标`);
        return Array.from({ length: missing }, (_, index) => createPeakArcherRouteMasteryCard(pathId, rarity, category, tier, index));
    })));
});

const PEAK_KNIGHT_GENERAL_RARITIES = [...PEAK_ARCHER_GENERAL_RARITIES];
const PEAK_KNIGHT_GENERAL_CARD_NAMES = {
    common: {
        attack: ['盾缘叩击', '挑枪撩甲', '俯身撞阵'],
        defense: ['铁盾自守', '侧盾卸力', '半盾不坠'],
        skill: ['熹光一斩', '灼目之光', '调械养息'],
        buff: ['束甲整装', '持枪蓄势', '晨祷加护'],
        special: ['整肃阵线', '初立誓约'],
    },
    excellent: {
        attack: ['铁缘碎骨', '穿甲挑月', '踏步破阵'],
        defense: ['铁壁当前', '偏锋卸势', '余盾长存'],
        skill: ['破晓一击', '曜甲之隙', '临阵换械'],
        buff: ['重甲加身', '枪锋蓄势', '静室誓祷'],
        special: ['列阵齐进', '战前立约'],
    },
    rare: {
        attack: ['银缘裂甲', '银枪掀骑', '衔锋冲阵'],
        defense: ['银壁不移', '银鳞偏刃', '银盾余晖'],
        skill: ['银光断罪', '罪痕昭彰', '银库调械'],
        buff: ['银甲固身', '银锋凝势', '银印祝祷'],
        special: ['银骑督阵', '铭誓于银'],
    },
    scarce: {
        attack: ['晶棱崩甲', '晶枪掀天', '晶铠碾阵'],
        defense: ['晶壁生辉', '晶面折刃', '晶盾未熄'],
        skill: ['晶光落罪', '晶纹刻隙', '晶库启械'],
        buff: ['晶甲共鸣', '晶锋盈势', '晶阶诵祷'],
        special: ['晶阵号令', '刻誓于晶'],
    },
    legendary: {
        attack: ['圣缘裁骨', '圣枪问天', '圣骑荡军'],
        defense: ['圣壁如岳', '圣辉折锋', '圣盾长明'],
        skill: ['圣辉断罪', '天罪显形', '圣库授械'],
        buff: ['圣甲加冕', '圣锋满蓄', '圣坛长祷'],
        special: ['圣阵敕令', '誓铭圣典'],
    },
    epic: {
        attack: ['神缘灭骨', '弑天一枪', '破军神骑'],
        defense: ['不朽壁垒', '断锋神辉', '恒明圣盾'],
        skill: ['诸神断罪', '神罚显罪', '神库赐械'],
        buff: ['神甲铸魂', '神锋极蓄', '神殿终祷'],
        special: ['神阵敕令', '誓刻神约'],
    },
};
const PEAK_KNIGHT_CARD_ART = {
    attack: ['judgment-hammer.png', 'holy-swordfall.png', 'winged-hammer.png'],
    defense: ['sanctuary-barrier.png', 'consecrated-ground.png', 'cross-sanctuary.png'],
    skill: ['radiant-cross.png', 'heavenly-blade.png', 'divine-cross.png'],
    buff: ['radiant-wings.png', 'consecrated-ground.png', 'cross-sanctuary.png'],
    special: ['divine-cross.png', 'winged-hammer.png'],
};
const PEAK_KNIGHT_EFFECT_ART = {
    attack: ['holy-hammer-swing.png', 'holy-hammer-impact.png', 'holy-hammer-slam.png'],
    defense: ['holy-shield-barrier.png', 'holy-dome.png', 'holy-shield-aura.png'],
    skill: ['holy-hammer-burst.png', 'holy-hammer-impact.png', 'holy-hammer-slam.png'],
    buff: ['holy-shield-aura.png', 'holy-dome.png', 'holy-hammer-burst.png'],
    special: ['holy-hammer-burst.png', 'holy-shield-aura.png'],
};
const createPeakKnightGeneralCard = (rarity, category, index) => {
    const profile = PEAK_CARD_BALANCE[rarity];
    const rarityIndex = PEAK_KNIGHT_GENERAL_RARITIES.indexOf(rarity);
    const unlocked = ['rare', 'scarce', 'legendary', 'epic'].includes(rarity);
    const caps = CLASS_MECHANIC_CAPS[rarity];
    const id = `knight_general_${rarity}_${category}_${index + 1}`;
    const name = PEAK_KNIGHT_GENERAL_CARD_NAMES[rarity]?.[category]?.[index];
    if (!name) throw new Error(`骑士通用卡缺少卡名：${id}`);
    const commonExtra = {
        knightGeneralExpansion: true,
        cardArt: `assets/fighters/heroes/shengwei/card-pic/${PEAK_KNIGHT_CARD_ART[category][index]}`,
        effectArt: `assets/fighters/heroes/shengwei/${PEAK_KNIGHT_EFFECT_ART[category][index]}`,
        tags: ['骑士', '基础通用'],
    };
    const universalCaps = UNIVERSAL_DEFENSE_CAPS[rarity];
    const sustain = KNIGHT_SUSTAIN_WEIGHTS[rarity];
    if (category === 'attack') {
        const profiles = [
            { style: 'strike', from: ['standing'], to: 'standing', summary: '以盾缘打击站立目标。' },
            { style: 'thrust', from: ['standing', 'airborne'], to: 'launched', summary: '以长枪挑起目标。' },
            { style: 'charge', from: ['standing', 'launched'], to: 'airborne', summary: '发起冲锋并将目标撞入浮空。' },
        ];
        const attack = profiles[index];
        const weights = KNIGHT_ATTACK_WEIGHTS[rarity];
        const vowSpend = unlocked && (index === 2 || (index === 1 && rarityIndex >= 4))
            ? [{ type: 'vowSpend', perStack: caps.vowPerStack, maxStacks: caps.vowMax }]
            : [];
        return card(id, name, category, rarity, 'knight', 0, vowSpend.length ? `${attack.summary}消耗全部誓约提高本牌伤害。` : attack.summary,
            [...vowSpend, damage(profile.base * (weights.base + index * .05), scaledWeights(weights.scaling, profile.scaling)), ...(attack.to === 'standing' ? [] : [state(attack.to)])],
            { ...attackData(attack.style, attack.from, attack.to), ...commonExtra, tags: [...commonExtra.tags, '枪盾连击', ...(vowSpend.length ? ['誓约兑现'] : [])] });
    }
    if (category === 'defense') {
        const vowGain = unlocked && index < 2 ? [{ type: 'vowGain', value: caps.vowGain }] : [];
        const effects = [
            [{ type: 'shield', base: profile.sustainBase, scaling: scaledWeights(sustain, profile.sustainScaling) }, ...vowGain],
            [{ type: 'shield', base: profile.sustainBase * .88, scaling: scaledWeights(sustain, profile.sustainScaling, .86) }, { type: 'guard', reduction: 14 + rarityIndex * 4, uses: 1, duration: 2 }, ...vowGain],
            [{ type: 'shield', base: profile.sustainBase * .82, scaling: scaledWeights(sustain, profile.sustainScaling, .8) }, { type: 'retainShield', value: profile.retainShield },
                ...(unlocked ? [{ type: 'thorns', ratio: universalCaps.thorns, uses: universalCaps.uses, duration: universalCaps.duration }] : [])],
        ][index];
        const summaries = [
            unlocked ? '获得坚实护盾，并积攒誓约。' : '获得坚实护盾。',
            unlocked ? '获得护盾、格挡下一次伤害，并积攒誓约。' : '获得护盾并格挡下一次伤害。',
            unlocked ? '获得护盾、保留部分护盾至下一回合，并以盾刺反伤。' : '获得护盾并将部分护盾保留至下一回合。',
        ];
        return card(id, name, category, rarity, 'knight', 0, summaries[index], effects,
            { ...commonExtra, tags: [...commonExtra.tags, index === 2 ? '护盾保留' : '防御架势', ...(unlocked ? [index < 2 ? '誓约积攒' : '盾刺反伤'] : [])] });
    }
    if (category === 'skill') {
        const mechanic = !unlocked
            ? []
            : index === 0
                ? [{ type: 'vowGain', value: caps.vowGain }]
                : index === 1
                    ? [{ type: 'guard', reduction: 12 + rarityIndex * 3, uses: 1, duration: 2 }]
                    : [{ type: 'empower', category: 'defense', value: profile.empower, uses: 1 }];
        const effects = [
            [damage(profile.base * .9, { physicalAttack: profile.scaling * .42, independentAttack: profile.scaling * .34, vitality: profile.scaling * .14 }, { element: 'light' }), ...mechanic],
            [damage(profile.base * .82, { physicalAttack: profile.scaling * .38, independentAttack: profile.scaling * .34, spirit: profile.scaling * .16 }, { element: 'light' }), { type: 'status', status: 'vulnerable', stacks: 1 + Math.floor(rarityIndex / 2), duration: 2 + Math.floor(rarityIndex / 3) }, ...mechanic],
            [{ type: 'drawCategory', category: 'defense', value: 1 + Math.floor(rarityIndex / 3) }, { type: 'restoreMp', base: profile.mpRecovery * .45 }, ...mechanic],
        ][index];
        const extra = index < 2 ? { requiresTargetState: index === 0 ? ['standing'] : ['standing', 'launched'] } : {};
        const summaries = [
            unlocked ? '以圣光武技攻击站立目标，并积攒誓约。' : '以圣光武技攻击站立目标。',
            unlocked ? '造成光属性伤害、施加易伤，并格挡下一次伤害。' : '造成光属性伤害并施加易伤。',
            unlocked ? '检索防守牌、恢复少量MP，并强化下一张防守牌。' : '检索防守牌并恢复少量MP。',
        ];
        return card(id, name, category, rarity, 'knight', 0, summaries[index], effects,
            { ...extra, ...commonExtra, tags: [...commonExtra.tags, index === 2 ? '整备' : '圣光战技', ...(unlocked && index === 0 ? ['誓约积攒'] : [])] });
    }
    if (category === 'buff') {
        const duration = Math.min(profile.duration, 2 + Math.floor(rarityIndex / 2));
        const enriched = rarityIndex >= 2;
        const effects = [
            [{ type: 'buff', stat: 'vitality', value: profile.buff, duration }, { type: 'buff', stat: 'damageReduction', value: Math.ceil(profile.buff * .45), duration },
                ...(enriched ? [{ type: 'statusWard', value: 1, duration: 2 + Math.floor(rarityIndex / 3) }] : [])],
            [{ type: 'buff', stat: 'physicalAttack', value: profile.buff, duration }, { type: 'empower', category: 'attack', value: profile.empower, uses: 1 },
                ...(enriched ? [{ type: 'vowGain', value: caps.vowGain }] : [])],
            [{ type: 'buff', stat: 'lightElement', value: profile.buff, duration }, { type: 'nextTurnDraw', value: 1 },
                ...(enriched ? [{ type: 'buff', stat: 'physicalDefense', value: Math.ceil(profile.buff * .6), duration }] : [])],
        ][index];
        return card(id, name, category, rarity, 'knight', 0,
            [enriched ? '提高体力与伤害减免，并获得异常防护。' : '提高体力与伤害减免。',
                enriched ? '提高物理攻击、强化下一张进攻牌，并积攒誓约。' : '提高物理攻击并强化下一张进攻牌。',
                enriched ? '提高光属性强化与物理防御，并准备额外抽牌。' : '提高光属性强化并准备额外抽牌。'][index], effects,
            { ...commonExtra, tags: [...commonExtra.tags, '骑士增益', ...(enriched && index === 1 ? ['誓约积攒'] : [])] });
    }
    const minValue = 5 + rarityIndex * 3;
    const maxValue = minValue + 4 + rarityIndex;
    const specialMechanic = unlocked
        ? (index === 0
            ? [{ type: 'vowGain', value: caps.vowGain }]
            : [{ type: 'guard', reduction: 12 + rarityIndex * 4, uses: 1, duration: 2 }])
        : [];
    const effects = index === 0
        ? [{ type: 'classCategoryRoundDamageBoost', classId: 'knight', categories: ['attack', 'skill'], minValue, maxValue }, ...specialMechanic]
        : [{ type: 'nextTurnClassCategoryDamageBoost', classId: 'knight', categories: ['attack', 'skill'], minValue, maxValue }, ...specialMechanic];
    return card(id, name, category, rarity, 'knight', 0,
        index === 0
            ? (unlocked ? '整顿阵线，本回合提高骑士牌伤害，并积攒誓约。' : '整顿阵线，本回合提高骑士进攻牌与技能牌伤害。')
            : (unlocked ? '立下誓约，下一回合提高骑士牌伤害，并格挡下一次伤害。' : '立下誓约，下一回合提高骑士进攻牌与技能牌伤害。'), effects,
        { ...commonExtra, tags: [...commonExtra.tags, '特殊牌', index === 0 ? '列阵' : '蓄势', ...(unlocked ? [index === 0 ? '誓约积攒' : '格挡'] : [])] });
};

const PEAK_KNIGHT_GENERAL_CARDS = PEAK_KNIGHT_GENERAL_RARITIES.flatMap((rarity) => Object.keys(PEAK_CARD_CATEGORIES).flatMap((category) => {
    const count = category === 'special' ? 2 : 3;
    return Array.from({ length: count }, (_, index) => createPeakKnightGeneralCard(rarity, category, index));
}));

const PEAK_PRIEST_GENERAL_RARITIES = [...PEAK_ARCHER_GENERAL_RARITIES];
const PEAK_PRIEST_GENERAL_CARD_NAMES = {
    common: {
        attack: ['圣杖叩击', '祷力震退', '驱邪一击'],
        defense: ['净血抚伤', '素光结衣', '诵言辟秽'],
        skill: ['熹微光矢', '圣焰初燃', '疗愈之息'],
        buff: ['初心不移', '默然吟诵', '晨课授福'],
        special: ['晨祷领众', '祈求垂怜'],
    },
    excellent: {
        attack: ['银杖叩罪', '震浪撩空', '涤秽落锤'],
        defense: ['净血复元', '银辉结衣', '祷环辟邪'],
        skill: ['银芒穿刺', '白焰昭罪', '回春之泉'],
        buff: ['守节持斋', '银铃和声', '午祷加恩'],
        special: ['银堂弥撒', '默祷候恩'],
    },
    rare: {
        attack: ['典章问罪', '圣言震魂', '断秽重击'],
        defense: ['圣典疗愈', '典光结衣', '经文封邪'],
        skill: ['经纬光矢', '典焰灼罪', '生泉涌流'],
        buff: ['笃信圣典', '唱诗共鸣', '课诵沐恩'],
        special: ['圣典宣讲', '典中求谕'],
    },
    scarce: {
        attack: ['恩泽落杖', '恩威震魄', '涤罪贯击'],
        defense: ['神恩复躯', '恩光加衣', '恩言破秽'],
        skill: ['恩慈光矢', '恩焰焚罪', '涌恩之泉'],
        buff: ['受恩不疑', '万众和唱', '晚祷承恩'],
        special: ['恩堂大祷', '静候恩降'],
    },
    legendary: {
        attack: ['谕令加身', '圣谕震天', '肃罪之槌'],
        defense: ['圣谕重生', '谕光成衣', '谕言绝邪'],
        skill: ['谕示光矢', '圣谕天焰', '生命长流'],
        buff: ['奉谕如命', '天阶咏唱', '谕降洗礼'],
        special: ['圣谕弥撒', '待谕而行'],
    },
    epic: {
        attack: ['神迹显杖', '震世之祷', '肃清万秽'],
        defense: ['回生神迹', '披光加身', '镇秽圣环'],
        skill: ['神迹光矢', '圣焰终审', '生泉不竭'],
        buff: ['以身证迹', '诸天同唱', '神迹加冕'],
        special: ['神迹弥撒', '神迹将至'],
    },
};
const PEAK_PRIEST_CARD_ART_FILES = Array.from({ length: 29 }, (_, index) => `priest-card-${String(index + 1).padStart(2, '0')}.png`);
const PEAK_PRIEST_CARD_ART_OFFSETS = { attack: 0, defense: 3, skill: 6, buff: 9, special: 12 };
const createPeakPriestGeneralCard = (rarity, category, index) => {
    const profile = PEAK_CARD_BALANCE[rarity];
    const rarityIndex = PEAK_PRIEST_GENERAL_RARITIES.indexOf(rarity);
    const unlocked = ['rare', 'scarce', 'legendary', 'epic'].includes(rarity);
    const caps = CLASS_MECHANIC_CAPS[rarity];
    const id = `priest_general_${rarity}_${category}_${index + 1}`;
    const name = PEAK_PRIEST_GENERAL_CARD_NAMES[rarity]?.[category]?.[index];
    if (!name) throw new Error(`牧师通用卡缺少卡名：${id}`);
    const artIndex = (rarityIndex * 14 + PEAK_PRIEST_CARD_ART_OFFSETS[category] + index) % PEAK_PRIEST_CARD_ART_FILES.length;
    const commonExtra = {
        priestGeneralExpansion: true,
        cardArt: `assets/fighters/heroes/shenmu/card-pic/${PEAK_PRIEST_CARD_ART_FILES[artIndex]}`,
        tags: ['牧师', '基础通用'],
    };
    const sustain = PRIEST_SUSTAIN_WEIGHTS[rarity];
    if (category === 'attack') {
        const profiles = [
            { style: 'strike', from: ['standing'], to: 'standing', summary: '以圣杖打击站立目标。' },
            { style: 'launch', from: ['standing', 'airborne'], to: 'launched', summary: '凝聚祷力将目标震至击飞。' },
            { style: 'finisher', from: ['airborne'], to: 'knockedDown', summary: '以驱邪冲击终结浮空目标。' },
        ];
        const attack = profiles[index];
        const weights = PRIEST_ATTACK_WEIGHTS[rarity];
        const mechanic = !unlocked
            ? []
            : index === 0
                ? [{ type: 'scheduleBlessing', blessingType: 'heal', turns: caps.blessingTurns, value: Math.round(profile.sustainBase * .3), name: '杖底恩光' }]
                : index === 1
                    ? [{ type: 'cleanse', value: 1 }]
                    : [{ type: 'scheduleBlessing', blessingType: 'shield', turns: caps.blessingTurns, value: Math.round(profile.sustainBase * .32), name: '驱邪余晖' }];
        return card(id, name, category, rarity, 'priest', 0,
            unlocked ? `${attack.summary}${index === 0 ? '并埋设一份延迟治疗。' : index === 1 ? '同时洗去自身一层负面状态。' : '并埋设一份延迟护盾。'}` : attack.summary,
            [damage(profile.base * (weights.base + index * .05), scaledWeights(weights.scaling, profile.scaling), { damageType: 'magical' }), ...mechanic, ...(attack.to === 'standing' ? [] : [state(attack.to)])],
            { ...attackData(attack.style, attack.from, attack.to), ...commonExtra, tags: [...commonExtra.tags, '圣杖', ...(unlocked ? [index === 1 ? '随手净化' : '祝福预载'] : [])] });
    }
    if (category === 'defense') {
        const preloadHeal = unlocked && index === 0
            ? [{ type: 'scheduleBlessing', blessingType: 'heal', turns: caps.blessingTurns, value: Math.round(profile.sustainBase * .46), name: '预载祝福' }]
            : [];
        const preloadShield = unlocked && index === 1
            ? [{ type: 'scheduleBlessing', blessingType: 'shield', turns: caps.blessingTurns, value: Math.round(profile.sustainBase * .42), name: '守誓圣盾' }]
            : [];
        const wardExtra = unlocked && index === 2
            ? [{ type: 'scheduleBlessing', blessingType: 'cleanse', turns: caps.blessingTurns, value: 1, name: '守誓洗礼' }]
            : [];
        const healSlot0 = unlocked ? profile.sustainBase * .58 : profile.sustainBase * .78;
        const shieldSlot1 = unlocked ? profile.sustainBase * .78 : profile.sustainBase;
        const effects = [
            [{ type: 'heal', base: healSlot0, scaling: scaledWeights(sustain, profile.sustainScaling, .9) }, { type: 'cleanse', value: 1 + Math.floor(rarityIndex / 3) }, ...preloadHeal],
            [{ type: 'shield', base: shieldSlot1, scaling: scaledWeights(sustain, profile.sustainScaling, .88) }, { type: 'retainShield', value: profile.retainShield }, ...preloadShield],
            [{ type: 'shield', base: profile.sustainBase * .72, scaling: scaledWeights(sustain, profile.sustainScaling, .76) }, { type: 'statusWard', value: 1 + Math.floor(rarityIndex / 3), duration: 2 + Math.floor(rarityIndex / 3) }, ...wardExtra],
        ][index];
        const summaries = [
            unlocked ? '恢复生命、清除负面状态，并埋设一份延迟兑现的治疗。' : '恢复生命并清除负面状态。',
            unlocked ? '获得圣光护盾、保留部分护盾，并埋设一份延迟兑现的护盾。' : '获得圣光护盾并保留部分护盾。',
            unlocked ? '获得护盾与异常防护，并埋设一次延迟净化。' : '获得护盾与异常防护。',
        ];
        return card(id, name, category, rarity, 'priest', 0, summaries[index], effects,
            { ...commonExtra, tags: [...commonExtra.tags, index === 0 ? '治疗净化' : '圣光防护', ...(unlocked ? ['祝福预载'] : [])] });
    }
    if (category === 'skill') {
        const delayedCleanse = unlocked && index === 0
            ? [{ type: 'scheduleBlessing', blessingType: 'cleanse', turns: caps.blessingTurns, value: 1, name: '圣光洗礼' }]
            : [];
        const flameBlessing = unlocked && index === 1
            ? [{ type: 'scheduleBlessing', blessingType: 'heal', turns: caps.blessingTurns, value: Math.round(profile.sustainBase * .34), name: '圣焰余温' }]
            : [];
        const prayerSplit = unlocked && index === 2;
        const prayerBlessing = prayerSplit
            ? [{ type: 'scheduleBlessing', blessingType: 'heal', turns: caps.blessingTurns, value: Math.round(profile.sustainBase * .4), name: '祈愈延音' }]
            : [];
        const effects = [
            [damage(profile.base * .9, { magicalAttack: profile.scaling * .52, independentAttack: profile.scaling * .3, intelligence: profile.scaling * .12 }, { element: 'light', damageType: 'magical' }), ...delayedCleanse],
            [damage(profile.base * .8, { magicalAttack: profile.scaling * .46, independentAttack: profile.scaling * .28, spirit: profile.scaling * .14 }, { element: 'light', damageType: 'magical' }), { type: 'status', status: 'vulnerable', stacks: 1 + Math.floor(rarityIndex / 2), duration: 2 + Math.floor(rarityIndex / 3) }, ...flameBlessing],
            [{ type: 'heal', base: profile.sustainBase * (prayerSplit ? .58 : .82), scaling: scaledWeights(sustain, profile.sustainScaling, prayerSplit ? .62 : .84) }, { type: 'drawCategory', category: 'defense', value: 1 + Math.floor(rarityIndex / 3) }, ...prayerBlessing],
        ][index];
        const extra = index < 2 ? { requiresTargetState: index === 0 ? ['standing'] : ['standing', 'launched'] } : {};
        const summaries = [
            unlocked ? '释放光矢造成魔法伤害，并埋设一次延迟净化。' : '释放光矢造成魔法伤害。',
            unlocked ? '以圣焰造成光属性伤害、施加易伤，并留下延迟治疗。' : '以圣焰造成光属性伤害并施加易伤。',
            prayerSplit ? '恢复生命、检索防守牌，并把余下的祈愈延后兑现。' : '恢复生命并检索防守牌。',
        ];
        return card(id, name, category, rarity, 'priest', 0, summaries[index], effects,
            { ...extra, ...commonExtra, tags: [...commonExtra.tags, index === 2 ? '祈愈' : '圣光法术', ...(unlocked ? [index === 0 ? '延迟净化' : '祝福预载'] : [])] });
    }
    if (category === 'buff') {
        const duration = Math.min(profile.duration, 2 + Math.floor(rarityIndex / 2));
        const enriched = rarityIndex >= 2;
        const effects = [
            [{ type: 'buff', stat: 'spirit', value: profile.buff, duration }, { type: 'buff', stat: 'damageReduction', value: Math.ceil(profile.buff * .45), duration },
                ...(enriched ? [{ type: 'scheduleBlessing', blessingType: 'shield', turns: caps.blessingTurns, value: Math.round(profile.sustainBase * .3), name: '静祷圣盾' }] : [])],
            [{ type: 'buff', stat: 'magicalAttack', value: profile.buff, duration }, { type: 'empower', category: 'skill', value: profile.empower, uses: 1 },
                ...(enriched ? [{ type: 'statusWard', value: 1, duration }] : [])],
            [{ type: 'buff', stat: 'lightElement', value: profile.buff, duration }, { type: 'nextTurnDraw', value: 1 },
                ...(enriched ? [{ type: 'scheduleBlessing', blessingType: 'heal', turns: caps.blessingTurns, value: Math.round(profile.sustainBase * .28), name: '晨光低语' }] : [])],
        ][index];
        return card(id, name, category, rarity, 'priest', 0,
            [enriched ? '提高精神与伤害减免，并埋设一份延迟护盾。' : '提高精神与伤害减免。',
                enriched ? '提高魔法攻击、强化下一张技能牌并获得异常防护。' : '提高魔法攻击并强化下一张技能牌。',
                enriched ? '提高光属性强化、准备额外抽牌，并埋设一份延迟治疗。' : '提高光属性强化并准备额外抽牌。'][index], effects,
            { ...commonExtra, tags: [...commonExtra.tags, '牧师增益', ...(enriched && index !== 1 ? ['祝福预载'] : [])] });
    }
    const minValue = 5 + rarityIndex * 3;
    const maxValue = minValue + 4 + rarityIndex;
    const specialMechanic = unlocked
        ? (index === 0
            ? [{ type: 'cleanse', value: 1 + Math.floor(rarityIndex / 3) }]
            : [{ type: 'scheduleBlessing', blessingType: 'heal', turns: caps.blessingTurns, value: Math.round(profile.sustainBase * .36), name: '神恩兑现' }])
        : [];
    const effects = index === 0
        ? [{ type: 'classCategoryRoundDamageBoost', classId: 'priest', categories: ['attack', 'skill'], minValue, maxValue }, ...specialMechanic]
        : [{ type: 'nextTurnClassCategoryDamageBoost', classId: 'priest', categories: ['attack', 'skill'], minValue, maxValue }, ...specialMechanic];
    return card(id, name, category, rarity, 'priest', 0,
        index === 0
            ? (unlocked ? '举行弥撒，本回合提高牧师牌伤害，并清除负面状态。' : '举行弥撒，本回合提高牧师进攻牌与技能牌伤害。')
            : (unlocked ? '祈求神恩，下一回合提高牧师牌伤害，并埋设一份延迟治疗。' : '祈求神恩，下一回合提高牧师进攻牌与技能牌伤害。'), effects,
        { ...commonExtra, tags: [...commonExtra.tags, '特殊牌', index === 0 ? '弥撒' : '神恩', ...(unlocked ? [index === 0 ? '净化' : '祝福预载'] : [])] });
};

const PEAK_PRIEST_GENERAL_CARDS = PEAK_PRIEST_GENERAL_RARITIES.flatMap((rarity) => Object.keys(PEAK_CARD_CATEGORIES).flatMap((category) => {
    const count = category === 'special' ? 2 : 3;
    return Array.from({ length: count }, (_, index) => createPeakPriestGeneralCard(rarity, category, index));
}));

const PEAK_MAGE_GENERAL_RARITIES = [...PEAK_ARCHER_GENERAL_RARITIES];
const PEAK_MAGE_GENERAL_CARD_NAMES = {
    common: {
        attack: ['魔弹迸射', '念力推山', '杖底轰鸣'],
        defense: ['薄魔护壁', '引魔代伤', '净秽轻纱'],
        skill: ['灼焰初绽', '寒霜凝锥', '幽雾侵魂'],
        buff: ['魔力初涌', '凝神持咒', '秘册启卷'],
        special: ['初阵铺陈', '咒式镌刻'],
    },
    excellent: {
        attack: ['奥术连弹', '念场倾压', '杖端奥鸣'],
        defense: ['奥纹护壁', '奥力代伤', '奥环净秽'],
        skill: ['火球贯空', '冰枪钉骨', '暗渊拽魂'],
        buff: ['魔泉充盈', '奥息内敛', '奥义通玄'],
        special: ['奥阵展开', '奥咒预载'],
    },
    rare: {
        attack: ['符文弹幕', '符压逼退', '杖刻符震'],
        defense: ['符文护壁', '符纹抵偿', '符篆辟异'],
        skill: ['符火焚身', '符冰锁骨', '符暗蚀魂'],
        buff: ['符力鼓涌', '刻符入心', '符经解奥'],
        special: ['符阵铺展', '符咒铭刻'],
    },
    scarce: {
        attack: ['星辉散弹', '星力掀空', '杖引星鸣'],
        defense: ['星辉护壁', '星力偿伤', '星环屏秽'],
        skill: ['星火燎原', '星冰封锁', '星暗吞噬'],
        buff: ['星力灌注', '引星入定', '星图推演'],
        special: ['星阵铺开', '星咒预铸'],
    },
    legendary: {
        attack: ['天穹弹雨', '天压倾覆', '杖鸣天动'],
        defense: ['天穹护壁', '天力代偿', '天环绝异'],
        skill: ['天火焚天', '天冰凝寂', '天暗蚀空'],
        buff: ['天力贯身', '通天入寂', '天书洞览'],
        special: ['垂天法阵', '天咒预载'],
    },
    epic: {
        attack: ['禁弹炼狱', '禁力碎空', '杖落禁鸣'],
        defense: ['禁咒护壁', '禁力尽偿', '禁环屠异'],
        skill: ['禁火燃世', '禁冰绝息', '禁暗归墟'],
        buff: ['禁力附体', '触禁通玄', '禁典解封'],
        special: ['禁咒法阵', '禁咒将临'],
    },
};
const PEAK_MAGE_CARD_ART_FILES = Array.from({ length: 20 }, (_, index) => `mage-card-${String(index + 1).padStart(2, '0')}.png`);
const PEAK_MAGE_CARD_ART_OFFSETS = { attack: 0, defense: 3, skill: 6, buff: 9, special: 12 };
const createPeakMageGeneralCard = (rarity, category, index) => {
    const profile = PEAK_CARD_BALANCE[rarity];
    const rarityIndex = PEAK_MAGE_GENERAL_RARITIES.indexOf(rarity);
    const id = `mage_general_${rarity}_${category}_${index + 1}`;
    const name = PEAK_MAGE_GENERAL_CARD_NAMES[rarity]?.[category]?.[index];
    if (!name) throw new Error(`魔法师通用卡缺少卡名：${id}`);
    const artIndex = (rarityIndex * 14 + PEAK_MAGE_CARD_ART_OFFSETS[category] + index) % PEAK_MAGE_CARD_ART_FILES.length;
    const commonExtra = {
        mageGeneralExpansion: true,
        cardArt: `assets/fighters/heroes/molinger/card-pic/${PEAK_MAGE_CARD_ART_FILES[artIndex]}`,
        tags: ['魔法师', '魔灵儿', '基础通用'],
    };
    if (category === 'attack') {
        const weightMatrix = {
            common: { base: .82, scaling: { magicalAttack: .56, intelligence: .34 } },
            excellent: { base: .84, scaling: { magicalAttack: .50, intelligence: .42 } },
            rare: { base: .82, scaling: { magicalAttack: .46, intelligence: .36, independentAttack: .12 } },
            scarce: { base: .82, scaling: { magicalAttack: .42, intelligence: .34, independentAttack: .18 } },
            legendary: { base: .80, scaling: { magicalAttack: .40, intelligence: .32, independentAttack: .22 } },
            epic: { base: .78, scaling: { magicalAttack: .38, intelligence: .30, independentAttack: .26 } },
        };
        const weights = weightMatrix[rarity];
        const profiles = [
            { style: 'shot', from: ['standing'], to: 'standing', summary: '发射无属性魔弹攻击站立目标。' },
            { style: 'launch', from: ['standing', 'airborne'], to: 'launched', summary: '以念力将目标推至击飞。' },
            { style: 'finisher', from: ['airborne'], to: 'knockedDown', summary: '以法杖冲击终结浮空目标。' },
        ];
        const attack = profiles[index];
        const caps = CLASS_MECHANIC_CAPS[rarity];
        const chargeMechanic = caps.charge > 0 && attack.to === 'standing'
            ? [{ type: 'spellCharge', value: 1, max: caps.chargeMax }]
            : [];
        return card(id, name, category, rarity, 'mage', 0, chargeMechanic.length ? `${attack.summary}命中后积蓄法力充能。` : attack.summary,
            [damage(profile.base * (weights.base + index * .05), scaledWeights(weights.scaling, profile.scaling), { damageType: 'magical' }), ...chargeMechanic, ...(attack.to === 'standing' ? [] : [state(attack.to)])],
            { ...attackData(attack.style, attack.from, attack.to), ...commonExtra, tags: [...commonExtra.tags, '奥术攻击', ...(chargeMechanic.length ? ['法力充能'] : [])] });
    }
    if (category === 'defense') {
        const highRarity = rarityIndex >= 2;
        const universalCaps = UNIVERSAL_DEFENSE_CAPS[rarity];
        const sustain = MAGE_SUSTAIN_WEIGHTS[rarity];
        const effects = [
            [{ type: 'shield', base: profile.sustainBase, scaling: scaledWeights(sustain, profile.sustainScaling) },
                ...(highRarity ? [{ type: 'retainShield', value: 15 + rarityIndex * 5 }] : [])],
            [{ type: 'shield', base: profile.sustainBase * .82, scaling: scaledWeights(sustain, profile.sustainScaling, .84) },
                highRarity
                    ? { type: 'damageCap', ratio: universalCaps.damageCap, uses: universalCaps.uses, duration: universalCaps.duration }
                    : { type: 'manaBarrier', ratio: 25 + rarityIndex * 4, uses: 1, duration: 2 }],
            [{ type: 'shield', base: profile.sustainBase * .75, scaling: scaledWeights(sustain, profile.sustainScaling, .76) },
                { type: 'statusWard', value: 1 + Math.floor(rarityIndex / 3), duration: 2 + Math.floor(rarityIndex / 3) },
                ...(highRarity ? [{ type: 'thorns', ratio: universalCaps.thorns, uses: universalCaps.uses, duration: universalCaps.duration }] : [])],
        ][index];
        return card(id, name, category, rarity, 'mage', 0,
            [highRarity ? '获得魔力护盾，并将部分护盾保留到下一回合。' : '获得魔力护盾。',
                highRarity ? '获得护盾，并限制下一次受到的伤害上限。' : '获得护盾，并用MP吸收下一次伤害。',
                highRarity ? '获得护盾与异常防护，并以奥术荆棘反伤。' : '获得护盾与异常防护。'][index], effects,
            { ...commonExtra, tags: [...commonExtra.tags, index === 1 ? (highRarity ? '伤害上限' : '魔力护壁') : '法术防护'] });
    }
    if (category === 'skill') {
        const elements = ['fire', 'ice', 'dark'];
        const statuses = ['burn', 'frozen', 'poison'];
        const element = elements[index];
        const caps = CLASS_MECHANIC_CAPS[rarity];
        const elementWeights = [
            { magicalAttack: .50 + rarityIndex * .02, intelligence: .30, independentAttack: .10 },
            { magicalAttack: .44, intelligence: .34 + rarityIndex * .02, independentAttack: .12 },
            { magicalAttack: .40, intelligence: .28, independentAttack: .18 + rarityIndex * .02 },
        ][index];
        const unlocked = caps.charge > 0;
        const mechanic = !unlocked
            ? []
            : index === 0
                ? [{ type: 'spellCharge', value: caps.charge, max: caps.chargeMax }]
                : index === 1
                    ? [{ type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }]
                    : [{ type: 'spellChargeSpend', perCharge: caps.perCharge, maxStacks: caps.chargeMax }];
        const effects = [
            damage(profile.base * .82, scaledWeights(elementWeights, profile.scaling), { element, damageType: 'magical' }),
            { type: 'status', status: statuses[index], stacks: 1 + Math.floor(rarityIndex / 2), duration: 2 + Math.floor(rarityIndex / 3) },
            ...mechanic,
        ];
        const summary = [
            unlocked ? '造成火属性伤害并施加灼烧，同时积蓄法力充能。' : '造成火属性伤害并施加灼烧。',
            unlocked ? '造成冰属性伤害，施加冰冻并使目标脆化易伤。' : '造成冰属性伤害并施加冰冻。',
            unlocked ? '造成暗属性伤害并施加中毒，引爆全部法力充能提高本牌伤害。' : '造成暗属性伤害并施加中毒。',
        ][index];
        return card(id, name, category, rarity, 'mage', 0, summary, effects,
            { requiresTargetState: index === 0 ? ['standing'] : index === 1 ? ['standing', 'launched'] : ['standing', 'airborne'], ...commonExtra, tags: [...commonExtra.tags, '元素法术', statuses[index], ...(unlocked ? [index === 0 ? '法力充能' : index === 1 ? '冰霜脆化' : '充能爆发'] : [])] });
    }
    if (category === 'buff') {
        const duration = Math.min(profile.duration, 2 + Math.floor(rarityIndex / 2));
        const enriched = rarityIndex >= 2;
        const effects = [
            [{ type: 'buff', stat: 'magicalAttack', value: profile.buff, duration }, { type: 'buff', stat: 'magicalCrit', value: Math.ceil(profile.buff * .5), duration },
                ...(enriched ? [{ type: 'buff', stat: 'allElement', value: Math.ceil(profile.buff * .5), duration }] : [])],
            [{ type: 'buff', stat: 'intelligence', value: profile.buff, duration }, { type: 'empower', category: 'skill', value: profile.empower, uses: 1 },
                ...(enriched ? [{ type: 'restoreMp', base: profile.mpRecovery * .35 }] : [])],
            [{ type: 'buff', stat: 'allElement', value: profile.buff, duration }, { type: 'nextTurnDraw', value: 1 },
                ...(enriched ? [{ type: 'buff', stat: 'independentAttack', value: Math.ceil(profile.buff * .6), duration }] : [])],
        ][index];
        return card(id, name, category, rarity, 'mage', 0,
            [enriched ? '提高魔法攻击、魔法暴击与全属性强化。' : '提高魔法攻击与魔法暴击。',
                enriched ? '提高智力，强化下一张技能牌并回复少量MP。' : '提高智力并强化下一张技能牌。',
                enriched ? '提高全属性强化与独立攻击，并准备额外抽牌。' : '提高全属性强化并准备额外抽牌。'][index], effects,
            { ...commonExtra, tags: [...commonExtra.tags, '奥术增益'] });
    }
    const minValue = 5 + rarityIndex * 3;
    const maxValue = minValue + 4 + rarityIndex;
    const caps = CLASS_MECHANIC_CAPS[rarity];
    const specialMechanic = caps.fuseTurns > 0
        ? (index === 0
            ? [timedFuseEffect(profile, { magicalAttack: .46, intelligence: .32, independentAttack: .16 }, { turns: rarityIndex >= 4 ? 2 : 3, share: .36 + rarityIndex * .02, element: 'fire', name: '奥术引信' })]
            : [{ type: 'spellCharge', value: caps.charge, max: caps.chargeMax }])
        : [];
    const effects = index === 0
        ? [{ type: 'classCategoryRoundDamageBoost', classId: 'mage', categories: ['attack', 'skill'], minValue, maxValue }, ...specialMechanic]
        : [{ type: 'nextTurnClassCategoryDamageBoost', classId: 'mage', categories: ['attack', 'skill'], minValue, maxValue }, ...specialMechanic];
    return card(id, name, category, rarity, 'mage', 0,
        index === 0
            ? (specialMechanic.length ? '展开奥术法阵，本回合提高魔法师牌伤害，并在目标身上埋下延迟引信。' : '展开奥术法阵，本回合提高魔法师进攻牌与技能牌伤害。')
            : (specialMechanic.length ? '预载咒文，下一回合提高魔法师牌伤害，并立即积蓄法力充能。' : '预载咒文，下一回合提高魔法师进攻牌与技能牌伤害。'), effects,
        { ...commonExtra, tags: [...commonExtra.tags, '特殊牌', index === 0 ? '法阵' : '预载', ...(specialMechanic.length ? [index === 0 ? '延迟引信' : '法力充能'] : [])] });
};

const PEAK_MAGE_GENERAL_CARDS = PEAK_MAGE_GENERAL_RARITIES.flatMap((rarity) => Object.keys(PEAK_CARD_CATEGORIES).flatMap((category) => {
    const count = category === 'special' ? 2 : 3;
    return Array.from({ length: count }, (_, index) => createPeakMageGeneralCard(rarity, category, index));
}));

const PEAK_LANCER_GENERAL_RARITIES = [...PEAK_ARCHER_GENERAL_RARITIES];
const PEAK_LANCER_GENERAL_CARD_NAMES = {
    common: {
        attack: ['试锋一探', '枪杆撩月', '横扫连营'],
        defense: ['横枪封架', '沉腕化劲', '盘枪固守'],
        skill: ['锋刃破血', '双旋枪影', '重枪镇地'],
        buff: ['枪意初凝', '行伍蓄锋', '掠阵窥隙'],
        special: ['枪阵初布', '收枪蓄锋'],
    },
    excellent: {
        attack: ['百炼直取', '挑锋撩空', '扫堂断马'],
        defense: ['铁枪封路', '拧腰化劲', '余锋常驻'],
        skill: ['见血穿膛', '连环旋枪', '重枪贯地'],
        buff: ['枪意百炼', '负甲长驱', '阵眼窥破'],
        special: ['百炼枪阵', '按锋不发'],
    },
    rare: {
        attack: ['玄钢刺喉', '玄锋掀甲', '玄枪扫野'],
        defense: ['玄钢封门', '玄劲折势', '玄锋不退'],
        skill: ['玄钢裂血', '玄旋双绞', '玄枪镇地'],
        buff: ['枪意入玄', '玄甲疾行', '玄眸洞阵'],
        special: ['玄钢枪阵', '玄锋内蓄'],
    },
    scarce: {
        attack: ['紫电点喉', '电芒掀空', '电扫千军'],
        defense: ['电枪封势', '电劲卸锋', '电痕未散'],
        skill: ['紫电破血', '电旋双绞', '电枪贯地'],
        buff: ['枪意奔雷', '电履疾行', '电目破阵'],
        special: ['紫电枪阵', '雷锋暗蓄'],
    },
    legendary: {
        attack: ['龙胆独取', '龙抬撩天', '龙尾横扫'],
        defense: ['龙鳞封路', '龙筋化劲', '龙威长驻'],
        skill: ['龙牙饮血', '龙旋双缠', '龙脊贯地'],
        buff: ['枪意如龙', '龙行千里', '龙目烛阵'],
        special: ['龙胆枪阵', '龙锋深蓄'],
    },
    epic: {
        attack: ['一点无双', '掀天绝式', '横绝八荒'],
        defense: ['绝境封锋', '万劲皆化', '恒锋不坠'],
        skill: ['无双裂血', '双旋绝影', '镇地无痕'],
        buff: ['枪意无双', '疾进无踪', '洞阵无遗'],
        special: ['八荒无双阵', '无双待发'],
    },
};
const createPeakLancerGeneralCard = (rarity, category, index) => {
    const profile = PEAK_CARD_BALANCE[rarity];
    const rarityIndex = PEAK_LANCER_GENERAL_RARITIES.indexOf(rarity);
    const unlocked = ['rare', 'scarce', 'legendary', 'epic'].includes(rarity);
    const caps = CLASS_MECHANIC_CAPS[rarity];
    const id = `lancer_general_${rarity}_${category}_${index + 1}`;
    const name = PEAK_LANCER_GENERAL_CARD_NAMES[rarity]?.[category]?.[index];
    if (!name) throw new Error(`魔枪士通用卡缺少卡名：${id}`);
    const commonExtra = { lancerGeneralExpansion: true, tags: ['魔枪士', '冷兵器', '长枪', '基础通用'] };
    const universalCaps = UNIVERSAL_DEFENSE_CAPS[rarity];
    const sustain = LANCER_SUSTAIN_WEIGHTS[rarity];
    if (category === 'attack') {
        const profiles = [
            { style: 'thrust', from: ['standing'], to: 'standing', summary: '以长枪试探站立目标，保持距离继续压制。' },
            { style: 'launch', from: ['standing', 'airborne', 'launched'], to: 'launched', allowSame: true, summary: '以枪杆挑起目标，可连续衔接挑击。' },
            { style: 'sweep', from: ['standing', 'launched'], to: 'airborne', summary: '横扫站立或击飞目标，使其进入浮空。' },
        ];
        const attack = profiles[index];
        const weights = LANCER_ATTACK_WEIGHTS[rarity];
        const mechanic = !unlocked
            ? []
            : index === 1
                ? [{ type: 'status', status: 'bleed', stacks: 1, duration: 2 }]
                : [{ type: 'bleedAmplify', perStack: caps.bleedPerStack, maxStacks: 5 }];
        return card(id, name, category, rarity, 'lancer', 0,
            unlocked ? `${attack.summary}${index === 1 ? '并造成流血。' : '目标每层流血提高本牌伤害。'}` : attack.summary,
            [...(index === 1 ? [] : mechanic), damage(profile.base * (weights.base + index * .05), scaledWeights(weights.scaling, profile.scaling)), ...(index === 1 ? mechanic : []), ...(attack.to === 'standing' ? [] : [state(attack.to)])],
            { ...attackData(attack.style, attack.from, attack.to, { allowSame: attack.allowSame }), ...commonExtra, tags: [...commonExtra.tags, index === 0 ? '试探' : '枪术连段', ...(unlocked ? [index === 1 ? '枪尖见血' : '流血追击'] : [])] });
    }
    if (category === 'defense') {
        const mechanic = !unlocked
            ? []
            : index === 0
                ? [{ type: 'thorns', ratio: universalCaps.thorns, uses: universalCaps.uses, duration: universalCaps.duration }]
                : index === 1
                    ? [{ type: 'empower', category: 'attack', value: profile.empower, uses: 1 }]
                    : [{ type: 'nextTurnDraw', value: 1 }];
        const effects = [
            [{ type: 'shield', base: profile.sustainBase, scaling: scaledWeights(sustain, profile.sustainScaling) }, ...mechanic],
            [{ type: 'shield', base: profile.sustainBase * .86, scaling: scaledWeights(sustain, profile.sustainScaling, .86) }, { type: 'guard', reduction: 15 + rarityIndex * 4, uses: 1, duration: 2 }, ...mechanic],
            [{ type: 'shield', base: profile.sustainBase * .8, scaling: scaledWeights(sustain, profile.sustainScaling, .8) }, { type: 'retainShield', value: profile.retainShield }, ...mechanic],
        ][index];
        const summaries = [
            unlocked ? '横枪封架，获得护盾并以枪尖反刺来敌。' : '横枪封架，获得坚实护盾。',
            unlocked ? '沉心架枪，获得护盾、格挡下一次伤害，并强化下一张进攻牌。' : '沉心架枪，获得护盾并格挡下一次伤害。',
            unlocked ? '盘枪固守，获得护盾、保留部分至下一回合，并准备额外抽牌。' : '盘枪固守，获得护盾并保留部分至下一回合。',
        ];
        return card(id, name, category, rarity, 'lancer', 0, summaries[index], effects,
            { ...commonExtra, tags: [...commonExtra.tags, index === 1 ? '枪架格挡' : '阵地防守', ...(unlocked && index === 0 ? ['枪尖反刺'] : [])] });
    }
    if (category === 'skill') {
        const bleedStacks = unlocked && index === 0 ? 2 + Math.floor(rarityIndex / 2) : 1 + Math.floor(rarityIndex / 2);
        const thirdHit = unlocked && index === 1 && rarityIndex >= 4;
        const hitScale = thirdHit ? .52 : .46;
        const hitWeights = { physicalAttack: profile.scaling * .25, independentAttack: profile.scaling * .2, strength: profile.scaling * .08 };
        const finisherAmplify = unlocked && index === 2 ? [{ type: 'bleedAmplify', perStack: caps.bleedPerStack, maxStacks: 5 }] : [];
        const pierceFollowUp = unlocked && index === 0 ? [{ type: 'drawCategory', category: 'attack', value: 1 + Math.floor(rarityIndex / 3) }] : [];
        const effects = [
            [damage(profile.base * .92, { physicalAttack: profile.scaling * .5, independentAttack: profile.scaling * .34, strength: profile.scaling * .14 }), { type: 'status', status: 'bleed', stacks: bleedStacks, duration: 2 + Math.floor(rarityIndex / 3) }, ...pierceFollowUp],
            [damage(profile.base * hitScale, hitWeights), damage(profile.base * hitScale, hitWeights), ...(thirdHit ? [damage(profile.base * hitScale, hitWeights)] : [])],
            [...finisherAmplify, damage(profile.base, { physicalAttack: profile.scaling * .5, independentAttack: profile.scaling * .32, strength: profile.scaling * .18 }), { type: 'status', status: 'vulnerable', stacks: 1 + Math.floor(rarityIndex / 3), duration: 2 }, state('knockedDown')],
        ][index];
        const summaries = [
            unlocked ? '贯穿目标造成更深的流血，并抽取进攻牌衔接追击。' : '贯穿目标并造成流血。',
            thirdHit ? '旋枪进行三段物理攻击。' : '旋枪进行两段物理攻击。',
            unlocked ? '重枪贯地，施加易伤并击倒目标，目标每层流血提高本牌伤害。' : '重枪贯地，施加易伤并将目标击倒。',
        ];
        return card(id, name, category, rarity, 'lancer', 0, summaries[index], effects,
            { requiresTargetState: index === 0 ? ['standing'] : index === 1 ? ['standing', 'launched', 'airborne'] : ['airborne'], ...commonExtra, tags: [...commonExtra.tags, index === 1 ? '多段命中' : index === 2 ? '枪术终结' : '贯刺', ...(pierceFollowUp.length ? ['枪招衔接'] : []), ...(thirdHit ? ['三段旋枪'] : []), ...(finisherAmplify.length ? ['流血追击'] : [])] });
    }
    if (category === 'buff') {
        const duration = Math.min(profile.duration, 2 + Math.floor(rarityIndex / 2));
        const enriched = rarityIndex >= 2;
        const effects = [
            [{ type: 'buff', stat: 'strength', value: profile.buff, duration }, { type: 'buff', stat: 'physicalCrit', value: Math.ceil(profile.buff * .5), duration },
                ...(enriched ? [{ type: 'buff', stat: 'criticalDamage', value: Math.ceil(profile.buff * .8), duration }] : [])],
            [{ type: 'buff', stat: 'physicalAttack', value: profile.buff, duration }, { type: 'empower', category: 'attack', value: profile.empower, uses: 1 },
                ...(enriched ? [{ type: 'restoreMp', base: profile.mpRecovery * .35 }] : [])],
            [{ type: 'buff', stat: 'damageIncrease', value: Math.ceil(profile.buff * .65), duration }, { type: 'nextTurnDraw', value: 1 },
                ...(enriched ? [{ type: 'buff', stat: 'independentAttack', value: Math.ceil(profile.buff * .6), duration }] : [])],
        ][index];
        return card(id, name, category, rarity, 'lancer', 0,
            [enriched ? '凝聚枪意，提高力量、物理暴击与暴击伤害。' : '凝聚枪意，提高力量与物理暴击。',
                enriched ? '运转行军枪诀，提高物理攻击、强化下一张进攻牌并回复少量MP。' : '运转行军枪诀，提高物理攻击并强化下一张进攻牌。',
                enriched ? '洞察敌阵，提高伤害与独立攻击，并准备额外抽牌。' : '洞察敌阵，提高伤害并准备额外抽牌。'][index], effects,
            { ...commonExtra, tags: [...commonExtra.tags, '枪势增益'] });
    }
    const minValue = 6 + rarityIndex * 3;
    const maxValue = minValue + 4 + rarityIndex;
    const specialMechanic = unlocked
        ? (index === 0
            ? [{ type: 'status', status: 'bleed', stacks: 1 + Math.floor(rarityIndex / 3), duration: 2 }]
            : [{ type: 'guard', reduction: 12 + rarityIndex * 4, uses: 1, duration: 2 }])
        : [];
    const effects = index === 0
        ? [{ type: 'classCategoryRoundDamageBoost', classId: 'lancer', categories: ['attack', 'skill'], minValue, maxValue }, ...specialMechanic]
        : [{ type: 'nextTurnClassCategoryDamageBoost', classId: 'lancer', categories: ['attack', 'skill'], minValue, maxValue }, ...specialMechanic];
    return card(id, name, category, rarity, 'lancer', 0,
        index === 0
            ? (unlocked ? '展开八荒枪阵，本回合提高魔枪士牌伤害，并扎出流血。' : '展开八荒枪阵，本回合提高魔枪士进攻牌与技能牌伤害。')
            : (unlocked ? '收枪蓄锋，下一回合提高魔枪士牌伤害，并格挡下一次伤害。' : '收枪蓄锋，下一回合提高魔枪士进攻牌与技能牌伤害。'), effects,
        { ...commonExtra, tags: [...commonExtra.tags, '特殊牌', index === 0 ? '枪阵' : '蓄锋', ...(unlocked ? [index === 0 ? '枪尖见血' : '格挡'] : [])] });
};

const PEAK_LANCER_GENERAL_CARDS = PEAK_LANCER_GENERAL_RARITIES.flatMap((rarity) => Object.keys(PEAK_CARD_CATEGORIES).flatMap((category) => {
    const count = category === 'special' ? 2 : 3;
    return Array.from({ length: count }, (_, index) => createPeakLancerGeneralCard(rarity, category, index));
}));

const PEAK_CLASS_ROUTE_CATEGORIES = ['attack', 'defense', 'skill', 'buff'];
const PEAK_CLASS_ROUTE_RARITIES = [...PEAK_ARCHER_GENERAL_RARITIES];

const PEAK_CLASS_ROUTE_MASTERY_CONFIG = {
    holy_guardian: {
        classId: 'knight', firstName: '圣盾骑士', secondName: '曜光圣卫', resourceTag: '守护誓印',
        element: 'light', status: 'vulnerable', mechanic: 'vowShield',
        attackWeights: KNIGHT_ATTACK_WEIGHTS, sustainWeights: KNIGHT_SUSTAIN_WEIGHTS,
        skillScaling: { physicalAttack: .40, independentAttack: .32, spirit: .18 },
        buffStat: 'lightElement', secondBuffStat: 'damageReduction', empowerCategory: 'defense',
    },
    judgment_crusader: {
        classId: 'knight', firstName: '惩戒骑士', secondName: '天罚圣裁', resourceTag: '裁决印记',
        element: 'light', status: 'vulnerable', mechanic: 'vowShield',
        attackWeights: KNIGHT_ATTACK_WEIGHTS, sustainWeights: KNIGHT_SUSTAIN_WEIGHTS,
        skillScaling: { physicalAttack: .44, independentAttack: .34, strength: .16 },
        buffStat: 'physicalAttack', secondBuffStat: 'criticalDamage', empowerCategory: 'attack',
    },
    dragon_lancer: {
        classId: 'lancer', firstName: '破军枪将', secondName: '龙胆枪神', resourceTag: '破军枪势',
        element: '', status: 'bleed', mechanic: 'bleedHarvest',
        attackWeights: LANCER_ATTACK_WEIGHTS, sustainWeights: LANCER_SUSTAIN_WEIGHTS,
        skillScaling: { physicalAttack: .46, independentAttack: .34, strength: .14 },
        buffStat: 'physicalAttack', secondBuffStat: 'physicalCrit', empowerCategory: 'attack',
    },
    fortress_lancer: {
        classId: 'lancer', firstName: '镇岳枪卫', secondName: '玄甲枪圣', resourceTag: '镇岳枪架',
        element: '', status: 'bleed', mechanic: 'bleedHarvest',
        attackWeights: LANCER_ATTACK_WEIGHTS, sustainWeights: LANCER_SUSTAIN_WEIGHTS,
        skillScaling: { physicalAttack: .40, independentAttack: .30, vitality: .20 },
        buffStat: 'physicalDefense', secondBuffStat: 'damageReduction', empowerCategory: 'defense',
    },
    elemental_sorceress: {
        classId: 'mage', firstName: '元素术士', secondName: '天象魔导师', resourceTag: '元素星轨',
        element: 'fire', status: 'burn', mechanic: 'arcaneCascade',
        attackWeights: MAGE_ROUTE_ATTACK_WEIGHTS, sustainWeights: MAGE_SUSTAIN_WEIGHTS,
        skillScaling: { magicalAttack: .46, intelligence: .34, spirit: .14 },
        buffStat: 'fireElement', secondBuffStat: 'allElement', empowerCategory: 'skill',
    },
    void_warlock: {
        classId: 'mage', firstName: '虚空术士', secondName: '星渊大魔导', resourceTag: '虚空符文',
        element: 'dark', status: 'poison', mechanic: 'arcaneCascade',
        attackWeights: MAGE_ROUTE_ATTACK_WEIGHTS, sustainWeights: MAGE_SUSTAIN_WEIGHTS,
        skillScaling: { magicalAttack: .42, intelligence: .32, magicalCrit: .18 },
        buffStat: 'darkElement', secondBuffStat: 'criticalDamage', empowerCategory: 'skill',
    },
    grace_cleric: {
        classId: 'priest', firstName: '神愈祭司', secondName: '圣灵神牧', resourceTag: '神恩祷印',
        element: 'light', status: 'vulnerable', mechanic: 'blessingHasten',
        attackWeights: PRIEST_ATTACK_WEIGHTS, sustainWeights: PRIEST_SUSTAIN_WEIGHTS,
        skillScaling: { magicalAttack: .38, intelligence: .30, spirit: .24 },
        buffStat: 'lightElement', secondBuffStat: 'damageReduction', empowerCategory: 'defense',
    },
    revelation_priest: {
        classId: 'priest', firstName: '启示司祭', secondName: '神罚主教', resourceTag: '启示圣痕',
        element: 'light', status: 'burn', mechanic: 'blessingHasten',
        attackWeights: PRIEST_ATTACK_WEIGHTS, sustainWeights: PRIEST_SUSTAIN_WEIGHTS,
        skillScaling: { magicalAttack: .46, intelligence: .34, spirit: .16 },
        buffStat: 'magicalAttack', secondBuffStat: 'skillAttack', empowerCategory: 'skill',
    },
};

const PEAK_CLASS_ROUTE_CARD_NAMES = {
    holy_guardian: {
        common: {
            attack: { t1_1: '盾锋轻叩', t1_2: '抬盾撞胸', t2_1: '盾缘斜击' },
            defense: { t1_1: '正盾立守', t1_2: '侧盾斜卸', t2_1: '低盾护膝' },
            skill: { t1_1: '誓言初诵', t1_2: '微光加护', t2_1: '守誓列步' },
            buff: { t1_1: '整甲束带', t1_2: '沉肩定息', t2_1: '按盾静心' },
        },
        excellent: {
            attack: { t1_1: '铁盾突进', t1_2: '扬盾破势', t2_1: '重盾横扫' },
            defense: { t1_1: '铁壁半跪', t1_2: '双盾交锁', t2_1: '卸力回身' },
            skill: { t1_1: '誓约铭刻', t1_2: '银光庇佑', t2_1: '护誓成环' },
            buff: { t1_1: '披甲受衣', t1_2: '凝神持誓', t2_1: '光纹附盾' },
        },
        rare: {
            attack: { t1_1: '光盾贯击', t1_2: '誓锋斩隙', t2_1: '曜盾横断' },
            defense: { t1_1: '誓印回盾', t1_2: '光壁环身', t2_1: '誓印成垒' },
            skill: { t1_1: '守誓化壁', t1_2: '圣光扫场', t2_1: '誓约转盾' },
            buff: { t1_1: '誓心澄明', t1_2: '光辉加身', t2_1: '守誓凝光' },
        },
        scarce: {
            attack: { t1_1: '曜光叩阵', t1_2: '圣盾裂空', t2_1: '天盾压顶' },
            defense: { t1_1: '圣垒不倾', t1_2: '光障环列', t2_1: '曜壁镇场' },
            skill: { t1_1: '誓约倾泻', t2_1: '曜光洗地', t2_2: '守誓成阵' },
            buff: { t1_1: '圣誓加冕', t2_1: '曜心通明', t2_2: '光誓灌盾' },
        },
        legendary: {
            attack: { t1_1: '曜日盾击', t2_1: '圣裁盾压', t2_2: '天罚盾断' },
            defense: { t1_1: '曜光圣垒', t2_1: '不坠之壁', t2_2: '誓约天障' },
            skill: { t1_1: '誓约化圣壁', t2_1: '曜光遍照', t2_2: '守誓神格' },
            buff: { t1_1: '曜光加冕', t2_1: '圣誓通神', t2_2: '磐岳之心' },
        },
        epic: {
            attack: { t1_1: '曜光神盾击', t2_1: '万誓归锋', t2_2: '天穹盾裁', t2_3: '圣域灭击' },
            defense: { t1_1: '曜光神域垒', t2_1: '永不倾之壁' },
            skill: { t1_1: '万誓化神壁', t2_1: '曜光神照' },
            buff: { t1_1: '曜光神冕', t2_1: '万誓通圣' },
        },
    },
    judgment_crusader: {
        common: {
            attack: { t1_1: '罚枪直刺', t1_2: '压枪挑甲', t2_1: '扫枪断步' },
            defense: { t1_1: '横枪封面', t1_2: '沉枪拄地', t2_1: '侧枪卸势' },
            skill: { t1_1: '罪罚初宣', t1_2: '熹光问罪', t2_1: '戒律列步' },
            buff: { t1_1: '戒心自持', t1_2: '默诵戒条', t2_1: '按枪凝神' },
        },
        excellent: {
            attack: { t1_1: '铁罚重刺', t1_2: '扬枪破甲', t2_1: '旋枪裂阵' },
            defense: { t1_1: '铁枪封路', t1_2: '拄枪不退', t2_1: '卸枪回势' },
            skill: { t1_1: '罪状铭刻', t1_2: '银焰问罪', t2_1: '戒律成环' },
            buff: { t1_1: '戒律加身', t1_2: '凝神持罚', t2_1: '光纹附枪' },
        },
        rare: {
            attack: { t1_1: '裁决贯刺', t1_2: '誓罚破甲', t2_1: '罚光横断' },
            defense: { t1_1: '裁印回护', t1_2: '罚光环身', t2_1: '誓罚铸架' },
            skill: { t1_1: '誓约转罚', t1_2: '圣焰审判', t2_1: '裁律成阵' },
            buff: { t1_1: '裁心澄明', t1_2: '罚辉加身', t2_1: '誓罚凝光' },
        },
        scarce: {
            attack: { t1_1: '天罚叩阵', t1_2: '圣裁裂空', t2_1: '天谴压顶' },
            defense: { t1_1: '罚垒不倾', t2_1: '裁障环列', t2_2: '罚壁镇场' },
            skill: { t1_1: '誓约倾罚', t2_1: '圣裁洗地', t2_2: '裁律成域' },
            buff: { t1_1: '圣裁加冕', t2_1: '罚心通明', t2_2: '光罚灌枪' },
        },
        legendary: {
            attack: { t1_1: '天罚一击', t2_1: '圣裁枪压', t2_2: '神谴枪断', t2_3: '裁决之怒' },
            defense: { t1_1: '天罚圣垒', t2_1: '不赦之壁', t2_2: '誓约罚障' },
            skill: { t1_1: '誓约化天罚', t2_1: '圣裁遍照', t2_2: '裁律神格', t2_3: '天罚倾世' },
            buff: { t1_1: '天罚加冕', t2_1: '圣裁通神', t2_2: '不赦之心', t2_3: '裁心永铭' },
        },
        epic: {
            attack: { t1_1: '天罚神枪裁', t2_1: '万誓归罚', t2_2: '裁天一击' },
            defense: { t1_1: '天罚神域垒' },
            skill: { t1_1: '万誓化神罚', t2_1: '圣裁神照' },
            buff: { t1_1: '天罚神冕' },
        },
    },
    dragon_lancer: {
        common: {
            attack: { t1_1: '贯刺破阵', t1_2: '挑枪撩甲', t2_1: '旋枪扫野' },
            defense: { t1_1: '横枪格挡', t1_2: '沉枪扎地', t2_1: '侧枪卸力' },
            skill: { t1_1: '连环三刺', t1_2: '枪影乱点', t2_1: '疾风连贯' },
            buff: { t1_1: '枪意初凝', t1_2: '沉腕定息', t2_1: '握枪聚力' },
        },
        excellent: {
            attack: { t1_1: '铁枪贯甲', t1_2: '扬枪惊鸿', t2_1: '盘龙旋扫' },
            defense: { t1_1: '铁枪截路', t1_2: '拄枪不动', t2_1: '卸势回枪' },
            skill: { t1_1: '四刺连环', t1_2: '枪雨密点', t2_1: '锐风连贯' },
            buff: { t1_1: '枪意上扬', t1_2: '凝眸聚锋', t2_1: '劲力灌枪' },
        },
        rare: {
            attack: { t1_1: '血纹贯刺', t1_2: '破军挑血', t2_1: '旋枪割裂' },
            defense: { t1_1: '血枪回护', t1_2: '枪势环身', t2_1: '破军铸架' },
            skill: { t1_1: '血刃连环', t1_2: '追血枪潮', t2_1: '破军收割' },
            buff: { t1_1: '血战之心', t1_2: '枪势加身', t2_1: '破军凝势' },
        },
        scarce: {
            attack: { t1_1: '龙胆贯日', t1_2: '破军裂空', t2_1: '盘龙碎阵' },
            defense: { t1_1: '龙枪不倾', t1_2: '枪障环列', t2_1: '龙纹反锋' },
            skill: { t1_1: '龙胆连环', t2_1: '血河枪潮', t2_2: '破军血收' },
            buff: { t1_1: '龙胆加冕', t2_1: '枪心通明', t2_2: '破军灌枪' },
        },
        legendary: {
            attack: { t1_1: '龙胆贯天', t2_1: '破军一线', t2_2: '龙神断阵' },
            defense: { t1_1: '龙枪圣垒', t2_1: '不折之枪', t2_2: '破军天障' },
            skill: { t1_1: '龙胆化血河', t2_1: '破军遍扫', t2_2: '龙神收割' },
            buff: { t1_1: '龙胆通神', t2_1: '枪神之心', t2_2: '破军灌顶' },
        },
        epic: {
            attack: { t1_1: '龙胆神枪贯', t2_1: '万血归锋', t2_2: '龙神天断', t2_3: '破军绝杀' },
            defense: { t1_1: '龙枪神域垒', t2_1: '永不折之枪' },
            skill: { t1_1: '龙胆化神河', t2_1: '破军神扫' },
            buff: { t1_1: '龙胆神冕', t2_1: '破军神顶' },
        },
    },
    fortress_lancer: {
        common: {
            attack: { t1_1: '架枪推撞', t1_2: '压枪撩挑', t2_1: '扫枪断马' },
            defense: { t1_1: '封架立枪', t1_2: '盘龙拄地', t2_1: '低架护身' },
            skill: { t1_1: '镇岳初架', t1_2: '枪风扫尘', t2_1: '守枪列步' },
            buff: { t1_1: '扎马稳身', t1_2: '沉气定息', t2_1: '按枪静心' },
        },
        excellent: {
            attack: { t1_1: '铁架推阵', t1_2: '扬枪破势', t2_1: '重枪横扫' },
            defense: { t1_1: '铁架半跪', t1_2: '双枪交锁', t2_1: '卸力回架' },
            skill: { t1_1: '镇岳成架', t1_2: '铁风扫野', t2_1: '守枪成环' },
            buff: { t1_1: '披甲扎马', t1_2: '凝神持架', t2_1: '劲力附枪' },
        },
        rare: {
            attack: { t1_1: '镇岳贯击', t1_2: '血架破甲', t2_1: '玄甲横断' },
            defense: { t1_1: '枪架回护', t1_2: '铁壁环身', t2_1: '镇岳固架' },
            skill: { t1_1: '枪架转盾', t1_2: '镇岳收割', t2_1: '守枪成阵' },
            buff: { t1_1: '镇岳之心', t1_2: '铁甲加身', t2_1: '枪架凝势' },
        },
        scarce: {
            attack: { t1_1: '玄甲叩阵', t2_1: '镇岳裂空', t2_2: '岳压千钧' },
            defense: { t1_1: '玄垒不倾', t2_1: '铁障环列', t2_2: '玄壁镇场' },
            skill: { t1_1: '枪架倾泻', t2_1: '镇岳血收', t2_2: '守枪成域' },
            buff: { t1_1: '玄甲授冠', t2_1: '岳心通明', t2_2: '枪架灌劲' },
        },
        legendary: {
            attack: { t1_1: '镇岳一压', t2_1: '玄甲枪断', t2_2: '岳倾之击', t2_3: '玄铁归岳' },
            defense: { t1_1: '玄甲圣垒', t2_1: '不倾之岳', t2_2: '镇岳天障' },
            skill: { t1_1: '枪架化铁壁', t2_1: '镇岳遍压', t2_2: '玄甲收割', t2_3: '镇岳血月' },
            buff: { t1_1: '玄甲加冕', t2_1: '岳心通神', t2_2: '磐岳之守', t2_3: '玄心永镇' },
        },
        epic: {
            attack: { t1_1: '镇岳神枪压', t2_1: '玄甲天断', t2_2: '岳压苍穹' },
            defense: { t1_1: '玄甲神域垒' },
            skill: { t1_1: '枪架化神壁', t2_1: '玄甲证道' },
            buff: { t1_1: '玄甲神冕' },
        },
    },
    elemental_sorceress: {
        common: {
            attack: { t1_1: '火星弹', t1_2: '炽焰推手', t2_1: '焰纹冲击' },
            defense: { t1_1: '火墙微护', t1_2: '热流偏斜', t2_1: '焰纹结障' },
            skill: { t1_1: '双焰速射', t1_2: '星轨初转', t2_1: '火花连点' },
            buff: { t1_1: '元素亲和', t1_2: '静心冥想', t2_1: '焰心初生' },
        },
        excellent: {
            attack: { t1_1: '赤焰弹', t1_2: '烈焰推压', t2_1: '炎纹贯击' },
            defense: { t1_1: '焰墙环护', t1_2: '热浪偏转', t2_1: '炎纹成障' },
            skill: { t1_1: '三焰急射', t1_2: '星轨叠转', t2_1: '爆焰连点' },
            buff: { t1_1: '元素共鸣', t1_2: '凝神聚法', t2_1: '焰心渐炽' },
        },
        rare: {
            attack: { t1_1: '爆焰穿刺', t1_2: '星轨引爆', t2_1: '炎潮贯击' },
            defense: { t1_1: '焰环回护', t1_2: '星轨结障', t2_1: '炎壁环身' },
            skill: { t1_1: '级联焰射', t1_2: '星轨倾泻', t2_1: '爆焰连锁' },
            buff: { t1_1: '焰心激涌', t1_2: '星轨加身', t2_1: '元素凝法' },
        },
        scarce: {
            attack: { t1_1: '红莲穿空', t1_2: '天象引爆', t2_1: '炎潮裂阵' },
            defense: { t1_1: '红莲不灭', t1_2: '天象结障', t2_1: '元素返焰' },
            skill: { t1_1: '级联炎潮', t2_1: '星轨齐倾', t2_2: '红莲连锁' },
            buff: { t1_1: '红莲加冕', t2_1: '天象通明', t2_2: '元素灌法' },
        },
        legendary: {
            attack: { t1_1: '红莲天火', t2_1: '天象焚空', t2_2: '炎帝裁决' },
            defense: { t1_1: '红莲圣垒', t2_1: '不灭之焰', t2_2: '天象炎障' },
            skill: { t1_1: '级联红莲', t2_1: '天象遍焚', t2_2: '星轨归焰' },
            buff: { t1_1: '红莲通神', t2_1: '天象之心', t2_2: '元素灌顶' },
        },
        epic: {
            attack: { t1_1: '万劫焚星', t2_1: '天象神焚', t2_2: '炎帝神裁', t2_3: '红莲灭世' },
            defense: { t1_1: '红莲神域垒', t2_1: '永不灭之焰' },
            skill: { t1_1: '级联神莲', t2_1: '星轨神归' },
            buff: { t1_1: '红莲神冕', t2_1: '元素神顶' },
        },
    },
    void_warlock: {
        common: {
            attack: { t1_1: '暗影弹', t1_2: '腐蚀推手', t2_1: '虚空刺' },
            defense: { t1_1: '暗幕微护', t1_2: '虚空偏斜', t2_1: '影纹结障' },
            skill: { t1_1: '双影速射', t1_2: '符文初刻', t2_1: '暗蚀连点' },
            buff: { t1_1: '虚空亲和', t1_2: '静默冥想', t2_1: '影心初凝' },
        },
        excellent: {
            attack: { t1_1: '幽影弹', t1_2: '腐蚀压覆', t2_1: '虚空贯刺' },
            defense: { t1_1: '暗幕环护', t1_2: '虚空偏转', t2_1: '影纹成障' },
            skill: { t1_1: '三影急射', t1_2: '符文叠刻', t2_1: '暗蚀连锁' },
            buff: { t1_1: '虚空共鸣', t1_2: '凝神聚暗', t2_1: '影心深凝' },
        },
        rare: {
            attack: { t1_1: '蚀骨穿刺', t1_2: '符文引爆', t2_1: '虚空贯隙' },
            defense: { t1_1: '影环回护', t1_2: '符文结障', t2_1: '暗壁环身' },
            skill: { t1_1: '级联影射', t1_2: '符文倾泻', t2_1: '蚀骨连锁' },
            buff: { t1_1: '影心激涌', t1_2: '符文加身', t2_1: '虚空凝法' },
        },
        scarce: {
            attack: { t1_1: '星渊穿空', t2_1: '奇点引爆', t2_2: '虚空裂阵' },
            defense: { t1_1: '星渊不蚀', t2_1: '奇点结障', t2_2: '虚空返渊' },
            skill: { t1_1: '级联渊影', t2_1: '符文齐倾', t2_2: '星渊连锁' },
            buff: { t1_1: '星渊加冕', t2_1: '奇点通明', t2_2: '虚空灌法' },
        },
        legendary: {
            attack: { t1_1: '星渊坠灭', t2_1: '奇点吞空', t2_2: '渊神裁决', t2_3: '虚空审判' },
            defense: { t1_1: '星渊圣垒', t2_1: '不蚀之影', t2_2: '奇点暗障' },
            skill: { t1_1: '级联星渊', t2_1: '奇点遍蚀', t2_2: '符文归渊', t2_3: '虚空奇点' },
            buff: { t1_1: '星渊通神', t2_1: '奇点之心', t2_2: '虚空灌顶', t2_3: '渊心永寂' },
        },
        epic: {
            attack: { t1_1: '万劫归渊', t2_1: '奇点神吞', t2_2: '虚空终焉' },
            defense: { t1_1: '星渊神域垒' },
            skill: { t1_1: '级联神渊', t2_1: '符文神归' },
            buff: { t1_1: '星渊神冕' },
        },
    },
    grace_cleric: {
        common: {
            attack: { t1_1: '圣杖轻叩', t1_2: '祷力推退', t2_1: '素光拂击' },
            defense: { t1_1: '素光结衣', t1_2: '净血抚伤', t2_1: '祷印微护' },
            skill: { t1_1: '初愈之息', t1_2: '祝福初埋', t2_1: '柔光疗愈' },
            buff: { t1_1: '晨课授福', t1_2: '默然吟诵', t2_1: '祷心初静' },
        },
        excellent: {
            attack: { t1_1: '圣杖重叩', t1_2: '祷力震退', t2_1: '银光拂击' },
            defense: { t1_1: '银光结衣', t1_2: '净血复元', t2_1: '祷印环护' },
            skill: { t1_1: '复愈之息', t1_2: '祝福叠埋', t2_1: '银光疗愈' },
            buff: { t1_1: '午祷授福', t1_2: '凝神吟诵', t2_1: '祷心澄静' },
        },
        rare: {
            attack: { t1_1: '圣光裁叩', t1_2: '神恩反转', t2_1: '曜光拂击' },
            defense: { t1_1: '神恩结衣', t1_2: '祷印回护', t2_1: '圣光环壁' },
            skill: { t1_1: '祝福催熟', t1_2: '神恩速愈', t2_1: '圣光疗愈' },
            buff: { t1_1: '神恩加身', t1_2: '祷心通明', t2_1: '恩泽灌顶' },
        },
        scarce: {
            attack: { t1_1: '圣灵裁叩', t1_2: '神恩倾转', t2_1: '曜光贯击' },
            defense: { t1_1: '圣灵结衣', t1_2: '祷印铸垒', t2_1: '恩泽覆域' },
            skill: { t1_1: '祝福齐熟', t2_1: '神恩疾愈', t2_2: '圣灵疗愈' },
            buff: { t1_1: '圣灵加冕', t2_1: '祷心圆明', t2_2: '恩泽满盈' },
        },
        legendary: {
            attack: { t1_1: '圣灵裁决', t2_1: '神恩天转', t2_2: '曜光神拂' },
            defense: { t1_1: '圣灵圣垒', t2_1: '不朽之衣', t2_2: '祷印天障' },
            skill: { t1_1: '祝福化神迹', t2_1: '神恩遍愈', t2_2: '圣灵疗域' },
            buff: { t1_1: '圣灵通神', t2_1: '祷心之极', t2_2: '恩泽灌世' },
        },
        epic: {
            attack: { t1_1: '圣灵神裁', t2_1: '神恩万转', t2_2: '曜光神决', t2_3: '圣灵终曜' },
            defense: { t1_1: '圣灵神域垒', t2_1: '永不朽之衣' },
            skill: { t1_1: '祝福化万迹', t2_1: '圣灵神域' },
            buff: { t1_1: '圣灵神冕', t2_1: '恩泽神世' },
        },
    },
    revelation_priest: {
        common: {
            attack: { t1_1: '熹光箭', t1_2: '圣焰初燃', t2_1: '光矢斜射' },
            defense: { t1_1: '光幕微护', t1_2: '圣焰偏斜', t2_1: '圣痕微障' },
            skill: { t1_1: '双光速射', t1_2: '圣痕初刻', t2_1: '光焰连点' },
            buff: { t1_1: '启示初闻', t1_2: '静心诵典', t2_1: '圣痕微光' },
        },
        excellent: {
            attack: { t1_1: '银光箭', t1_2: '圣焰灼纹', t2_1: '光矢贯射' },
            defense: { t1_1: '光幕环护', t1_2: '圣焰偏转', t2_1: '圣痕成障' },
            skill: { t1_1: '三光急射', t1_2: '圣痕叠刻', t2_1: '光焰连锁' },
            buff: { t1_1: '启示渐明', t1_2: '凝神诵典', t2_1: '圣痕明纹' },
        },
        rare: {
            attack: { t1_1: '裁光穿刺', t1_2: '圣痕引爆', t2_1: '光矢贯隙' },
            defense: { t1_1: '光环回护', t1_2: '圣痕结障', t2_1: '曜壁环身' },
            skill: { t1_1: '祝福催启', t1_2: '圣痕倾泻', t2_1: '裁光连锁' },
            buff: { t1_1: '启示激涌', t1_2: '圣痕加身', t2_1: '神罚初显' },
        },
        scarce: {
            attack: { t1_1: '神罚穿空', t2_1: '圣痕齐爆', t2_2: '光矢裂阵' },
            defense: { t1_1: '神罚不倾', t2_1: '圣痕铸障', t2_2: '启示返罚' },
            skill: { t1_1: '祝福齐启', t2_1: '圣痕齐倾', t2_2: '神罚连锁' },
            buff: { t1_1: '神罚加冕', t2_1: '圣痕圆明', t2_2: '主教之证' },
        },
        legendary: {
            attack: { t1_1: '神罚裁光', t2_1: '圣痕天爆', t2_2: '主教神决', t2_3: '启示终审' },
            defense: { t1_1: '神罚圣垒', t2_1: '不灭之光', t2_2: '圣痕天障' },
            skill: { t1_1: '祝福化神启', t2_1: '圣痕遍照', t2_2: '神罚连天', t2_3: '启示倾世' },
            buff: { t1_1: '神罚通神', t2_1: '圣痕之极', t2_2: '启示灌顶', t2_3: '圣痕永铭' },
        },
        epic: {
            attack: { t1_1: '神罚万裁', t2_1: '圣痕神爆', t2_2: '启示裁天' },
            defense: { t1_1: '神罚神域垒' },
            skill: { t1_1: '祝福化万启', t2_1: '神罚神天' },
            buff: { t1_1: '神罚神冕' },
        },
    },
};

const PEAK_CLASS_ROUTE_ART_POOLS = {
    knight: { dir: 'assets/fighters/heroes/shengwei/card-pic', files: PEAK_KNIGHT_CARD_ART.attack.concat(PEAK_KNIGHT_CARD_ART.defense, PEAK_KNIGHT_CARD_ART.skill, PEAK_KNIGHT_CARD_ART.buff) },
    priest: { dir: 'assets/fighters/heroes/shenmu/card-pic', files: PEAK_PRIEST_CARD_ART_FILES },
    mage: { dir: 'assets/fighters/heroes/molinger/card-pic', files: PEAK_MAGE_CARD_ART_FILES },
};
const PEAK_CLASS_ROUTE_ART_OFFSETS = { attack: 0, defense: 3, skill: 6, buff: 9 };
const peakClassRouteSlot = (index, tier) => (index + (tier - 1) * 2) % 3;
const peakClassRouteArt = (classId, rarityIndex, category, tier, index) => {
    const pool = PEAK_CLASS_ROUTE_ART_POOLS[classId];
    if (!pool) return {};
    const artIndex = (rarityIndex * 13 + PEAK_CLASS_ROUTE_ART_OFFSETS[category] + tier * 5 + index) % pool.files.length;
    return { cardArt: `${pool.dir}/${pool.files[artIndex]}` };
};

const createPeakClassRouteMasteryCard = (pathId, rarity, category, tier, index) => {
    const config = PEAK_CLASS_ROUTE_MASTERY_CONFIG[pathId];
    const profile = PEAK_CARD_BALANCE[rarity];
    const rarityIndex = PEAK_CLASS_ROUTE_RARITIES.indexOf(rarity);
    const unlocked = rarityIndex >= 2;
    const caps = CLASS_MECHANIC_CAPS[rarity];
    const universalCaps = UNIVERSAL_DEFENSE_CAPS[rarity];
    const classId = config.classId;
    const tierName = tier === 1 ? config.firstName : config.secondName;
    const id = `${classId}_route_${pathId}_${rarity}_${category}_t${tier}_${index + 1}`;
    const name = PEAK_CLASS_ROUTE_CARD_NAMES[pathId]?.[rarity]?.[category]?.[`t${tier}_${index + 1}`];
    if (!name) throw new Error(`转职专属卡缺少卡名：${id}`);
    const commonExtra = {
        requiredAdvancement: { pathId, minTier: tier },
        advancementCard: true,
        classRouteMasteryExpansion: pathId,
        ...peakClassRouteArt(classId, rarityIndex, category, tier, index),
        tags: [tierName, config.resourceTag, tier === 1 ? '一转卡' : '二转卡'],
    };
    const sustain = config.sustainWeights[rarity];

    const mechanicEffect = () => {
        if (!unlocked) return [];
        if (config.mechanic === 'vowShield') return [{ type: 'vowShield', shieldPerStack: caps.vowShieldPerStack, maxStacks: caps.vowMax }];
        if (config.mechanic === 'bleedHarvest') return [{ type: 'bleedHarvest', damagePerStack: caps.bleedHarvestPerStack, maxStacks: 5 }];
        if (config.mechanic === 'arcaneCascade') return [{ type: 'arcaneCascade', damagePerCharge: caps.cascadePerCharge, maxCharges: SPELL_CHARGE_BUDGET_STACKS, ...(config.element ? { element: config.element } : {}) }];
        return [{ type: 'blessingHasten', turns: 1, bonusPercent: caps.blessingHastenBonus }];
    };
    const mechanicLabel = { vowShield: '誓约换盾', bleedHarvest: '流血收割', arcaneCascade: '充能级联', blessingHasten: '祝福催熟' }[config.mechanic];
    const mechanicSummary = { vowShield: '并消耗全部誓约转化为护盾', bleedHarvest: '并收割目标全部流血兑现真实伤害', arcaneCascade: '并引爆全部充能追加级联伤害', blessingHasten: '并催熟全部待兑现祝福' }[config.mechanic];

    if (category === 'attack') {
        const attackProfiles = [
            { style: 'strike', from: ['standing'], to: 'standing' },
            { style: 'launch', from: ['standing', 'airborne'], to: 'launched' },
            { style: 'finisher', from: ['airborne'], to: 'knockedDown' },
        ];
        const attack = attackProfiles[peakClassRouteSlot(index, tier)];
        const weights = config.attackWeights[rarity];
        const mechanic = unlocked && (attack.to === 'knockedDown' || (attack.to === 'launched' && rarityIndex >= 4))
            ? mechanicEffect()
            : [];
        const combo = unlocked && attack.to === 'standing'
            ? [{ type: 'empower', category: config.empowerCategory, value: Math.max(4, Math.round(profile.empower * .6)), uses: 1 }]
            : [];
        const base = [
            ...combo, ...mechanic,
            damage(profile.base * (weights.base + tier * .05), scaledWeights(weights.scaling, profile.scaling),
                { damageType: classId === 'mage' || classId === 'priest' ? 'magical' : 'physical' }),
            ...(attack.to === 'standing' ? [] : [state(attack.to)]),
        ];
        const summary = attack.to === 'standing'
            ? (combo.length ? `打击站立目标，并强化下一张${PEAK_CARD_CATEGORIES[config.empowerCategory]?.name || config.empowerCategory}牌。` : '打击站立目标并积累路线优势。')
            : attack.to === 'launched'
                ? (mechanic.length ? `以路线技法将目标击飞，${mechanicSummary}。` : '以路线技法将目标击飞。')
                : (mechanic.length ? `终结浮空目标并将其击倒，${mechanicSummary}。` : '终结浮空目标并将其击倒。');
        return card(id, name, category, rarity, classId, tier - 1, summary, base,
            {
                ...attackData(attack.style, attack.from, attack.to), ...commonExtra,
                tags: [...commonExtra.tags, '路线进攻', ...(mechanic.length ? [mechanicLabel] : []), ...(combo.length ? ['起手强化'] : [])],
            });
    }

    if (category === 'defense') {
        const defenseIndex = peakClassRouteSlot(index, tier);
        const counterGuard = unlocked;
        const effects = [
            [{ type: 'shield', base: profile.sustainBase, scaling: scaledWeights(sustain, profile.sustainScaling) },
                ...(counterGuard ? [{ type: 'retainShield', value: profile.retainShield }] : [])],
            [{ type: 'shield', base: profile.sustainBase * .88, scaling: scaledWeights(sustain, profile.sustainScaling, .86) },
                { type: 'guard', reduction: 13 + rarityIndex * 4 + tier * 2, uses: 1, duration: 2, ...(counterGuard ? { counterRatio: 18 + rarityIndex * 6 } : {}) }],
            [{ type: 'shield', base: profile.sustainBase * .78, scaling: scaledWeights(sustain, profile.sustainScaling, .78) },
                ...(unlocked ? mechanicEffect() : []),
                ...(unlocked ? [] : [{ type: 'thorns', ratio: universalCaps.thorns, uses: universalCaps.uses, duration: universalCaps.duration }])],
        ][defenseIndex];
        const summaries = [
            counterGuard ? '获得坚实护盾，并将部分护盾保留到下一回合。' : '获得坚实护盾。',
            counterGuard ? '获得护盾，以架势减伤并反击来袭者。' : '获得护盾并以架势减轻下一次伤害。',
            unlocked ? `获得护盾，${mechanicSummary}。` : '获得护盾并以反伤回敬来袭者。',
        ];
        return card(id, name, category, rarity, classId, tier - 1, summaries[defenseIndex], effects,
            { ...commonExtra, tags: [...commonExtra.tags, '路线防御', ...(unlocked && defenseIndex === 2 ? [mechanicLabel] : [])] });
    }

    if (category === 'skill') {
        const skillIndex = peakClassRouteSlot(index, tier);
        const bonusHits = rarityIndex >= 4 ? 2 : rarityIndex >= 2 ? 1 : 0;
        const hitCount = skillIndex + 1 + bonusHits;
        const hitEffects = Array.from({ length: hitCount }, (_, hitIndex) => damage(
            profile.base * (.82 + tier * .04),
            scaledWeights(config.skillScaling, profile.scaling),
            { ...(config.element ? { element: config.element } : {}), damageType: classId === 'mage' || classId === 'priest' ? 'magical' : 'physical', hitIndex: hitIndex + 1, hitCount },
        ));
        const utility = skillIndex === 1
            ? [{ type: 'status', status: config.status, stacks: 1 + Math.floor(rarityIndex / 2), duration: 2 + Math.floor(rarityIndex / 3) }]
            : skillIndex === 2 && unlocked ? mechanicEffect() : [];
        const summaries = [
            `释放${hitCount}段路线法术造成稳定伤害。`,
            `${hitCount}段路线法术命中并施加${PEAK_STATUS_EFFECTS[config.status]?.name || config.status}。`,
            unlocked ? `${hitCount}段路线法术命中，${mechanicSummary}。` : `${hitCount}段路线法术连续命中。`,
        ];
        return card(id, name, category, rarity, classId, tier - 1, summaries[skillIndex], [...hitEffects, ...utility],
            {
                requiresTargetState: skillIndex === 2 ? ['standing', 'launched'] : ['standing'], ...commonExtra,
                tags: [...commonExtra.tags, '路线技能', '多段', ...(unlocked && skillIndex === 2 ? [mechanicLabel] : [])],
            });
    }

    const buffIndex = peakClassRouteSlot(index, tier);
    const duration = Math.min(profile.duration, 2 + Math.floor(rarityIndex / 2));
    const enriched = unlocked;
    const effects = [
        [{ type: 'buff', stat: config.buffStat, value: profile.buff, duration },
            { type: 'buff', stat: config.secondBuffStat, value: Math.ceil(profile.buff * .5), duration },
            ...(enriched ? [{ type: 'statusWard', value: 1, duration: 2 + Math.floor(rarityIndex / 3) }] : [])],
        [{ type: 'buff', stat: config.buffStat, value: profile.buff, duration },
            { type: 'empower', category: config.empowerCategory, value: profile.empower, uses: 1 },
            ...(enriched ? [{ type: 'restoreMp', base: profile.mpRecovery * .35 }] : [])],
        [{ type: 'buff', stat: config.secondBuffStat, value: profile.buff, duration },
            { type: 'nextTurnDraw', value: tier },
            ...(enriched ? mechanicEffect() : [])],
    ][buffIndex];
    const summaries = [
        enriched ? '提高路线属性与配套属性，并获得异常防护。' : '提高路线属性与配套属性。',
        enriched ? `提高路线属性、强化下一张${PEAK_CARD_CATEGORIES[config.empowerCategory]?.name || config.empowerCategory}牌并回复少量MP。` : `提高路线属性并强化下一张${PEAK_CARD_CATEGORIES[config.empowerCategory]?.name || config.empowerCategory}牌。`,
        enriched ? `提高配套属性、准备额外抽牌，${mechanicSummary}。` : '提高配套属性并准备额外抽牌。',
    ];
    return card(id, name, category, rarity, classId, tier - 1, summaries[buffIndex], effects,
        { ...commonExtra, tags: [...commonExtra.tags, '路线增益', ...(enriched && buffIndex === 2 ? [mechanicLabel] : [])] });
};

const PEAK_CLASS_ROUTE_MASTERY_CARDS = Object.keys(PEAK_CLASS_ROUTE_MASTERY_CONFIG).flatMap((pathId) =>
    PEAK_CLASS_ROUTE_RARITIES.flatMap((rarity) => PEAK_CLASS_ROUTE_CATEGORIES.flatMap((category) => [1, 2].flatMap((tier) => {
        const slot = PEAK_CLASS_ROUTE_CARD_NAMES[pathId]?.[rarity]?.[category] || {};
        const count = Object.keys(slot).filter((key) => key.startsWith(`t${tier}_`)).length;
        return Array.from({ length: count }, (_, index) => createPeakClassRouteMasteryCard(pathId, rarity, category, tier, index));
    }))));

const PEAK_CARD_CATALOG = [
    card('combat_preparation', '临战整备', 'special', 'common', 'all', 0, '若本回合此前未打出进攻牌，恢复MP并使下一张进攻牌伤害提高。', [{ type: 'restoreMp', base: 10 }, { type: 'empower', category: 'attack', value: 5, uses: 1 }], { requiresNoPreviousCategory: ['attack'], tags: ['通用', '特殊牌'] }),
    card('advance_loan', '超前借贷', 'special', 'common', 'all', 1, '立即抽2张牌；下回合抽牌数减少2，最低降至0。', [{ type: 'borrowDraw', draw: 2, penalty: 2 }], { tags: ['通用', '特殊牌'] }),
    card('bouncing_bomb', '蹦蹦炸弹', 'special', 'common', 'all', 1, '为对手安放一枚炸弹；每当持有者回合开始时判定，有25%几率爆炸并对持有者造成其最大生命25%-40%的伤害（对Boss减半），未爆炸则把炸弹传给对面，循环直到爆炸。', [{ type: 'plantBomb', chance: 25, minRatio: 25, maxRatio: 40, bossFactor: .5 }], { tags: ['通用', '特殊牌'] }),
    card('patient_wait', '静候良机', 'special', 'common', 'all', 0, '若本回合队列中只有此牌，恢复12-18MP；存在其他牌时不生效。', [{ type: 'soloQueueRecovery', minValue: 12, maxValue: 18 }], { tags: ['通用', '特殊牌', '单牌回能'] }),
    card('second_rising_cut', '二次上挑', 'special', 'common', 'sword', 1, '本回合将目标击飞过才可使用；下一回合与下下回合各获得1张Lv.1上挑。', [{ type: 'scheduleCard', cardId: 'rising_cut', delays: [1, 2], level: 1 }], { requiresRoundStateApplied: ['launched'], tags: ['剑士', '特殊牌'] }),
    card('little_trickster', '小捣蛋鬼', 'special', 'excellent', 'all', 2, '下回合使对方前两张增益牌或防守牌的效果无效。', [{ type: 'disruptCards', categories: ['buff', 'defense'], charges: 2 }], { tags: ['通用', '特殊牌'] }),
    card('hedonism', '享乐主义', 'special', 'excellent', 'all', 2, '本回合造成的伤害降低15%-10%，但治疗量与护盾量提高30%-42%。', [{ type: 'roundTradeoff', minDamagePenalty: 15, maxDamagePenalty: 10, minSustainBonus: 30, maxSustainBonus: 42 }], { tags: ['通用', '特殊牌'] }),
    card('contingency_plan', '应变预案', 'special', 'excellent', 'all', 2, '本回合下一张被眩晕或卡牌干扰无效的非特殊牌返回手牌，并返还其50%-100%MP消耗；每回合限触发1次。', [{ type: 'nullifyInsurance', minRefund: 50, maxRefund: 100, uses: 1 }], { tags: ['通用', '特殊牌', '失效保险'] }),
    card('life_casting_shield', '生命铸盾', 'special', 'excellent', 'all', 2, '本回合后续治疗超过生命上限时，将溢出治疗的55%-85%转化为护盾。', [{ type: 'overhealToShield', minRatio: 55, maxRatio: 85 }], { tags: ['通用', '特殊牌', '溢出治疗'] }),
    card('reserve_to_barrier', '留牌成盾', 'special', 'excellent', 'all', 2, '回合结束时，每保留1张手牌获得3-5点护盾，最多计算6张。', [{ type: 'handReserveShield', minPerCard: 3, maxPerCard: 5, cap: 6 }], { tags: ['通用', '特殊牌', '手牌转盾'] }),
    card('advance_consumption', '超前消费', 'special', 'rare', 'all', 3, '仅在此卡为最后一张手牌时可用；抽1张牌，若为进攻或技能牌则其伤害提高15%-22%，下回合少抽1张牌。', [{ type: 'advanceConsume', draw: 1, penalty: 1, minDamageBonus: 15, maxDamageBonus: 22 }], { requiresLastHandCard: true, tags: ['通用', '特殊牌'] }),
    card('reckless_break', '破罐破摔', 'special', 'rare', 'all', 3, '丢弃全部剩余手牌，每张对目标造成当前生命5%-8%的伤害，单张最低20；对Boss效果减半。', [{ type: 'discardHandDamage', minRatio: 5, maxRatio: 8, minimum: 20, bossFactor: .5 }], { tags: ['通用', '特殊牌'] }),
    card('shield_thief', '窃盾者', 'special', 'rare', 'all', 3, '夺取目标当前护盾的50%-80%转化为自身护盾；对Boss效果减半。', [{ type: 'stealShield', minRatio: 50, maxRatio: 80, bossFactor: .5 }], { tags: ['通用', '特殊牌'] }),
    card('misfortune_transfer', '祸水东引', 'special', 'rare', 'all', 3, '移除自身最早获得的1-2种负面状态，并将其剩余层数与持续时间转移给对手；对Boss转移层数减半。', [{ type: 'transferDebuffs', minCount: 1, maxCount: 2, bossFactor: .5 }], { tags: ['通用', '特殊牌', '异常转移'] }),
    card('predictive_stance', '预判架势', 'special', 'rare', 'all', 3, '使对方下一张造成伤害的进攻或技能牌伤害降低35%-50%，并将减免量的30%-45%转化为自身护盾。', [{ type: 'forecastGuard', categories: ['attack', 'skill'], minReduction: 35, maxReduction: 50, minShieldRatio: 30, maxShieldRatio: 45, uses: 1 }], { tags: ['通用', '特殊牌', '预判防御'] }),
    card('sword_battlefield_veteran', '战场熟手', 'special', 'rare', 'sword', 3, '本回合剑士职业专属进攻牌和技能牌造成的伤害提高12%-20%。', [{ type: 'classCategoryRoundDamageBoost', classId: 'sword', categories: ['attack', 'skill'], minValue: 12, maxValue: 20 }], { tags: ['剑士', '特殊牌', '职业增伤'] }),
    card('brawler_battle_hardened', '秣兵历马', 'special', 'rare', 'brawler', 3, '下一回合格斗家职业专属进攻牌和技能牌造成的伤害提高12%-20%。', [{ type: 'nextTurnClassCategoryDamageBoost', classId: 'brawler', categories: ['attack', 'skill'], minValue: 12, maxValue: 20 }], { tags: ['格斗家', '特殊牌', '蓄势增伤'] }),
    card('hat_trick', '帽子戏法', 'special', 'rare', 'all', 3, '若本次队列除本牌外的卡牌类别互不重复，则按实际类别触发：进攻/技能牌伤害提高12%-20%，防守获得25-45点护盾，增益恢复8-16MP；任一类别重复则全部不触发。', [{ type: 'hatTrick', minDamageBoost: 12, maxDamageBoost: 20, minShield: 25, maxShield: 45, minMp: 8, maxMp: 16 }], { tags: ['通用', '特殊牌', '队列构成'] }),
    card('ground_pursuit', '倒地追击', 'special', 'scarce', 'all', 3, '追击倒地目标，造成较低物理伤害并使其重新浮空。', [damage(28, { physicalAttack: .65, strength: .75 }), state('airborne')], { requiresTargetState: ['knockedDown'], tags: ['通用', '特殊牌'] }),
    card('last_ditch_battle', '背水一战', 'special', 'scarce', 'all', 3, '消耗20%当前生命，本回合后续造成的物理伤害提高18%-24%。', [{ type: 'sacrificeCurrentHp', value: 20 }, { type: 'roundDamageBoost', damageType: 'physical', minValue: 18, maxValue: 24 }], { tags: ['通用', '特殊牌'] }),
    card('precaution', '防患未然', 'special', 'scarce', 'all', 3, '从现在起至下一回合结束，不会受到任何来源施加的负面状态。', [{ type: 'debuffImmunity', duration: 1 }], { tags: ['通用', '特殊牌'] }),
    card('shield_vanguard', '破盾先锋', 'special', 'scarce', 'all', 4, '本回合对护盾额外造成50%-80%伤害；击破护盾后，本回合剩余行动伤害提高5%-10%。', [{ type: 'shieldVanguard', minShieldBonus: 50, maxShieldBonus: 80, minBreakBonus: 5, maxBreakBonus: 10 }], { tags: ['通用', '特殊牌'] }),
    card('wound_rewind', '伤势回拨', 'special', 'scarce', 'all', 4, '记录当前已损生命；下回合开始恢复记录值的30%-45%，恢复量最多为最大生命的15%。', [{ type: 'scheduleMissingHpHeal', minRatio: 30, maxRatio: 45, capPercent: 15, turns: 1 }], { tags: ['通用', '特殊牌', '延迟恢复'] }),
    card('sword_shield_exchange', '剑盾互换', 'special', 'scarce', 'sword', 4, '随机丢弃手牌中1张进攻牌或技能牌，再从牌库随机获得最多2张防守牌或增益牌。', [{ type: 'discardForRandomCategories', discardCategories: ['attack', 'skill'], drawCategories: ['defense', 'buff'], draw: 2 }], { requiresDiscardCategories: ['attack', 'skill'], tags: ['剑士', '特殊牌', '攻守转换'] }),
    card('brawler_chain_uppercut', '连环勾拳', 'special', 'scarce', 'brawler', 4, '本回合立即获得1张与本牌同等级的上勾拳，之后两个回合开始时各再获得1张。', [{ type: 'grantAndScheduleCard', cardId: 'brawler_uppercut', delays: [1, 2] }], { tags: ['格斗家', '特殊牌', '连续生成'] }),
    card('thread_the_needle', '穿针引线', 'special', 'scarce', 'all', 4, '本回合获得10%-30%物理穿透和魔法穿透。', [{ type: 'roundPenetration', minValue: 10, maxValue: 30 }], { tags: ['通用', '特殊牌', '双穿透'] }),
    card('something_from_nothing', '无中生有', 'special', 'legendary', 'all', 4, '预支下一回合的战术选择，下回合额外抽取2张牌。', [{ type: 'nextTurnDraw', value: 2 }], { tags: ['通用', '特殊牌'] }),
    card('big_trickster', '大捣蛋鬼', 'special', 'legendary', 'all', 5, '下回合使对方所有增益牌和防守牌无效，并在其回合结束时丢弃手牌中的全部此类卡牌。', [{ type: 'disruptCards', categories: ['buff', 'defense'], all: true, discardAtTurnEnd: true }], { tags: ['通用', '特殊牌'] }),
    card('magic_to_physical', '魔法转物理', 'special', 'legendary', 'all', 4, '本回合后续造成的所有魔法伤害改为物理伤害，并额外提高18%-24%。', [{ type: 'convertRoundDamage', from: 'magical', to: 'physical', minBonus: 18, maxBonus: 24 }], { tags: ['通用', '特殊牌'] }),
    card('physical_to_magic', '物理转魔法', 'special', 'legendary', 'all', 4, '本回合后续造成的所有物理伤害改为魔法伤害，并额外提高18%-24%。', [{ type: 'convertRoundDamage', from: 'physical', to: 'magical', minBonus: 18, maxBonus: 24 }], { tags: ['通用', '特殊牌'] }),
    card('tactical_rewind', '战术回溯', 'special', 'legendary', 'all', 5, '回合结束时记录本回合最后打出的非特殊牌；下回合获得其同等级临时复制，使用后移出战斗。', [{ type: 'rewindLastCard', uses: 1 }], { tags: ['通用', '特殊牌', '临时复制'] }),
    card('show_your_sword', '亮出你的剑', 'special', 'legendary', 'all', 5, '从本回合开始直到本局结束：技能牌造成的伤害变为0，其他效果正常生效；进攻牌造成的伤害提高20%-40%。', [{ type: 'drawSword', minAttackBonus: 20, maxAttackBonus: 40 }], { tags: ['通用', '特殊牌', '整场效果'] }),
    card('copycat', '拷贝猫', 'special', 'epic', 'all', 6, '复制本回合此前打出的上一张进攻牌或技能牌到手牌。', [{ type: 'copyPreviousCard', categories: ['attack', 'skill'] }], { requiresPreviousCard: ['attack', 'skill'], tags: ['通用', '特殊牌'] }),
    card('baptism_by_fire', '浴火金身', 'special', 'epic', 'all', 6, '三回合内首次受到致命伤害时无视该次伤害，并清除自身所有负面状态。', [{ type: 'phoenixWard', duration: 3, charges: 1 }], { tags: ['通用', '特殊牌'] }),
    card('unstable_dark_magic', '不稳定黑魔法', 'special', 'epic', 'all', 5, '本回合打出的技能牌各自随机获得-10%~15%（满级-8%~24%）额外伤害，并按额外伤害的25%（满级40%）恢复生命；额外伤害为负时改为扣血，最多扣至剩余1点生命。', [{ type: 'unstableMagic', category: 'skill', minLow: -10, maxLow: -8, minHigh: 15, maxHigh: 24, minLeech: 25, maxLeech: 40 }], { tags: ['通用', '特殊牌'] }),
    card('mana_forged_armor', '魔力铸甲', 'special', 'epic', 'all', 5, '记录本回合后续进攻牌与技能牌消耗的MP，回合结束时获得消耗量200%-300%的护盾，最多不超过最大生命18%-25%。', [{ type: 'spentMpToShield', categories: ['attack', 'skill'], minRatio: 200, maxRatio: 300, minCap: 18, maxCap: 25 }], { tags: ['通用', '特殊牌', '耗蓝转盾'] }),
    card('causal_echo', '因果回响', 'special', 'epic', 'all', 6, '本回合下一张造成伤害的进攻牌或技能牌产生35%-55%伤害余响；余响不触发暴击、状态、异常、反伤或延迟标记。', [{ type: 'damageEcho', categories: ['attack', 'skill'], minRatio: 35, maxRatio: 55, uses: 1 }], { tags: ['通用', '特殊牌', '伤害余响'] }),
    card('absolute_piercing', '绝对贯通', 'special', 'epic', 'all', 6, '本回合下一张造成伤害的进攻牌或技能牌全部转为真实伤害，但最终伤害降低25%-10%。', [{ type: 'nextCardTrueDamage', categories: ['attack', 'skill'], minPenalty: 25, maxPenalty: 10, uses: 1 }], { tags: ['通用', '特殊牌', '真实伤害'] }),
    card('straight_slash', '直斩', 'attack', 'common', 'all', 0, '造成基础伤害，保持目标站立。', [{ type: 'damage', base: 24, scaling: { physicalAttack: .7, strength: .8 } }], { attackState: { from: ['standing'], to: 'standing' }, tags: ['起手'] }),
    card('rising_cut', '上挑', 'attack', 'common', 'sword', 1, '剑士上挑目标并将其击飞，可连续衔接上挑。', [{ type: 'damage', base: 20, scaling: { physicalAttack: .6, strength: .7 } }, { type: 'setState', value: 'launched' }], { attackState: { from: ['standing', 'airborne', 'launched'], to: 'launched', allowSame: true }, tags: ['剑士', '击飞'] }),
    card('brawler_uppercut', '上勾拳', 'attack', 'common', 'brawler', 1, '格斗家以同等威力上勾目标并将其击飞，可连续衔接上勾拳。', [{ type: 'damage', base: 20, scaling: { physicalAttack: .6, strength: .7 } }, { type: 'setState', value: 'launched' }], { attackState: { from: ['standing', 'airborne', 'launched'], to: 'launched', allowSame: true }, tags: ['格斗家', '击飞'] }),
    card('air_chaser', '浮空追斩', 'attack', 'excellent', 'all', 1, '追击站立或击飞目标，使其进入浮空。', [{ type: 'damage', base: 34, scaling: { physicalAttack: .8, strength: 1.1 } }, { type: 'setState', value: 'airborne' }], { attackState: { from: ['standing', 'launched'], to: 'airborne' }, tags: ['浮空'] }),
    card('ground_sweep', '裂地追击', 'attack', 'epic', 'all', 7, '攻击站立或倒地目标并使其眩晕，追击倒地目标时伤害提高。', [{ type: 'damage', base: 42, scaling: { physicalAttack: .9, strength: 1.2 } }, { type: 'setState', value: 'stunned' }], { attackState: { from: ['standing', 'knockedDown'], to: 'stunned' }, conditionalDamage: condition('targetState', .25, '目标处于击倒状态时，伤害提高25%。', { states: ['knockedDown'] }), tags: ['扫地', '眩晕', '史诗'] }),
    card('brace', '格挡架势', 'defense', 'common', 'all', 0, '获得基于体力和物防的护盾。', [{ type: 'shield', base: 24, scaling: { vitality: 1.2, physicalDefense: .2 } }], { tags: ['护盾'] }),
    card('iron_will', '钢铁意志', 'defense', 'excellent', 'all', 1, '获得大量护盾、恢复生命并净化一个负面状态。', [{ type: 'shield', base: 34, scaling: { vitality: 1.4 } }, { type: 'heal', base: 10, scaling: { spirit: .5 } }, { type: 'cleanse', value: 1 }], { tags: ['护盾', '净化'] }),
    card('second_wind', '回气', 'defense', 'common', 'all', 0, '恢复生命。', [{ type: 'heal', base: 18, scaling: { vitality: .8, spirit: .5 } }], { tags: ['恢复'] }),
    card('focus', '凝神', 'buff', 'common', 'all', 0, '恢复MP，为后续技能准备资源。', [{ type: 'restoreMp', base: 16 }], { tags: ['MP'] }),
    card('battle_instinct', '战斗本能', 'buff', 'excellent', 'all', 0, '两回合内增加力量，额外收益随自身基础力量成长。', [{ type: 'buff', stat: 'strength', value: 8, percent: 15, duration: 2 }], { cost: 3, tags: ['力量'] }),
    card('arcane_focus', '魔力聚焦', 'buff', 'excellent', 'all', 0, '两回合内增加智力，额外收益随自身基础智力成长。', [{ type: 'buff', stat: 'intelligence', value: 8, percent: 15, duration: 2 }], { cost: 3, tags: ['智力'] }),
    card('energy_burst', '念气爆发', 'skill', 'rare', 'all', 3, '造成光属性魔法伤害并施加易伤。', [{ type: 'damage', damageType: 'magical', element: 'light', base: 50, scaling: { independentAttack: .9, strength: 1.2, intelligence: .35 } }, { type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }], { tags: ['魔法', '光'] }),
    card('shock_wave', '震地波', 'skill', 'rare', 'all', 3, '造成范围伤害并击倒目标。', [{ type: 'damage', base: 50, scaling: { independentAttack: 1.1, strength: 1.4 } }, { type: 'setState', value: 'knockedDown' }], { tags: ['击倒'] }),
    card('ground_bombardment', '对地轰炸', 'skill', 'rare', 'all', 3, '只能轰炸处于击倒状态的目标，造成伤害但不改变目标状态。', [{ type: 'damage', base: 55, scaling: { independentAttack: 1.2, strength: 1.2 } }], { requiresTargetState: ['knockedDown'], tags: ['通用', '倒地追击'] }),

    card('frost_edge', '霜刃斩', 'attack', 'common', 'sword', 1, '剑士的冰属性斩击。', [{ type: 'damage', element: 'ice', base: 30, scaling: { physicalAttack: .9, strength: 1 } }], { attackState: { from: ['standing'], to: 'standing' }, tags: ['剑士', '冰'] }),
    card('mountain_launcher', '崩山挑', 'attack', 'excellent', 'sword', 2, '强力上挑并将目标击飞，可连续衔接击飞。', [{ type: 'damage', base: 45, scaling: { physicalAttack: 1.1, strength: 1.5 } }, { type: 'setState', value: 'launched' }], { attackState: { from: ['standing', 'airborne', 'launched'], to: 'launched', allowSame: true }, tags: ['剑士', '击飞'] }),
    card('moon_air_combo', '月轮空斩', 'skill', 'rare', 'sword', 3, '追击空中目标并维持浮空。', [{ type: 'damage', base: 58, scaling: { physicalAttack: 1.2, strength: 1.7 } }, { type: 'setState', value: 'airborne' }], { requiresTargetState: ['launched', 'airborne'], tags: ['剑士', '浮空'] }),
    card('frost_guard', '霜纹剑守', 'defense', 'excellent', 'sword', 1, '展开霜纹护盾。', [{ type: 'shield', base: 40, scaling: { vitality: 1.5, iceElement: .5 } }], { tags: ['剑士', '护盾'] }),
    card('sword_heart', '剑心', 'buff', 'rare', 'sword', 2, '提高力量与物理暴击。', [{ type: 'buff', stat: 'strength', value: 10, duration: 2 }, { type: 'buff', stat: 'physicalCrit', value: 5, duration: 2 }], { tags: ['剑士', '力量'] }),
    card('falling_frost', '霜落斩', 'skill', 'legendary', 'sword', 5, '以冰属性攻击终结浮空连段并击倒目标。', [{ type: 'damage', element: 'ice', base: 86, scaling: { physicalAttack: 1.6, strength: 2.2 } }, { type: 'setState', value: 'knockedDown' }], { requiresTargetState: ['airborne'], tags: ['剑士', '终结'] }),

    card('flame_jab', '炎拳', 'attack', 'common', 'brawler', 1, '格斗家的火属性直拳并施加1层灼烧。', [{ type: 'damage', element: 'fire', base: 32, scaling: { physicalAttack: .8, strength: 1.1 } }, { type: 'status', status: 'burn', stacks: 1, duration: 2 }], { attackState: { from: ['standing'], to: 'standing' }, tags: ['格斗家', '火'] }),
    card('dragon_kick', '升龙脚', 'attack', 'excellent', 'brawler', 2, '踢飞目标，可连续衔接击飞。', [{ type: 'damage', base: 43, scaling: { physicalAttack: 1, strength: 1.5 } }, { type: 'setState', value: 'launched' }], { attackState: { from: ['standing', 'airborne', 'launched'], to: 'launched', allowSame: true }, tags: ['格斗家', '击飞'] }),
    card('thunder_combo', '闪电乱击', 'skill', 'rare', 'brawler', 3, '快速连击浮空中的目标。', [{ type: 'damage', base: 60, scaling: { independentAttack: 1.3, strength: 1.6 } }, { type: 'setState', value: 'airborne' }], { requiresTargetState: ['launched', 'airborne'], tags: ['格斗家', '浮空'] }),
    card('body_armor', '霸体护身', 'defense', 'rare', 'brawler', 2, '获得护盾并恢复MP。', [{ type: 'shield', base: 38, scaling: { vitality: 1.6 } }, { type: 'restoreMp', base: 6 }], { tags: ['格斗家', '护盾', '回能'] }),
    card('demon_strength', '魔神之力', 'buff', 'rare', 'brawler', 2, '提高力量与伤害增加。', [{ type: 'buff', stat: 'strength', value: 11, duration: 2 }, { type: 'buff', stat: 'damageIncrease', value: 5, duration: 2 }], { tags: ['格斗家', '力量'] }),
    card('inferno_finish', '炼狱终结', 'skill', 'legendary', 'brawler', 5, '以火焰终结浮空连段并眩晕目标。', [{ type: 'damage', element: 'fire', base: 88, scaling: { independentAttack: 1.5, strength: 2.3 } }, { type: 'status', status: 'burn', stacks: 4, duration: 3 }, { type: 'setState', value: 'stunned' }], { requiresTargetState: ['airborne'], tags: ['格斗家', '终结'] }),

    card('gale_chain_slash', '疾风连斩', 'attack', 'common', 'sword', 0, '快速斩击站立目标，保持其站立状态。', [{ type: 'damage', base: 22, scaling: { physicalAttack: .62, strength: .68 } }], { attackState: { from: ['standing'], to: 'standing' }, tags: ['剑士', '连击'] }),
    card('frost_wheel_rise', '冰轮升斩', 'attack', 'excellent', 'sword', 2, '以寒冰剑气将站立或浮空目标击飞。', [{ type: 'damage', element: 'ice', base: 30, scaling: { physicalAttack: .72, strength: .86, iceElement: .12 } }, { type: 'setState', value: 'launched' }], { attackState: { from: ['standing', 'airborne'], to: 'launched' }, tags: ['剑士', '冰', '击飞'] }),
    card('iron_mountain_crash', '铁山靠', 'attack', 'excellent', 'brawler', 1, '用强力冲撞将站立或浮空目标击倒。', [{ type: 'damage', base: 31, scaling: { physicalAttack: .72, strength: .92 } }, { type: 'setState', value: 'knockedDown' }], { attackState: { from: ['standing', 'airborne'], to: 'knockedDown' }, tags: ['格斗家', '击倒'] }),
    card('blazing_suplex', '烈焰背摔', 'attack', 'excellent', 'brawler', 2, '抓取站立或浮空目标，以烈焰将其击倒。', [{ type: 'damage', element: 'fire', base: 33, scaling: { physicalAttack: .76, strength: .98 } }, { type: 'status', status: 'burn', stacks: 2, duration: 2 }, { type: 'setState', value: 'knockedDown' }], { attackState: { from: ['standing', 'airborne'], to: 'knockedDown' }, tags: ['格斗家', '火', '击倒'] }),
    card('breaking_wheel_kick', '破军旋踢', 'attack', 'common', 'all', 1, '旋踢站立或击飞目标，使其进入浮空状态。', [{ type: 'damage', base: 25, scaling: { physicalAttack: .64, strength: .76 } }, { type: 'setState', value: 'airborne' }], { attackState: { from: ['standing', 'launched'], to: 'airborne' }, tags: ['通用', '浮空'] }),
    card('crosswind_slash', '十字风斩', 'attack', 'common', 'sword', 1, '交错斩击站立目标，并造成轻微流血。', [{ type: 'damage', base: 23, scaling: { physicalAttack: .64, strength: .7 } }, { type: 'status', status: 'bleed', stacks: 1, duration: 2 }], { attackState: { from: ['standing'], to: 'standing' }, tags: ['剑士', '流血'] }),
    card('rising_knee', '冲膝上击', 'attack', 'excellent', 'brawler', 2, '以冲膝攻击站立、浮空或击飞目标，使其保持击飞。', [{ type: 'damage', base: 29, scaling: { physicalAttack: .7, strength: .88 } }, { type: 'setState', value: 'launched' }], { attackState: { from: ['standing', 'airborne', 'launched'], to: 'launched', allowSame: true }, tags: ['格斗家', '击飞'] }),

    card('crushing_blow', '崩地重击', 'attack', 'rare', 'all', 2, '重击站立或浮空目标并将其击倒。', [{ type: 'damage', base: 52, scaling: { physicalAttack: 1.1, strength: 1.4 } }, { type: 'setState', value: 'knockedDown' }], { attackState: { from: ['standing', 'airborne'], to: 'knockedDown' }, tags: ['击倒', '起手'] }),
    card('counter_guard', '反击壁垒', 'defense', 'rare', 'all', 2, '获得护盾并提高伤害。', [{ type: 'shield', base: 42, scaling: { vitality: 1.35, physicalDefense: .15 } }, { type: 'buff', stat: 'damageIncrease', value: 8, duration: 2 }], { tags: ['护盾', '反击'] }),
    card('battle_flow', '战术循环', 'skill', 'excellent', 'all', 1, '抽取两张卡牌。', [{ type: 'draw', value: 2 }], { tags: ['抽牌'] }),
    card('limit_break', '界限突破', 'buff', 'legendary', 'all', 3, '大幅提高力量与智力。', [{ type: 'buff', stat: 'strength', value: 16, duration: 2 }, { type: 'buff', stat: 'intelligence', value: 16, duration: 2 }], { tags: ['爆发'] }),
    card('aurora_finale', '极光终焉剑', 'skill', 'epic', 'sword', 7, '剑士史诗终结技，斩落浮空目标。', [{ type: 'damage', element: 'ice', base: 138, scaling: { physicalAttack: 2.2, strength: 3.1, iceElement: .8 } }, { type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }, { type: 'setState', value: 'knockedDown' }], { requiresTargetState: ['airborne'], tags: ['剑士', '史诗'] }),
    card('infernal_verdict', '魔焰裁决', 'skill', 'epic', 'brawler', 7, '格斗家史诗终结技，轰击浮空目标并施加5层灼烧。', [{ type: 'damage', element: 'fire', base: 142, scaling: { independentAttack: 2.1, strength: 3.2 } }, { type: 'status', status: 'burn', stacks: 5, duration: 4 }, { type: 'setState', value: 'stunned' }], { requiresTargetState: ['airborne'], tags: ['格斗家', '史诗'] }),
    ...PEAK_EXPANSION_CARDS,
    ...PEAK_MECHANIC_CARDS,
    ...PEAK_STATE_REWORK_CARDS,
    ...PEAK_NON_ATTACK_EXPANSION,
    ...PEAK_ELEMENTAL_SKILL_CARDS,
    ...PEAK_REACTIVE_DEFENSE_CARDS,
    ...PEAK_UNIVERSAL_DEFENSE_CARDS,
    ...PEAK_TACTICAL_DEFENSE_CARDS,
    ...PEAK_DERIVED_ATTACK_CARDS,
    ...PEAK_MECHANIC_ATTACK_CARDS,
    ...PEAK_QUEUE_COMPOSITION_ATTACK_CARDS,
    ...PEAK_SCARCE_CLASS_CARDS,
    ...PEAK_UNIVERSAL_BLUE_PURPLE_CARDS,
    ...PEAK_ADVANCEMENT_CARDS,
    ...PEAK_SWORD_BRAWLER_ROUTE_SPECIALS,
    ...PEAK_ADVANCEMENT_EXPANSION_CARDS,
    ...universalFiveAttackCards,
    ...universalFiveDefenseCards,
    ...universalFiveSkillCards,
    ...universalFiveBuffCards,
    ...PEAK_ARCHER_CARDS,
    ...PEAK_ARCHER_GENERAL_CARDS,
    ...PEAK_ARCHER_ROUTE_MASTERY_CARDS,
    ...PEAK_KNIGHT_GENERAL_CARDS,
    ...PEAK_PRIEST_GENERAL_CARDS,
    ...PEAK_MAGE_GENERAL_CARDS,
    ...PEAK_LANCER_GENERAL_CARDS,
    ...PEAK_CLASS_ROUTE_MASTERY_CARDS,
];

export const PEAK_CARDS = PEAK_CARD_CATALOG.map((entry) => {
    const pathId = legacyAdvancementRouteFor(entry);
    if (!pathId) return entry;
    const minTier = entry.rarity === 'epic' ? 2 : 1;
    return {
        ...entry,
        requiredAdvancement: { pathId, minTier },
        advancementCard: true,
        tags: [...new Set([...(entry.tags || []), PEAK_ROUTE_TAGS[pathId]])],
    };
});

export const PEAK_CARD_BY_ID = Object.fromEntries(PEAK_CARDS.map((entry) => [entry.id, entry]));
export const PEAK_SHARED_STARTERS = ['straight_slash', 'straight_slash', 'air_chaser', 'brace', 'brace', 'iron_will', 'second_wind', 'focus', 'battle_instinct', 'arcane_focus', 'energy_burst', 'shock_wave'];
export const PEAK_STARTER_DECKS = {
    sword: [
        'gale_chain_slash', 'gale_chain_slash',
        'rising_cut', 'rising_cut',
        'sword_linking_arc', 'universal_five_attack_common_4',
        'sword_scabbard_guard', 'sword_scabbard_guard',
        'utility_sword_defense_common_1',
        'frost_edge', 'frost_edge',
        'elemental_sword_common_ice_1', 'utility_sword_skill_common_2',
        'frost_breath_focus', 'frost_breath_focus',
        'utility_sword_buff_common_1', 'focus',
        'second_rising_cut',
    ],
    brawler: [
        'probing_jab', 'probing_jab',
        'brawler_uppercut', 'brawler_uppercut',
        'brawler_step_hook', 'universal_five_attack_common_4',
        'wrapped_guard', 'wrapped_guard',
        'utility_brawler_defense_common_1',
        'flame_jab', 'flame_jab',
        'elemental_brawler_common_fire_1', 'utility_brawler_skill_common_2',
        'heatup_breath', 'heatup_breath',
        'utility_brawler_buff_common_1', 'focus',
        'combat_preparation',
    ],
    archer: [
        'archer_quick_shot', 'archer_quick_shot',
        'archer_rising_arrow', 'archer_rising_arrow',
        'breaking_wheel_kick', 'universal_five_attack_common_4',
        'archer_hunter_guard', 'archer_hunter_guard',
        'archer_general_common_defense_2',
        'archer_general_common_skill_1', 'archer_general_common_skill_1',
        'archer_general_common_skill_2', 'archer_general_common_skill_3',
        'archer_steady_aim', 'archer_steady_aim',
        'archer_general_common_buff_1', 'focus',
        'archer_general_common_special_1',
    ],
    knight: [
        'knight_general_common_attack_1', 'knight_general_common_attack_1',
        'knight_general_common_attack_2', 'knight_general_common_attack_2',
        'knight_general_common_attack_3', 'universal_five_attack_common_4',
        'knight_general_common_defense_1', 'knight_general_common_defense_1',
        'knight_general_common_defense_2',
        'knight_general_common_skill_1', 'knight_general_common_skill_1',
        'knight_general_common_skill_2', 'knight_general_common_skill_3',
        'knight_general_common_buff_1', 'knight_general_common_buff_1',
        'knight_general_common_buff_2', 'focus',
        'knight_general_common_special_1',
    ],
    priest: [
        'priest_general_common_attack_1', 'priest_general_common_attack_1',
        'priest_general_common_attack_2', 'priest_general_common_attack_2',
        'breaking_wheel_kick', 'priest_general_common_attack_3',
        'priest_general_common_defense_1', 'priest_general_common_defense_1',
        'priest_general_common_defense_2',
        'priest_general_common_skill_1', 'priest_general_common_skill_1',
        'priest_general_common_skill_2', 'priest_general_common_skill_2',
        'priest_general_common_buff_1', 'priest_general_common_buff_1',
        'priest_general_common_buff_2', 'focus',
        'priest_general_common_special_1',
    ],
    mage: [
        'mage_general_common_attack_1', 'mage_general_common_attack_1',
        'mage_general_common_attack_2', 'mage_general_common_attack_2',
        'breaking_wheel_kick', 'mage_general_common_attack_3',
        'mage_general_common_defense_1', 'mage_general_common_defense_2',
        'mage_general_common_defense_3',
        'mage_general_common_skill_1', 'mage_general_common_skill_1',
        'mage_general_common_skill_2', 'mage_general_common_skill_3',
        'mage_general_common_buff_1', 'mage_general_common_buff_1',
        'mage_general_common_buff_2', 'focus',
        'mage_general_common_special_1',
    ],
    lancer: [
        'lancer_general_common_attack_1', 'lancer_general_common_attack_1',
        'lancer_general_common_attack_2', 'lancer_general_common_attack_2',
        'lancer_general_common_attack_3', 'universal_five_attack_common_4',
        'lancer_general_common_defense_1', 'lancer_general_common_defense_1',
        'lancer_general_common_defense_2',
        'lancer_general_common_skill_1', 'lancer_general_common_skill_1',
        'lancer_general_common_skill_2', 'lancer_general_common_skill_3',
        'lancer_general_common_buff_1', 'lancer_general_common_buff_1',
        'lancer_general_common_buff_2', 'focus',
        'lancer_general_common_special_1',
    ],
};

export const PEAK_PACKS = [
    { id: 'lower', name: '下级卡包', price: 200, tone: '#aeb6c0', rates: { common: 92, excellent: 8 } },
    { id: 'low', name: '低级卡包', price: 450, tone: '#7ccf99', rates: { common: 75, excellent: 23, rare: 2 } },
    { id: 'middle', name: '中级卡包', price: 900, tone: '#5fb7e8', rates: { common: 55, excellent: 38, rare: 6.8, scarce: .2 } },
    { id: 'high', name: '高级卡包', price: 1800, tone: '#c58be8', guaranteeRarity: 'excellent', rates: { common: 35, excellent: 43, rare: 18, scarce: 3, legendary: 1 } },
    { id: 'upper', name: '上级卡包', price: 4000, tone: '#f0b34f', guaranteeRarity: 'rare', rates: { common: 15, excellent: 40, rare: 32, scarce: 10, legendary: 2.5, epic: .5 } },
    { id: 'special', name: '特级卡包', price: 9000, tone: '#f06a51', guaranteeRarity: 'rare', rates: { excellent: 20, rare: 38, scarce: 28, legendary: 11, epic: 3 } },
    { id: 'highest', name: '最上级卡包', price: 20000, tone: '#ffe16b', guaranteeRarity: 'legendary', rates: { excellent: 8, rare: 28, scarce: 32, legendary: 25, epic: 7 } },
    { id: 'class', name: '职业定向卡包', price: 30000, tone: '#ffcf68', guaranteeRarity: 'legendary', poolMode: 'class', minAdvancementTier: 2, rates: { excellent: 8, rare: 28, scarce: 32, legendary: 25, epic: 7 } },
];

const enemyMpCosts = {
    normal: { attack: 3, skill: 4, defense: 3, buff: 3 },
    difficult: { attack: 5, skill: 6, defense: 5, buff: 4 },
    nightmare: { attack: 7, skill: 9, defense: 7, buff: 6 },
    boss: { attack: 8, skill: 10, defense: 8, buff: 7 },
};
const enemyCard = (id, name, category, summary, effects, extra = {}) => {
    const tier = extra.tier || 'normal';
    return {
        id, name, category, rarity: 'common', classId: 'enemy', cost: enemyMpCosts[tier]?.[category] || 3, summary, effects,
        level: 1, maxLevel: 10, levelGrowth: .06, requiresTargetState: [], tags: ['怪物'], tier, aiScore: 10, enemyOnly: true, ...extra,
    };
};

export const PEAK_ENEMY_CARDS = [
    enemyCard('enemy_claw', '撕咬', 'attack', '造成物理伤害并施加流血。', [{ type: 'damage', base: 18, scaling: { physicalAttack: .8 } }, { type: 'status', status: 'bleed', stacks: 1, duration: 2 }], { attackStyle: 'claw', attackState: { from: ['standing'], to: 'standing' }, aiScore: 24 }),
    enemyCard('enemy_heavy', '沉重打击', 'attack', '重击并击倒目标。', [{ type: 'damage', base: 24, scaling: { physicalAttack: 1 } }, { type: 'setState', value: 'knockedDown' }], { attackStyle: 'finisher', attackState: { from: ['standing', 'airborne'], to: 'knockedDown' }, aiScore: 34 }),
    enemyCard('enemy_launcher', '凶猛上挑', 'attack', '攻击并将目标击飞，可连续上挑。', [{ type: 'damage', base: 16, scaling: { physicalAttack: .7 } }, { type: 'setState', value: 'launched' }], { attackStyle: 'launch', attackState: { from: ['standing', 'airborne', 'launched'], to: 'launched', allowSame: true }, aiScore: 30 }),
    enemyCard('enemy_air_follow', '空中追袭', 'attack', '追击站立或击飞目标并使其浮空。', [{ type: 'damage', base: 27, scaling: { physicalAttack: 1.05 } }, { type: 'setState', value: 'airborne' }], { attackStyle: 'air', attackState: { from: ['standing', 'launched'], to: 'airborne' }, aiScore: 42 }),
    enemyCard('enemy_air_finish', '坠地猛袭', 'attack', '攻击站立或浮空目标并使其倒地。', [{ type: 'damage', base: 38, scaling: { physicalAttack: 1.25 } }, { type: 'setState', value: 'knockedDown' }], { attackStyle: 'finisher', attackState: { from: ['standing', 'airborne'], to: 'knockedDown' }, aiScore: 55 }),
    enemyCard('enemy_ground_hit', '倒地追击', 'attack', '攻击站立或倒地目标并使其眩晕。', [{ type: 'damage', base: 29, scaling: { physicalAttack: 1.1 } }, { type: 'setState', value: 'stunned' }], { attackStyle: 'ground', attackState: { from: ['standing', 'knockedDown'], to: 'stunned' }, aiScore: 48 }),
    enemyCard('enemy_bolt', '魔力弹', 'skill', '造成暗属性魔法伤害。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 21, scaling: { magicalAttack: .9 } }], { aiScore: 28 }),
    enemyCard('enemy_guard', '坚壳防御', 'defense', '获得护盾。', [{ type: 'shield', base: 24, scaling: { vitality: .8 } }], { aiScore: 20 }),
    enemyCard('enemy_recover', '邪气再生', 'defense', '恢复生命。', [{ type: 'heal', base: 20, scaling: { spirit: .7 } }], { aiScore: 18 }),
    enemyCard('enemy_rage', '狂暴蓄力', 'buff', '提高物理攻击。', [{ type: 'buff', stat: 'physicalAttack', value: 8, duration: 2 }], { aiScore: 26 }),
    enemyCard('enemy_spell_focus', '咒力汇聚', 'buff', '提高魔法攻击。', [{ type: 'buff', stat: 'magicalAttack', value: 9, duration: 2 }], { aiScore: 26 }),

    enemyCard('enemy_probe', '试探突袭', 'attack', '目标生命充足时略微提高伤害。', [{ type: 'damage', base: 14, scaling: { physicalAttack: .65 } }], { attackStyle: 'strike', attackState: { from: ['standing'], to: 'standing' }, conditionalDamage: condition('targetHpAbove', .08, '目标生命高于75%时，伤害提高8%。', { threshold: .75 }), aiScore: 20 }),
    enemyCard('enemy_hook_claw', '钩爪上扬', 'attack', '将目标击飞，可继续衔接击飞攻击。', [{ type: 'damage', base: 13, scaling: { physicalAttack: .6 } }, { type: 'setState', value: 'launched' }], { attackStyle: 'launch', attackState: { from: ['standing', 'airborne', 'launched'], to: 'launched', allowSame: true }, aiScore: 25 }),
    enemyCard('enemy_carapace', '甲壳收缩', 'defense', '获得少量护盾。', [{ type: 'shield', base: 18, scaling: { vitality: .55 } }], { aiScore: 17 }),
    enemyCard('enemy_battle_cry', '狂野战吼', 'buff', '短暂提高物理攻击。', [{ type: 'buff', stat: 'physicalAttack', value: 5, duration: 2 }], { aiScore: 20 }),
    enemyCard('enemy_dark_spark', '暗影火花', 'skill', '造成较低的暗属性魔法伤害。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 17, scaling: { magicalAttack: .7 } }], { aiScore: 22 }),
    enemyCard('enemy_venom_spit', '毒液喷吐', 'skill', '造成较低魔法伤害并施加1层中毒。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 12, scaling: { magicalAttack: .5 } }, { type: 'status', status: 'poison', stacks: 1, duration: 2 }], { aiScore: 24 }),
    enemyCard('enemy_frost_touch', '寒霜触碰', 'skill', '造成较低冰属性伤害并施加1层冰冻。', [{ type: 'damage', damageType: 'magical', element: 'ice', base: 13, scaling: { magicalAttack: .52 } }, { type: 'status', status: 'frozen', stacks: 1, duration: 2 }], { aiScore: 24 }),
    enemyCard('enemy_pack_fangs', '狼群连牙', 'attack', '连续撕咬两次并施加流血。', [{ type: 'damage', base: 7, scaling: { physicalAttack: .3 }, hitIndex: 1, hitCount: 2 }, { type: 'damage', base: 7, scaling: { physicalAttack: .3 }, hitIndex: 2, hitCount: 2 }, { type: 'status', status: 'bleed', stacks: 1, duration: 2 }], { attackStyle: 'claw', attackState: { from: ['standing'], to: 'standing' }, aiScore: 25, tags: ['怪物', '多段命中', '流血'] }),
    enemyCard('enemy_spore_burst', '孢子爆裂', 'skill', '孢子造成少量暗属性魔法伤害并使目标虚弱。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 12, scaling: { magicalAttack: .5 } }, { type: 'status', status: 'weak', stacks: 1, duration: 1 }], { aiScore: 25, tags: ['怪物', '虚弱'] }),
    enemyCard('enemy_rock_spines', '岩刺反甲', 'defense', '获得少量护盾，并反弹下一次受到的伤害。', [{ type: 'shield', base: 14, scaling: { vitality: .5 } }, { type: 'thorns', ratio: 12, uses: 1, duration: 2 }], { aiScore: 22, tags: ['怪物', '反伤'] }),
    enemyCard('enemy_mist_ward', '雾幕祷告', 'defense', '获得少量护盾和一次异常屏障。', [{ type: 'shield', base: 12, scaling: { spirit: .42 } }, { type: 'statusWard', value: 1, duration: 2 }], { aiScore: 23, tags: ['怪物', '异常防护'] }),
    enemyCard('enemy_raking_claws', '连环抓挠', 'attack', '快速抓挠两次，对高生命目标略微提高伤害。', [{ type: 'damage', base: 6, scaling: { physicalAttack: .27 }, hitIndex: 1, hitCount: 2 }, { type: 'damage', base: 6, scaling: { physicalAttack: .27 }, hitIndex: 2, hitCount: 2 }], { attackStyle: 'claw', attackState: { from: ['standing'], to: 'standing' }, conditionalDamage: condition('targetHpAbove', .08, '目标生命高于75%时，伤害提高8%。', { threshold: .75 }), aiScore: 23, tags: ['怪物', '二段'] }),
    enemyCard('enemy_tail_launcher', '铁尾挑击', 'attack', '以铁尾挑起站立目标，使其进入击飞状态。', [{ type: 'damage', base: 14, scaling: { physicalAttack: .62 } }, { type: 'setState', value: 'launched' }], { attackStyle: 'launch', attackState: { from: ['standing'], to: 'launched' }, aiScore: 27, tags: ['怪物', '击飞'] }),
    enemyCard('enemy_swooping_pounce', '俯冲扑袭', 'attack', '扑向击飞目标并使其进入浮空状态。', [{ type: 'damage', base: 19, scaling: { physicalAttack: .74 } }, { type: 'setState', value: 'airborne' }], { attackStyle: 'air', attackState: { from: ['launched'], to: 'airborne' }, aiScore: 32, tags: ['怪物', '浮空追击'] }),
    enemyCard('enemy_ember_spit', '火星喷吐', 'skill', '喷吐火星造成火属性魔法伤害并施加1层灼烧。', [{ type: 'damage', damageType: 'magical', element: 'fire', base: 13, scaling: { magicalAttack: .5 } }, { type: 'status', status: 'burn', stacks: 1, duration: 2 }], { aiScore: 24, tags: ['怪物', '火', '灼烧'] }),
    enemyCard('enemy_static_pulse', '静电脉冲', 'skill', '释放电流造成光属性魔法伤害并施加短暂易伤。', [{ type: 'damage', damageType: 'magical', element: 'light', base: 14, scaling: { magicalAttack: .52 } }, { type: 'status', status: 'vulnerable', stacks: 1, duration: 1 }], { aiScore: 25, tags: ['怪物', '光', '易伤'] }),
    enemyCard('enemy_hide_hardening', '硬化皮膜', 'defense', '获得少量护盾并格挡下一次伤害。', [{ type: 'shield', base: 15, scaling: { vitality: .48 } }, { type: 'guard', reduction: 10, uses: 1, duration: 1 }], { aiScore: 21, tags: ['怪物', '格挡'] }),
    enemyCard('enemy_savage_posture', '野性架势', 'buff', '短暂提高物理攻击与物理暴击。', [{ type: 'buff', stat: 'physicalAttack', value: 5, duration: 2 }, { type: 'buff', stat: 'physicalCrit', value: 2, duration: 2 }], { aiScore: 22, tags: ['怪物', '物理强化'] }),
    enemyCard('enemy_mystic_posture', '咒能架势', 'buff', '短暂提高魔法攻击与魔法暴击。', [{ type: 'buff', stat: 'magicalAttack', value: 5, duration: 2 }, { type: 'buff', stat: 'magicalCrit', value: 2, duration: 2 }], { aiScore: 22, tags: ['怪物', '魔法强化'] }),

    enemyCard('enemy_hunting_rend', '追猎撕裂', 'attack', '撕裂高生命目标并施加流血。', [{ type: 'damage', base: 24, scaling: { physicalAttack: .9 } }, { type: 'status', status: 'bleed', stacks: 1, duration: 2 }], { tier: 'difficult', attackStyle: 'claw', attackState: { from: ['standing'], to: 'standing' }, conditionalDamage: condition('targetHpAbove', .12, '目标生命高于65%时，伤害提高12%。', { threshold: .65 }), aiScore: 35 }),
    enemyCard('enemy_air_slam', '破空坠袭', 'attack', '在击飞连段后获得额外伤害并击倒目标。', [{ type: 'damage', base: 31, scaling: { physicalAttack: 1.1 } }, { type: 'setState', value: 'knockedDown' }], { tier: 'difficult', attackStyle: 'finisher', attackState: { from: ['standing', 'launched', 'airborne'], to: 'knockedDown' }, conditionalDamage: condition('priorAttackStyleOnly', .14, '本回合此前只打出过击飞类进攻牌时，伤害提高14%。', { style: 'launch' }), aiScore: 48 }),
    enemyCard('enemy_desperate_maul', '困兽猛袭', 'attack', '怪物生命较低时提高伤害。', [{ type: 'damage', base: 27, scaling: { physicalAttack: 1 } }], { tier: 'difficult', attackStyle: 'strike', attackState: { from: ['standing'], to: 'standing' }, conditionalDamage: condition('actorHpBelow', .14, '自身生命低于40%时，伤害提高14%。', { threshold: .4 }), aiScore: 39 }),
    enemyCard('enemy_curse_armor', '咒甲屏障', 'defense', '获得护盾并提高伤害减免。', [{ type: 'shield', base: 30, scaling: { vitality: .9 } }, { type: 'buff', stat: 'damageReduction', value: 5, duration: 2 }], { tier: 'difficult', aiScore: 31 }),
    enemyCard('enemy_soul_siphon', '噬魂汲取', 'skill', '造成暗属性魔法伤害并恢复生命。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 23, scaling: { magicalAttack: .85 } }, { type: 'heal', base: 12, scaling: { spirit: .35 } }], { tier: 'difficult', aiScore: 38 }),
    enemyCard('enemy_plague_bite', '疫毒撕咬', 'attack', '以较低直伤施加2层中毒。', [{ type: 'damage', base: 20, scaling: { physicalAttack: .72 } }, { type: 'status', status: 'poison', stacks: 2, duration: 3 }], { tier: 'difficult', attackStyle: 'claw', attackState: { from: ['standing'], to: 'standing' }, aiScore: 40 }),
    enemyCard('enemy_armor_gouge', '裂甲角击', 'attack', '撞击并击飞目标；目标拥有护盾时伤害提高15%。', [{ type: 'damage', base: 23, scaling: { physicalAttack: .9 } }, { type: 'setState', value: 'launched' }], { tier: 'difficult', attackStyle: 'launch', attackState: { from: ['standing'], to: 'launched' }, conditionalDamage: condition('targetHasShield', .15, '目标拥有护盾时，伤害提高15%。'), aiScore: 42, tags: ['怪物', '破盾追猎', '击飞'] }),
    enemyCard('enemy_mana_gnaw', '噬魔啃咬', 'skill', '造成暗属性魔法伤害并侵蚀目标MP。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 20, scaling: { magicalAttack: .7 } }, { type: 'drainMp', base: 8 }], { tier: 'difficult', aiScore: 39, tags: ['怪物', 'MP侵蚀'] }),
    enemyCard('enemy_execution_mark', '行刑标记', 'skill', '造成暗属性魔法伤害并施加易伤。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 18, scaling: { magicalAttack: .65 } }, { type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }], { tier: 'difficult', aiScore: 41, tags: ['怪物', '易伤'] }),
    enemyCard('enemy_mutation_molt', '蜕壳增殖', 'defense', '按已损生命恢复少量生命并获得护盾。', [{ type: 'healMissing', value: 5 }, { type: 'shield', base: 20, scaling: { vitality: .65 } }], { tier: 'difficult', aiScore: 34, tags: ['怪物', '残血防御'] }),
    enemyCard('enemy_shield_ram', '碎盾冲撞', 'attack', '撞击站立目标；目标拥有护盾时伤害提高16%。', [{ type: 'damage', base: 25, scaling: { physicalAttack: .92 } }], { tier: 'difficult', attackStyle: 'strike', attackState: { from: ['standing'], to: 'standing' }, conditionalDamage: condition('targetHasShield', .16, '目标拥有护盾时，伤害提高16%。'), aiScore: 42, tags: ['怪物', '破盾追猎'] }),
    enemyCard('enemy_sky_ripper', '裂空双爪', 'attack', '连续撕裂击飞目标两次，随后使其进入浮空状态。', [{ type: 'damage', base: 11, scaling: { physicalAttack: .38 }, hitIndex: 1, hitCount: 2 }, { type: 'damage', base: 11, scaling: { physicalAttack: .38 }, hitIndex: 2, hitCount: 2 }, { type: 'setState', value: 'airborne' }], { tier: 'difficult', attackStyle: 'air', attackState: { from: ['launched'], to: 'airborne' }, aiScore: 47, tags: ['怪物', '二段', '浮空追击'] }),
    enemyCard('enemy_bone_crusher', '碎骨踏击', 'attack', '重踏站立或浮空目标并将其击倒。', [{ type: 'damage', base: 29, scaling: { physicalAttack: 1.05 } }, { type: 'setState', value: 'knockedDown' }], { tier: 'difficult', attackStyle: 'finisher', attackState: { from: ['standing', 'airborne'], to: 'knockedDown' }, aiScore: 48, tags: ['怪物', '击倒', '终结'] }),
    enemyCard('enemy_burning_ichor', '燃血喷涌', 'skill', '喷涌燃血造成火属性魔法伤害并施加2层灼烧。', [{ type: 'damage', damageType: 'magical', element: 'fire', base: 23, scaling: { magicalAttack: .82 } }, { type: 'status', status: 'burn', stacks: 2, duration: 3 }], { tier: 'difficult', aiScore: 43, tags: ['怪物', '火', '灼烧'] }),
    enemyCard('enemy_frost_breath', '霜息侵袭', 'skill', '吐出寒息造成冰属性魔法伤害并施加2层冰冻。', [{ type: 'damage', damageType: 'magical', element: 'ice', base: 22, scaling: { magicalAttack: .78 } }, { type: 'status', status: 'frozen', stacks: 2, duration: 2 }], { tier: 'difficult', aiScore: 43, tags: ['怪物', '冰', '冰冻'] }),
    enemyCard('enemy_reflective_shell', '镜刺甲壳', 'defense', '获得护盾并反弹下一次受到的部分伤害。', [{ type: 'shield', base: 24, scaling: { vitality: .72 } }, { type: 'thorns', ratio: 22, uses: 1, duration: 2 }], { tier: 'difficult', aiScore: 35, tags: ['怪物', '反伤'] }),
    enemyCard('enemy_predation_command', '捕食号令', 'buff', '提高物理攻击与伤害。', [{ type: 'buff', stat: 'physicalAttack', value: 8, duration: 2 }, { type: 'buff', stat: 'damageIncrease', value: 4, duration: 2 }], { tier: 'difficult', aiScore: 33, tags: ['怪物', '物理爆发'] }),
    enemyCard('enemy_hex_overload', '咒力过载', 'buff', '提高魔法攻击与技能伤害。', [{ type: 'buff', stat: 'magicalAttack', value: 9, duration: 2 }, { type: 'buff', stat: 'skillAttack', value: 4, duration: 2 }], { tier: 'difficult', aiScore: 33, tags: ['怪物', '魔法爆发'] }),

    enemyCard('enemy_nightmare_upper', '梦魇升击', 'attack', '强力击飞目标并允许连续衔接。', [{ type: 'damage', base: 25, scaling: { physicalAttack: .9 } }, { type: 'setState', value: 'launched' }], { tier: 'nightmare', attackStyle: 'launch', attackState: { from: ['standing', 'airborne', 'launched'], to: 'launched', allowSame: true }, aiScore: 43 }),
    enemyCard('enemy_void_execution', '虚空处决', 'attack', '以击飞连段终结目标并将其击倒。', [{ type: 'damage', base: 40, scaling: { physicalAttack: 1.3 } }, { type: 'setState', value: 'knockedDown' }], { tier: 'nightmare', attackStyle: 'finisher', attackState: { from: ['standing', 'launched', 'airborne'], to: 'knockedDown' }, conditionalDamage: condition('priorAttackStyleOnly', .18, '本回合此前只打出过击飞类进攻牌时，伤害提高18%。', { style: 'launch' }), aiScore: 60 }),
    enemyCard('enemy_bloodstorm', '血暴连击', 'attack', '自身生命较低时强化连击并施加流血。', [{ type: 'damage', base: 32, scaling: { physicalAttack: 1.1 } }, { type: 'status', status: 'bleed', stacks: 2, duration: 3 }], { tier: 'nightmare', attackStyle: 'claw', attackState: { from: ['standing'], to: 'standing' }, conditionalDamage: condition('actorHpBelow', .18, '自身生命低于45%时，伤害提高18%。', { threshold: .45 }), aiScore: 50 }),
    enemyCard('enemy_abyss_carapace', '深渊甲壳', 'defense', '获得护盾与短暂再生。', [{ type: 'shield', base: 42, scaling: { vitality: 1.1 } }, { type: 'status', status: 'regeneration', stacks: 2, duration: 2, target: 'self' }], { tier: 'nightmare', aiScore: 43 }),
    enemyCard('enemy_annihilation_ray', '湮灭射线', 'skill', '对高生命目标造成暗属性魔法伤害。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 38, scaling: { magicalAttack: 1.2 } }], { tier: 'nightmare', conditionalDamage: condition('targetHpAbove', .18, '目标生命高于60%时，伤害提高18%。', { threshold: .6 }), aiScore: 54 }),
    enemyCard('enemy_predatory_focus', '猎杀专注', 'buff', '提高伤害并额外抽取一张牌。', [{ type: 'buff', stat: 'damageIncrease', value: 9, duration: 2 }, { type: 'draw', value: 1 }], { tier: 'nightmare', aiScore: 40 }),
    enemyCard('enemy_glacial_curse', '极寒诅咒', 'skill', '造成冰属性魔法伤害并施加3层冰冻。', [{ type: 'damage', damageType: 'magical', element: 'ice', base: 28, scaling: { magicalAttack: .92 } }, { type: 'status', status: 'frozen', stacks: 3, duration: 3 }], { tier: 'nightmare', aiScore: 52 }),
    enemyCard('enemy_threefold_rend', '三重裂杀', 'attack', '连续攻击三次，最后施加2层流血。', [{ type: 'damage', base: 11, scaling: { physicalAttack: .38 }, hitIndex: 1, hitCount: 3 }, { type: 'damage', base: 11, scaling: { physicalAttack: .38 }, hitIndex: 2, hitCount: 3 }, { type: 'damage', base: 11, scaling: { physicalAttack: .38 }, hitIndex: 3, hitCount: 3 }, { type: 'status', status: 'bleed', stacks: 2, duration: 3 }], { tier: 'nightmare', attackStyle: 'claw', attackState: { from: ['standing'], to: 'standing' }, aiScore: 52, tags: ['怪物', '三段', '流血'] }),
    enemyCard('enemy_abyss_brand', '深渊刻印', 'skill', '先造成暗属性伤害，再埋下会被后续命中引爆的刻印。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 18, scaling: { magicalAttack: .55 } }, { type: 'delayedBurst', damageType: 'magical', element: 'dark', base: 26, scaling: { magicalAttack: .85 } }], { tier: 'nightmare', aiScore: 55, tags: ['怪物', '延迟爆发'] }),
    enemyCard('enemy_doom_siphon', '末日汲取', 'skill', '造成暗属性魔法伤害，并按已损生命恢复自身。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 36, scaling: { magicalAttack: 1.1 } }, { type: 'healMissing', value: 4 }], { tier: 'nightmare', aiScore: 56, tags: ['怪物', '汲取'] }),
    enemyCard('enemy_predator_sentence', '猎杀宣判', 'attack', '重击并击倒目标；目标生命低于40%时伤害提高20%。', [{ type: 'damage', base: 36, scaling: { physicalAttack: 1.15 } }, { type: 'setState', value: 'knockedDown' }], { tier: 'nightmare', attackStyle: 'finisher', attackState: { from: ['standing', 'airborne'], to: 'knockedDown' }, conditionalDamage: condition('targetHpBelow', .2, '目标生命低于40%时，伤害提高20%。', { threshold: .4 }), aiScore: 61, tags: ['怪物', '残血处决'] }),
    enemyCard('enemy_fourfold_maul', '四重虐杀', 'attack', '连续撕裂目标四次并施加2层流血。', [{ type: 'damage', base: 9, scaling: { physicalAttack: .3 }, hitIndex: 1, hitCount: 4 }, { type: 'damage', base: 9, scaling: { physicalAttack: .3 }, hitIndex: 2, hitCount: 4 }, { type: 'damage', base: 9, scaling: { physicalAttack: .3 }, hitIndex: 3, hitCount: 4 }, { type: 'damage', base: 9, scaling: { physicalAttack: .3 }, hitIndex: 4, hitCount: 4 }, { type: 'status', status: 'bleed', stacks: 2, duration: 3 }], { tier: 'nightmare', attackStyle: 'claw', attackState: { from: ['standing'], to: 'standing' }, aiScore: 56, tags: ['怪物', '四段', '流血'] }),
    enemyCard('enemy_abyss_launch', '深渊升腾', 'attack', '以深渊冲击持续击飞目标，可连续衔接。', [{ type: 'damage', base: 27, scaling: { physicalAttack: .95 } }, { type: 'setState', value: 'launched' }], { tier: 'nightmare', attackStyle: 'launch', attackState: { from: ['standing', 'airborne', 'launched'], to: 'launched', allowSame: true }, aiScore: 47, tags: ['怪物', '击飞'] }),
    enemyCard('enemy_gravebreaker', '墓穴追刑', 'attack', '追击倒地目标并使其眩晕，追击时造成额外伤害。', [{ type: 'damage', base: 34, scaling: { physicalAttack: 1.1 } }, { type: 'setState', value: 'stunned' }], { tier: 'nightmare', attackStyle: 'ground', attackState: { from: ['knockedDown'], to: 'stunned' }, conditionalDamage: condition('targetState', .2, '目标处于击倒状态时，伤害提高20%。', { states: ['knockedDown'] }), aiScore: 63, tags: ['怪物', '倒地追击', '眩晕'] }),
    enemyCard('enemy_scorching_plague', '灾焰毒潮', 'skill', '灾焰造成火属性魔法伤害，同时施加灼烧与中毒。', [{ type: 'damage', damageType: 'magical', element: 'fire', base: 27, scaling: { magicalAttack: .86 } }, { type: 'status', status: 'burn', stacks: 2, duration: 3 }, { type: 'status', status: 'poison', stacks: 1, duration: 3 }], { tier: 'nightmare', aiScore: 57, tags: ['怪物', '灼烧', '中毒'] }),
    enemyCard('enemy_chain_lightning', '蚀骨雷链', 'skill', '雷链造成两段光属性魔法伤害并施加易伤。', [{ type: 'damage', damageType: 'magical', element: 'light', base: 16, scaling: { magicalAttack: .48 }, hitIndex: 1, hitCount: 2 }, { type: 'damage', damageType: 'magical', element: 'light', base: 16, scaling: { magicalAttack: .48 }, hitIndex: 2, hitCount: 2 }, { type: 'status', status: 'vulnerable', stacks: 1, duration: 2 }], { tier: 'nightmare', aiScore: 58, tags: ['怪物', '二段', '易伤'] }),
    enemyCard('enemy_void_mirror', '虚空镜甲', 'defense', '获得护盾并格挡下一次伤害，反震部分被减免的伤害。', [{ type: 'shield', base: 36, scaling: { vitality: 1 } }, { type: 'guard', reduction: 28, uses: 1, duration: 2, counterRatio: 20 }], { tier: 'nightmare', aiScore: 47, tags: ['怪物', '格挡反震'] }),
    enemyCard('enemy_killing_instinct', '屠戮本能', 'buff', '提高伤害与物理暴击，并额外抽取一张牌。', [{ type: 'buff', stat: 'damageIncrease', value: 8, duration: 2 }, { type: 'buff', stat: 'physicalCrit', value: 6, duration: 2 }, { type: 'draw', value: 1 }], { tier: 'nightmare', aiScore: 46, tags: ['怪物', '物理爆发', '抽牌'] }),
    enemyCard('enemy_occult_surge', '邪术涌动', 'buff', '提高技能伤害与魔法暴击，并额外抽取一张牌。', [{ type: 'buff', stat: 'skillAttack', value: 8, duration: 2 }, { type: 'buff', stat: 'magicalCrit', value: 6, duration: 2 }, { type: 'draw', value: 1 }], { tier: 'nightmare', aiScore: 46, tags: ['怪物', '魔法爆发', '抽牌'] }),

    enemyCard('enemy_boss_crush', '首领碾压', 'skill', '首领重击并眩晕目标。', [{ type: 'damage', base: 42, scaling: { physicalAttack: 1.35 } }, { type: 'setState', value: 'stunned' }], { tier: 'boss', aiScore: 64 }),
    enemyCard('enemy_boss_barrier', '首领屏障', 'defense', '获得大量护盾。', [{ type: 'shield', base: 45, scaling: { vitality: 1.2 } }], { tier: 'boss', aiScore: 38 }),
    enemyCard('boss_briar_bind', '荆棘缠缚', 'skill', '荆棘撕裂目标并施加流血与虚弱。', [{ type: 'damage', element: 'dark', base: 34, scaling: { physicalAttack: 1.1 } }, { type: 'status', status: 'bleed', stacks: 3, duration: 3 }, { type: 'status', status: 'weak', stacks: 1, duration: 2 }], { tier: 'boss', aiScore: 62 }),
    enemyCard('boss_fog_plague', '腐雾侵蚀', 'skill', '腐雾造成较低魔法伤害并施加4层中毒。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 31, scaling: { magicalAttack: 1.02 } }, { type: 'status', status: 'poison', stacks: 4, duration: 4 }], { tier: 'boss', aiScore: 64 }),
    enemyCard('boss_aether_storm', '天穹雷暴', 'skill', '雷暴造成光属性魔法伤害。', [{ type: 'damage', damageType: 'magical', element: 'light', base: 48, scaling: { magicalAttack: 1.35 } }], { tier: 'boss', aiScore: 68 }),
    enemyCard('boss_harbor_cannon', '巨港舰炮', 'skill', '舰炮轰击并击倒目标。', [{ type: 'damage', element: 'fire', base: 54, scaling: { physicalAttack: 1.45 } }, { type: 'setState', value: 'knockedDown' }], { tier: 'boss', aiScore: 70 }),
    enemyCard('boss_mana_devour', '魔力吞噬', 'skill', '首领造成暗属性魔法伤害并大量侵蚀目标MP。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 34, scaling: { magicalAttack: 1.05 } }, { type: 'drainMp', base: 14 }], { tier: 'boss', aiScore: 65, tags: ['怪物', '首领', 'MP侵蚀'] }),
    enemyCard('boss_iron_decree', '铁壁敕令', 'defense', '获得护盾，下一次受到的单次伤害不会超过最大生命的28%。', [{ type: 'shield', base: 38, scaling: { vitality: 1 } }, { type: 'damageCap', ratio: 28, uses: 1, duration: 2 }], { tier: 'boss', aiScore: 48, tags: ['怪物', '首领', '伤害上限'] }),
    enemyCard('boss_cataclysm_mark', '灾厄刻印', 'skill', '造成暗属性魔法伤害，并留下更强的延迟爆发标记。', [{ type: 'damage', damageType: 'magical', element: 'dark', base: 25, scaling: { magicalAttack: .75 } }, { type: 'delayedBurst', damageType: 'magical', element: 'dark', base: 38, scaling: { magicalAttack: 1.15 } }], { tier: 'boss', aiScore: 69, tags: ['怪物', '首领', '延迟爆发'] }),
    enemyCard('boss_execution_protocol', '终焉协议', 'attack', '连续重击两次并击倒目标；目标生命低于45%时伤害提高25%。', [{ type: 'damage', base: 22, scaling: { physicalAttack: .65 }, hitIndex: 1, hitCount: 2 }, { type: 'damage', base: 22, scaling: { physicalAttack: .65 }, hitIndex: 2, hitCount: 2 }, { type: 'setState', value: 'knockedDown' }], { tier: 'boss', attackStyle: 'finisher', attackState: { from: ['standing', 'airborne'], to: 'knockedDown' }, conditionalDamage: condition('targetHpBelow', .25, '目标生命低于45%时，伤害提高25%。', { threshold: .45 }), aiScore: 73, tags: ['怪物', '首领', '二段', '残血处决'] }),
];

export const PEAK_ENEMY_CARD_BY_ID = Object.fromEntries(PEAK_ENEMY_CARDS.map((entry) => [entry.id, entry]));
export const PEAK_ENEMY_SHARED_PLAYER_CARD_IDS = Object.freeze([
    'straight_slash', 'air_chaser', 'breaking_wheel_kick', 'queue_attack_all_common_2',
    'universal_five_attack_common_2', 'universal_five_attack_common_3', 'universal_five_attack_excellent_1',
    'brace', 'second_wind', 'iron_will', 'field_bandage', 'emergency_guard',
    'universal_defense_common_2', 'universal_five_defense_common_2',
    'battle_instinct', 'arcane_focus', 'universal_five_buff_common_3', 'universal_five_buff_common_4',
    'tactical_observation', 'battle_flow',
    'elemental_all_common_fire_1', 'elemental_all_common_ice_1',
    'elemental_all_common_light_1', 'elemental_all_common_dark_1',
]);
const enemySharedCardAiScores = {
    straight_slash: 22, air_chaser: 31, brace: 18, second_wind: 17,
    battle_instinct: 22, arcane_focus: 22, emergency_guard: 26, tactical_observation: 27,
    breaking_wheel_kick: 30, queue_attack_all_common_2: 24,
    universal_five_attack_common_2: 27, universal_five_attack_common_3: 31,
    universal_five_attack_excellent_1: 28,
    iron_will: 29, field_bandage: 16, universal_defense_common_2: 23,
    universal_five_defense_common_2: 22,
    universal_five_buff_common_3: 23, universal_five_buff_common_4: 20,
    battle_flow: 28,
    elemental_all_common_fire_1: 27, elemental_all_common_ice_1: 27,
    elemental_all_common_light_1: 27, elemental_all_common_dark_1: 27,
};
export const PEAK_ENEMY_SHARED_PLAYER_CARDS = PEAK_ENEMY_SHARED_PLAYER_CARD_IDS.map((id) => {
    const source = PEAK_CARD_BY_ID[id];
    if (!source || source.classId !== 'all' || !['common', 'excellent'].includes(source.rarity) || source.category === 'special') throw new Error(`怪物通用卡白名单无效：${id}`);
    if (source.effects.some((effect) => effect.type === 'restoreMp')) throw new Error(`怪物不能使用回蓝卡：${id}`);
    return {
        ...source,
        cost: enemyMpCosts.normal[source.category] || 3,
        tier: 'normal',
        monsterShared: true,
        aiScore: enemySharedCardAiScores[id] || 18,
        tags: [...new Set([...(source.tags || []), '怪物可用'])],
    };
});
export const PEAK_ENEMY_BATTLE_CARD_BY_ID = Object.freeze({
    ...PEAK_ENEMY_CARD_BY_ID,
    ...Object.fromEntries(PEAK_ENEMY_SHARED_PLAYER_CARDS.map((entry) => [entry.id, entry])),
});
export const PEAK_ENEMY_CARD_TIERS = {
    normal: PEAK_ENEMY_CARDS.filter((entry) => entry.tier === 'normal').map((entry) => entry.id),
    difficult: PEAK_ENEMY_CARDS.filter((entry) => entry.tier === 'difficult').map((entry) => entry.id),
    nightmare: PEAK_ENEMY_CARDS.filter((entry) => entry.tier === 'nightmare').map((entry) => entry.id),
    boss: PEAK_ENEMY_CARDS.filter((entry) => entry.tier === 'boss').map((entry) => entry.id),
};
const enemyDecks = {
    normal: {
        melee: [
            'enemy_probe', 'straight_slash', 'enemy_probe', 'queue_attack_all_common_2',
            'universal_five_attack_excellent_1', 'enemy_raking_claws', 'enemy_tail_launcher',
            'enemy_swooping_pounce', 'enemy_claw', 'enemy_pack_fangs', 'enemy_hook_claw',
            'enemy_air_follow', 'enemy_heavy', 'enemy_carapace', 'brace', 'enemy_hide_hardening',
            'universal_five_defense_common_2', 'enemy_rock_spines', 'enemy_guard', 'enemy_battle_cry',
            'enemy_savage_posture', 'universal_five_buff_common_3', 'enemy_venom_spit',
            'field_bandage', 'second_wind', 'enemy_recover',
        ],
        caster: [
            'enemy_dark_spark', 'enemy_spore_burst', 'enemy_ember_spit', 'enemy_static_pulse',
            'elemental_all_common_fire_1', 'elemental_all_common_ice_1', 'enemy_bolt',
            'enemy_venom_spit', 'enemy_frost_touch', 'arcane_focus', 'enemy_spell_focus',
            'enemy_mystic_posture', 'universal_five_buff_common_4', 'enemy_mist_ward',
            'enemy_hide_hardening', 'emergency_guard', 'universal_defense_common_2', 'enemy_carapace',
            'enemy_guard', 'enemy_recover', 'enemy_hook_claw', 'enemy_air_follow', 'battle_flow',
            'tactical_observation', 'enemy_bolt',
        ],
    },
    difficult: {
        melee: [
            'enemy_probe', 'enemy_claw', 'enemy_hunting_rend', 'enemy_plague_bite', 'enemy_armor_gouge',
            'enemy_launcher', 'air_chaser', 'breaking_wheel_kick', 'enemy_shield_ram', 'enemy_sky_ripper',
            'enemy_bone_crusher', 'universal_five_attack_common_2', 'universal_five_attack_common_3',
            'enemy_air_slam', 'enemy_desperate_maul', 'battle_instinct', 'enemy_predation_command',
            'universal_five_buff_common_3', 'enemy_curse_armor', 'iron_will', 'enemy_reflective_shell',
            'emergency_guard', 'enemy_mutation_molt', 'enemy_guard', 'enemy_rage', 'enemy_ground_hit',
            'enemy_recover', 'enemy_heavy', 'enemy_air_follow',
        ],
        caster: [
            'enemy_dark_spark', 'enemy_frost_touch', 'enemy_soul_siphon', 'enemy_mana_gnaw',
            'enemy_execution_mark', 'enemy_plague_bite', 'enemy_burning_ichor', 'enemy_frost_breath',
            'elemental_all_common_fire_1', 'elemental_all_common_ice_1', 'elemental_all_common_light_1',
            'elemental_all_common_dark_1', 'arcane_focus', 'enemy_spell_focus', 'enemy_hex_overload',
            'universal_five_buff_common_4', 'enemy_curse_armor', 'emergency_guard',
            'enemy_reflective_shell', 'universal_defense_common_2', 'enemy_mutation_molt', 'enemy_guard',
            'second_wind', 'enemy_recover', 'enemy_launcher', 'enemy_air_slam', 'enemy_hunting_rend',
            'battle_flow', 'tactical_observation', 'enemy_bolt', 'enemy_air_follow', 'enemy_venom_spit',
        ],
    },
    nightmare: {
        melee: [
            'enemy_hunting_rend', 'enemy_bloodstorm', 'enemy_threefold_rend', 'enemy_plague_bite',
            'straight_slash', 'queue_attack_all_common_2', 'enemy_nightmare_upper',
            'enemy_nightmare_upper', 'enemy_abyss_launch', 'enemy_fourfold_maul', 'enemy_gravebreaker',
            'air_chaser', 'breaking_wheel_kick', 'universal_five_attack_common_2',
            'universal_five_attack_common_3', 'universal_five_attack_excellent_1', 'enemy_void_execution',
            'enemy_predator_sentence', 'enemy_air_slam', 'enemy_desperate_maul', 'iron_will',
            'enemy_void_mirror', 'universal_defense_common_2', 'emergency_guard', 'enemy_abyss_carapace',
            'enemy_curse_armor', 'enemy_predatory_focus', 'enemy_killing_instinct',
            'universal_five_buff_common_3', 'enemy_ground_hit', 'enemy_heavy', 'enemy_glacial_curse',
            'enemy_recover', 'enemy_rage',
        ],
        caster: [
            'enemy_soul_siphon', 'enemy_doom_siphon', 'enemy_abyss_brand', 'enemy_annihilation_ray',
            'enemy_glacial_curse', 'enemy_nightmare_upper', 'enemy_void_execution', 'enemy_dark_spark',
            'enemy_frost_touch', 'enemy_scorching_plague', 'enemy_chain_lightning',
            'elemental_all_common_fire_1', 'elemental_all_common_ice_1', 'elemental_all_common_light_1',
            'elemental_all_common_dark_1', 'arcane_focus', 'enemy_spell_focus', 'enemy_occult_surge',
            'universal_five_buff_common_3', 'universal_five_buff_common_4', 'iron_will',
            'enemy_void_mirror', 'universal_defense_common_2', 'emergency_guard', 'enemy_abyss_carapace',
            'enemy_curse_armor', 'enemy_predatory_focus', 'enemy_killing_instinct', 'second_wind',
            'enemy_recover', 'enemy_air_slam', 'enemy_plague_bite', 'battle_flow',
            'tactical_observation', 'enemy_bolt', 'enemy_guard',
        ],
    },
};

export const PEAK_ENEMY_ARCHETYPES = Object.freeze({
    assault: {
        id: 'assault', name: '强攻', pool: 'melee',
        categoryTargets: { attack: 8, skill: 3, defense: 2, buff: 3 },
        categoryWeights: { attack: 1.35, skill: 1.08, defense: .72, buff: .92 },
        tactics: '以前压进攻和击飞终结压缩你的调整回合',
    },
    bastion: {
        id: 'bastion', name: '堡垒', pool: 'melee',
        categoryTargets: { attack: 3, skill: 2, defense: 7, buff: 4 },
        categoryWeights: { attack: .82, skill: .82, defense: 1.45, buff: 1.12 },
        lowHpDefenseMultiplier: 1.65,
        tactics: '以护盾、恢复和减伤拖长战斗，再寻找反击窗口',
    },
    caster: {
        id: 'caster', name: '术士', pool: 'caster',
        categoryTargets: { attack: 2, skill: 8, defense: 3, buff: 3 },
        categoryWeights: { attack: .7, skill: 1.45, defense: .9, buff: 1.14 },
        magicalMultiplier: 1.2,
        tactics: '连续施放元素技能，并用法术增益放大异常伤害',
    },
    attrition: {
        id: 'attrition', name: '消耗', pool: 'caster',
        categoryTargets: { attack: 4, skill: 6, defense: 3, buff: 3 },
        categoryWeights: { attack: .96, skill: 1.22, defense: 1.02, buff: 1.05 },
        statusMultiplier: 1.32,
        tactics: '叠加中毒、流血和灼烧，并依靠续航扩大回合优势',
    },
    control: {
        id: 'control', name: '控制', pool: 'caster',
        categoryTargets: { attack: 4, skill: 6, defense: 3, buff: 3 },
        categoryWeights: { attack: 1.05, skill: 1.18, defense: .96, buff: .94 },
        stateMultiplier: 1.35,
        tactics: '频繁改变目标状态，打断站立起手并制造控制连段',
    },
    hybrid: {
        id: 'hybrid', name: '均衡', pool: 'melee',
        categoryTargets: { attack: 5, skill: 5, defense: 3, buff: 3 },
        categoryWeights: { attack: 1, skill: 1, defense: 1, buff: 1 },
        tactics: '牌序均衡，会根据手牌在进攻、防守和强化之间切换',
    },
});

const ENEMY_ARCHETYPE_BY_ID = Object.freeze({
    mossGoblin: 'assault', grayWolf: 'attrition', stoneGuard: 'bastion', mistPriest: 'caster',
    skyPatrol: 'control', gearGolem: 'bastion', cloudExecutioner: 'assault', nightStalker: 'attrition',
    briarTyrant: 'control', fogMatriarch: 'attrition', aetherWarden: 'caster', harborDreadnought: 'bastion',
    frostSovereign: 'control', nightRegent: 'hybrid', plagueEngine: 'attrition', riftArbiter: 'hybrid',
    abyssGoblinRaider: 'assault', abyssShadowWolf: 'attrition', abyssStoneGolem: 'bastion', abyssVoidMage: 'caster',
    abyssFrostLancer: 'control', abyssClockworkGolem: 'bastion', abyssFrostWarrior: 'assault', abyssShadowWraith: 'caster',
});

export const enemyArchetypeFor = (enemyId) => ENEMY_ARCHETYPE_BY_ID[enemyId] || 'hybrid';

const enemyDeckRotation = (enemyId) => [...String(enemyId || '')].reduce((total, character) => total + character.codePointAt(0), 0);

const buildArchetypeDeck = (pool, targets, requiredIds = [], rotation = 0) => {
    const validPool = pool.filter((id) => PEAK_ENEMY_BATTLE_CARD_BY_ID[id]);
    const buckets = Object.fromEntries(Object.keys(targets).map((category) => [
        category,
        validPool.filter((id) => PEAK_ENEMY_BATTLE_CARD_BY_ID[id].category === category),
    ]));
    const result = requiredIds.filter((id) => PEAK_ENEMY_BATTLE_CARD_BY_ID[id]);
    Object.entries(targets).forEach(([category, target]) => {
        const bucket = buckets[category] || [];
        if (!bucket.length) return;
        const alreadyPresent = result.filter((id) => PEAK_ENEMY_BATTLE_CARD_BY_ID[id].category === category).length;
        for (let index = alreadyPresent; index < target; index += 1) result.push(bucket[(index + rotation) % bucket.length]);
    });
    const fallback = validPool.length ? validPool : PEAK_ENEMY_CARD_TIERS.normal;
    for (let index = 0; result.length < 16 && fallback.length; index += 1) result.push(fallback[index % fallback.length]);
    return result.slice(0, 20);
};

const bossCards = ['enemy_boss_crush', 'enemy_boss_barrier', 'boss_mana_devour', 'boss_iron_decree', 'boss_cataclysm_mark', 'boss_execution_protocol', 'enemy_launcher', 'enemy_air_follow', 'enemy_air_finish'];
const bossSignature = {
    briarTyrant: 'boss_briar_bind', fogMatriarch: 'boss_fog_plague', aetherWarden: 'boss_aether_storm', harborDreadnought: 'boss_harbor_cannon',
    frostSovereign: 'boss_aether_storm', nightRegent: 'boss_fog_plague', plagueEngine: 'boss_fog_plague', riftArbiter: 'boss_briar_bind',
    abyssGoblinRaider: 'boss_briar_bind', abyssShadowWolf: 'boss_harbor_cannon', abyssStoneGolem: 'boss_harbor_cannon', abyssVoidMage: 'boss_fog_plague',
    abyssFrostLancer: 'boss_aether_storm', abyssClockworkGolem: 'boss_harbor_cannon', abyssFrostWarrior: 'boss_aether_storm', abyssShadowWraith: 'boss_fog_plague',
};
const ENEMY_LOADOUT_SIGNATURES = Object.freeze({
    grayWolf: 'enemy_pack_fangs',
    gearGolem: 'enemy_armor_gouge',
    abyssShadowWraith: 'enemy_occult_surge',
    mistPriest: 'field_bandage',
});
const PEAK_STANDARD_BOSS_ROTATION = ['briarTyrant', 'fogMatriarch', 'aetherWarden', 'harborDreadnought', 'frostSovereign', 'nightRegent', 'plagueEngine', 'riftArbiter'];
const PEAK_ABYSS_BOSS_ROTATION = ['abyssGoblinRaider', 'abyssShadowWolf', 'abyssStoneGolem', 'abyssVoidMage', 'abyssFrostLancer', 'abyssClockworkGolem', 'abyssFrostWarrior', 'abyssShadowWraith'];
const PEAK_MINION_ROTATION = [
    ['mossGoblin', 'grayWolf'], ['stoneGuard', 'mistPriest'], ['skyPatrol', 'gearGolem'], ['cloudExecutioner', 'nightStalker'],
    ['grayWolf', 'stoneGuard'], ['mistPriest', 'skyPatrol'], ['gearGolem', 'cloudExecutioner'], ['nightStalker', 'mossGoblin'],
];
const PEAK_ABYSS_BOSSES = {
    abyssGoblinRaider: { name: '深渊·哥布林统领' }, abyssShadowWolf: { name: '深渊·影狼王' },
    abyssStoneGolem: { name: '深渊·巨岩魔像' }, abyssVoidMage: { name: '深渊·虚空大法师' },
    abyssFrostLancer: { name: '深渊·霜枪领主' }, abyssClockworkGolem: { name: '深渊·机巧巨神' },
    abyssFrostWarrior: { name: '深渊·寒武战神' }, abyssShadowWraith: { name: '深渊·暗影魂主' },
};
const enemyTierForLevel = (level) => level <= 16 ? 'normal' : level <= 24 ? 'difficult' : 'nightmare';
const enemyTactics = { normal: '基础攻防', difficult: '条件压制与续航', nightmare: '连段处决与深渊防护' };
export const enemyDeckFor = (enemyId, boss, level, { introBoss = false } = {}) => {
    const tier = enemyTierForLevel(level);
    const archetype = PEAK_ENEMY_ARCHETYPES[enemyArchetypeFor(enemyId)] || PEAK_ENEMY_ARCHETYPES.hybrid;
    const pool = enemyDecks[tier][archetype.pool];
    const tierRank = { normal: 0, difficult: 1, nightmare: 2, boss: 3 };
    const signature = ENEMY_LOADOUT_SIGNATURES[enemyId];
    const signatureCard = signature && PEAK_ENEMY_BATTLE_CARD_BY_ID[signature];
    const loadoutSignature = signatureCard && (tierRank[signatureCard.tier] ?? 0) <= (tierRank[tier] ?? 0) ? [signature] : [];
    const bossSignatureCards = bossSignature[enemyId] ? [bossSignature[enemyId]] : [];
    const required = boss
        ? introBoss
            ? [...loadoutSignature, ...bossSignatureCards]
            : [...loadoutSignature, ...bossCards, ...bossSignatureCards, ...bossSignatureCards]
        : loadoutSignature;
    return buildArchetypeDeck(pool, archetype.categoryTargets, required, enemyDeckRotation(enemyId));
};

const staminaCostForOrder = (order) => [1, 1, 2, 2, 3, 3, 4, 4][order] || 4;
export const PEAK_DIFFICULTY_TIERS = [
    {
        id: 'normal', name: '普通', levelBonus: 0, cardLevelBonus: 0, drawBonus: 0, staminaBonus: 0,
        goldMultiplier: .78, xpMultiplier: .86, itemBonus: 0, rarityBoost: 0, minionDropChance: .04,
        hpMultiplier: 1.1, attackMultiplier: 1.09, defenseMultiplier: 1.05,
        lootHint: '基础品质', tone: '#68b9c8',
    },
    {
        id: 'elite', name: '精英', levelBonus: 1, cardLevelBonus: 1, drawBonus: 0, staminaBonus: 0,
        goldMultiplier: 1.02, xpMultiplier: 1.08, itemBonus: 0, rarityBoost: 0, minionDropChance: .08,
        hpMultiplier: 1.18, attackMultiplier: 1.16, defenseMultiplier: 1.11,
        lootHint: '品质提升', tone: '#6d91eb',
    },
    {
        id: 'hard', name: '困难', levelBonus: 3, cardLevelBonus: 2, drawBonus: 1, staminaBonus: 1,
        goldMultiplier: 1.28, xpMultiplier: 1.28, itemBonus: 0, rarityBoost: 0, minionDropChance: .14,
        hpMultiplier: 1.29, attackMultiplier: 1.25, defenseMultiplier: 1.18,
        lootHint: '高品质提升', tone: '#df725d',
    },
];
export const PEAK_LATE_ENEMY_SCALING = Object.freeze({
    startLevel: 34,
    maxLevel: 50,
    hpBonus: .08,
    attackBonus: .06,
    defenseBonus: .05,
});
const lateEnemyScaleFor = (level, bonus) => {
    const progress = Math.max(0, Math.min(1, (level - PEAK_LATE_ENEMY_SCALING.startLevel)
        / (PEAK_LATE_ENEMY_SCALING.maxLevel - PEAK_LATE_ENEMY_SCALING.startLevel)));
    return 1 + progress * bonus;
};

const enemyDrawFor = (level, boss, difficulty) => Math.min(6,
    3 + (level >= 17 ? 1 : 0) + (level >= 29 ? 1 : 0) + difficulty.drawBonus + (boss && level >= 21 ? 1 : 0));
const buildDungeonEnemy = (enemyId, level, boss, scale, progressionRank, difficulty) => {
    const enemy = ABYSS_MONSTERS[enemyId] || ABYSS_BOSSES[enemyId] || PEAK_ABYSS_BOSSES[enemyId];
    const model = ABYSS_ASSETS.enemyModels[enemyId];
    const combatLevel = level + difficulty.cardLevelBonus * 3;
    const tier = enemyTierForLevel(combatLevel);
    const finalHardCardBonus = boss && level >= PEAK_LATE_ENEMY_SCALING.maxLevel && difficulty.id === 'hard' ? 1 : 0;
    const cardLevel = Math.min(10, 1 + Math.floor((progressionRank + 1) / 3) + finalHardCardBonus);
    const bossHp = boss ? 70 : 0;
    const bossAttack = boss ? 1 : 0;
    const lateHpScale = lateEnemyScaleFor(level, PEAK_LATE_ENEMY_SCALING.hpBonus);
    const lateAttackScale = lateEnemyScaleFor(level, PEAK_LATE_ENEMY_SCALING.attackBonus);
    const lateDefenseScale = lateEnemyScaleFor(level, PEAK_LATE_ENEMY_SCALING.defenseBonus);
    const maxHp = (336 + progressionRank * 87.4 + level * 20.2 + bossHp * 1.12) * scale * difficulty.hpMultiplier * lateHpScale;
    const combatAttack = (10.8 + progressionRank * 2.38 + level * .81 + bossAttack * 1.08) * scale * difficulty.attackMultiplier * lateAttackScale;
    const physicalDefense = (8.64 + progressionRank * 1.38 + level * .63 + (boss ? .54 : 0)) * (.94 + scale * .06) * difficulty.defenseMultiplier * lateDefenseScale;
    const magicalDefense = (7.56 + progressionRank * 1.3 + level * .58 + (boss ? .54 : 0)) * (.94 + scale * .06) * difficulty.defenseMultiplier * lateDefenseScale;
    const archetypeId = enemyArchetypeFor(enemyId);
    const archetype = PEAK_ENEMY_ARCHETYPES[archetypeId] || PEAK_ENEMY_ARCHETYPES.hybrid;
    const introBoss = boss && progressionRank === 0 && difficulty.id === 'normal';
    return {
        id: enemyId,
        name: enemy?.name || '未知敌人',
        image: model?.idleFile || model?.file || '',
        portrait: model?.portraitFile || model?.idleFile || model?.file || '',
        spriteSheet: model?.columns > 1 ? model.file : '',
        attackSheet: model?.columns > 1 ? model.file : '',
        eliteAttackSheet: model?.columns > 1 ? model.eliteFile : '',
        spriteColumns: model?.columns || 1,
        spriteRows: model?.rows || 1,
        spriteFrames: model?.frames || 1,
        spriteFps: model?.fps || 1,
        spriteSheetWidth: model?.sheetWidth || 0,
        spriteSheetHeight: model?.sheetHeight || 0,
        eliteAttackColumns: model?.attackColumns || 1,
        eliteAttackRows: model?.attackRows || 1,
        eliteAttackFrames: model?.attackFrames || 1,
        eliteAttackSheetWidth: model?.attackSheetWidth || 0,
        eliteAttackSheetHeight: model?.attackSheetHeight || 0,
        deck: enemyDeckFor(enemyId, boss, combatLevel, { introBoss }),
        introBossDeck: introBoss,
        tier,
        archetypeId,
        archetypeName: archetype.name,
        aiProfile: {
            categoryWeights: { ...archetype.categoryWeights },
            lowHpDefenseMultiplier: archetype.lowHpDefenseMultiplier || 1,
            magicalMultiplier: archetype.magicalMultiplier || 1,
            statusMultiplier: archetype.statusMultiplier || 1,
            stateMultiplier: archetype.stateMultiplier || 1,
        },
        tactics: `${boss ? '首领 · ' : ''}${archetype.name}流 · ${archetype.tactics}`,
        drawPerTurn: enemyDrawFor(level, boss, difficulty),
        cardLevel,
        level,
        maxMp: 60 + cardLevel * 4 + (boss ? 8 : 0),
        difficulty: difficulty.name,
        maxHp: Math.round(maxHp),
        combatAttack: Math.round(combatAttack),
        physicalDefense: Math.round(physicalDefense),
        magicalDefense: Math.round(magicalDefense),
        isBoss: boss,
    };
};

let peakDungeonOrder = 0;
const PEAK_GUARANTEED_GOLD_UNIT = 10;
const PEAK_MAP_GOLD_BASE_SCALE = [.58, .64, .74, .84, .96, 1.07, 1.18, 1.3];
const PEAK_MAP_GOLD_PROGRESS_BONUS = [1, 1, 1, 1.15, 1.15, 1.18, 1.20, 1.20];
const PEAK_MAP_GOLD_SCALE = PEAK_MAP_GOLD_BASE_SCALE.map((scale, index) => scale * PEAK_MAP_GOLD_PROGRESS_BONUS[index]);
const PEAK_MAP_XP_SCALE = [.72, .78, .85, .92, 1, 1.08, 1.16, 1.24];
export const PEAK_EARLY_HARD_REWARD_MULTIPLIER = 1.35;
const PEAK_HARD_CARD_REWARD_CHANCES = [.10, .11, .12, .13, .14, .16, .18, .20];
const hardCardRewardRates = (order) => {
    if (order < 2) return { common: 72, excellent: 23, rare: 4.5, scarce: .5 };
    if (order < 4) return { common: 58, excellent: 31, rare: 10, scarce: 1 };
    if (order < 6) return { common: 44, excellent: 36, rare: 17.5, scarce: 2.5 };
    return { common: 32, excellent: 38, rare: 25, scarce: 5 };
};
const dungeonRarityBoost = (order, difficultyId) => {
    if (order < 2) return 0;
    if (difficultyId === 'hard') return order >= 6 ? 2 : 1;
    if (difficultyId === 'elite' && order >= 6) return 1;
    return 0;
};
const dungeonBaseItemCount = (order, difficultyId) => {
    if (order < 2) return 1;
    if (order < 4) return difficultyId === 'hard' ? 2 : 1;
    if (order < 6) return difficultyId === 'normal' ? 1 : 2;
    return difficultyId === 'hard' ? 3 : 2;
};
export const PEAK_DUNGEON_BASE_LEVELS = Object.freeze([1, 5, 10, 16, 23, 31, 39, 47]);
export const PEAK_DUNGEONS = ABYSS_AREAS.slice(0, 4).flatMap((area) => area.dungeons.flatMap((dungeon, dungeonIndex) => {
    const order = peakDungeonOrder++;
    return PEAK_DIFFICULTY_TIERS.map((difficulty, difficultyIndex) => {
        const level = PEAK_DUNGEON_BASE_LEVELS[order] + difficulty.levelBonus;
        const progressionRank = order * PEAK_DIFFICULTY_TIERS.length + difficultyIndex;
        const earlyHardRewardMultiplier = difficulty.id === 'hard' && order < 2 ? PEAK_EARLY_HARD_REWARD_MULTIPLIER : 1;
        const openingStageEnemyMultiplier = order === 0 && difficultyIndex === 0 ? .95 : 1;
        const tuneOpeningStageEnemy = (entry) => openingStageEnemyMultiplier === 1 ? entry : {
            ...entry,
            maxHp: Math.round(entry.maxHp * openingStageEnemyMultiplier),
            maxMp: Math.round(entry.maxMp * openingStageEnemyMultiplier),
        };
        const finalEnemyId = difficulty.id === 'hard' ? PEAK_ABYSS_BOSS_ROTATION[order] : PEAK_STANDARD_BOSS_ROTATION[order];
        const finalEnemy = tuneOpeningStageEnemy(buildDungeonEnemy(finalEnemyId, level, true, 1, progressionRank, difficulty));
        const minionCount = difficulty.id === 'normal' ? 0 : difficulty.id === 'elite' ? 1 : 2;
        const minionDropChance = Math.min(.2, difficulty.minionDropChance * (.55 + order * .065));
        const minions = PEAK_MINION_ROTATION[order].slice(0, minionCount).map((enemyId, index) => ({
            ...tuneOpeningStageEnemy(buildDungeonEnemy(enemyId, level, false, .76 + index * .06, progressionRank, difficulty)),
            dropChance: minionDropChance,
        }));
        const encounters = [...minions, finalEnemy];
        const hasEncounterChain = encounters.length > 1;
        return {
            ...dungeon,
            id: `${dungeon.id}_${difficulty.id}`,
            baseId: dungeon.id,
            baseName: dungeon.name,
            name: `${dungeon.name} · ${difficulty.name}`,
            level,
            recommendedLevel: level,
            progressionRank,
            difficultyId: difficulty.id,
            difficultyName: difficulty.name,
            difficultyIndex,
            difficultyTone: difficulty.tone,
            guaranteedGold: Math.round(PEAK_GUARANTEED_GOLD_UNIT * (order + 1) * (difficultyIndex + 1) * earlyHardRewardMultiplier),
            goldMultiplier: difficulty.goldMultiplier * PEAK_MAP_GOLD_SCALE[order] * earlyHardRewardMultiplier,
            xpMultiplier: difficulty.xpMultiplier * PEAK_MAP_XP_SCALE[order] * earlyHardRewardMultiplier,
            earlyHardRewardMultiplier,
            itemBonus: difficulty.itemBonus,
            rarityBoost: dungeonRarityBoost(order, difficulty.id),
            minionDropChance,
            lootHint: difficulty.lootHint,
            cardRewardChance: difficulty.id === 'hard' ? PEAK_HARD_CARD_REWARD_CHANCES[order] : 0,
            cardRewardRates: difficulty.id === 'hard' ? hardCardRewardRates(order) : null,
            areaId: area.id,
            areaName: area.name,
            areaIntro: area.intro,
            backdrop: ABYSS_ASSETS.dungeonBackdrops[area.id],
            staminaCost: staminaCostForOrder(order) + difficulty.staminaBonus,
            isBoss: true,
            hasEncounterChain,
            baseItemCount: dungeonBaseItemCount(order, difficulty.id),
            encounters,
            enemy: finalEnemy,
        };
    });
}));

export const PEAK_RESERVED_CLASSES = Object.freeze({});

export const PEAK_CHARACTERS = {
    sword: {
        ...ABYSS_CHARACTERS.sword,
        base: { ...ABYSS_CHARACTERS.sword.base, physicalAttack: 27, independentAttack: 11, strength: 21, vitality: 16, spirit: 14, hp: 270, mp: 112, physicalDefense: 52, magicalDefense: 44, physicalCrit: 6 },
        growth: { ...ABYSS_CHARACTERS.sword.growth, physicalAttack: 3.5, independentAttack: 1.1, strength: 3.3, vitality: 1.4, spirit: 1.7, hp: 13, mp: 6, physicalDefense: 2.5, magicalDefense: 2.6, physicalCrit: .24 },
    },
    brawler: {
        ...ABYSS_CHARACTERS.brawler,
        name: '斗士',
        base: { ...ABYSS_CHARACTERS.brawler.base, physicalAttack: 22, independentAttack: 18, strength: 24, vitality: 23, spirit: 9, hp: 310, mp: 78, physicalDefense: 70, magicalDefense: 31, physicalCrit: 5 },
        growth: { ...ABYSS_CHARACTERS.brawler.growth, physicalAttack: 2.6, independentAttack: 2.5, strength: 2.9, vitality: 2.6, spirit: .8, hp: 21, mp: 3, physicalDefense: 3.8, magicalDefense: 1.5, physicalCrit: .16 },
    },
    archer: {
        id: 'archer', name: '弓箭手', title: '凌风 · 暗羽神射', accent: '#8b7cff', asset: 'archer',
        combatType: 'physical', attackElement: 'dark',
        base: { physicalAttack: 30, magicalAttack: 8, independentAttack: 17, strength: 22, intelligence: 9, vitality: 14, spirit: 15, hp: 260, mp: 106, physicalDefense: 47, magicalDefense: 46, physicalCrit: 8, magicalCrit: 2, attackSpeed: 4, castSpeed: 0, moveSpeed: 4, baseMoveSpeed: 204, allElement: 0, fireElement: 0, iceElement: 0, lightElement: 0, darkElement: 0, damageIncrease: 0, skillAttack: 0, criticalDamage: 0, cooldownReduction: 0, allSkillLevel: 0, damageReduction: 0 },
        growth: { physicalAttack: 3.4, magicalAttack: .8, independentAttack: 1.7, strength: 2.7, intelligence: .8, vitality: 1.3, spirit: 1.6, hp: 12, mp: 5, physicalDefense: 2.2, magicalDefense: 2.5, physicalCrit: .28, magicalCrit: .06 },
        starterWeapon: 'lingfeng_bow',
    },
    knight: {
        id: 'knight', name: '骑士', title: '圣卫 · 誓约守护', accent: '#e4c46b', asset: 'knight',
        combatType: 'physical', attackElement: 'light',
        base: { physicalAttack: 23, magicalAttack: 10, independentAttack: 14, strength: 18, intelligence: 10, vitality: 25, spirit: 22, hp: 260, mp: 102, physicalDefense: 70, magicalDefense: 66, physicalCrit: 4, magicalCrit: 2, attackSpeed: 0, castSpeed: 0, moveSpeed: 0, baseMoveSpeed: 200, allElement: 0, fireElement: 0, iceElement: 0, lightElement: 0, darkElement: 0, damageIncrease: 0, skillAttack: 0, criticalDamage: 0, cooldownReduction: 0, allSkillLevel: 0, damageReduction: 2 },
        growth: { physicalAttack: 2.8, magicalAttack: .9, independentAttack: 1.5, strength: 2.4, intelligence: .8, vitality: 3.1, spirit: 2.7, hp: 22, mp: 4, physicalDefense: 4.2, magicalDefense: 3.8, physicalCrit: .14, magicalCrit: .05 },
        starterWeapon: 'novice_holy_lance',
    },
    priest: {
        id: 'priest', name: '牧师', title: '神牧 · 圣谕祈者', accent: '#f0df9a', asset: 'priest',
        combatType: 'magical', attackElement: 'light',
        base: { physicalAttack: 12, magicalAttack: 28, independentAttack: 16, strength: 9, intelligence: 23, vitality: 15, spirit: 25, hp: 245, mp: 128, physicalDefense: 46, magicalDefense: 70, physicalCrit: 2, magicalCrit: 7, attackSpeed: 0, castSpeed: 4, moveSpeed: 0, baseMoveSpeed: 200, allElement: 0, fireElement: 0, iceElement: 0, lightElement: 0, darkElement: 0, damageIncrease: 0, skillAttack: 0, criticalDamage: 0, cooldownReduction: 0, allSkillLevel: 0, damageReduction: 0 },
        growth: { physicalAttack: 1.1, magicalAttack: 3.7, independentAttack: 1.8, strength: .7, intelligence: 3.2, vitality: 1.5, spirit: 3.2, hp: 14, mp: 7, physicalDefense: 2.4, magicalDefense: 4, physicalCrit: .05, magicalCrit: .24 },
        starterWeapon: 'novice_pastoral_staff',
    },
    mage: {
        id: 'mage', name: '魔法师', title: '魔灵儿 · 星界秘法', accent: '#c68cff', asset: 'mage',
        combatType: 'magical', attackElement: 'dark',
        base: { physicalAttack: 8, magicalAttack: 32, independentAttack: 18, strength: 7, intelligence: 26, vitality: 11, spirit: 19, hp: 265, mp: 142, physicalDefense: 44, magicalDefense: 58, physicalCrit: 1, magicalCrit: 9, attackSpeed: 0, castSpeed: 6, moveSpeed: 2, baseMoveSpeed: 202, allElement: 2, fireElement: 0, iceElement: 0, lightElement: 0, darkElement: 0, damageIncrease: 0, skillAttack: 0, criticalDamage: 0, cooldownReduction: 0, allSkillLevel: 0, damageReduction: 0 },
        growth: { physicalAttack: .6, magicalAttack: 4.1, independentAttack: 2.1, strength: .5, intelligence: 3.7, vitality: 1.1, spirit: 2.1, hp: 11, mp: 8, physicalDefense: 1.8, magicalDefense: 3.3, physicalCrit: .03, magicalCrit: .3 },
        starterWeapon: 'novice_arcane_staff',
    },
    lancer: {
        id: 'lancer', name: '魔枪士', title: '赵云 · 龙胆长锋', accent: '#7fa9e8', asset: 'lancer',
        combatType: 'physical', attackElement: 'physical',
        base: { physicalAttack: 29, magicalAttack: 7, independentAttack: 16, strength: 23, intelligence: 7, vitality: 18, spirit: 11, hp: 270, mp: 96, physicalDefense: 56, magicalDefense: 38, physicalCrit: 7, magicalCrit: 1, attackSpeed: 3, castSpeed: 0, moveSpeed: 2, baseMoveSpeed: 202, allElement: 0, fireElement: 0, iceElement: 0, lightElement: 0, darkElement: 0, damageIncrease: 0, skillAttack: 0, criticalDamage: 0, cooldownReduction: 0, allSkillLevel: 0, damageReduction: 1 },
        growth: { physicalAttack: 3.7, magicalAttack: .5, independentAttack: 2, strength: 3.3, intelligence: .4, vitality: 2, spirit: 1, hp: 17, mp: 4, physicalDefense: 3, magicalDefense: 2, physicalCrit: .24, magicalCrit: .03 },
        starterWeapon: 'novice_cold_spear',
    },
};

export const PEAK_ADVANCEMENT_LEVELS = Object.freeze({ first: 30, second: 50, max: 60 });
export const PEAK_ADVANCEMENTS = Object.freeze({
    dragon_lancer: {
        id: 'dragon_lancer', baseClassId: 'lancer', accent: '#79b9ff', element: 'physical',
        firstName: '破军枪将', secondName: '龙胆枪神',
        firstStats: { strength: 4, physicalCrit: 2 }, secondStats: { physicalAttack: 5, skillAttack: 3 },
        firstGrantCards: ['lancer_route_dragon_lancer_common_attack_t1_1', 'lancer_route_dragon_lancer_common_defense_t1_1', 'lancer_route_dragon_lancer_common_skill_t1_1', 'lancer_route_dragon_lancer_common_buff_t1_1', 'lancer_route_dragon_lancer_excellent_attack_t1_1', 'lancer_route_dragon_lancer_excellent_defense_t1_1'],
        secondGrantCards: ['lancer_route_dragon_lancer_legendary_attack_t2_1', 'lancer_route_dragon_lancer_legendary_defense_t2_1', 'lancer_route_dragon_lancer_legendary_skill_t2_1', 'lancer_route_dragon_lancer_legendary_buff_t2_1', 'lancer_route_dragon_lancer_epic_attack_t2_1'],
        combat: { resourceId: 'spear_momentum', resourceName: '破军枪势', color: '#79b9ff', max: 5, secondMax: 4, trigger: 'damageHit', spend: 'offenseCard', firstBonus: 18, secondBonus: 29 },
        firstSummary: '用贯刺与旋枪的连续命中积累破军枪势，枪势圆满后强化下一次攻势。',
        secondSummary: '将长枪连段炼成龙胆枪势，以更短的蓄势周期持续发动破阵强攻。',
    },
    fortress_lancer: {
        id: 'fortress_lancer', baseClassId: 'lancer', accent: '#b8c9e8', element: 'physical',
        firstName: '镇岳枪卫', secondName: '玄甲枪圣',
        firstStats: { vitality: 5, physicalDefense: 6 }, secondStats: { vitality: 5, damageReduction: 4 },
        firstGrantCards: ['lancer_route_fortress_lancer_common_attack_t1_1', 'lancer_route_fortress_lancer_common_defense_t1_1', 'lancer_route_fortress_lancer_common_skill_t1_1', 'lancer_route_fortress_lancer_common_buff_t1_1', 'lancer_route_fortress_lancer_excellent_attack_t1_1', 'lancer_route_fortress_lancer_excellent_defense_t1_1'],
        secondGrantCards: ['lancer_route_fortress_lancer_legendary_attack_t2_1', 'lancer_route_fortress_lancer_legendary_defense_t2_1', 'lancer_route_fortress_lancer_legendary_skill_t2_1', 'lancer_route_fortress_lancer_legendary_buff_t2_1', 'lancer_route_fortress_lancer_epic_attack_t2_1'],
        combat: { resourceId: 'fortress_stance', resourceName: '镇岳枪架', color: '#b8c9e8', max: 4, secondMax: 3, trigger: 'defenseCard', spend: 'offenseCard', firstBonus: 16, secondBonus: 25, shieldRetention: 25, secondShieldRetention: 45 },
        firstSummary: '以封架和盘龙势积累镇岳枪架，将稳固防线转化为下一次长枪反击。',
        secondSummary: '身披玄甲、枪架如山，大幅保留护盾并强化守势后的破阵反击。',
    },
    elemental_sorceress: {
        id: 'elemental_sorceress', baseClassId: 'mage', accent: '#ff9c73', element: 'fire',
        firstName: '元素术士', secondName: '天象魔导师',
        firstStats: { intelligence: 4, allElement: 6 }, secondStats: { magicalAttack: 5, skillAttack: 3 },
        firstGrantCards: ['mage_route_elemental_sorceress_common_attack_t1_1', 'mage_route_elemental_sorceress_common_defense_t1_1', 'mage_route_elemental_sorceress_common_skill_t1_1', 'mage_route_elemental_sorceress_common_buff_t1_1', 'mage_route_elemental_sorceress_excellent_attack_t1_1', 'mage_route_elemental_sorceress_excellent_defense_t1_1'],
        secondGrantCards: ['mage_route_elemental_sorceress_legendary_attack_t2_1', 'mage_route_elemental_sorceress_legendary_defense_t2_1', 'mage_route_elemental_sorceress_legendary_skill_t2_1', 'mage_route_elemental_sorceress_legendary_buff_t2_1', 'mage_route_elemental_sorceress_epic_attack_t2_1'],
        combat: { resourceId: 'elemental_orbit', resourceName: '元素星轨', color: '#ff9c73', max: 5, secondMax: 4, trigger: 'damageHit', spend: 'offenseCard', firstBonus: 17, secondBonus: 27 },
        firstSummary: '轮转火、冰与暗属性法术积累元素星轨，在连续命中后强化下一次攻势。',
        secondSummary: '驾驭天象级元素循环，以更短的星轨周期释放高频法术爆发。',
    },
    void_warlock: {
        id: 'void_warlock', baseClassId: 'mage', accent: '#9b6cff', element: 'dark',
        firstName: '虚空术士', secondName: '星渊大魔导',
        firstStats: { darkElement: 8, magicalCrit: 2 }, secondStats: { darkElement: 8, criticalDamage: 4 },
        firstGrantCards: ['mage_route_void_warlock_common_attack_t1_1', 'mage_route_void_warlock_common_defense_t1_1', 'mage_route_void_warlock_common_skill_t1_1', 'mage_route_void_warlock_common_buff_t1_1', 'mage_route_void_warlock_excellent_attack_t1_1', 'mage_route_void_warlock_excellent_defense_t1_1'],
        secondGrantCards: ['mage_route_void_warlock_legendary_attack_t2_1', 'mage_route_void_warlock_legendary_defense_t2_1', 'mage_route_void_warlock_legendary_skill_t2_1', 'mage_route_void_warlock_legendary_buff_t2_1', 'mage_route_void_warlock_epic_attack_t2_1'],
        combat: { resourceId: 'void_rune', resourceName: '虚空符文', color: '#9b6cff', max: 4, secondMax: 3, trigger: 'harmfulStatus', spend: 'debuffedTarget', firstBonus: 18, secondBonus: 29 },
        firstSummary: '通过中毒、冰冻与灼烧刻写虚空符文，对带有负面状态的目标发动爆发。',
        secondSummary: '将虚空符文压缩为星渊奇点，进一步强化异常叠加后的终结伤害。',
    },
    grace_cleric: {
        id: 'grace_cleric', baseClassId: 'priest', accent: '#fff0ad', element: 'light',
        firstName: '神愈祭司', secondName: '圣灵神牧',
        firstStats: { spirit: 5, lightElement: 6 }, secondStats: { vitality: 4, damageReduction: 4 },
        firstGrantCards: ['priest_route_grace_cleric_common_attack_t1_1', 'priest_route_grace_cleric_common_defense_t1_1', 'priest_route_grace_cleric_common_skill_t1_1', 'priest_route_grace_cleric_common_buff_t1_1', 'priest_route_grace_cleric_excellent_attack_t1_1', 'priest_route_grace_cleric_excellent_defense_t1_1'],
        secondGrantCards: ['priest_route_grace_cleric_legendary_attack_t2_1', 'priest_route_grace_cleric_legendary_defense_t2_1', 'priest_route_grace_cleric_legendary_skill_t2_1', 'priest_route_grace_cleric_legendary_buff_t2_1', 'priest_route_grace_cleric_epic_attack_t2_1'],
        combat: { resourceId: 'grace', resourceName: '神恩祷印', color: '#fff0ad', max: 4, secondMax: 3, trigger: 'defenseCard', spend: 'offenseCard', firstBonus: 14, secondBonus: 22, shieldRetention: 20, secondShieldRetention: 35, healingJudgmentRatio: 25, overhealJudgmentRatio: 80, secondHealingJudgmentRatio: 40, secondOverhealJudgmentRatio: 100 },
        firstSummary: '通过治疗、防护与净化积累神恩祷印；有效治疗的25%与溢出治疗的80%会反转为圣光裁决伤害。',
        secondSummary: '神恩反转提升至有效治疗40%、溢出治疗100%，并强化护盾保留与危急反攻。',
    },
    revelation_priest: {
        id: 'revelation_priest', baseClassId: 'priest', accent: '#ffd36b', element: 'light',
        firstName: '启示司祭', secondName: '神罚主教',
        firstStats: { intelligence: 4, lightElement: 8 }, secondStats: { magicalAttack: 5, skillAttack: 3 },
        firstGrantCards: ['priest_route_revelation_priest_common_attack_t1_1', 'priest_route_revelation_priest_common_defense_t1_1', 'priest_route_revelation_priest_common_skill_t1_1', 'priest_route_revelation_priest_common_buff_t1_1', 'priest_route_revelation_priest_excellent_attack_t1_1', 'priest_route_revelation_priest_excellent_defense_t1_1'],
        secondGrantCards: ['priest_route_revelation_priest_legendary_attack_t2_1', 'priest_route_revelation_priest_legendary_defense_t2_1', 'priest_route_revelation_priest_legendary_skill_t2_1', 'priest_route_revelation_priest_legendary_buff_t2_1', 'priest_route_revelation_priest_epic_attack_t2_1'],
        combat: { resourceId: 'revelation', resourceName: '启示圣痕', color: '#ffd36b', max: 5, secondMax: 4, trigger: 'damageHit', spend: 'offenseCard', firstBonus: 17, secondBonus: 27 },
        firstSummary: '以光矢和圣焰积累启示圣痕，在连续施术后降下裁决。',
        secondSummary: '将启示升华为神罚，以高频光属性法术压制并终结敌人。',
    },
    holy_guardian: {
        id: 'holy_guardian', baseClassId: 'knight', accent: '#ffe58a', element: 'light',
        firstName: '圣盾骑士', secondName: '曜光圣卫',
        firstStats: { vitality: 5, lightElement: 6 }, secondStats: { spirit: 5, damageReduction: 4 },
        firstGrantCards: ['knight_route_holy_guardian_common_attack_t1_1', 'knight_route_holy_guardian_common_defense_t1_1', 'knight_route_holy_guardian_common_skill_t1_1', 'knight_route_holy_guardian_common_buff_t1_1', 'knight_route_holy_guardian_excellent_attack_t1_1', 'knight_route_holy_guardian_excellent_defense_t1_1'],
        secondGrantCards: ['knight_route_holy_guardian_legendary_attack_t2_1', 'knight_route_holy_guardian_legendary_defense_t2_1', 'knight_route_holy_guardian_legendary_skill_t2_1', 'knight_route_holy_guardian_legendary_buff_t2_1', 'knight_route_holy_guardian_epic_attack_t2_1'],
        combat: { resourceId: 'holy_oath', resourceName: '守护誓印', color: '#ffe58a', max: 4, secondMax: 3, trigger: 'defenseCard', spend: 'offenseCard', firstBonus: 15, secondBonus: 24, shieldRetention: 30, secondShieldRetention: 50 },
        firstSummary: '以防守牌积累守护誓印，在稳固阵线后将誓约化为反击力量。',
        secondSummary: '让圣盾之光覆盖全场，大幅保留护盾并强化攻防转换。',
    },
    judgment_crusader: {
        id: 'judgment_crusader', baseClassId: 'knight', accent: '#f6b85f', element: 'light',
        firstName: '惩戒骑士', secondName: '天罚圣裁',
        firstStats: { strength: 4, lightElement: 8 }, secondStats: { physicalAttack: 5, skillAttack: 3 },
        firstGrantCards: ['knight_route_judgment_crusader_common_attack_t1_1', 'knight_route_judgment_crusader_common_defense_t1_1', 'knight_route_judgment_crusader_common_skill_t1_1', 'knight_route_judgment_crusader_common_buff_t1_1', 'knight_route_judgment_crusader_excellent_attack_t1_1', 'knight_route_judgment_crusader_excellent_defense_t1_1'],
        secondGrantCards: ['knight_route_judgment_crusader_legendary_attack_t2_1', 'knight_route_judgment_crusader_legendary_defense_t2_1', 'knight_route_judgment_crusader_legendary_skill_t2_1', 'knight_route_judgment_crusader_legendary_buff_t2_1', 'knight_route_judgment_crusader_epic_attack_t2_1'],
        combat: { resourceId: 'judgment', resourceName: '裁决印记', color: '#f6b85f', max: 5, secondMax: 4, trigger: 'damageHit', spend: 'offenseCard', firstBonus: 17, secondBonus: 27 },
        firstSummary: '通过连续命中积累裁决印记，以枪盾连击实施正面惩戒。',
        secondSummary: '将裁决印记升华为天罚，在高频进攻后释放更强圣光爆发。',
    },
    storm_hunter: {
        id: 'storm_hunter', baseClassId: 'archer', accent: '#78ddff', element: 'light',
        firstName: '风暴猎手', secondName: '天穹神射手',
        firstStats: { lightElement: 8, physicalCrit: 2 }, secondStats: { lightElement: 8, skillAttack: 3 },
        firstGrantCards: ['storm_hunter_gale_arrow', 'storm_hunter_chain_bolt', 'storm_hunter_tempest_guard', 'storm_hunter_tailwind'], secondGrantCards: ['storm_hunter_sky_judgment'],
        combat: { resourceId: 'storm', resourceName: '风暴印记', color: '#78ddff', max: 5, secondMax: 4, trigger: 'damageHit', spend: 'offenseCard', firstBonus: 16, secondBonus: 26 },
        firstSummary: '以高速连射积累风暴印记，用雷矢完成连续压制。',
        secondSummary: '驾驭天穹雷霆，在多段命中后释放贯穿战场的神射。',
    },
    shadow_marksman: {
        id: 'shadow_marksman', baseClassId: 'archer', accent: '#b07cff', element: 'dark',
        firstName: '幽影游侠', secondName: '蚀星神射手',
        firstStats: { darkElement: 8, criticalDamage: 3 }, secondStats: { darkElement: 8, physicalCrit: 3 },
        firstGrantCards: ['shadow_marksman_venom_arrow', 'shadow_marksman_night_volley', 'shadow_marksman_smoke_screen', 'shadow_marksman_killing_intent'], secondGrantCards: ['shadow_marksman_eclipse'],
        combat: { resourceId: 'shadow_arrow', resourceName: '猎杀印记', color: '#b07cff', max: 4, secondMax: 3, trigger: 'harmfulStatus', spend: 'debuffedTarget', firstBonus: 18, secondBonus: 28 },
        firstSummary: '用毒箭与暗影标记削弱目标，在破绽出现时发动狙击。',
        secondSummary: '将猎杀印记化为蚀星一箭，终结带有负面状态的敌人。',
    },
    ice_shadow: {
        id: 'ice_shadow', baseClassId: 'sword', accent: '#75d7ff', element: 'ice',
        firstName: '冰影', secondName: '霜狱剑魂',
        firstStats: { iceElement: 8, spirit: 4 }, secondStats: { iceElement: 8, skillAttack: 3 },
        firstGrantCards: ['ice_shadow_frost_lift', 'ice_shadow_wheel_combo', 'adv_ice_shadow_attack_common', 'adv_ice_shadow_skill_common', 'adv_ice_shadow_defense_common', 'adv_ice_shadow_buff_common'], secondGrantCards: ['ice_shadow_prison_domain', 'adv_ice_shadow_attack_legendary', 'adv_ice_shadow_skill_legendary', 'adv_ice_shadow_defense_legendary', 'adv_ice_shadow_buff_legendary'],
        combat: { resourceId: 'frost', resourceName: '寒霜印记', color: '#75d7ff', max: 4, secondMax: 3, trigger: 'iceDamage', spend: 'iceDamage', firstBonus: 18, secondBonus: 28 },
        firstSummary: '以寒霜印记、浮空控制和延迟引爆组织剑技。',
        secondSummary: '驾驭霜狱之力，在严密的队列中引爆寒霜终结敌人。',
    },
    light_guardian: {
        id: 'light_guardian', baseClassId: 'sword', accent: '#ffe58a', element: 'light',
        firstName: '神光剑卫', secondName: '曜光剑皇',
        firstStats: { lightElement: 8, vitality: 4 }, secondStats: { lightElement: 8, damageReduction: 3 },
        firstGrantCards: ['light_guardian_returning_slash', 'light_guardian_sacred_wall', 'adv_light_guardian_attack_common', 'adv_light_guardian_skill_common', 'adv_light_guardian_defense_common', 'adv_light_guardian_buff_common'], secondGrantCards: ['light_guardian_emperor_array', 'adv_light_guardian_attack_legendary', 'adv_light_guardian_skill_legendary', 'adv_light_guardian_defense_legendary', 'adv_light_guardian_buff_legendary'],
        combat: { resourceId: 'radiance', resourceName: '神光', color: '#ffe58a', max: 3, secondMax: 3, trigger: 'defenseCard', spend: 'offenseCard', firstBonus: 16, secondBonus: 24, shieldRetention: 25, secondShieldRetention: 40 },
        firstSummary: '以护盾、格挡和光属性剑技完成攻防转换。',
        secondSummary: '将守护之光铸为剑阵，在承受攻击后发动强力反击。',
    },
    flame_brawler: {
        id: 'flame_brawler', baseClassId: 'brawler', accent: '#ff785d', element: 'fire',
        firstName: '炎拳斗士', secondName: '炼狱拳皇',
        firstStats: { fireElement: 8, strength: 4 }, secondStats: { fireElement: 8, physicalCrit: 3 },
        firstGrantCards: ['flame_brawler_heated_jab', 'flame_brawler_burst_combo', 'adv_flame_brawler_attack_common', 'adv_flame_brawler_skill_common', 'adv_flame_brawler_defense_common', 'adv_flame_brawler_buff_common'], secondGrantCards: ['flame_brawler_inferno_blood', 'adv_flame_brawler_attack_legendary', 'adv_flame_brawler_skill_legendary', 'adv_flame_brawler_defense_legendary', 'adv_flame_brawler_buff_legendary'],
        combat: { resourceId: 'heat', resourceName: '热意', color: '#ff785d', max: 6, secondMax: 5, trigger: 'damageHit', spend: 'offenseCard', firstBonus: 16, secondBonus: 25, burnStackBonus: 1, secondBurnStackBonus: 2 },
        firstSummary: '通过多段命中积累热意，以灼烧和连续进攻压制目标。',
        secondSummary: '将热意推至极限，引爆灼烧并在危急时爆发更强拳势。',
    },
    shadow_fist: {
        id: 'shadow_fist', baseClassId: 'brawler', accent: '#bd91ff', element: 'dark',
        firstName: '暗影之拳', secondName: '幽冥拳宗',
        firstStats: { darkElement: 8, physicalCrit: 2 }, secondStats: { darkElement: 8, criticalDamage: 4 },
        firstGrantCards: ['shadow_fist_step_stab', 'shadow_fist_venom_fangs', 'adv_shadow_fist_attack_common', 'adv_shadow_fist_skill_common', 'adv_shadow_fist_defense_common', 'adv_shadow_fist_buff_common'], secondGrantCards: ['shadow_fist_nether_mark', 'adv_shadow_fist_attack_legendary', 'adv_shadow_fist_skill_legendary', 'adv_shadow_fist_defense_legendary', 'adv_shadow_fist_buff_legendary'],
        combat: { resourceId: 'shadow', resourceName: '幽影印记', color: '#bd91ff', max: 4, secondMax: 3, trigger: 'harmfulStatus', spend: 'debuffedTarget', firstBonus: 18, secondBonus: 28, statusStackBonus: 1, secondStatusStackBonus: 2 },
        firstSummary: '利用中毒、流血和追击捕捉敌人的每一个破绽。',
        secondSummary: '积累幽冥印记，以终结技消耗负面状态完成致命追击。',
    },
});

export const getPeakAdvancementDefinition = (character) => PEAK_ADVANCEMENTS[character?.advancement?.pathId] || null;
export const getPeakCharacterJobName = (character) => {
    const definition = getPeakAdvancementDefinition(character);
    if (definition && character.advancement.tier >= 2) return definition.secondName;
    if (definition && character.advancement.tier >= 1) return definition.firstName;
    return PEAK_CHARACTERS[character?.baseClassId]?.name || '未创建角色';
};

export const PEAK_ASSETS = {
    ...ABYSS_ASSETS,
    heroes: { ...ABYSS_ASSETS.heroes, archer: 'assets/fighters/heroes/lingfeng/portrait.png', knight: 'assets/fighters/heroes/shengwei/touming-lihui.png', priest: 'assets/fighters/heroes/shenmu/touming-lihui.png', mage: 'assets/fighters/heroes/molinger/touming-lihui.png', lancer: 'assets/fighters/heroes/zhaoyun/touming-lihui.png' },
    heroPortraits: {
        lancer: {
            base: 'assets/fighters/heroes/zhaoyun/touming-lihui.png',
            advanced: 'assets/fighters/heroes/zhaoyun/yizhuan-lihui.png',
        },
    },
    heroSprites: { ...ABYSS_ASSETS.heroSprites, archer: 'assets/fighters/heroes/lingfeng/standby-alt-strip.png', knight: 'assets/fighters/heroes/shengwei/standby-strip.png', priest: 'assets/fighters/heroes/shenmu/standby-strip.png', mage: 'assets/fighters/heroes/molinger/standby-strip.png', lancer: 'assets/fighters/heroes/zhaoyun/standby-sheet.png' },
    heroProjectiles: {
        lancer: { file: 'assets/fighters/heroes/zhaoyun/spear-projectile-sheet.png', columns: 4, rows: 2, frames: 6, fps: 14 },
    },
    heroDisplayScales: { archer: 1, knight: 1.44, priest: 1.25, mage: 1.25, lancer: 1.25 },
    heroAnimations: {
        ...ABYSS_ASSETS.heroAnimations,
        archer: {
            idle: { file: 'assets/fighters/heroes/lingfeng/standby-alt-strip.png', frames: 8, fps: 7 },
            move: { file: 'assets/fighters/heroes/lingfeng/standby-alt-strip.png', frames: 8, fps: 9 },
            jump: { file: 'assets/fighters/heroes/lingfeng/skill-alt-strip.png', frames: 6, fps: 9 },
            attack1: { file: 'assets/fighters/heroes/lingfeng/attack-alt-strip.png', frames: 8, fps: 13 },
            attack2: { file: 'assets/fighters/heroes/lingfeng/super-alt-strip.png', frames: 8, fps: 12 },
            attack3: { file: 'assets/fighters/heroes/lingfeng/skill-alt-strip.png', frames: 6, fps: 15 },
            skill: { file: 'assets/fighters/heroes/lingfeng/skill-alt-strip.png', frames: 6, fps: 12 },
            super: { file: 'assets/fighters/heroes/lingfeng/super-alt-strip.png', frames: 8, fps: 15 },
            guard: { file: 'assets/fighters/heroes/lingfeng/standby-alt-strip.png', frames: 8, fps: 8 },
            hurt: { file: 'assets/fighters/heroes/lingfeng/hurt.png', frames: 6, fps: 11 },
            knockdown: { file: 'assets/fighters/heroes/lingfeng/hurt.png', frames: 6, fps: 9 },
            defeat: { file: 'assets/fighters/heroes/lingfeng/hurt.png', frames: 6, fps: 7 },
        },
        knight: {
            idle: { file: 'assets/fighters/heroes/shengwei/standby-strip.png', frames: 8, fps: 7 },
            move: { file: 'assets/fighters/heroes/shengwei/standby-strip.png', frames: 8, fps: 8 },
            jump: { file: 'assets/fighters/heroes/shengwei/attack-strip.png', frames: 8, fps: 10 },
            attack1: { file: 'assets/fighters/heroes/shengwei/attack-strip.png', frames: 8, fps: 12 },
            attack2: { file: 'assets/fighters/heroes/shengwei/attack-strip.png', frames: 8, fps: 11 },
            attack3: { file: 'assets/fighters/heroes/shengwei/attack-strip.png', frames: 8, fps: 13 },
            skill: { file: 'assets/fighters/heroes/shengwei/attack-strip.png', frames: 8, fps: 11 },
            super: { file: 'assets/fighters/heroes/shengwei/superskill-strip.png', frames: 12, fps: 15 },
            guard: { file: 'assets/fighters/heroes/shengwei/get-hit-strip.png', frames: 8, fps: 11 },
            hurt: { file: 'assets/fighters/heroes/shengwei/get-hit-strip.png', frames: 8, fps: 12 },
            knockdown: { file: 'assets/fighters/heroes/shengwei/get-hit-strip.png', frames: 8, fps: 9 },
            defeat: { file: 'assets/fighters/heroes/shengwei/get-hit-strip.png', frames: 8, fps: 7 },
            victory: { file: 'assets/fighters/heroes/shengwei/victory-strip.png', frames: 8, fps: 8 },
        },
        mage: {
            idle: { file: 'assets/fighters/heroes/molinger/standby-strip.png', frames: 8, fps: 7 },
            move: { file: 'assets/fighters/heroes/molinger/standby-strip.png', frames: 8, fps: 8 },
            jump: { file: 'assets/fighters/heroes/molinger/cast-alt-strip.png', frames: 8, fps: 10 },
            attack1: { file: 'assets/fighters/heroes/molinger/cast-alt-strip.png', frames: 8, fps: 12 },
            attack2: { file: 'assets/fighters/heroes/molinger/skill-alt-strip.png', frames: 8, fps: 13 },
            attack3: { file: 'assets/fighters/heroes/molinger/skill-alt-strip.png', frames: 8, fps: 14 },
            skill: { file: 'assets/fighters/heroes/molinger/skill-alt-strip.png', frames: 8, fps: 12 },
            super: { file: 'assets/fighters/heroes/molinger/skill-alt-strip.png', frames: 8, fps: 15 },
            guard: { file: 'assets/fighters/heroes/molinger/standby-strip.png', frames: 8, fps: 9 },
            hurt: { file: 'assets/fighters/heroes/molinger/hurt-alt-strip.png', frames: 6, fps: 11 },
            knockdown: { file: 'assets/fighters/heroes/molinger/hurt-alt-strip.png', frames: 6, fps: 9 },
            defeat: { file: 'assets/fighters/heroes/molinger/hurt-alt-strip.png', frames: 6, fps: 7 },
        },
        priest: {
            idle: { file: 'assets/fighters/heroes/shenmu/standby-strip.png', frames: 8, fps: 7 },
            move: { file: 'assets/fighters/heroes/shenmu/standby-strip.png', frames: 8, fps: 8 },
            jump: { file: 'assets/fighters/heroes/shenmu/attack-strip.png', frames: 8, fps: 10 },
            attack1: { file: 'assets/fighters/heroes/shenmu/attack-strip.png', frames: 8, fps: 12 },
            attack2: { file: 'assets/fighters/heroes/shenmu/attack-strip.png', frames: 8, fps: 13 },
            attack3: { file: 'assets/fighters/heroes/shenmu/attack-strip.png', frames: 8, fps: 14 },
            skill: { file: 'assets/fighters/heroes/shenmu/heal-strip.png', frames: 8, fps: 12 },
            super: { file: 'assets/fighters/heroes/shenmu/heal-strip.png', frames: 8, fps: 15 },
            guard: { file: 'assets/fighters/heroes/shenmu/standby-strip.png', frames: 8, fps: 9 },
            hurt: { file: 'assets/fighters/heroes/shenmu/get-hit-strip.png', frames: 8, fps: 11 },
            knockdown: { file: 'assets/fighters/heroes/shenmu/get-hit-strip.png', frames: 8, fps: 9 },
            defeat: { file: 'assets/fighters/heroes/shenmu/get-hit-strip.png', frames: 8, fps: 7 },
            victory: { file: 'assets/fighters/heroes/shenmu/victory-strip.png', frames: 8, fps: 8 },
        },
        lancer: {
            idle: { file: 'assets/fighters/heroes/zhaoyun/standby-sheet.png', columns: 4, rows: 2, frames: 8, fps: 7, sheetWidth: 1280, sheetHeight: 640 },
            move: { file: 'assets/fighters/heroes/zhaoyun/standby-sheet.png', columns: 4, rows: 2, frames: 8, fps: 9, sheetWidth: 1280, sheetHeight: 640 },
            jump: { file: 'assets/fighters/heroes/zhaoyun/spear-thrust-sheet.png', columns: 4, rows: 2, frames: 8, fps: 10, sheetWidth: 1280, sheetHeight: 640 },
            attack1: { file: 'assets/fighters/heroes/zhaoyun/spear-thrust-sheet.png', columns: 4, rows: 2, frames: 8, fps: 13, sheetWidth: 1280, sheetHeight: 640 },
            attack2: { file: 'assets/fighters/heroes/zhaoyun/charged-spear-sheet.png', columns: 4, rows: 2, frames: 8, fps: 12, sheetWidth: 1280, sheetHeight: 640 },
            attack3: { file: 'assets/fighters/heroes/zhaoyun/dragon-soul-skill-sheet.png', columns: 4, rows: 2, frames: 8, fps: 14, sheetWidth: 1280, sheetHeight: 640 },
            skill: { file: 'assets/fighters/heroes/zhaoyun/charged-spear-sheet.png', columns: 4, rows: 2, frames: 8, fps: 12, sheetWidth: 1280, sheetHeight: 640 },
            super: { file: 'assets/fighters/heroes/zhaoyun/dragon-soul-skill-sheet.png', columns: 4, rows: 2, frames: 8, fps: 15, sheetWidth: 1280, sheetHeight: 640 },
            guard: { file: 'assets/fighters/heroes/zhaoyun/charged-spear-sheet.png', columns: 4, rows: 2, frames: 8, fps: 9, sheetWidth: 1280, sheetHeight: 640 },
            hurt: { file: 'assets/fighters/heroes/zhaoyun/standby-sheet.png', columns: 4, rows: 2, frames: 8, fps: 11, sheetWidth: 1280, sheetHeight: 640 },
            knockdown: { file: 'assets/fighters/heroes/zhaoyun/standby-sheet.png', columns: 4, rows: 2, frames: 8, fps: 8, sheetWidth: 1280, sheetHeight: 640 },
            defeat: { file: 'assets/fighters/heroes/zhaoyun/standby-sheet.png', columns: 4, rows: 2, frames: 8, fps: 7, sheetWidth: 1280, sheetHeight: 640 },
            victory: { file: 'assets/fighters/heroes/zhaoyun/victory.png', columns: 4, rows: 2, frames: 8, fps: 8, sheetWidth: 1280, sheetHeight: 640 },
        },
    },
};
export const PEAK_EQUIPMENT_SLOTS = ABYSS_SLOTS;
export const PEAK_EQUIPMENT_SLOT_LABELS = ABYSS_SLOT_LABELS;
export const PEAK_EQUIPMENT_RARITIES = ABYSS_RARITIES;
const PEAK_LOW_WEAPON_NAMES = Object.freeze({
    inferior: {
        sword: ['缺口练习剑', '锈蚀铁剑', '磨钝军刀', '旧式长剑'],
        brawler: ['破旧布拳套', '生锈臂铠', '磨损铁爪', '旧木东方棍'],
        archer: ['裂纹短弓', '旧木猎弓', '磨损长弓', '粗制角弓'],
        knight: ['缺刃骑枪', '生锈圣枪', '旧式战矛', '粗铁长枪'],
        priest: ['磨旧牧杖', '裂纹十字杖', '粗木祷杖', '旧铜权杖'],
        mage: ['裂纹法杖', '失光魔杖', '旧木晶杖', '粗制符文杖'],
        lancer: ['缺刃长枪', '锈蚀战戟', '旧式蛇矛', '粗铁钩镰枪'],
    },
    common: {
        sword: ['铁锋长剑', '青钢短剑', '行军太刀', '守备巨剑'],
        brawler: ['熟铁拳套', '练武臂铠', '迅捷铁爪', '行者东方棍'],
        archer: ['白羽猎弓', '青木长弓', '哨兵角弓', '行军战弓'],
        knight: ['守誓骑枪', '白银战矛', '卫士圣枪', '坚壁长枪'],
        priest: ['白木牧杖', '祷言十字架', '见习圣杖', '恩典权杖'],
        mage: ['青晶法杖', '学徒魔杖', '星砂符文杖', '灵光长杖'],
        lancer: ['青锋长枪', '行军战戟', '游龙蛇矛', '铁脊钩镰枪'],
    },
    advanced: {
        sword: ['苍风剑', '霜纹太刀', '破岩巨剑', '流光短刃'],
        brawler: ['苍劲拳套', '炎纹臂铠', '影袭利爪', '盘石东方棍'],
        archer: ['苍翎长弓', '风语猎弓', '穿林战弓', '逐影角弓'],
        knight: ['苍银圣枪', '曜光骑枪', '壁垒战矛', '守望长枪'],
        priest: ['苍辉牧杖', '银纹十字架', '澄心圣杖', '祈光权杖'],
        mage: ['苍晶法杖', '秘纹魔杖', '元素符文杖', '星轨长杖'],
        lancer: ['苍龙长枪', '破阵战戟', '追风蛇矛', '寒芒钩镰枪'],
    },
    rare: {
        sword: ['紫霆斩风剑', '月影太刀', '断岳巨剑', '寒星短刃'],
        brawler: ['紫炎裂地拳套', '雷鸣臂铠', '影牙利爪', '镇山东方棍'],
        archer: ['紫电穿云弓', '月痕猎弓', '追星战弓', '影翎角弓'],
        knight: ['紫曜裁决枪', '月庭骑枪', '圣盾战矛', '星辉长枪'],
        priest: ['紫晶圣歌杖', '月华十字架', '神恩圣杖', '星祷权杖'],
        mage: ['紫晶奥术杖', '月蚀魔杖', '星界符文杖', '虚空长杖'],
        lancer: ['紫电龙牙枪', '月影战戟', '破军蛇矛', '寒星钩镰枪'],
    },
});
const PEAK_HIGH_EQUIPMENT_SLOT_SUFFIXES = Object.freeze({
    headShoulder: ['战冠', '肩铠'],
    top: ['战衣', '胸甲'],
    bottom: ['护腿', '胫甲'],
    belt: ['束带', '腰铠'],
    shoes: ['踏云靴', '远征战靴'],
    bracelet: ['星纹腕轮', '守望手镯'],
    necklace: ['辉光坠链', '誓约项链'],
    ring: ['界痕指环', '裁决秘戒'],
    support: ['战术核心', '远征徽记'],
    magicStone: ['源能晶石', '界域魔石'],
    earring: ['星辉耳坠', '回响耳环'],
});
const PEAK_HIGH_EQUIPMENT_NAMES = Object.freeze({
    artifact: {
        themes: ['暮星远征', '绯月守望'],
        weapons: {
            sword: ['绯夜逐星剑', '暮星断潮刃'],
            brawler: ['赤曜裂阵拳套', '绯月镇岳臂铠'],
            archer: ['苍翎追月弓', '暮星破风长弓'],
            knight: ['圣垒誓约枪', '绯月守望圣枪'],
            priest: ['晨祷赐福杖', '暮星圣歌权杖'],
            mage: ['秘环星辉法杖', '绯月奥术权杖'],
            lancer: ['玄锋破云长枪', '暮星龙牙枪'],
        },
    },
    legendary: {
        themes: ['天穹王庭', '曜日裁决'],
        weapons: {
            sword: ['天穹断界剑', '曜日无双刃'],
            brawler: ['撼岳镇魂拳套', '曜日武极臂铠'],
            archer: ['逐日穿云弓', '天穹猎星长弓'],
            knight: ['王庭裁决圣枪', '曜日守誓战枪'],
            priest: ['曙光圣谕权杖', '王庭神恩牧杖'],
            mage: ['星界真理法杖', '曜日万象权杖'],
            lancer: ['龙脊贯日长枪', '天穹破军枪'],
        },
    },
    epic: {
        themes: ['终焉神域', '创世天启'],
        weapons: {
            sword: ['终焉·万剑归墟', '创世·无极剑界'],
            brawler: ['终焉·武神破天', '创世·万钧神拳'],
            archer: ['终焉·群星陨落', '创世·苍穹神弓'],
            knight: ['终焉·圣裁天枪', '创世·永恒壁垒'],
            priest: ['终焉·神恩永昼', '创世·圣谕赞歌'],
            mage: ['终焉·万象湮灭', '创世·元素真理'],
            lancer: ['终焉·龙胆裂界', '创世·破军神枪'],
        },
    },
});
const buildPeakHighEquipmentNamePool = (rarity, config) => [
    ...Object.entries(config.weapons).flatMap(([classId, names]) => names.map((name, index) => ({
        id: `peak_${rarity}_${classId}_weapon_${index + 1}`,
        name,
        slot: 'weapon',
        classId,
    }))),
    ...Object.entries(PEAK_HIGH_EQUIPMENT_SLOT_SUFFIXES).flatMap(([slot, suffixes]) => config.themes.map((theme, index) => ({
        id: `peak_${rarity}_${slot}_${index + 1}`,
        name: `${theme}·${suffixes[index]}`,
        slot,
        classId: null,
    }))),
];
const buildPeakWeaponNamePool = (rarity, weapons) => Object.entries(weapons).flatMap(([classId, names]) => names.map((name, index) => ({
    id: `peak_${rarity}_${classId}_weapon_${index + 1}`,
    name,
    slot: 'weapon',
    classId,
})));
export const PEAK_EQUIPMENT_NAME_POOLS = Object.freeze(Object.fromEntries(Object.entries(ABYSS_RARITY_LOOT).map(([rarity, entries]) => [
    rarity,
    PEAK_HIGH_EQUIPMENT_NAMES[rarity]
        ? buildPeakHighEquipmentNamePool(rarity, PEAK_HIGH_EQUIPMENT_NAMES[rarity])
        : PEAK_LOW_WEAPON_NAMES[rarity]
            ? [...entries.filter((entry) => entry.slot !== 'weapon'), ...buildPeakWeaponNamePool(rarity, PEAK_LOW_WEAPON_NAMES[rarity])]
            : entries,
])));
export const PEAK_EQUIPMENT_DROP_BANDS = [
    { maxLevel: 8, weights: { inferior: 92, common: 8 } },
    { maxLevel: 16, weights: { inferior: 72, common: 27, advanced: 1 } },
    { maxLevel: 24, weights: { inferior: 40, common: 48, advanced: 11.5, rare: .5 } },
    { maxLevel: 34, weights: { inferior: 15, common: 45, advanced: 34, rare: 5.7, artifact: .28, legendary: .02 } },
    { maxLevel: 42, weights: { inferior: 6, common: 36, advanced: 42, rare: 14.5, artifact: 1.35, legendary: .14, epic: .01 } },
    { maxLevel: 50, weights: { common: 24, advanced: 40, rare: 29, artifact: 6, legendary: .9, epic: .1 } },
];
export const PEAK_EQUIPMENT_GRADES = ABYSS_ITEM_GRADES;
export const PEAK_STARTER_EQUIPMENT = {
    sword: ABYSS_EQUIPMENT.rustwind_blade,
    brawler: ABYSS_EQUIPMENT.ember_knuckles,
    archer: { id: 'lingfeng_bow', name: '凌风长弓', slot: 'weapon', level: 1, rarity: 'common', classId: 'archer', stats: { physicalAttack: 7, strength: 2, physicalCrit: 2 }, price: 20, icon: '弓' },
    knight: { id: 'novice_holy_lance', name: '见习圣枪', slot: 'weapon', level: 1, rarity: 'common', classId: 'knight', stats: { physicalAttack: 6, vitality: 3, physicalDefense: 5 }, price: 20, icon: '枪' },
    priest: { id: 'novice_pastoral_staff', name: '见习牧杖', slot: 'weapon', level: 1, rarity: 'common', classId: 'priest', stats: { magicalAttack: 7, intelligence: 2, spirit: 3 }, price: 20, icon: '杖' },
    mage: { id: 'novice_arcane_staff', name: '见习奥术杖', slot: 'weapon', level: 1, rarity: 'common', classId: 'mage', stats: { magicalAttack: 8, intelligence: 3, magicalCrit: 2 }, price: 20, icon: '法' },
    lancer: { id: 'novice_cold_spear', name: '见习镔铁枪', slot: 'weapon', level: 1, rarity: 'common', classId: 'lancer', stats: { physicalAttack: 8, strength: 3, physicalCrit: 1 }, price: 20, icon: '枪' },
};

export const isPeakCardAvailableForAdvancement = (card, advancement) => {
    const requirement = card?.requiredAdvancement;
    if (!requirement) return true;
    return advancement?.pathId === requirement.pathId && Number(advancement?.tier) >= Number(requirement.minTier || 1);
};

export const getAvailableCards = (classId, advancement = null) => PEAK_CARDS.filter((entry) => !entry.generatedOnly
    && (entry.classId === 'all' || entry.classId === classId)
    && isPeakCardAvailableForAdvancement(entry, advancement));
