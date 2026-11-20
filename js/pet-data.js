export const PET_SPECIES = [
    {
        id: 'shadow-wolf', name: '暗夜幼灵', trait: '敏锐直觉',
        description: '来自森林边缘的小小影子，行动迅速，也很重视熟悉的人。',
        image: 'assets/dnf/enemy/idle/shadow-wolf.png', accent: '#9f93ff',
        attributes: { strength: 5, intelligence: 2, charm: 3 },
        talent: { name: '夜行本能', description: '游乐场获得的宠物币增加 15%', playgroundCoins: 0.15 },
    },
    {
        id: 'clockwork-golem', name: '齿轮岩仔', trait: '精密核心',
        description: '身体沉重但心思细密，喜欢把房间里的物件排列整齐。',
        image: 'assets/dnf/enemy/idle/clockwork-golem.png', accent: '#ffc857',
        attributes: { strength: 6, intelligence: 4, charm: 1 },
        talent: { name: '精密作业', description: '所有打工基础报酬增加 15%', jobCoins: 0.15 },
    },
    {
        id: 'frost-lancer', name: '霜枪灵', trait: '冷静专注',
        description: '安静、专注，遇到喜欢的游戏就会认真练习到最后。',
        image: 'assets/dnf/enemy/idle/frost-lancer.png', accent: '#73d8ff',
        attributes: { strength: 4, intelligence: 5, charm: 2 },
        talent: { name: '冷静研习', description: '智力训练额外提升 1 点智力', trainingAttribute: 'intelligence', trainingGain: 1 },
    },
    {
        id: 'frost-warrior', name: '雪铠兽', trait: '坚韧体魄',
        description: '看起来不苟言笑，其实会把得到的每件小礼物都收藏起来。',
        image: 'assets/dnf/enemy/idle/frost-warrior.png', accent: '#9ac6ff',
        attributes: { strength: 7, intelligence: 2, charm: 2 },
        talent: { name: '霜甲体魄', description: '活动消耗的体力减少 15%', energyCost: 0.85 },
    },
    {
        id: 'goblin-raider', name: '绿野跑跑', trait: '热场高手',
        description: '精力旺盛的气氛担当，最擅长把普通的一天变得热闹。',
        image: 'assets/dnf/enemy/idle/goblin-raider.png', accent: '#7be2aa',
        attributes: { strength: 4, intelligence: 2, charm: 6 },
        talent: { name: '快乐感染', description: '所有正向心情恢复效果增加 25%', moodGain: 1.25 },
    },
    {
        id: 'shadow-wraith', name: '幽影书灵', trait: '夜读天赋',
        description: '对谜题和故事充满好奇，常常在夜里冒出意外的好主意。',
        image: 'assets/dnf/enemy/idle/shadow-wraith.png', accent: '#c699ff',
        attributes: { strength: 1, intelligence: 7, charm: 3 },
        talent: { name: '谜题洞察', description: '智慧赛事得分增加 10%', competitionAttribute: 'intelligence', competitionScore: 0.1 },
    },
    {
        id: 'stone-golem', name: '岩墩墩', trait: '可靠肩膀',
        description: '稳重而可靠，虽然反应慢半拍，却从不会丢下自己的伙伴。',
        image: 'assets/dnf/enemy/idle/stone-golem.png', accent: '#d5b483',
        attributes: { strength: 8, intelligence: 1, charm: 2 },
        talent: { name: '磐石之力', description: '力量赛事得分增加 10%', competitionAttribute: 'strength', competitionScore: 0.1 },
    },
    {
        id: 'void-mage', name: '星渊术灵', trait: '灵感涌现',
        description: '脑海里装着许多奇妙想法，偶尔会因为思考而忘记吃饭。',
        image: 'assets/dnf/enemy/idle/void-mage.png', accent: '#ff8fd1',
        attributes: { strength: 1, intelligence: 8, charm: 3 },
        talent: { name: '星渊冥想', description: '真实时间自然成长速度增加 25%', offlineGrowth: 0.25 },
    },
];

export const PET_SPECIES_BY_ID = Object.fromEntries(PET_SPECIES.map((species) => [species.id, species]));

