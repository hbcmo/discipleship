'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  section: string;
  text: string;
  options: { text: string; value: number }[];
  explanation?: string;
}

// Redesigned assessment with non-obvious correct answers
// Answer lengths vary, longest answers aren't always correct
const ASSESSMENT_QUESTIONS: Question[] = [
  // Phase 1: Gospel Foundation (Gospel & Salvation)
  {
    id: 'g1',
    section: 'Gospel & Salvation',
    text: 'In Christian theology, what does justification mean?',
    options: [
      { text: 'Becoming a better person through moral effort', value: 0 },
      { text: 'Being declared righteous through faith in Christ', value: 3 },
      { text: 'Gaining eternal happiness by following God\'s commands', value: 1 },
      { text: 'Achieving spiritual enlightenment', value: 0 },
    ],
    explanation: 'Justification is our legal status before God—we are declared righteous through faith in Christ.',
  },
  {
    id: 'g2',
    section: 'Gospel & Salvation',
    text: 'Why did Jesus die on the cross?',
    options: [
      { text: 'He was a martyr dying for a political cause', value: 0 },
      { text: 'To show us how to live nobly', value: 1 },
      { text: 'To pay the penalty for our sins', value: 3 },
      { text: 'To prove His power over death', value: 1 },
    ],
    explanation: 'Jesus died to pay the penalty for our sins and accomplish our redemption.',
  },
  {
    id: 'g3',
    section: 'Gospel & Salvation',
    text: 'What is the resurrection?',
    options: [
      { text: 'Jesus rising from the dead', value: 1 },
      { text: 'The foundation of Christian hope and Christ\'s victory over sin and death', value: 3 },
      { text: 'A spiritual lesson about renewal', value: 1 },
      { text: 'An event that happened metaphorically', value: 0 },
    ],
    explanation: 'The resurrection is Jesus literally rising from the dead, demonstrating His power and offering eternal life.',
  },
  {
    id: 'g4',
    section: 'Gospel & Salvation',
    text: 'What does repentance involve?',
    options: [
      { text: 'Feeling sorry for sin', value: 1 },
      { text: 'Turning from sin and toward Christ', value: 3 },
      { text: 'Confessing sins to a priest', value: 0 },
      { text: 'Doing penance to earn forgiveness', value: 0 },
    ],
    explanation: 'Repentance means turning from sin and toward Christ with changed mind and direction.',
  },

  // Phase 2: Biblical Foundations (Scripture & Bible Study)
  {
    id: 'b1',
    section: 'Scripture & Bible Study',
    text: 'How many books are in the Protestant Bible?',
    options: [
      { text: '39', value: 0 },
      { text: '27', value: 0 },
      { text: '66', value: 3 },
      { text: '73', value: 1 },
    ],
    explanation: 'The Protestant Bible contains 66 books (39 OT + 27 NT). Catholic Bibles include additional books.',
  },
  {
    id: 'b2',
    section: 'Scripture & Bible Study',
    text: 'What principle guides interpreting Bible passages?',
    options: [
      { text: 'Whatever meaning feels right to you personally', value: 0 },
      { text: 'Understanding the historical context, grammar, and author\'s intent', value: 3 },
      { text: 'Only using commentaries and traditions', value: 1 },
      { text: 'Reading symbolically without literal meaning', value: 0 },
    ],
    explanation: 'Good interpretation requires understanding context, grammar, and what the author intended.',
  },
  {
    id: 'b3',
    section: 'Scripture & Bible Study',
    text: 'Who authored the four Gospels?',
    options: [
      { text: 'The disciples Matthew, Mark, Luke, and John', value: 1 },
      { text: 'We don\'t know for certain the original authors', value: 3 },
      { text: 'Paul and other apostles', value: 0 },
      { text: 'Early church councils', value: 0 },
    ],
    explanation: 'Tradition attributes them to Matthew, Mark, Luke, and John, though scholarly discussion continues.',
  },
  {
    id: 'b4',
    section: 'Scripture & Bible Study',
    text: 'What happened at Pentecost?',
    options: [
      { text: 'The church was formally established', value: 1 },
      { text: 'The Holy Spirit was given and the church began', value: 3 },
      { text: 'Jesus promised to return soon', value: 0 },
      { text: 'The disciples received special spiritual powers', value: 1 },
    ],
    explanation: 'Pentecost was when the Holy Spirit was given, empowering the disciples to witness.',
  },

  // Phase 3: Discipleship Basics & Church
  {
    id: 'c1',
    section: 'Church & Membership',
    text: 'What is baptism in Baptist practice?',
    options: [
      { text: 'An act that saves or cleanses sin', value: 0 },
      { text: 'Public identification with Christ after conversion', value: 3 },
      { text: 'Something done to infants to bring them into the church', value: 0 },
      { text: 'A requirement for attending church services', value: 0 },
    ],
    explanation: 'Baptist baptism is by immersion of believers as public testimony to conversion.',
  },
  {
    id: 'c2',
    section: 'Church & Membership',
    text: 'What is the Lord\'s Supper?',
    options: [
      { text: 'The last meal Jesus ate before His crucifixion', value: 1 },
      { text: 'Jesus\'s last meal; believers remember His death through it', value: 3 },
      { text: 'A ritual that spiritually sustains our salvation', value: 1 },
      { text: 'An optional church practice with little significance', value: 0 },
    ],
    explanation: 'The Lord\'s Supper commemorates Christ\'s death and is a sign of covenant relationship.',
  },
  {
    id: 'c3',
    section: 'Church & Membership',
    text: 'What does church discipline aim to accomplish?',
    options: [
      { text: 'Permanently remove sinners from the church', value: 0 },
      { text: 'Restore believers and maintain holiness', value: 3 },
      { text: 'Punish people for breaking rules', value: 1 },
      { text: 'Show power of church leadership', value: 0 },
    ],
    explanation: 'Discipline is redemptive—meant to restore believers and protect church purity.',
  },
  {
    id: 'c4',
    section: 'Church & Membership',
    text: 'What is congregational polity?',
    options: [
      { text: 'A bishop rules the church', value: 0 },
      { text: 'The congregation collectively makes decisions', value: 3 },
      { text: 'An appointed committee controls everything', value: 0 },
      { text: 'A pope oversees all churches', value: 0 },
    ],
    explanation: 'Congregational polity means the local church body makes decisions together.',
  },

  // Phase 4: Sanctification & Holiness
  {
    id: 's1',
    section: 'Sanctification & Holiness',
    text: 'What is sanctification?',
    options: [
      { text: 'Being declared holy by God', value: 1 },
      { text: 'Growing in holiness as the Spirit transforms us', value: 3 },
      { text: 'Becoming perfect in this life', value: 0 },
      { text: 'Reaching a special spiritual status', value: 0 },
    ],
    explanation: 'Sanctification is progressive transformation into Christ\'s likeness.',
  },
  {
    id: 's2',
    section: 'Sanctification & Holiness',
    text: 'How do we grow spiritually?',
    options: [
      { text: 'God works alone without our effort', value: 0 },
      { text: 'We work alone through discipline', value: 0 },
      { text: 'Through God\'s power working with our obedience', value: 3 },
      { text: 'By attending church services regularly', value: 1 },
    ],
    explanation: 'Growth requires both God\'s grace and our cooperation through obedience.',
  },
  {
    id: 's3',
    section: 'Sanctification & Holiness',
    text: 'What is mortification of sin?',
    options: [
      { text: 'Killing oneself physically', value: 0 },
      { text: 'Feeling ashamed of past mistakes', value: 1 },
      { text: 'Putting to death sinful desires through God\'s power', value: 3 },
      { text: 'Becoming sinless in this life', value: 0 },
    ],
    explanation: 'Mortification means crucifying sinful impulses with the Spirit\'s help.',
  },
  {
    id: 's4',
    section: 'Sanctification & Holiness',
    text: 'What is the role of the Holy Spirit?',
    options: [
      { text: 'To make us feel good emotionally', value: 1 },
      { text: 'To empower us, convict us, and transform us', value: 3 },
      { text: 'To replace our conscience', value: 0 },
      { text: 'To give us special abilities', value: 1 },
    ],
    explanation: 'The Spirit convicts, empowers, guides, and transforms believers.',
  },

  // Phase 5: Spiritual Leadership Essentials
  {
    id: 'l1',
    section: 'Spiritual Leadership',
    text: 'What is the core of servant leadership?',
    options: [
      { text: 'Being nice to people', value: 1 },
      { text: 'Using your position for others\' growth', value: 3 },
      { text: 'Never disagreeing with anyone', value: 0 },
      { text: 'Giving people what they want', value: 0 },
    ],
    explanation: 'Servant leadership means using authority to serve others\' spiritual development.',
  },
  {
    id: 'l2',
    section: 'Spiritual Leadership',
    text: 'What matters most in spiritual leadership?',
    options: [
      { text: 'Your education and credentials', value: 0 },
      { text: 'Your character and faithfulness', value: 3 },
      { text: 'Your natural charisma', value: 0 },
      { text: 'Your ability to manage people', value: 1 },
    ],
    explanation: 'Character shaped by Christ matters far more than credentials or personality.',
  },
  {
    id: 'l3',
    section: 'Spiritual Leadership',
    text: 'How should leaders handle disagreement?',
    options: [
      { text: 'Ignore it and move forward', value: 0 },
      { text: 'Remove anyone who disagrees', value: 0 },
      { text: 'Address it with wisdom and seek resolution', value: 3 },
      { text: 'Vote and go with the majority always', value: 1 },
    ],
    explanation: 'Wise leaders address disagreement thoughtfully, seeking reconciliation.',
  },
  {
    id: 'l4',
    section: 'Spiritual Leadership',
    text: 'What is the primary responsibility of leadership?',
    options: [
      { text: 'Keeping the organization running smoothly', value: 1 },
      { text: 'Making members happy', value: 0 },
      { text: 'Leading people to Christ-like maturity', value: 3 },
      { text: 'Accumulating resources and influence', value: 0 },
    ],
    explanation: 'The essential task is helping people grow spiritually toward Christ.',
  },

  // Phase 6: Doctrinal Depth & Christian Thinking
  {
    id: 'd1',
    section: 'Doctrine & Theology',
    text: 'What is the Trinity?',
    options: [
      { text: 'Three gods working together', value: 0 },
      { text: 'One God in three persons', value: 3 },
      { text: 'God with three roles but not distinct persons', value: 1 },
      { text: 'An idea invented by Constantine', value: 0 },
    ],
    explanation: 'The Trinity is one God eternally existing as Father, Son, and Holy Spirit.',
  },
  {
    id: 'd2',
    section: 'Doctrine & Theology',
    text: 'What did the Reformation emphasize?',
    options: [
      { text: 'The Pope\'s authority', value: 0 },
      { text: 'Salvation by faith alone', value: 3 },
      { text: 'Works righteousness', value: 0 },
      { text: 'Church tradition over Scripture', value: 0 },
    ],
    explanation: 'Protestants emphasized justification by faith alone in Christ.',
  },
  {
    id: 'd3',
    section: 'Doctrine & Theology',
    text: 'What is predestination?',
    options: [
      { text: 'Everything is predetermined and humans have no choice', value: 0 },
      { text: 'God knows and chose believers, yet people still have real choice', value: 3 },
      { text: 'Random chance that God cannot predict', value: 0 },
      { text: 'Something that doesn\'t matter for theology', value: 1 },
    ],
    explanation: 'God\'s sovereignty and human responsibility work together.',
  },
  {
    id: 'd4',
    section: 'Doctrine & Theology',
    text: 'What does inerrancy claim about Scripture?',
    options: [
      { text: 'It\'s perfect in every detail of history and science', value: 1 },
      { text: 'It\'s truthful in what it teaches about salvation and faith', value: 3 },
      { text: 'It contains significant errors', value: 0 },
      { text: 'Only some parts are authoritative', value: 0 },
    ],
    explanation: 'Scripture is reliable and true in its purposes, though views on scope differ.',
  },
];

