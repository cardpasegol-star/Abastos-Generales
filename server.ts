import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

console.log("¿GEMINI_API_KEY configurada?", process.env.GEMINI_API_KEY ? "SÍ" : "NO");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper function to calculate a realistic Chilean market price suggestion when Gemini API is rate-limited or unavailable
function getLocalFallbackPrice(name: string = "", barcode: string = "") {
  const queryStr = (name + " " + barcode).toLowerCase();
  
  let precio_sugerido = 1200;
  let razon_sugerencia = "Sugerencia local estimada para almacenes en Chile (servicio de IA en mantención).";
  let categoria_estimada: "Bebidas" | "Abarrotes" | "Lácteos" | "Snacks" = "Abarrotes";
  let nombre_estimado = name || `Producto nuevo (${barcode || "sin código"})`;

  if (queryStr.includes("fideo") || queryStr.includes("tallarin") || queryStr.includes("pasta") || queryStr.includes("espagueti") || queryStr.includes("lucchetti") || queryStr.includes("carozzi")) {
    precio_sugerido = 1100;
    razon_sugerencia = "Sugerencia local: precio típico de fideos/pastas de 400g en Chile ($900-$1.300 CLP).";
    categoria_estimada = "Abarrotes";
    nombre_estimado = name || "Fideos Spaghetti Lucchetti 400g";
  } else if (queryStr.includes("aceite") || queryStr.includes("maravilla") || queryStr.includes("natura") || queryStr.includes("chef") || queryStr.includes("girasol")) {
    precio_sugerido = 2800;
    razon_sugerencia = "Sugerencia local: precio promedio de aceite de cocina de 1L en almacenes ($2.400-$3.200 CLP).";
    categoria_estimada = "Abarrotes";
    nombre_estimado = name || "Aceite de Maravilla 1L";
  } else if (queryStr.includes("arroz") || queryStr.includes("tucapel") || queryStr.includes("miraflores")) {
    precio_sugerido = 1350;
    razon_sugerencia = "Sugerencia local: precio promedio de arroz de 1kg Grado 1 o 2 en Chile ($1.100-$1.600 CLP).";
    categoria_estimada = "Abarrotes";
    nombre_estimado = name || "Arroz Tucapel Grado 1 1kg";
  } else if (queryStr.includes("bebida") || queryStr.includes("coca") || queryStr.includes("fanta") || queryStr.includes("sprite") || queryStr.includes("nectar") || queryStr.includes("jugo") || queryStr.includes("pepsi") || queryStr.includes("bilz") || queryStr.includes("pap") || queryStr.includes("watts")) {
    precio_sugerido = 1800;
    razon_sugerencia = "Sugerencia local: precio promedio de bebidas o gaseosas de 1.5L en Chile ($1.500-$2.100 CLP).";
    categoria_estimada = "Bebidas";
    nombre_estimado = name || "Bebida de Fantasía 1.5L";
  } else if (queryStr.includes("leche") || queryStr.includes("yogurt") || queryStr.includes("queso") || queryStr.includes("soprole") || queryStr.includes("colun") || queryStr.includes("surlat") || queryStr.includes("mantequilla") || queryStr.includes("crema")) {
    precio_sugerido = 1050;
    razon_sugerencia = "Sugerencia local: precio estándar de leche en caja de 1L en Chile ($950-$1.200 CLP).";
    categoria_estimada = "Lácteos";
    nombre_estimado = name || "Leche Entera Colun 1L";
  } else if (queryStr.includes("papa") || queryStr.includes("snack") || queryStr.includes("ramita") || queryStr.includes("galleta") || queryStr.includes("chocolate") || queryStr.includes("lays") || queryStr.includes("togo") || queryStr.includes("morocha") || queryStr.includes("club social") || queryStr.includes("ramitas") || queryStr.includes("kryzpo")) {
    precio_sugerido = 850;
    razon_sugerencia = "Sugerencia local: precio típico para snacks, papas chicas o galletas de almacén ($500-$1.200 CLP).";
    categoria_estimada = "Snacks";
    nombre_estimado = name || "Papas Fritas Lays Clásicas 100g";
  } else if (queryStr.includes("pan") || queryStr.includes("hallulla") || queryStr.includes("marraqueta") || queryStr.includes("molde")) {
    precio_sugerido = 1900;
    razon_sugerencia = "Sugerencia local: precio de referencia para panadería o panes envasados envasados en Chile.";
    categoria_estimada = "Abarrotes";
    nombre_estimado = name || "Pan Hallulla Corriente 1kg";
  }

  return { precio_sugerido, razon_sugerencia, categoria_estimada, nombre_estimado };
}

