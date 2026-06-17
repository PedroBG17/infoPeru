'use client';

import { useState } from 'react';
import { AlertCircle, Award, CheckCircle2, HelpCircle, RefreshCw } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const BALOTARIO_MTC: Question[] = [
  {
    id: 1,
    question: 'Si un conductor es detenido y se detecta alcohol en la sangre por encima del limite legal, la sancion correspondiente es:',
    options: [
      'Una amonestacion verbal.',
      'Multa pecuniaria y suspension de la licencia de conducir.',
      'Cancelacion definitiva de la licencia de conducir en todos los casos.',
      'Detencion del vehiculo por 24 horas solamente.',
    ],
    correctAnswer: 1,
    explanation:
      'Conducir con alcohol por encima del limite permitido califica como infraccion muy grave y puede implicar multa y suspension temporal de licencia.',
  },
  {
    id: 2,
    question: 'Que tipo de luces se deben utilizar al transitar por carreteras peruanas de dia?',
    options: [
      'Luces altas unicamente.',
      'No es obligatorio usar luces de dia.',
      'Luces bajas o luces diurnas de manera obligatoria.',
      'Luces intermitentes de emergencia.',
    ],
    correctAnswer: 2,
    explanation:
      'En redes viales nacionales y departamentales se exige usar luces bajas o diurnas para mejorar la visibilidad.',
  },
  {
    id: 3,
    question: 'La senal vertical de transito de forma octogonal y color rojo indica:',
    options: ['Ceda el paso.', 'Pare de forma obligatoria.', 'Giro obligatorio a la derecha.', 'Zona escolar.'],
    correctAnswer: 1,
    explanation:
      'La senal reglamentaria PARE obliga al conductor a detener el vehiculo por completo antes de continuar.',
  },
  {
    id: 4,
    question: 'Cual es la velocidad maxima permitida en zonas residenciales urbanas?',
    options: ['30 km/h.', '50 km/h.', '80 km/h.', '60 km/h.'],
    correctAnswer: 0,
    explanation:
      'La velocidad maxima en zonas residenciales es 30 km/h para proteger a peatones y reducir riesgos.',
  },
];

export function SimuladorExamen() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = BALOTARIO_MTC[currentIdx];

  const handleAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOpt(optionIdx);
    setIsAnswered(true);

    if (optionIdx === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsAnswered(false);

    if (currentIdx < BALOTARIO_MTC.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    const passed = score >= 3;

    return (
      <div className="border border-[#E8E4DE] bg-[#0A0F1E] p-6 text-center text-white sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-white/15 bg-white/10 text-[#F59E0B]">
          <Award className="h-8 w-8" />
        </div>
        <h3 className="mt-5 font-heading text-2xl font-bold">Simulacro terminado</h3>
        <p className="mt-2 text-sm text-white/68">
          Obtuviste <strong className="text-white">{score}</strong> de{' '}
          <strong className="text-white">{BALOTARIO_MTC.length}</strong> respuestas correctas.
        </p>

        <div
          className={`mx-auto mt-5 max-w-sm border p-4 text-sm font-semibold ${
            passed ? 'border-emerald-500/30 bg-emerald-950/35 text-emerald-200' : 'border-rose-500/30 bg-rose-950/35 text-rose-200'
          }`}
        >
          {passed ? 'Aprobaste el simulacro basico' : 'No alcanzaste el puntaje minimo aprobatorio'}
        </div>

        <button
          onClick={resetQuiz}
          className="mt-6 inline-flex items-center justify-center gap-2 bg-[#C8102E] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#9B0B22]"
        >
          <RefreshCw className="h-4 w-4" />
          Volver a intentar
        </button>
      </div>
    );
  }

  return (
    <div className="border border-[#E8E4DE] bg-[#0A0F1E] p-5 text-white sm:p-6">
      <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[#F59E0B]" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
            Simulador MTC Reglas
          </span>
        </div>
        <span className="w-fit border border-white/10 bg-white/[0.06] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
          Pregunta {currentIdx + 1} de {BALOTARIO_MTC.length}
        </span>
      </div>

      <h4 className="mt-5 font-heading text-xl font-bold leading-relaxed text-white">{currentQuestion.question}</h4>

      <div className="mt-5 space-y-3">
        {currentQuestion.options.map((option, index) => {
          let optionClass = 'border-white/10 bg-white/[0.04] text-white/75 hover:border-[#C8102E]/50 hover:bg-white/[0.08]';

          if (isAnswered) {
            if (index === currentQuestion.correctAnswer) {
              optionClass = 'border-emerald-500 bg-emerald-950/35 text-emerald-100';
            } else if (selectedOpt === index) {
              optionClass = 'border-rose-500 bg-rose-950/35 text-rose-100';
            } else {
              optionClass = 'border-white/10 text-white/35 opacity-70';
            }
          }

          return (
            <button
              key={option}
              disabled={isAnswered}
              onClick={() => handleAnswer(index)}
              className={`flex w-full items-start justify-between gap-3 border p-4 text-left transition ${optionClass}`}
            >
              <span className="text-sm font-medium leading-6">{option}</span>
              {isAnswered && index === currentQuestion.correctAnswer && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />}
              {isAnswered && selectedOpt === index && index !== currentQuestion.correctAnswer && <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="border border-white/10 bg-white/[0.04] p-4 text-xs leading-6 text-white/62">
            <strong className="mb-1 block text-[#F59E0B]">Explicacion:</strong>
            {currentQuestion.explanation}
          </div>

          <button
            onClick={handleNext}
            className="mt-4 w-full bg-[#C8102E] px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#9B0B22]"
          >
            {currentIdx < BALOTARIO_MTC.length - 1 ? 'Siguiente pregunta' : 'Finalizar simulacro'}
          </button>
        </div>
      )}
    </div>
  );
}