export default function AssessmentPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [currentSection, setCurrentSection] = useState('Gospel & Salvation');
  const [submitted, setSubmitted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const sections = ['Gospel & Salvation', 'Scripture & Bible Study', 'Church & Membership', 'Sanctification & Holiness', 'Spiritual Leadership', 'Doctrine & Theology'];
  const questionsInSection = ASSESSMENT_QUESTIONS.filter(q => q.section === currentSection);
  const currentSectionIndex = sections.indexOf(currentSection);
  const progressPercent = ((currentSectionIndex + 1) / sections.length) * 100;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/auth/login');
          return;
        }
        const userData = await res.json();
        if (userData.role !== 'disciplee') {
          router.push('/');
          return;
        }
        setUser(userData);
      } catch (error) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNext = () => {
    const nextIndex = currentSectionIndex + 1;
    if (nextIndex < sections.length) {
      setCurrentSection(sections[nextIndex]);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentSectionIndex - 1;
    if (prevIndex >= 0) {
      setCurrentSection(sections[prevIndex]);
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setEvaluating(true);
    setError('');

    try {
      const res = await fetch('/api/assessment/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error evaluating assessment. Please try again.');
        setEvaluating(false);
        return;
      }

      const data = await res.json();
      
      // Build clean URL for results page
      const resultUrl = new URL('/assessment/results', window.location.origin);
      resultUrl.searchParams.set('score', String(data.score));
      resultUrl.searchParams.set('phase', String(data.recommendedPhase));
      resultUrl.searchParams.set('percentage', String(data.scorePercentage));
      
      router.push(resultUrl.pathname + resultUrl.search);
    } catch (error) {
      console.error('Assessment submission error:', error);
      setError('Error submitting assessment. Please try again.');
      setEvaluating(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const allAnswered = questionsInSection.every(q => answers[q.id] !== undefined);
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = ASSESSMENT_QUESTIONS.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b border-blue-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
              HBC
            </div>
            <span className="font-semibold text-zinc-900">Placement Assessment</span>
          </div>
          <span className="text-sm text-zinc-600">{user.name}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-zinc-900">
              Section {currentSectionIndex + 1} of {sections.length}: {currentSection}
            </h2>
            <span className="text-sm font-semibold text-zinc-600">
              {totalAnswered} of {totalQuestions} answered
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            Section progress: {questionsInSection.filter(q => answers[q.id] !== undefined).length} of {questionsInSection.length}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {questionsInSection.map((question, index) => (
            <div key={question.id} className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-blue-600 mb-2">Question {ASSESSMENT_QUESTIONS.findIndex(q => q.id === question.id) + 1}</p>
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">{question.text}</h3>
              <div className="space-y-3">
                {question.options.map((option, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: answers[question.id] === option.value ? '#2563eb' : '#e5e7eb',
                      backgroundColor: answers[question.id] === option.value ? '#eff6ff' : 'white'
                    }}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id] === option.value}
                      onChange={() => handleAnswer(question.id, option.value)}
                      className="mt-1"
                    />
                    <span className="text-sm text-zinc-700">{option.text}</span>
                  </label>
                ))}
              </div>
              {question.explanation && answers[question.id] !== undefined && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900">Explanation:</p>
                  <p className="text-sm text-blue-800 mt-1">{question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="px-6 py-2 rounded-lg border border-zinc-300 text-zinc-900 font-semibold hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous Section
          </button>

          <div className="flex gap-2">
            {sections.map((section, i) => (
              <button
                key={i}
                onClick={() => setCurrentSection(section)}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  backgroundColor: i < currentSectionIndex ? '#10b981' : i === currentSectionIndex ? '#2563eb' : '#e5e7eb'
                }}
                title={section}
              />
            ))}
          </div>

          {currentSectionIndex === sections.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={totalAnswered !== totalQuestions || evaluating}
              className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {evaluating ? 'Evaluating...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!allAnswered}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Section →
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-10 p-6 rounded-2xl bg-blue-50 border border-blue-200">
          <p className="text-sm text-zinc-700">
            <span className="font-semibold text-blue-900">💡 About This Assessment:</span> This placement assessment helps determine an appropriate starting phase. Answer based on your genuine understanding. Your score will help us place you where you can grow most effectively.
          </p>
        </div>
      </div>
    </div>
  );
}
