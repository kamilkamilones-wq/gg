import React from 'react';
import { UserData, GarmentPiece } from '../types';
import ImageUploader from './ImageUploader';
import { GenerateIcon, PlusIcon, TrashIcon } from './IconComponents';

interface UserInputFormProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  garmentPieces: GarmentPiece[];
  setGarmentPieces: React.Dispatch<React.SetStateAction<GarmentPiece[]>>;
  modelImages: File[];
  setModelImages: React.Dispatch<React.SetStateAction<File[]>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const UserInputForm: React.FC<UserInputFormProps> = ({
  userData,
  setUserData,
  garmentPieces,
  setGarmentPieces,
  modelImages,
  setModelImages,
  onSubmit,
  isLoading,
}) => {
  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const addGarmentPiece = () => {
    setGarmentPieces([
      ...garmentPieces,
      {
        id: Date.now().toString(),
        description: '',
        frontImage: null,
        backImage: null,
        detailImages: [],
      },
    ]);
  };

  const removeGarmentPiece = (id: string) => {
    setGarmentPieces(garmentPieces.filter((piece) => piece.id !== id));
  };

  const updateGarmentPiece = (id: string, field: keyof GarmentPiece, value: any) => {
    setGarmentPieces(
      garmentPieces.map((piece) =>
        piece.id === id ? { ...piece, [field]: value } : piece
      )
    );
  };
  
  const addDetailImageSlot = (id: string) => {
      const piece = garmentPieces.find(p => p.id === id);
      if(piece) {
          updateGarmentPiece(id, 'detailImages', [...piece.detailImages, null]);
      }
  };

  const updateDetailImage = (id: string, index: number, file: File | null) => {
      const piece = garmentPieces.find(p => p.id === id);
      if(piece) {
          const newDetailImages = [...piece.detailImages];
          newDetailImages[index] = file;
          updateGarmentPiece(id, 'detailImages', newDetailImages);
      }
  };
  
  const addModelImageSlot = () => {
    setModelImages([...modelImages, null!]);
  };

  const updateModelImage = (index: number, file: File | null) => {
    const newModelImages = [...modelImages];
    if (file) {
        newModelImages[index] = file;
    }
    setModelImages(newModelImages.filter(f => f !== null));
  };


  const isSubmitDisabled = isLoading || garmentPieces.length === 0 || !garmentPieces[0].frontImage;

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Dane Modelu/Modelki</h2>

        <div className="mb-4 p-4 border border-dashed rounded-lg bg-indigo-50 border-indigo-200 space-y-3">
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {modelImages.map((_, index) => (
                    <ImageUploader key={index} label={`Model ${index + 1}`} onFileSelect={(file) => updateModelImage(index, file)} />
                ))}
                <button type="button" onClick={addModelImageSlot} className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col justify-center items-center text-gray-400 hover:border-indigo-500 hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                    <PlusIcon className="h-8 w-8"/>
                    <span>Dodaj zdjęcie</span>
                </button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">Wgraj zdjęcie całej postaci, aby AI ubrało tę osobę. Im więcej zdjęć (różne kąty, twarz), tym lepszy wynik. Jeśli pominiesz, model zostanie wygenerowany na podstawie poniższych danych.</p>
        </div>
        
        <div key={modelImages.length > 0 ? 'image-mode' : 'manual-mode'}>
            {modelImages.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-600 mb-1">Płeć</label>
                        <select id="gender" name="gender" value={userData.gender} onChange={handleUserChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="female">Kobieta</option>
                        <option value="male">Mężczyzna</option>
                        <option value="unisex">Unisex</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bodyType" className="block text-sm font-medium text-gray-600 mb-1">Typ sylwetki</label>
                        <select id="bodyType" name="bodyType" value={userData.bodyType} onChange={handleUserChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="standardowa">Standardowa</option>
                        <option value="szczupła">Szczupła</option>
                        <option value="atletyczna">Atletyczna</option>
                        <option value="pełniejsza">Pełniejsza</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="height" className="block text-sm font-medium text-gray-600 mb-1">Wzrost (cm)</label>
                        <input type="number" id="height" name="height" value={userData.height} onChange={handleUserChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-600 mb-1">Waga (kg)</label>
                        <input type="number" id="weight" name="weight" value={userData.weight} onChange={handleUserChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>
            ) : (
                <div className="text-center p-3 bg-green-100 text-green-800 rounded-lg animate-fade-in border border-green-200">
                    <p className="font-medium text-sm">Zdjęcie osoby wgrane.</p>
                    <p className="text-xs">Model zostanie wygenerowany na podstawie tej fotografii.</p>
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
           <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-600 mb-1">Rozmiar odzieży</label>
            <input type="text" id="size" name="size" value={userData.size} onChange={handleUserChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="np. M, 38" />
          </div>
           <div>
            <label htmlFor="scene" className="block text-sm font-medium text-gray-600 mb-1">Sceneria</label>
            <select id="scene" name="scene" value={userData.scene} onChange={handleUserChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option value="studio">Studio (jasne tło)</option>
              <option value="ulica">Ulica miasta</option>
              <option value="wnętrze">Nowoczesne wnętrze</option>
              <option value="park">Park/Ogród</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
             <h2 className="text-xl font-semibold text-gray-700">Garderoba</h2>
             <button type="button" onClick={addGarmentPiece} className="flex items-center gap-1 text-sm bg-indigo-100 text-indigo-700 font-medium py-1 px-3 rounded-full hover:bg-indigo-200 transition-colors">
                <PlusIcon className="h-4 w-4" />
                Dodaj element
             </button>
        </div>
        <div className="space-y-6">
            {garmentPieces.map((piece, index) => (
                <div key={piece.id} className="p-4 border rounded-lg bg-gray-50 relative">
                    <button type="button" onClick={() => removeGarmentPiece(piece.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                        <TrashIcon className="h-4 w-4"/>
                    </button>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor={`description-${piece.id}`} className="block text-sm font-medium text-gray-600 mb-1">{`Opis elementu #${index + 1}`}</label>
                            <textarea id={`description-${piece.id}`} value={piece.description} onChange={(e) => updateGarmentPiece(piece.id, 'description', e.target.value)} rows={2} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder={`np. krótka czarna skórzana kurtka...`}></textarea>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ImageUploader label="Przód (obowiązkowe)" onFileSelect={(file) => updateGarmentPiece(piece.id, 'frontImage', file)} />
                            <ImageUploader label="Tył (opcjonalnie)" onFileSelect={(file) => updateGarmentPiece(piece.id, 'backImage', file)} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Szczegóły</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {piece.detailImages.map((_, detailIndex) => (
                                    <ImageUploader key={detailIndex} label={`Detal ${detailIndex + 1}`} onFileSelect={(file) => updateDetailImage(piece.id, detailIndex, file)} />
                                ))}
                                <button type="button" onClick={() => addDetailImageSlot(piece.id)} className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col justify-center items-center text-gray-400 hover:border-indigo-500 hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                                    <PlusIcon className="h-8 w-8"/>
                                    <span>Dodaj detal</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {garmentPieces.length === 0 && (
                <p className="text-center text-gray-500 py-4">Kliknij "Dodaj element", aby zacząć budować stylizację.</p>
            )}
        </div>
      </div>
      
      <button type="submit" disabled={isSubmitDisabled} className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
        <GenerateIcon className="h-5 w-5"/>
        {isLoading ? 'Generowanie...' : 'Generuj Model'}
      </button>
    </form>
  );
};

export default UserInputForm;