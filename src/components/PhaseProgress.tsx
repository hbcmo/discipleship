'use client';

import { PHASE_INFO, GENDER_SPECIFIC_TRACKS } from '@/lib/phaseUtils';

interface PhaseProgressProps {
  currentPhase: number;
  completedPhases: number[];
  gender?: string | null;
}

export default function PhaseProgress({ currentPhase, completedPhases, gender }: PhaseProgressProps) {
  const sequence = gender === 'male' ? GENDER_SPECIFIC_TRACKS.men : gender === 'female' ? GENDER_SPECIFIC_TRACKS.women : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="w-full bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">Your Discipleship Journey</h3>
      </div>

      {/* Phase progression visualization */}
      <div className="flex items-center justify-between gap-2">
        {sequence.map((phase, index) => {
          const isCompleted = completedPhases.includes(phase);
          const isCurrent = phase === currentPhase;
          const phaseInfo = PHASE_INFO[phase as keyof typeof PHASE_INFO];

          return (
            <div key={phase} className="flex-1">
              {/* Phase circle */}
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center font-semibold text-sm mb-2 transition-all ${
                  isCompleted ? 'bg-green-100 text-green-900 border-2 border-green-500' : isCurrent ? `${phaseInfo.color} ${phaseInfo.textColor} border-2 border-blue-500 ring-2 ring-blue-300` : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isCompleted ? '✓' : phase}
              </div>
              {/* Phase label */}
              <div className="text-center">
                <p className={`text-xs font-medium leading-tight ${isCurrent ? 'text-blue-900' : 'text-gray-600'}`}>
                  {isCurrent ? (
                    <>
                      <span className="block font-bold">Phase {phase}</span>
                      <span className="text-blue-600">Current</span>
                    </>
                  ) : isCompleted ? (
                    <>
                      <span className="block font-bold">Phase {phase}</span>
                      <span className="text-green-600">Done</span>
                    </>
                  ) : (
                    <span className="block opacity-60">Phase {phase}</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current phase details */}
      {currentPhase > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className={`${PHASE_INFO[currentPhase as keyof typeof PHASE_INFO].color} p-4 rounded-lg`}>
            <h4 className={`font-semibold ${PHASE_INFO[currentPhase as keyof typeof PHASE_INFO].textColor} mb-1`}>
              {PHASE_INFO[currentPhase as keyof typeof PHASE_INFO].name}
            </h4>
            <p className="text-sm text-gray-700">
              Progress: <span className="font-semibold">{completedPhases.length} phases completed</span> • <span className="font-semibold">Phase {sequence.indexOf(currentPhase) + 1} of {sequence.length}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
