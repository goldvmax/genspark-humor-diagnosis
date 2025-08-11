'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Question = { qid: string; text: string; type: 'choice'; options: string[]; weight: number };
type Rule = { if: Record<string, string>; type_id: string };
type TypeDef = { type_id: string; label: string; emoji: string; description: string };
type Theme = {
  theme_id: 'sushi' | 'aimodel' | 'kansai_tsukkomi';
  title: string;
  humor_style: string;
  questions: Question[];
  rules: { map: Rule[]; fallback: string };
  types: TypeDef[];
};

const THEMES: Record<Theme['theme_id'], Theme> = {
  sushi: {
    theme_id: 'sushi',
    title: 'あなたを寿司ネタに例えると？',
    humor_style: 'witty',
    questions: [
      { qid: 'q1', text: '朝のテンションは？', type: 'choice', options: ['静かに浸る', 'すぐ全開', 'じわ上げ'], weight: 1 },
      { qid: 'q2', text: '締切との距離感', type: 'choice', options: ['常に先手', '当日勝負', '運命に任せる'], weight: 2 },
      { qid: 'q3', text: '飲み会での立ち回り', type: 'choice', options: ['聞き役', '盛り上げ役', 'ミステリアス'], weight: 1 },
      { qid: 'q4', text: '好きな食感', type: 'choice', options: ['トロっと', 'ぷりっと', 'ふわっと'], weight: 1 },
    ],
    rules: {
      map: [
        { if: { q1: 'すぐ全開', q2: '当日勝負' }, type_id: 't_maguro' },
        { if: { q3: '盛り上げ役', q4: 'ぷりっと' }, type_id: 't_ebi' },
        { if: { q1: '静かに浸る', q3: '聞き役' }, type_id: 't_tamago' },
        { if: { q4: 'トロっと', q2: '常に先手' }, type_id: 't_maguro' },
        { if: { q1: 'じわ上げ', q4: 'ふわっと' }, type_id: 't_salmon' },
      ],
      fallback: 't_salmon',
    },
    types: [
      { type_id: 't_maguro', label: '本マグロ', emoji: '🐟', description: '芯が強い瞬発力タイプ' },
      { type_id: 't_tamago', label: '玉子', emoji: '🍳', description: 'やさしさで場を包む癒やし系' },
      { type_id: 't_salmon', label: 'サーモン', emoji: '🍣', description: 'みんな大好き万能選手' },
      { type_id: 't_ebi', label: '海老', emoji: '🍤', description: '弾む食感のムードメーカー' },
    ],
  },
  aimodel: {
    theme_id: 'aimodel',
    title: 'あなたをAIモデルに例えると？',
    humor_style: 'witty',
    questions: [
      { qid: 'q1', text: 'アイデアの出し方', type: 'choice', options: ['ひらめき一発', '計画的に積む', '状況で切替'], weight: 2 },
      { qid: 'q2', text: '出力スタイル', type: 'choice', options: ['長文で丁寧に', '要点を箇条書き', 'イメージで説明'], weight: 1 },
      { qid: 'q3', text: '初動は？', type: 'choice', options: ['まず試す', 'まず調べる', '誰かに相談'], weight: 1 },
      { qid: 'q4', text: '好きなタスク', type: 'choice', options: ['文章生成', '要約・検索', '画像ネタ'], weight: 2 },
    ],
    rules: {
      map: [
        { if: { q1: 'ひらめき一発', q4: '画像ネタ' }, type_id: 't_diffusion' },
        { if: { q2: '要点を箇条書き', q3: 'まず調べる' }, type_id: 't_bert' },
        { if: { q2: '長文で丁寧に', q3: '誰かに相談' }, type_id: 't_gpt' },
        { if: { q1: '計画的に積む', q4: '要約・検索' }, type_id: 't_bert' },
        { if: { q1: '状況で切替', q2: 'イメージで説明' }, type_id: 't_gpt' },
      ],
      fallback: 't_gpt',
    },
    types: [
      { type_id: 't_gpt', label: 'GPT', emoji: '🧠', description: '多芸多才なゼネラリスト' },
      { type_id: 't_bert', label: 'BERT', emoji: '📚', description: '読み解き・要約の職人' },
      { type_id: 't_diffusion', label: 'Diffusion', emoji: '🎨', description: '発想とイメージで魅せる' },
      { type_id: 't_rnn', label: 'RNN', emoji: '🔁', description: '味わい深い伝統派' },
    ],
  },
  kansai_tsukkomi: {
    theme_id: 'kansai_tsukkomi',
    title: '関西つっこみタイプ診断',
    humor_style: 'kansai',
    questions: [
      { qid: 'q1', text: 'ツッコミの速さ', type: 'choice', options: ['即座に', 'ちょい待ち', '温存しとく'], weight: 1 },
      { qid: 'q2', text: 'ツッコミの温度', type: 'choice', options: ['やさしめ', 'そこそこ', 'ピリッと'], weight: 2 },
      { qid: 'q3', text: '相手がスベった時', type: 'choice', options: ['拾って伸ばす', '乗っかる', '空気を変える'], weight: 1 },
      { qid: 'q4', text: '好きなオチ', type: 'choice', options: ['きれいに締める', 'カオスで笑う', 'たたみかける'], weight: 1 },
    ],
    rules: {
      map: [
        { if: { q1: '即座に', q2: 'ピリッと', q4: 'たたみかける' }, type_id: 't_chauyaro' },
        { if: { q1: 'ちょい待ち', q2: 'やさしめ', q3: '拾って伸ばす' }, type_id: 't_ee_yanka' },
        { if: { q1: '温存しとく', q3: '空気を変える', q4: 'きれいに締める' }, type_id: 't_moeewa' },
        { if: { q1: '即座に', q2: 'そこそこ', q3: '乗っかる' }, type_id: 't_donaiyanen' },
      ],
      fallback: 't_donaiyanen',
    },
    types: [
      { type_id: 't_donaiyanen', label: 'どないやねん', emoji: '🎤', description: '王道テンポで心地よく' },
      { type_id: 't_ee_yanka', label: 'ええやんか', emoji: '🌈', description: '包容力で場をあたためる' },
      { type_id: 't_chauyaro', label: 'ちゃうやろ', emoji: '✂️', description: 'キレのあるピリ辛系' },
      { type_id: 't_moeewa', label: 'もうええわ', emoji: '🔔', description: 'スマートに締めるまとめ役' },
    ],
  },
};

