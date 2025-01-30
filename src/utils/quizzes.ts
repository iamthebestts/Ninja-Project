import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..", "..");

interface QuizOption {
    text: string;
    correct: boolean;
}

interface Quiz {
    id: number;
    question: string;
    options: QuizOption[];
    reward: number;
}

// Carrega os quizzes do arquivo JSON
export function loadQuizzes(): Quiz[] {
    try {
        const filePath = join(rootDir, "quizzes.json");
        const fileContent = readFileSync(filePath, "utf-8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Erro ao carregar quizzes:", error);
        return [];
    }
}

// Função para pegar um quiz aleatório
export function getRandomQuiz(quizzes: Quiz[]): Quiz | null {
    if (quizzes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    return quizzes[randomIndex];
}
