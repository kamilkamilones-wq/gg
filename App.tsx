import React, { useState } from 'react';
import { UserData, GarmentPiece, GenerationResult } from './types';
import { generateTryOn } from './services/geminiService';
import Header from './components/Header';
import UserInputForm from './components/UserInputForm';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    gender: 'female',
    height: '170',
    weight: '65',
    bodyType: 'standardowa',
    size: 'M',
    scene: 'studio',
  });

  const [garmentPieces, setGarmentPieces] = useState<GarmentPiece[]>([]);
  const [modelImages, setModelImages] = useState<File[]>([]);

  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (garmentPieces.length === 0 || !garmentPieces[0].frontImage) {
      setError('Dodaj przynajmniej jeden element garderoby i jego zdjęcie przodu.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generatedResult = await generateTryOn(userData, garmentPieces, modelImages);
      setResult(generatedResult);
    } catch (err) {
      console.error(err);
      setError('Wystąpił błąd podczas generowania modelu. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <UserInputForm
              userData={userData}
              setUserData={setUserData}
              garmentPieces={garmentPieces}
              setGarmentPieces={setGarmentPieces}
              modelImages={modelImages}
              setModelImages={setModelImages}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 min-h-[500px]">
            <ResultDisplay result={result} isLoading={isLoading} error={error} />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>&copy; 2024 Wirtualna Przymierzalnia. Powered by Gemini.</p>
      </footer>
    </div>
  );
};

export default App;