// API endpoint for Gemini price suggestion
app.post("/api/gemini/suggest-price", async (req, res) => {
  try {
    const { name, barcode } = req.body;
    if (!name && !barcode) {
      return res.status(400).json({ error: "Se requiere el nombre del producto o el código de barras." });
    }

    const inputDesc = name ? `Producto: ${name}` : `Código de barras: ${barcode}`;
    let data;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analiza este producto: "${inputDesc}". Devuelve una sugerencia de precio para el mercado minorista (almacenes/minimarkets) en Chile en Pesos Chilenos (CLP). 
Considera la marca, tipo de producto, formato/peso si lo tiene, y calcula dinámicamente un precio minorista competitivo y real en Chile (año 2026). Por ejemplo, fideos Lucchetti/Carozzi suelen costar entre $900 y $1.300 CLP, aceites entre $2.000 y $3.500 CLP, bebidas de 1.5L entre $1.500 y $2.000 CLP, chocolates/snacks entre $500 y $1.500 CLP. No uses respuestas de plantilla estáticas si puedes inferir un precio más exacto.`,
        config: {
          systemInstruction: "Actúa como un experto en retail de almacenes en Chile. Sugiere un precio realista y dinámico de venta al público en Pesos Chilenos (CLP) para el producto provisto. Debe ser un entero razonable. Explica la razón en un texto breve de exactamente 1 línea.",
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

      try {
        data = JSON.parse(text.trim());
      } catch (parseErr: any) {
        console.error("ERROR AL PARSEAR JSON DE GEMINI (SUGGEST-PRICE). Texto original recibido:", text, "Error:", parseErr);
        throw parseErr;
      }
    } catch (apiErr: any) {
      console.warn("La llamada a Gemini falló o cuota de API excedida. Usando generador local de resguardo. Detalle:", apiErr.message || apiErr);
      const fallback = getLocalFallbackPrice(name, barcode);
      data = {
        precio_sugerido: fallback.precio_sugerido,
        razon_sugerencia: `[Sugerencia Local - IA sin cuota] ${fallback.razon_sugerencia}`
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error("Error en endpoint /api/gemini/suggest-price:", error);
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

    let data;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analiza este código de barras o producto de almacén: "${barcode}". 
Si el código de barras empieza con '780' u otro prefijo chileno, identifica o infiere que corresponde a un producto chileno auténtico de consumo masivo (ej: fideos Parma, Carozzi, Lucchetti, arroz Tucapel, aceite, bebidas CCU/Andina, lácteos Soprole/Colun, galletas McKay, etc.).
Si el código no es conocido, deduce qué tipo de producto de almacén chileno realista podría ser (por ejemplo, abarrotes básicos, fideos, salsa de tomate, etc.) basándote en la estructura del código y patrones comunes en Chile.
DEBES estimar y calcular un precio de venta al público dinámico y real en Pesos Chilenos (CLP), basándote estrictamente en los precios de mercado minorista actuales (2026) en almacenes de barrio, minimarkets y supermercados en Chile. No uses precios de plantilla o estáticos como 1200 o 1500 si no corresponden al producto estimado (por ejemplo, un paquete de fideos Parma de 400g suele costar entre $900 y $1.300 CLP, una bebida de 1.5L entre $1.500 y $2.000 CLP, un aceite entre $2.000 y $3.000 CLP, etc.). El precio sugerido debe ser un número entero redondeado.`,
        config: {
          systemInstruction: "Actúa como un experto consultor de retail para almacenes y minimarkets de barrio en Chile. Tu tarea es analizar códigos de barras o nombres de productos y estimar: 1) Un nombre de producto realista en español chileno con marca y formato (ej: 'Fideos Lucchetti Spaghetti N°5 400g', 'Bebida Coca Cola Original 1.5L', 'Leche Semidescremada Soprole 1L'). 2) Una categoría adecuada ('Bebidas', 'Abarrotes', 'Lácteos', 'Snacks'). 3) Un precio sugerido minorista en CLP real, dinámico y actual (en número entero, ej: 1150). 4) Una razón detallada y concisa de exactamente una línea explicando tu estimación en base a la marca, costo estimado de adquisición y margen del 20-30% típico en Chile.",
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

      try {
        data = JSON.parse(text.trim());
      } catch (parseErr: any) {
        console.error("ERROR AL PARSEAR JSON DE GEMINI (AI-ASSISTED-SCAN). Texto original recibido:", text, "Error:", parseErr);
        throw parseErr;
      }
    } catch (apiErr: any) {
      console.warn("La llamada de Escaneo con Gemini falló o cuota de API excedida. Usando generador local de resguardo. Detalle:", apiErr.message || apiErr);
      const fallback = getLocalFallbackPrice("", barcode);
      data = {
        nombre_estimado: fallback.nombre_estimado,
        categoria_estimada: fallback.categoria_estimada,
        precio_sugerido: fallback.precio_sugerido,
        razon_sugerencia: `[Sugerencia Local - IA sin cuota] ${fallback.razon_sugerencia}`
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error("Error en endpoint /api/gemini/ai-assisted-scan:", error);
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