export const PET_AILMENTS = [
    { id: 'stomach', name: '肠胃不适', icon: '胃', needKey: 'satiety', cureAction: 'feed', description: '饱腹长期过低，需要进食或使用药品。' },
    { id: 'skin', name: '皮肤不适', icon: '护', needKey: 'cleanliness', cureAction: 'clean', description: '清洁长期过低，需要洗澡或使用药品。' },
    { id: 'fatigue', name: '过度疲劳', icon: '眠', needKey: 'energy', cureAction: 'sleep', description: '体力长期透支，需要休息或使用药品。' },
];

export const PET_DIALOGUES = {
    needs: {
        satiety: ['肚子发出小小的抗议了……', '{name}现在看什么都有点像点心。', '先吃点东西吧，吃饱了我就有精神陪你。'],
        cleanliness: ['身上黏糊糊的，我想变回亮晶晶。', '刚才好像蹭到灰了……你看见了吗？', '洗得香香的，心情也会一起变好。'],
        mood: ['今天有一点安静，可以陪我待一会儿吗？', '我不是不开心，只是很想和你玩。', '给我一点点关注，我很快就能打起精神。'],
        energy: ['眼皮快要合上了，让我歇一会儿吧。', '电量告急……走路都要变成慢动作了。', '休息好以后，我还想和你去很多地方。'],
        health: ['我有点不舒服，今天先别勉强训练了。', '身体在提醒我需要认真休息和照顾。', '陪我恢复一下吧，我不想让你担心。'],
    },
    time: {
        morning: ['早呀，今天第一件开心事就是见到你。', '晨光正好，我们把今天过得精神一点吧。', '新的一天开始了，我已经准备好陪你啦。'],
        afternoon: ['下午好，你忙完了吗？我一直在这里。', '这个时间最适合去街区逛一圈。', '要不要看看今天还有哪些事情没做？'],
        evening: ['天色慢慢暗了，今天也辛苦你啦。', '晚上的街区会亮灯，我们去看看吧。', '今天发生的事情，我都偷偷记住了。'],
        night: ['这么晚还在呀？我陪你把这一局玩完。', '夜深了，小声一点，我们别吵醒其他伙伴。', '你去休息也没关系，我会好好待在这里。'],
    },
    mood: {
        happy: ['我今天状态超好，感觉什么挑战都能赢！', '你一来，我的心情条就像偷偷涨了一截。', '要是开心能发光，我现在一定很亮。'],
        calm: ['不用一直做什么，待在一起也很好。', '我在认真观察你今天会先玩哪个游戏。', '慢慢来，我们还有很多时间可以一起成长。'],
    },
    stage: {
        幼年期: ['世界好大呀，你要记得牵住我。', '我还小，但已经有想保护你的念头了。'],
        童年期: ['我比刚认识你的时候厉害一点了吧？', '最近学会了好多事，下次还想学新的。'],
        少年期: ['我已经能独当一面了，不过还是喜欢你陪着。', '下一场比赛，让我试试真正的实力。'],
        成年期: ['一起走了这么久，我已经很懂你的习惯了。', '长大不是终点，我们还有新的故事。'],
    },
    species: {
        'shadow-wolf': ['我听见远处的风声了，也听见你来了。', '影子会跟着光走，我会跟着你走。'],
        'clockwork-golem': ['核心运转正常，今天的计划也要整整齐齐。', '咔哒、咔哒，这是我心情不错的声音。'],
        'frost-lancer': ['安静的时候，思路会像冰面一样清楚。', '再难的谜题，多看一会儿也会找到答案。'],
        'frost-warrior': ['别看我表情严肃，我只是正在认真陪你。', '放心站在我身后，风雪也交给我。'],
        'goblin-raider': ['安静太久可不行，来点热闹的！', '今天的气氛就交给我来点燃吧。'],
        'shadow-wraith': ['昨晚想到一个好主意，差点忘了睡觉。', '每个谜题背后，都藏着另一个故事。'],
        'stone-golem': ['我走得慢一点，但答应你的事不会落下。', '累了就靠过来，我的肩膀很稳。'],
        'void-mage': ['刚才想到很远的地方，不过你一来我就回神了。', '星星之间一定有路，只是我们还没发现。'],
    },
    general: [
        '我们已经连续相伴 {days} 天了，明天也要见面。',
        '现在的我是“{personality}”，这可是你陪出来的。',
        '我的天赋“{talent}”可不只是写在名片上的。',
        '名册里还有 {friends} 位伙伴，我没有忘记他们。',
        '已经赢下 {wins} 场比拼了，下一场也认真上吧。',
        '你去玩别的游戏时，我也会在大厅等你回来。',
    ],
    interaction: {
        hover: ['是在看我的状态吗？我今天都有好好照顾自己。', '靠近一点也没关系，我认得你的鼠标。', '被你发现啦，我刚才正在偷偷发呆。'],
        pet: ['摸摸收到！今天也要多陪我一会儿。', '这里可以再摸一下，我不介意的。', '嘿嘿，被你碰到的时候会觉得很安心。', '我没有躲开，因为我知道是你。'],
        menu: ['想做什么？吃饭、洗澡、玩耍，我都听你的。', '快捷菜单打开！今天先从哪件事开始？', '你点，我来配合，我们很有默契的。'],
        drag: ['新位置不错，这里的视野更好。', '慢一点慢一点，我已经站稳啦。', '搬家完成！不过我还是会到处走走。'],
        home: ['回小屋吧，我有好多事情想和你一起做。', '出发，回我们的宠物王国！', '正好，我也想看看小屋今天怎么样了。'],
    },
};

