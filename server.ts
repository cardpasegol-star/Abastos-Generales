import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for Gemini price suggestion
app.post("/api/gemini/suggest-price", async (req, res) => {
  try {
    const { name, barcode } = req.body;
    if (!name && !barcode) {
      return res.status(400).json({ error: "Se requiere el nombre del producto o el código de barras." });
    }

    const inputDesc = name ? `Producto: ${name}` : `Código de barras: ${barcode}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analiza este producto: "${inputDesc}". Devuelve una sugerencia de precio para el mercado minorista (almacenes/minimarkets) en Chile en Pesos Chilenos (CLP).`,
      config: {
        systemInstruction: "Actúa como un experto en retail de almacenes en Chile. Sugiere un precio realista de venta al público en Pesos Chilenos (CLP) para el producto provisto. Debe ser un entero razonable. Explica la razón en un texto breve de exactamente 1 línea.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            precio_sugerido: {
              type: Type.INTEGER,
              description: "Sugerencia de precio de venta al público para almacenes en Chile en CLP (pesos chilenos). Debe ser un número entero (ej: 1200)."
            },
            razon_sugerencia: {
              type: Type.STRING,
              description: "Breve explicación de 1 línea sobre la sugerencia de precio."
            }
          },
          required: ["precio_sugerido", "razon_sugerencia"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No se recibió respuesta de Gemini");
    }

    const data = JSON.parse(text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: error.message || "Error al procesar la sugerencia con la IA." });
  }
});

// Dedicated endpoint for AI-assisted scanning when product is new or public APIs fail/timeout
app.post("/api/gemini/ai-assisted-scan", async (req, res) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ error: "Se requiere el código de barras." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analiza este código de barras o producto de almacén: "${barcode}". Si el código de barras es conocido (ej: prefijo EAN 780 de Chile, o un código EAN común), identifica el producto real de almacén de Chile. Si el código no es conocido o es genérico, inventa o sugiere de forma inteligente un producto de almacén chileno común y realista que podría tener este código de barras (por ejemplo, un refresco, cereal, fideos, golosina chilena, etc.). Genera una sugerencia de precio CLP para el mercado minorista (almacenes/minimarkets) en Chile.`,
      config: {
        systemInstruction: "Actúa como un experto en retail de almacenes en Chile. Estima un nombre de producto realista en español chileno (ej: 'Néctar Soprole Durazno 1L'), clasifícalo en una de estas categorías: 'Bebidas', 'Abarrotes', 'Lácteos', 'Snacks', y sugiere un precio realista de venta al público en Pesos Chilenos (CLP). El precio sugerido debe ser un número entero (ej: 1400). Explica la razón de forma concisa en exactamente una línea.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nombre_estimado: {
              type: Type.STRING,
              description: "Nombre estimado o sugerido de forma realista en español chileno."
            },
            categoria_estimada: {
              type: Type.STRING,
              enum: ["Bebidas", "Abarrotes", "Lácteos", "Snacks"],
              description: "La categoría del producto."
            },
            precio_sugerido: {
              type: Type.INTEGER,
              description: "Precio sugerido de venta minorista en CLP (ej: 1500)."
            },
            razon_sugerencia: {
              type: Type.STRING,
              description: "Breve explicación de exactamente 1 línea."
            }
          },
          required: ["nombre_estimado", "categoria_estimada", "precio_sugerido", "razon_sugerencia"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No se recibió respuesta de Gemini");
    }

    const data = JSON.parse(text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error in ai-assisted-scan:", error);
    res.status(500).json({ error: error.message || "Error al procesar el escaneo asistido con IA." });
  }
});

// Vite middleware setup for development, static serve for production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