type Msg = { id: string; role: 'bot' | 'user' | 'typing'; text?: string };

export default function Page() {
  const [stage, setStage] = useState<'landing' | 'consent' | 'questions' | 'result'>('landing');
  const [themeId, setThemeId] = useState<Theme['theme_id'] | null>(null);
  const theme = themeId ? THEMES[themeId] : null;

  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Msg[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [copyOk, setCopyOk] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const total = theme?.questions.length ?? 0;
  const completed = stage === 'questions' ? qIndex : stage === 'result' ? total : 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const startDiagnosis = (id: Theme['theme_id']) => {
    setThemeId(id);
    setStage('consent');
    setQIndex(0);
    setAnswers({});
    setMessages([
      { id: 'm1', role: 'bot', text: 'こんにちは！3分で笑って帰れます。準備OK？ 😊' },
      { id: 'm2', role: 'bot', text: `今日は「${THEMES[id].title}」で診断しますね！` },
      { id: 'm3', role: 'bot', text: 'これはジョークです。診断結果は娯楽目的に限ります。よろしいですか？' },
    ]);
    setOptions(['はい、楽しみます！', 'いいえ']);
  };

  const goHome = () => {
    setStage('landing'); setThemeId(null);
    setMessages([]); setOptions([]); setQIndex(0);
    setAnswers({}); setCopyOk(false);
  };

  const acceptConsent = () => {
    setStage('questions');
    setMessages((p) => [...p, { id: 'u-consent', role: 'user', text: 'はい、楽しみます！' }]);
    setTimeout(() => askQuestion(0), 200);
  };
  const declineConsent = () => {
    setMessages((p) => [...p, { id: 'u-consent-no', role: 'user', text: 'いいえ' }, { id: 'bye', role: 'bot', text: 'また遊びに来てくださいね！' }]);
    setOptions([]); setTimeout(goHome, 1200);
  };

  const askQuestion = (index: number) => {
    if (!theme) return;
    const q = theme.questions[index];
    setQIndex(index);
    setMessages((p) => [...p, { id: `q-${q.qid}`, role: 'bot', text: q.text }]);
    setOptions(q.options);
  };

  const answerQuestion = (value: string) => {
    if (!theme) return;
    const q = theme.questions[qIndex];
    setMessages((p) => [...p, { id: `u-${q.qid}`, role: 'user', text: value }]);
    setAnswers((prev) => ({ ...prev, [q.qid]: value }));
    setOptions([]);

    const next = qIndex + 1;
    if (next < theme.questions.length) {
      setTimeout(() => askQuestion(next), 300);
    } else {
      setMessages((p) => [...p, { id: 'typing', role: 'typing' }]);
      setTimeout(() => {
        setMessages((p) => p.filter((m) => m.role !== 'typing'));
        setStage('result');
      }, 1200);
    }
  };

  const typeDef: TypeDef | null = useMemo(() => {
    if (!theme || stage !== 'result') return null;
    for (const rule of theme.rules.map) {
      let ok = true;
      for (const [qid, expect] of Object.entries(rule.if)) {
        if (answers[qid] !== expect) { ok = false; break; }
      }
      if (ok) return theme.types.find((t) => t.type_id === rule.type_id) || null;
    }
    return theme.types.find((t) => t.type_id === theme.rules.fallback) || null;
  }, [theme, stage, answers]);

  const humorText = useMemo(() => {
    if (!theme || !typeDef) return '';
    const table: Record<string, Record<string, string>> = {
      sushi: {
        t_maguro: '決める時はスッと前に出るあなた。濃厚だけどしつこくない、場を締める主役気質。でも実は意外と繊細？',
        t_tamago: 'みんなの心をふんわり包むやさしさの塊。甘くて安心できる存在だけど、たまには意外な一面も見せちゃう。',
        t_salmon: '老若男女に愛される安定感。クセがなくて誰とでも合わせられる器用さが光る。実はコスパ最強？',
        t_ebi: 'プリプリの弾力で場を盛り上げるムードメーカー。エビ反りするほど元気いっぱい！',
      },
      aimodel: {
        t_gpt: '何でもそれなりにこなす万能タイプ。でも時々暴走して変な答えを出しちゃうのがご愛嬌。',
        t_bert: '情報を読み解く力はピカイチ。でも時々マニアックすぎて周りがついてこられないかも？',
        t_diffusion: '発想力が豊かで創造性抜群。でも時々現実離れした夢を語っちゃうのが玉にキズ。',
        t_rnn: '古き良き伝統を大切にする職人気質。時間はかかるけど、じっくり考えた答えは味わい深い。',
      },
      kansai_tsukkomi: {
        t_donaiyanen: '関西の王道つっこみをマスターしたあなた。テンポよく場を仕切る司会者タイプ。',
        t_ee_yanka: '優しさあふれるつっこみで、相手を傷つけずに笑いを作る平和主義者。',
        t_chauyaro: 'キレ味鋭いつっこみで場を引き締める。でも愛情たっぷりなので憎めない。',
        t_moeewa: '的確に締めくくるスマートなつっこみ。無駄がなくてカッコいい大人の魅力。',
      },
    };
    return table[theme.theme_id][typeDef.type_id] ?? typeDef.description;
  }, [theme, typeDef]);

  const shareText = typeDef ? `私は${typeDef.label}タイプでした！ ${typeDef.emoji} #ユーモア診断アプリ` : '';
  const copyShare = async () => { try { await navigator.clipboard.writeText(shareText); setCopyOk(true); setTimeout(() => setCopyOk(false), 1500); } catch {} };

  const ThemeCard = ({ id, emoji, title, desc }: { id: Theme['theme_id']; emoji: string; title: string; desc: string }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => startDiagnosis(id)}>
      <div className="text-6xl text-center mb-4">{emoji}</div>
      <h3 className="text-xl font-bold text-center mb-3">{title}</h3>
      <p className="text-gray-600 text-center">{desc}</p>
    </div>
  );

  return (
    <div>
      {/* Landing */}
      {stage === 'landing' && (
        <div className="min-h-screen flex flex-col">
          <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <i className="fas fa-laugh-beam mr-3" /> ユーモア診断アプリ
              </h1>
              <p className="text-xl md:text-2xl mb-6">3分で&quot;笑って当たる&quot;診断体験</p>
              <button
                onClick={() => document.getElementById('themeSection')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100"
              >
                診断を始める <i className="fas fa-arrow-down ml-2" />
              </button>
            </div>
          </header>

          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">🍣</div>
                  <h3 className="font-bold text-xl mb-2">軽妙なユーモア</h3>
                  <p className="text-gray-600">安心して笑える、やさしいツッコミで楽しい診断体験</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="font-bold text-xl mb-2">チャット形式</h3>
                  <p className="text-gray-600">会話しながら進む、直感的でスムーズなインターフェース</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="font-bold text-xl mb-2">3分完結</h3>
                  <p className="text-gray-600">サクッと楽しめて、すぐにシェアできる軽快さ</p>
                </div>
              </div>
            </div>
          </section>

          <section id="themeSection" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">診断テーマを選んでください</h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <ThemeCard id="sushi" emoji="🍣" title="寿司ネタ診断" desc="あなたの性格を寿司ネタに例えると？" />
                <ThemeCard id="aimodel" emoji="🧠" title="AIモデル診断" desc="あなたをAIモデルに例えると？" />
                <ThemeCard id="kansai_tsukkomi" emoji="🎤" title="関西つっこみ診断" desc="あなたのつっこみスタイルは？" />
              </div>
            </div>
          </section>

          <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="container mx-auto px-4 text-center">
              <p>© {new Date().getFullYear()} ユーモア診断アプリ - 娯楽目的のジョーク診断です</p>
            </div>
          </footer>
        </div>
      )}

      {/* Chat */}
      {(stage === 'consent' || stage === 'questions') && (
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <div className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <button onClick={goHome} className="text-gray-600 hover:text-gray-800">
                  <i className="fas fa-arrow-left" /> ホームに戻る
                </button>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="text-sm text-gray-600">{completed}/{total || 4}</div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-20" style={{ height: 'calc(100vh - 140px)' }}>
            <div className="container mx-auto px-4 py-6 space-y-4">
              {messages.map((m) =>
                m.role === 'bot' ? (
                  <div key={m.id} className="flex items-start space-x-3">
                    <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0"><i className="fas fa-robot text-sm" /></div>
                    <div className="bg-white rounded-lg shadow-sm p-4 max-w-md"><p className="text-gray-800">{m.text}</p></div>
                  </div>
                ) : m.role === 'typing' ? (
                  <div key={m.id} className="flex items-start space-x-3">
                    <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0"><i className="fas fa-robot text-sm" /></div>
                    <div className="bg-white rounded-lg shadow-sm p-4 max-w-md"><div className="flex space-x-1"><div className="bg-gray-400 rounded-full w-2 h-2 animate-pulse" /><div className="bg-gray-400 rounded-full w-2 h-2 animate-pulse" /><div className="bg-gray-400 rounded-full w-2 h-2 animate-pulse" /></div></div>
                  </div>
                ) : (
                  <div key={m.id} className="flex items-start space-x-3 justify-end">
                    <div className="bg-blue-500 text-white rounded-lg shadow-sm p-4 max-w-md"><p>{m.text}</p></div>
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0"><i className="fas fa-user text-sm" /></div>
                  </div>
                )
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="container mx-auto">
              <div className="flex flex-wrap gap-2 justify-center">
                {stage === 'consent' ? (
                  <>
                    <button onClick={acceptConsent} className="bg-white border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 px-4 py-2 rounded-full text-sm font-medium">はい、楽しみます！</button>
                    <button onClick={declineConsent} className="bg-white border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 px-4 py-2 rounded-full text-sm font-medium">いいえ</button>
                  </>
                ) : (
                  options.map((op) => (
                    <button key={op} onClick={() => answerQuestion(op)} className="bg-white border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 px-4 py-2 rounded-full text-sm font-medium">{op}</button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {stage === 'result' && theme && typeDef && (
        <div className="min-h-screen bg-gray-100 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-teal-400 text-white p-8 text-center">
                <div className="text-6xl mb-4">{typeDef.emoji}</div>
                <h2 className="text-3xl font-bold mb-2">{typeDef.label}</h2>
                <p className="text-lg opacity-90">{typeDef.description}</p>
              </div>

              <div className="p-8">
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-lg mb-3 text-gray-800">診断結果</h3>
                  <p className="text-gray-700 leading-relaxed">{humorText}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 mb-3"><i className="fas fa-share-alt mr-2" />結果をシェアしよう！</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`私は${typeDef.label}タイプでした！ ${typeDef.emoji} #ユーモア診断アプリ`)}`, '_blank')}
                      className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800"
                    >
                      <i className="fab fa-x-twitter mr-2" />X (Twitter)
                    </button>
                    <button
                      onClick={() => window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`私は${typeDef.label}タイプでした！ ${typeDef.emoji} #ユーモア診断アプリ`)}`, '_blank')}
                      className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600"
                    >
                      <i className="fab fa-line mr-2" />LINE
                    </button>
                    <button onClick={copyShare} className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600">
                      <i className="fas fa-copy mr-2" />{copyOk ? 'コピーしました！' : 'コピー'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                    <button
                      onClick={() => { setStage('questions'); setMessages([{ id: 'again', role: 'bot', text: 'もう一度やってみましょう！' }]); setQIndex(0); setAnswers({}); setOptions([]); setTimeout(() => askQuestion(0), 400); }}
                      className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600"
                    >
                      <i className="fas fa-redo mr-2" />もう一回
                    </button>
                    <button onClick={goHome} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                      <i className="fas fa-home mr-2" />別テーマへ
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">※ この診断は娯楽目的のジョークです</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