export const PET_TRAINING = [
    {
        id: 'strength', name: '障碍训练', icon: '力', attribute: 'strength', gain: 1,
        description: '穿过障碍与坡道，稳步提升力量。', cooldown: 60,
        needs: { energy: -12, satiety: -4, cleanliness: -4, mood: 2 },
    },
    {
        id: 'intelligence', name: '解谜课堂', icon: '智', attribute: 'intelligence', gain: 1,
        description: '观察图案与机关，积累智力。', cooldown: 60,
        needs: { energy: -10, satiety: -3, mood: -2 },
    },
    {
        id: 'charm', name: '舞台排练', icon: '魅', attribute: 'charm', gain: 1,
        description: '练习节拍与表现力，提升魅力。', cooldown: 60,
        needs: { energy: -9, satiety: -3, cleanliness: -3, mood: 4 },
    },
];

export const PET_JOBS = [
    { id: 'porter', name: '货站搬运员', icon: '运', primary: 'strength', requirement: 3, rewardRate: 72, description: '整理货箱与补给，适合力量型伙伴。' },
    { id: 'courier', name: '街区快递员', icon: '递', primary: 'strength', secondary: 'charm', requirement: 7, rewardRate: 88, description: '在街区间快速送达包裹。' },
    { id: 'librarian', name: '图书整理员', icon: '书', primary: 'intelligence', requirement: 3, rewardRate: 72, description: '分类书籍并修复旧标签。' },
    { id: 'debugger', name: '街机测试员', icon: '测', primary: 'intelligence', requirement: 7, rewardRate: 92, description: '寻找游戏里的异常关卡与机关。' },
    { id: 'cafe', name: '咖啡店迎宾', icon: '迎', primary: 'charm', requirement: 3, rewardRate: 72, description: '接待客人并照看店内陈列。' },
    { id: 'performer', name: '广场表演者', icon: '演', primary: 'charm', requirement: 7, rewardRate: 96, description: '用舞台表现为广场带来人气。' },
];

export const PET_JOB_DURATIONS = [
    { id: 'short', label: '15 分钟', milliseconds: 15 * 60 * 1000, rewardFactor: 0.25, energy: 8 },
    { id: 'medium', label: '1 小时', milliseconds: 60 * 60 * 1000, rewardFactor: 1, energy: 16 },
    { id: 'long', label: '4 小时', milliseconds: 4 * 60 * 60 * 1000, rewardFactor: 3.65, energy: 28 },
];

export const PET_PLAYGROUND_GAMES = [
    { id: 'sprint', name: '追光跑道', icon: '跑', mode: 'timing', attribute: 'strength', speed: 1.25, timeLimit: 5, target: [42, 62], description: '在冲刺时限内停进最佳加速区。' },
    { id: 'memory', name: '星图记忆', icon: '忆', mode: 'memory', attribute: 'intelligence', timeLimit: 12, target: [68, 82], description: '观察逐渐变长的星图序列并完整复现。' },
    { id: 'rhythm', name: '节拍舞台', icon: '拍', mode: 'rhythm', attribute: 'charm', beats: 4, beatDuration: 1.45, target: [70, 86], description: '连续踩准四个拍点，稳定完成整段演出。' },
];

