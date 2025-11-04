import React, { useState, useEffect } from 'react';
import { GenerationResult } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { BodyIcon, InfoIcon } from './IconComponents';

interface ResultDisplayProps {
  result: GenerationResult | null;
  isLoading: boolean;
  error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, error }) => {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  useEffect(() => {
    // Reset view when a new result comes in
    setCurrentViewIndex(0);
  }, [result]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-600 bg-red-50 p-4 rounded-lg">
        <InfoIcon className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold">Wystąpił błąd</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!result || result.views.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <BodyIcon className="h-16 w-16 mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold">Gotowy do generowania</h3>
        <p className="max-w-xs">Wypełnij formularz i wgraj zdjęcie, aby zobaczyć wirtualny model.</p>
      </div>
    );
  }

  const currentView = result.views[currentViewIndex];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Wygenerowany Model</h2>
        <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
          <div className="relative">
             <img src={currentView.url} alt={`Generated model - ${currentView.angle} view`} className="w-full h-auto min-h-[400px] object-contain bg-gray-100" />
          </div>
          {result.views.length > 1 && (
             <div className="p-2 bg-gray-50 border-t grid grid-cols-4 gap-2">
              {result.views.map((view, index) => (
                <button
                  key={view.angle}
                  onClick={() => setCurrentViewIndex(index)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
                    currentViewIndex === index
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {view.angle}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {result.fitAnalysis && (
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Analiza Dopasowania</h2>
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-4 rounded-lg space-y-2 text-sm">
            <p><strong>Ramiona:</strong> {result.fitAnalysis.ramiona}</p>
            <p><strong>Talia:</strong> {result.fitAnalysis.talia}</p>
            <p><strong>Długość rękawa:</strong> {result.fitAnalysis.długość_rękawa}</p>
            <p><strong>Długość całkowita:</strong> {result.fitAnalysis.długość_całkowita}</p>
            <p className="pt-2 border-t border-indigo-200 mt-2"><strong>Komentarz:</strong> {result.fitAnalysis.ogólne_dopasowanie}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;