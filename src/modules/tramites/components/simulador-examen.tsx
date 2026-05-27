'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Award, HelpCircle } from 'lucide-react';

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
    question: 'Si un conductor es detenido y se le detecta alcohol en la sangre por encima del límite legal, la sanción correspondiente es:',
    options: [
      'Una amonestación verbal.',
      'Multa pecuniaria y suspensión de la licencia de conducir.',
      'Cancelación definitiva de la licencia de conducir en todos los casos.',
      'Detención del vehículo por 24 horas solamente.'
    ],
    correctAnswer: 1,
    explanation: 'Según el Reglamento Nacional de Tránsito de Perú, conducir con presencia de alcohol en la sangre por encima del límite permitido califica como infracción muy grave (multa y suspensión temporal de licencia).'
  },
  {
    id: 2,
    question: '¿Qué tipo de luces se deben utilizar al transitar por las carreteras peruanas de día?',
    options: [
      'Luces altas únicamente.',
      'No es obligatorio usar luces de día.',
      'Luces bajas o luces diurnas de manera obligatoria.',
      'Luces intermitentes de emergencia.'
    ],
    correctAnswer: 2,
    explanation: 'En las redes viales nacionales y departamentales del Perú, el uso de las luces bajas o diurnas es obligatorio las 24 horas del día para mejorar la visibilidad.'
  },
  {
    id: 3,
    question: 'La señal vertical de tránsito de forma octogonal y color rojo (R-1) indica:',
    options: [
      'Ceda el paso.',
      'Pare de forma obligatoria.',
      'Giro obligatorio a la derecha.',
      'Zona escolar.'
    ],
    correctAnswer: 1,
    explanation: 'La señal reglamentaria R-1 es el octágono rojo de "PARE", indicando la obligación del conductor de detener el vehículo por completo antes de continuar la marcha.'
  },
  {
    id: 4,
    question: '¿Cuál es la velocidad máxima permitida en zonas residenciales urbanas en el Perú?',
    options: [
      '30 km/h.',
      '50 km/h.',
      '80 km/h.',
      '60 km/h.'
    ],
    correctAnswer: 0,
    explanation: 'De acuerdo con las modificaciones de velocidad del MTC vigentes, la velocidad máxima en zonas residenciales es de 30 km/h para salvaguardar la seguridad de los peatones.'
  }
];

export function SimuladorExamen() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOpt(optionIdx);
    setIsAnswered(true);

    if (optionIdx === BALOTARIO_MTC[currentIdx].correctAnswer) {
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

  const currentQuestion = BALOTARIO_MTC[currentIdx];

  if (showResult) {
    const passed = score >= 3; // Pasa con 75% o más en este demo
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-teal-400">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold">¡Simulacro Terminado!</h3>
        <p className="text-sm text-slate-400">
          Obtuviste <strong className="text-white text-lg">{score}</strong> de <strong className="text-white text-lg">{BALOTARIO_MTC.length}</strong> respuestas correctas.
        </p>
        
        <div className={`p-4 rounded-2xl border text-sm font-semibold max-w-sm mx-auto ${
          passed 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          {passed ? 'Aprobaste el simulacro básico' : 'No alcanzaste el puntaje mínimo aprobatorio (3 correctas)'}
        </div>

        <button
          onClick={resetQuiz}
          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold transition-all shadow-md text-sm gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Volver a Intentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-teal-400" />
          <span className="text-sm font-bold tracking-wide uppercase text-slate-400">
            Simulador MTC Reglas
          </span>
        </div>
        <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-semibold">
          Pregunta {currentIdx + 1} de {BALOTARIO_MTC.length}
        </span>
      </div>

      {/* Question */}
      <h4 className="text-lg font-bold leading-relaxed text-slate-100">
        {currentQuestion.question}
      </h4>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map((opt, idx) => {
          let optStyle = 'border-slate-800 hover:bg-slate-800/40 hover:border-slate-700 text-slate-300';
          
          if (isAnswered) {
            if (idx === currentQuestion.correctAnswer) {
              optStyle = 'border-emerald-500 bg-emerald-950/30 text-emerald-200';
            } else if (selectedOpt === idx) {
              optStyle = 'border-rose-500 bg-rose-950/30 text-rose-200';
            } else {
              optStyle = 'border-slate-800 opacity-50 text-slate-500';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 ${optStyle}`}
            >
              <span className="text-sm font-medium">{opt}</span>
              {isAnswered && idx === currentQuestion.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {isAnswered && selectedOpt === idx && idx !== currentQuestion.correctAnswer && (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation & Next */}
      {isAnswered && (
        <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <strong className="text-teal-400 block mb-1">Explicación Oficial:</strong>
            {currentQuestion.explanation}
          </div>
          
          <button
            onClick={handleNext}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-md text-center text-sm"
          >
            {currentIdx < BALOTARIO_MTC.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Simulacro'}
          </button>
        </div>
      )}
    </div>
  );
}