export const PET_COLLECTIONS = [
    { id: 'sun-badge', name: '晨光徽章', icon: '日', rarity: 'common', description: '广场晨练队赠送的小徽章。' },
    { id: 'fountain-coin', name: '许愿旧币', icon: '泉', rarity: 'common', description: '喷泉边捡到的旧纪念币。' },
    { id: 'market-ribbon', name: '商街彩带', icon: '彩', rarity: 'common', description: '庆典后留下的一截彩带。' },
    { id: 'clockwork-key', name: '发条小钥匙', icon: '钥', rarity: 'rare', description: '不知道还能启动什么机关。' },
    { id: 'moon-leaf', name: '月辉叶片', icon: '叶', rarity: 'common', description: '月光下会显出银色叶脉。' },
    { id: 'owl-feather', name: '夜枭羽毛', icon: '羽', rarity: 'rare', description: '森林守望者悄悄留下的礼物。' },
    { id: 'frost-crystal', name: '霜脉晶石', icon: '晶', rarity: 'rare', description: '握在手中仍带着山风的凉意。' },
    { id: 'summit-flag', name: '峰顶旗章', icon: '峰', rarity: 'epic', description: '只有登上雪岭顶端才能得到。' },
    { id: 'stage-confetti', name: '星光纸花', icon: '星', rarity: 'common', description: '舞台谢幕后飘落的闪亮纸花。' },
    { id: 'golden-note', name: '金色音符', icon: '音', rarity: 'epic', description: '据说记录着最完美的一次演出。' },
    { id: 'void-map', name: '星渊残图', icon: '图', rarity: 'rare', description: '拼合后会指向遥远星群。' },
    { id: 'astral-core', name: '天穹核心', icon: '核', rarity: 'epic', description: '古老观测站仍在微微跳动的核心。' },
];

export const PET_EXPLORATIONS = [
    {
        id: 'sunny-plaza', name: '晨光广场', icon: '场', requiredStage: '幼年期', attribute: 'strength', requirement: 3,
        duration: 3 * 60 * 1000, energy: 6, rewardCoins: [5, 8], ticketChance: 0,
        collectibles: ['sun-badge', 'fountain-coin'], description: '在喷泉与晨练队之间认识街区。',
        events: ['帮晨练队捡回了滚远的球。', '在喷泉边听完了一位老人的故事。', '绕着广场跑了一圈，路线已经记熟了。'],
    },
    {
        id: 'old-market', name: '旧街商市', icon: '街', requiredStage: '幼年期', attribute: 'charm', requirement: 5,
        duration: 10 * 60 * 1000, energy: 10, rewardCoins: [16, 24], ticketChance: 0.08,
        collectibles: ['market-ribbon', 'clockwork-key'], description: '帮忙跑腿、讨价还价，也许会遇见旧货摊。',
        events: ['替摊主送完了三份货物。', '参加了一场热闹的街头叫卖。', '从旧货箱里找到了有趣的零件。'],
    },
    {
        id: 'moon-forest', name: '月影森林', icon: '林', requiredStage: '童年期', attribute: 'intelligence', requirement: 9,
        duration: 20 * 60 * 1000, energy: 14, rewardCoins: [34, 48], ticketChance: 0.12,
        collectibles: ['moon-leaf', 'owl-feather'], description: '辨认星图与林间标记，寻找安全的月光小径。',
        events: ['沿着发光蘑菇找到了回程标记。', '解开了刻在树根上的方向谜题。', '和夜枭守望者交换了森林情报。'],
    },
    {
        id: 'frost-ridge', name: '霜风雪岭', icon: '雪', requiredStage: '少年期', attribute: 'strength', requirement: 17,
        duration: 45 * 60 * 1000, energy: 20, rewardCoins: [78, 105], ticketChance: 0.18,
        collectibles: ['frost-crystal', 'summit-flag'], description: '穿过强风与雪坡，在峰顶留下到访证明。',
        events: ['顶着横风完成了最后一段攀登。', '帮助迷路的旅人找回了营地。', '在冰层下发现了一条闪亮矿脉。'],
    },
    {
        id: 'sky-festival', name: '云端庆典', icon: '庆', requiredStage: '少年期', attribute: 'charm', requirement: 19,
        duration: 60 * 60 * 1000, energy: 18, rewardCoins: [105, 140], ticketChance: 0.25,
        collectibles: ['stage-confetti', 'golden-note'], description: '加入空中舞台巡游，用表现力赢得庆典掌声。',
        events: ['临时救场完成了一段即兴演出。', '带领巡游队穿过了整条云上长街。', '谢幕时收到了观众送来的纪念物。'],
    },
    {
        id: 'void-observatory', name: '星渊观测站', icon: '渊', requiredStage: '成年期', attribute: 'intelligence', requirement: 30,
        duration: 2 * 60 * 60 * 1000, energy: 26, rewardCoins: [220, 290], ticketChance: 0.4,
        collectibles: ['void-map', 'astral-core'], description: '修复古代观测装置，记录一次完整星轨。',
        events: ['重新点亮了沉寂多年的星轨仪。', '从残缺记录中推算出了新星坐标。', '在核心室完成了一次稳定校准。'],
    },
];

