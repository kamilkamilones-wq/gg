import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { UserData, GarmentPiece, GenerationResult, FitAnalysis, ModelView, Angle, Scene } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateTryOn = async (
  userData: UserData,
  garmentPieces: GarmentPiece[],
  modelImages: File[]
): Promise<GenerationResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (garmentPieces.length === 0 || !garmentPieces.length || !garmentPieces[0].frontImage) {
    throw new Error('At least one garment with a front image is required.');
  }

  const allGarmentImageParts = (await Promise.all(
    garmentPieces.flatMap(p => [
      p.frontImage ? fileToGenerativePart(p.frontImage) : null,
      p.backImage ? fileToGenerativePart(p.backImage) : null,
      ...p.detailImages.map(d => d ? fileToGenerativePart(d) : null)
    ])
  )).filter((p): p is { inlineData: { data: string; mimeType: string; } } => p !== null);

  const modelImageParts = modelImages ? await Promise.all(modelImages.map(fileToGenerativePart)) : [];
  
  const modelDescription = `Płeć: ${userData.gender}, Wzrost: ${userData.height} cm, Waga: ${userData.weight} kg, Typ sylwetki: ${userData.bodyType}, Rozmiar: ${userData.size}.`;
  const fullGarmentDescription = garmentPieces.map(p => p.description).filter(d => d).join(', ');

  const sceneDescriptions: Record<Scene, string> = {
      studio: 'w studio na gładkim, jasnoszarym tle',
      ulica: 'na tle rozmytej, słonecznej ulicy w europejskim mieście',
      wnętrze: 'w jasnym, nowoczesnym wnętrzu typu loft lub kawiarnia',
      park: 'w parku lub ogrodzie, z naturalną zielenią w tle',
  };
  const backgroundPrompt = sceneDescriptions[userData.scene];

  const generateImageView = async (
    angle: Angle, 
    baseViewImagePart: { inlineData: { data: string; mimeType: string; } } | null
    ): Promise<ModelView | null> => {
    
    let promptText = '';
    const parts: any[] = [];
    
    const faceInstruction = modelImageParts.length > 0
        ? 'Użyj załączonych zdjęć modela/modelki jako bazy. Zreprodukuj wygląd osoby (rysy twarzy, budowa ciała, włosy, kolor skóry) tak wiernie, jak to możliwe. Twarz musi być dobrze widoczna i spójna z oryginałem.'
        : 'Twarz musi być anonimowa i nie może przypominać żadnej prawdziwej osoby.';

    const commonPromptInstructions = `Wygeneruj fotorealistyczny, spójny obraz. Cała sylwetka widoczna od stóp do głów. Model/ka stoi w neutralnej pozie, ${backgroundPrompt}. Oświetlenie musi pasować do scenerii. ${faceInstruction}`;
    
    const clothingInstruction = `Kluczowe jest, aby NIE wymyślać nowego ubrania, a jedynie wiernie odtworzyć to z załączonych zdjęć odzieży (przód, tył, detale). Zreprodukuj jego krój, materiał, kolor, wzory i wszystkie detale. Opis tekstowy "${fullGarmentDescription}" służy jedynie jako dodatkowy kontekst. Ubranie musi być realistycznie dopasowane do sylwetki.`;


    if (angle === 'Przód') {
        parts.push(...allGarmentImageParts);
        if (modelImageParts.length > 0) {
            parts.push(...modelImageParts);
        }
        promptText = `Ubierz osobę w ODZIEŻ Z ZAŁĄCZONYCH ZDJĘĆ PRODUKTOWYCH. ${clothingInstruction} ${commonPromptInstructions} Wygeneruj widok z przodu (FRONT).`;
    } else {
        if (!baseViewImagePart) return null;
        parts.push(baseViewImagePart);

        const consistencyInstruction = `Absolutnie kluczowe jest zachowanie spójności postaci: wzrost, budowa ciała, kolor włosów, rysy twarzy muszą być identyczne jak na zdjęciu referencyjnym.`;

        if (angle === 'Tył' && allGarmentImageParts.some(p => p.inlineData.mimeType !== '')) { // Simple check if back image might exist
            parts.push(...allGarmentImageParts.filter((_, i) => i > 0)); // Add back and details
            promptText = `Bazując na pierwszym załączonym obrazie (widok przodem), wygeneruj widok z tyłu (BACK) DOKŁADNIE TEJ SAMEJ osoby, w tej samej scenerii. Osoba ma na sobie ubranie z pozostałych załączonych obrazów (tył/detale ubrania). ${consistencyInstruction} ${clothingInstruction} ${commonPromptInstructions}`;
        } else {
            const angleText = angle === 'Tył' ? 'z tyłu (BACK)' : (angle === 'Prawy Profil' ? 'prawego profilu (RIGHT SIDE)' : 'lewego profilu (LEFT SIDE)');
            promptText = `Bazując na załączonym obrazie (widok przodem), wygeneruj widok DOKŁADNIE TEJ SAMEJ osoby w tej samej scenerii i ubraniu z ${angleText}. ${consistencyInstruction} ${clothingInstruction} ${commonPromptInstructions}`;
        }
    }

    parts.push({ text: promptText });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: { responseModalities: [Modality.IMAGE] },
        });
        const responsePart = response.candidates?.[0]?.content?.parts[0];
        if (responsePart && 'inlineData' in responsePart) {
            const url = `data:${responsePart.inlineData.mimeType};base64,${responsePart.inlineData.data}`;
            return { angle, url };
        }
        return null;
    } catch (error) {
        console.error(`Failed to generate view for ${angle}:`, error);
        return null;
    }
  };

  // 1. Generate Front View first, it will be the reference for others
  const frontView = await generateImageView('Przód', null);
  if (!frontView) {
    throw new Error('Failed to generate the primary model view.');
  }
  
  const generatedViews: ModelView[] = [frontView];
  const frontViewImagePart = { inlineData: { data: frontView.url.split(',')[1], mimeType: 'image/jpeg' }};

  // 2. Generate other views based on the front view
  const otherViewPromises = [
    generateImageView('Prawy Profil', frontViewImagePart),
    generateImageView('Tył', frontViewImagePart),
    generateImageView('Lewy Profil', frontViewImagePart)
  ];
  
  const otherGeneratedViews = (await Promise.all(otherViewPromises)).filter((v): v is ModelView => v !== null);
  generatedViews.push(...otherGeneratedViews);

  const orderedViews: ModelView[] = [];
  const order: Angle[] = ['Przód', 'Prawy Profil', 'Tył', 'Lewy Profil'];
  for (const angle of order) {
      const view = generatedViews.find(v => v.angle === angle);
      if (view) orderedViews.push(view);
  }
  
  // 3. Generate Fit Analysis based on the Front View
  const analysisPrompt = `
    Jesteś wirtualnym stylistą. Na podstawie tego wygenerowanego obrazu modela/modelki, jego/jej parametrów (${modelDescription}) oraz opisu stylizacji ("${fullGarmentDescription}"), dokonaj analizy dopasowania.
    Odpowiedz WYŁĄCZNIE w formacie JSON, używając podanego schematu. Nie dodawaj żadnego innego tekstu ani formatowania markdown.
  `;

  const analysisResponse: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [frontViewImagePart, { text: analysisPrompt }] },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                ramiona: { type: Type.STRING, description: "Dopasowanie w ramionach (np. 'dopasowane', 'luźne')" },
                talia: { type: Type.STRING, description: "Dopasowanie w talii (np. 'przylega', 'oversize')" },
                długość_rękawa: { type: Type.STRING, description: "Długość rękawa (np. 'do nadgarstka', 'za dłonie')" },
                długość_całkowita: { type: Type.STRING, description: "Długość całkowita ubrania (np. 'do bioder', 'do połowy uda')" },
                ogólne_dopasowanie: { type: Type.STRING, description: "Krótki komentarz, czy ubranie wydaje się za małe, za duże, czy w sam raz." }
            },
            required: ["ramiona", "talia", "długość_rękawa", "długość_całkowita", "ogólne_dopasowanie"]
        },
    },
  });

  let fitAnalysis: FitAnalysis | null = null;
  try {
    const jsonText = analysisResponse.text.trim();
    fitAnalysis = JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse fit analysis JSON:", e);
    fitAnalysis = {
        ramiona: "Brak danych",
        talia: "Brak danych",
        długość_rękawa: "Brak danych",
        długość_całkowita: "Brak danych",
        ogólne_dopasowanie: "Nie udało się przeanalizować dopasowania."
    };
  }

  return { views: orderedViews, fitAnalysis };
};