export const PET_WEEKLY_TASKS = [
    { id: 'weekly-care', label: '完成 12 次日常照顾', field: 'care', target: 12, rewardCoins: 180 },
    { id: 'weekly-training', label: '完成 5 次能力训练', field: 'training', target: 5, rewardCoins: 220, rewardTickets: 1 },
    { id: 'weekly-jobs', label: '完成 3 个打工班次', field: 'jobs', target: 3, rewardCoins: 300, rewardTickets: 1 },
    { id: 'weekly-playground', label: '完成 4 次游乐挑战', field: 'playground', target: 4, rewardCoins: 260, rewardTickets: 2 },
    { id: 'weekly-competition', label: '参加 3 场伙伴比拼', field: 'competition', target: 3, rewardCoins: 360, rewardTickets: 1 },
    { id: 'weekly-exploration', label: '完成 3 次街区探索', field: 'exploration', target: 3, rewardCoins: 320, rewardTickets: 2 },
];

export const PET_GROWTH_STAGES = [
    { id: '幼年期', minDays: 0, minGrowth: 0, rewardCoins: 0, rewardTickets: 0, unlock: '基础照顾与短班打工' },
    { id: '童年期', minDays: 2, minGrowth: 30, rewardCoins: 120, rewardTickets: 1, unlock: '白银杯与中班打工' },
    { id: '少年期', minDays: 7, minGrowth: 120, rewardCoins: 320, rewardTickets: 2, unlock: '黄金杯与长班打工' },
    { id: '成年期', minDays: 21, minGrowth: 360, rewardCoins: 800, rewardTickets: 4, unlock: '大师杯与完整职业收益' },
];

export const PET_COMPETITIONS = [
    { id: 'power-cup', name: '力量挑战杯', icon: '力', attribute: 'strength', description: '速度、耐力与爆发力的综合较量。' },
    { id: 'wisdom-cup', name: '智慧解谜杯', icon: '智', attribute: 'intelligence', description: '观察、记忆与机关推演的综合较量。' },
    { id: 'charm-cup', name: '星光魅力秀', icon: '魅', attribute: 'charm', description: '节拍、表现力与现场感染力的综合较量。' },
];

export const PET_COMPETITION_STRATEGIES = [
    { id: 'rush', name: '抢攻', icon: '攻', counters: 'focus', primaryScale: 1.14, supportScale: 0.55, conditionScale: 0.8, variance: 0.14, description: '强化主能力，克制蓄势，但容易被变招看穿。' },
    { id: 'focus', name: '蓄势', icon: '稳', counters: 'feint', primaryScale: 1, supportScale: 1, conditionScale: 1.2, variance: 0.05, description: '依靠状态稳定发挥，克制变招，但启动较慢。' },
    { id: 'feint', name: '变招', icon: '变', counters: 'rush', primaryScale: 0.92, supportScale: 1.9, conditionScale: 1, variance: 0.18, description: '调用另外两项能力，克制抢攻，但惧怕蓄势。' },
];

export const PET_COMPETITION_DIVISIONS = [
    { id: 'bronze', name: '青铜组', requiredStage: '幼年期', requiredAttribute: 4, fee: 20, energy: 8, opponentPower: [30, 58], winCoins: 60, trophy: 10, rating: 18 },
    { id: 'silver', name: '白银组', requiredStage: '童年期', requiredAttribute: 10, fee: 55, energy: 11, opponentPower: [74, 112], winCoins: 155, trophy: 24, rating: 26 },
    { id: 'gold', name: '黄金组', requiredStage: '少年期', requiredAttribute: 20, fee: 120, energy: 15, opponentPower: [148, 208], winCoins: 360, trophy: 52, rating: 38 },
    { id: 'master', name: '大师组', requiredStage: '成年期', requiredAttribute: 36, fee: 240, energy: 20, opponentPower: [270, 360], winCoins: 820, trophy: 110, rating: 56 },
];

export const PET_OPPONENT_NAMES = [
    '雾港小满', '齿轮阿洛', '白塔星仔', '冰原团团', '月林七七', '街角布丁', '云台米粒', '深谷闪闪',
];

export const PET_ACHIEVEMENTS = [
    { id: 'first-friend', name: '初次相伴', description: '领养第一位伙伴', metric: 'petsAdopted', target: 1, rewardCoins: 80 },
    { id: 'care-keeper', name: '贴心管家', description: '累计完成 30 次日常照顾', metric: 'careCount', target: 30, rewardCoins: 180, rewardTickets: 1 },
    { id: 'training-road', name: '成长之路', description: '累计完成 15 次能力训练', metric: 'trainingCount', target: 15, rewardCoins: 220 },
    { id: 'career-start', name: '职业新星', description: '累计完成 10 个班次', metric: 'jobsCompleted', target: 10, rewardCoins: 300, rewardTickets: 1 },
    { id: 'playground-star', name: '游乐达人', description: '累计完成 10 次游乐挑战', metric: 'playgroundCount', target: 10, rewardCoins: 240, rewardTickets: 2 },
    { id: 'league-rising', name: '擂台新秀', description: '累计赢得 10 场伙伴比拼', metric: 'competitionWins', target: 10, rewardCoins: 420, rewardTickets: 2 },
    { id: 'collector', name: '街区收藏家', description: '累计购买 12 件商品', metric: 'itemsBought', target: 12, rewardCoins: 260 },
    { id: 'arcade-buddy', name: '街机搭档', description: '累计为小游戏助威 10 次', metric: 'arcadeCheers', target: 10, rewardCoins: 200 },
    { id: 'big-family', name: '热闹之家', description: '名册拥有 4 位不同伙伴', metric: 'rosterCount', target: 4, rewardCoins: 500, rewardTickets: 3 },
    { id: 'all-rounder', name: '全能伙伴', description: '同一伙伴三项能力均达到 15', metric: 'minAttribute', target: 15, rewardCoins: 480 },
    { id: 'career-master', name: '职业能手', description: '任意职业累计完成 8 个班次', metric: 'maxJobMastery', target: 8, rewardCoins: 420 },
    { id: 'grown-up', name: '长大成人', description: '培养一位伙伴进入成年期', metric: 'adultPets', target: 1, rewardCoins: 800, rewardTickets: 4 },
    { id: 'story-friend', name: '街区知己', description: '累计完成 10 次街区事件', metric: 'storyChoices', target: 10, rewardCoins: 260, rewardTickets: 1 },
    { id: 'trail-scout', name: '街区旅行家', description: '累计完成 12 次探索', metric: 'explorationsCompleted', target: 12, rewardCoins: 480, rewardTickets: 2 },
    { id: 'memory-cabinet', name: '回忆收藏家', description: '收集 8 件不同纪念物', metric: 'collectionCount', target: 8, rewardCoins: 620, rewardTickets: 3 },
];

export const PET_STORY_EVENTS = [
    {
        id: 'lost-parcel', title: '迷路的包裹', description: '门口放着一个写错地址的包裹，远处似乎有人正在着急寻找。',
        options: [
            { id: 'return', label: '一起寻找失主', outcome: '找到了失主，还收到了一份谢礼。', effect: { coins: 32, needs: { energy: -5, mood: 6 }, affection: 3, growth: 4 } },
            { id: 'station', label: '送去街区驿站', outcome: '驿站接下了包裹，事情稳妥解决。', effect: { coins: 18, needs: { energy: -2 }, affection: 2, growth: 3 } },
        ],
    },
    {
        id: 'mystery-book', title: '会发光的旧书', description: '旧书摊的一本书正发出微光，书页里画着从没见过的星图。',
        options: [
            { id: 'study', label: '认真读完', outcome: '星图被牢牢记住，思路也更清晰了。', effect: { attributes: { intelligence: 1 }, needs: { energy: -6, mood: 3 }, growth: 5 } },
            { id: 'share', label: '讲给大家听', outcome: '围观的人听得入迷，掌声一直没有停。', effect: { attributes: { charm: 1 }, needs: { mood: 7 }, affection: 2, growth: 4 } },
        ],
    },
    {
        id: 'training-call', title: '临时训练赛', description: '训练场刚好缺一位挑战者，教练正在邀请路过的伙伴登场。',
        options: [
            { id: 'join', label: '接受挑战', outcome: '虽然累得气喘吁吁，但动作变得更扎实了。', effect: { attributes: { strength: 1 }, needs: { energy: -9, mood: 5, cleanliness: -4 }, growth: 6 } },
            { id: 'cheer', label: '留在场边助威', outcome: '加油声带动了全场，大家都记住了这份热情。', effect: { attributes: { charm: 1 }, needs: { mood: 8 }, growth: 3 } },
        ],
    },
    {
        id: 'muddy-shortcut', title: '雨后的近路', description: '回家的近路满是水洼，但水洼中央好像闪着宠物币的光。',
        options: [
            { id: 'dash', label: '冲过去看看', outcome: '捡到了宠物币，也毫无意外地溅了一身泥。', effect: { coins: 46, needs: { cleanliness: -16, mood: 5 }, growth: 3 } },
            { id: 'detour', label: '绕路慢慢走', outcome: '一路平稳，还发现了从没注意过的小花园。', effect: { needs: { energy: -3, mood: 8 }, affection: 2, growth: 3 } },
        ],
    },
    {
        id: 'shared-snack', title: '长椅边的点心', description: '熟悉的街区伙伴带来了一盒点心，正招手邀请大家一起分享。',
        options: [
            { id: 'share', label: '坐下一起吃', outcome: '点心的味道很好，更开心的是有人一起分享。', effect: { needs: { satiety: 12, mood: 9 }, affection: 3, growth: 3 } },
            { id: 'save', label: '留一份带回家', outcome: '一份莓果软饼被仔细放进了背包。', effect: { inventory: { 'berry-bun': 1 }, affection: 1, growth: 2 } },
        ],
    },
    {
        id: 'tiny-stage', title: '街角即兴舞台', description: '街角响起熟悉的节拍，主持人把一支备用麦克风递了过来。',
        options: [
            { id: 'perform', label: '登台表演', outcome: '即兴表演赢得了掌声，舞台感也更好了。', effect: { attributes: { charm: 1 }, coins: 24, needs: { energy: -5, mood: 10 }, growth: 5 } },
            { id: 'rhythm', label: '帮忙打节拍', outcome: '节拍稳稳托住了演出，也学到了新的技巧。', effect: { attributes: { intelligence: 1 }, needs: { mood: 6 }, growth: 4 } },
        ],
    },
];

export const PET_ITEMS = [
    { id: 'berry-bun', name: '莓果软饼', icon: '饼', category: 'food', price: 24, effect: { satiety: 18, mood: 2 }, description: '松软的日常点心。' },
    { id: 'moon-milk', name: '月光牛奶', icon: '奶', category: 'food', price: 32, effect: { satiety: 12, energy: 8 }, description: '温热饮品，适合睡前。' },
    { id: 'forest-roast', name: '森林烤肉', icon: '肉', category: 'food', price: 48, effect: { satiety: 30, cleanliness: -2 }, description: '饱腹感很强的一餐。' },
    { id: 'fruit-cup', name: '晨露果杯', icon: '果', category: 'food', price: 40, effect: { satiety: 20, cleanliness: 1 }, description: '清爽又容易入口。' },
    { id: 'star-candy', name: '星星糖', icon: '糖', category: 'food', price: 55, effect: { satiety: 8, mood: 16 }, description: '不能代替正餐，但很开心。' },
    { id: 'festival-feast', name: '庆典拼盘', icon: '宴', category: 'food', price: 100, effect: { satiety: 45, mood: 8 }, description: '值得一起分享的大餐。' },
    { id: 'mint-soap', name: '薄荷香皂', icon: '皂', category: 'care', price: 30, effect: { cleanliness: 25 }, description: '基础清洁用品。' },
    { id: 'soft-brush', name: '蓬松软刷', icon: '刷', category: 'care', price: 45, effect: { cleanliness: 18, mood: 4 }, description: '把毛发梳得整整齐齐。' },
    { id: 'morning-mist', name: '晨光喷雾', icon: '露', category: 'care', price: 65, effect: { cleanliness: 15, mood: 8 }, description: '带有清晨草木气味。' },
    { id: 'spa-ticket', name: '温泉护理券', icon: '泉', category: 'care', price: 120, effect: { cleanliness: 40, health: 5 }, description: '一次完整的清洁护理。' },
    { id: 'bounce-ball', name: '弹弹球', icon: '球', category: 'toy', price: 35, effect: { mood: 18, energy: -8 }, description: '滚到哪里就追到哪里。' },
    { id: 'puzzle-box', name: '机关盒', icon: '盒', category: 'toy', price: 50, effect: { mood: 15, energy: -5 }, attribute: 'intelligence', description: '打开它需要一点耐心。' },
    { id: 'silver-bell', name: '银铃圈', icon: '铃', category: 'toy', price: 55, effect: { mood: 20, energy: -6 }, attribute: 'charm', description: '走动时会发出清脆声音。' },
    { id: 'cloud-plush', name: '云朵抱枕', icon: '云', category: 'toy', price: 75, effect: { mood: 26, energy: 5 }, description: '抱着休息会更安心。' },
    { id: 'herb-tonic', name: '草本补剂', icon: '剂', category: 'medicine', price: 80, effect: { health: 25, energy: 8 }, description: '恢复健康与少量体力。' },
    { id: 'grand-remedy', name: '星辉药箱', icon: '药', category: 'medicine', price: 150, effect: { health: 50 }, description: '应对状态很差的时候。' },
    { id: 'red-scarf', name: '冒险围巾', icon: '巾', category: 'outfit', price: 130, bonus: { strength: 1 }, description: '力量 +1', accent: '#ff8066' },
    { id: 'thinker-goggles', name: '思考护目镜', icon: '镜', category: 'outfit', price: 150, bonus: { intelligence: 1 }, description: '智力 +1', accent: '#61c9ff' },
    { id: 'stage-ribbon', name: '舞台缎带', icon: '带', category: 'outfit', price: 150, bonus: { charm: 1 }, description: '魅力 +1', accent: '#ff8fd1' },
    { id: 'little-crown', name: '纪念小冠', icon: '冠', category: 'outfit', price: 280, bonus: { strength: 1, intelligence: 1, charm: 1 }, description: '三项属性 +1', accent: '#ffc857' },
    { id: 'forest-lamp', name: '森林灯景', icon: '林', category: 'decor', price: 180, description: '把小屋布置成森林遗迹。', background: 'assets/dnf/background/verdant-catacombs.png' },
    { id: 'frost-window', name: '霜雪窗景', icon: '雪', category: 'decor', price: 180, description: '窗外是安静的冰雪山径。', background: 'assets/dnf/background/frozen-ruins.png' },
    { id: 'sky-balcony', name: '云端露台', icon: '空', category: 'decor', price: 220, description: '把远方天空带进小屋。', background: 'assets/dnf/background/sky-sanctuary.png' },
    { id: 'moon-garden', name: '月夜庭院', icon: '月', category: 'decor', price: 240, description: '适合夜晚休息的月色庭院。', background: 'assets/dnf/background/moonlit-forest.png' },
];

export const PET_ITEMS_BY_ID = Object.fromEntries(PET_ITEMS.map((item) => [item.id, item]));

export const PET_DAILY_TASKS = [
    { id: 'care', label: '完成 3 次日常照顾', target: 3, field: 'care', rewardCoins: 55 },
    { id: 'training', label: '完成 1 次能力训练', target: 1, field: 'training', rewardCoins: 65 },
    { id: 'playground', label: '完成 1 次游乐场挑战', target: 1, field: 'playground', rewardCoins: 70, rewardTickets: 1 },
    { id: 'jobs', label: '完成 1 次打工', target: 1, field: 'jobs', rewardCoins: 90 },
    { id: 'competition', label: '参加 1 次能力比拼', target: 1, field: 'competition', rewardCoins: 120, rewardTickets: 1 },
    { id: 'exploration', label: '完成 1 次街区探索', target: 1, field: 'exploration', rewardCoins: 100 },
];

export const ATTRIBUTE_LABELS = { strength: '力量', intelligence: '智力', charm: '魅力' };
export const ITEM_CATEGORY_LABELS = { food: '食物', care: '清洁', toy: '玩具', medicine: '药品', outfit: '装扮', decor: '房间' };
