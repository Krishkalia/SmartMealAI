const { GoogleGenerativeAI } = require('@google/generative-ai');
const Substitution = require('../models/Substitution');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
  }

  /**
   * 6.2 AI Meal Generation
   */
  async generateBestCombination(userPreferences) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required for AI generation.");
    }

    try {
      const prompt = `
        You are SmartMeal AI, an expert culinary assistant.
        The user needs a daily meal plan with brand new recipes for Breakfast, Lunch, and Dinner.
        
        Constraints:
        - Dietary Preferences: ${JSON.stringify(userPreferences.dietaryPreferences || [])}
        - Budget: ₹${userPreferences.budget || 25}
        - Cuisine Preferences: ${JSON.stringify(userPreferences.cuisine || [])}
        - Cook Time Available: ${userPreferences.cookTime || 'Standard'}
        - Pantry Items on Hand (prioritize using these): ${JSON.stringify(userPreferences.pantry || [])}

        Generate 3 completely unique, delicious recipes.
        The recipe MUST be highly detailed.
        - The 'ingredients' array MUST be exhaustive. Include every single item required, including all basic pantry staples like salt, black pepper, cooking oils (e.g., olive oil, vegetable oil), water, and all spices.
        - The 'steps' array MUST provide a comprehensive, step-by-step cooking guide. Break down the process clearly so a beginner can follow it without ambiguity.
        
        Return strictly in this JSON format without markdown ticks:
        {
          "aiMessage": "A 1-2 sentence rationale for why you designed this specific combination of meals.",
          "breakfast": {
            "name": "Recipe Name",
            "mealType": "Breakfast",
            "dietTags": ["vegetarian", "vegan", "keto", "none", "non-vegetarian"],
            "cuisine": "e.g., Continental",
            "description": "Short description",
            "prepTime": 10,
            "cookTime": 15,
            "ingredients": [
              { "name": "Ingredient Name", "qty": 1, "unit": "kg" }
            ],
            "steps": [
              { "text": "Detailed step description", "duration": 5, "type": "prep" }
            ],
            "allergens": []
          },
          "lunch": { /* same schema as breakfast, mealType: "Lunch" */ },
          "dinner": { /* same schema as breakfast, mealType: "Dinner" */ }
        }

        Rules for nested fields:
        - dietTags must be an array of strings from the allowed enum.
        - step type must be one of: "prep", "cook", "wait".
        - Ensure ingredients are common so they can be priced easily.
        - MUST use strictly metric units for ingredients: "g", "kg" for solids, and "ml", "L" for liquids, or "pcs" for items like eggs/onions. Do not use cups, tablespoons, or pinches.
        - CRITICAL RULE: If you use a unit for a specific ingredient in one meal (e.g., 'pcs' for Onion in Breakfast), you MUST use the EXACT SAME unit for that ingredient across all other meals (e.g., 'pcs' for Onion in Lunch). DO NOT mix 'g' and 'pcs' for the same ingredient, or the shopping list calculation will break.
      `;

      let attempts = 0;
      const maxAttempts = 2;
      let currentPrompt = prompt;

      while (attempts < maxAttempts) {
        try {
          const result = await this.model.generateContent(currentPrompt);
          let text = result.response.text();
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
          
          const parsed = JSON.parse(text);
          
          // Basic schema validation check
          if (!parsed.breakfast || !parsed.lunch || !parsed.dinner) {
            throw new Error("Missing required meal objects (breakfast, lunch, dinner)");
          }

          return parsed;
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            console.error("Gemini API error during generation (all attempts failed):", error);
            throw new Error("Failed to generate AI recipes after retry.");
          }
          console.warn(`AI Generation Attempt ${attempts} failed. Retrying with a stricter prompt...`);
          // Append strict instruction for the retry
          currentPrompt += `\n\nCRITICAL ERROR: Your previous response was malformed JSON or missing required fields. YOU MUST RETURN STRICT, VALID JSON ONLY. Do not include any other text or markdown block ticks. Ensure 'breakfast', 'lunch', and 'dinner' objects are strictly present and properly formatted.`;
        }
      }

    } catch (error) {
      console.error("Gemini API error during generation:", error);
      throw new Error("Failed to generate AI recipes. Please try again.");
    }
  }

  /**
   * 6.4 Ingredient Substitution Engine
   */
  async getMissingIngredientSubstitutes(missingIngredients, allergies) {
    const substitutions = {};

    for (const item of missingIngredients) {
      // 1. Check static DB first
      const staticSub = await Substitution.findOne({ originalIngredient: item.ingredientName });
      if (staticSub) {
        // Validate against allergies before using
        const isSafe = !allergies || !allergies.some(a => (staticSub.substitute || '').toLowerCase().includes(a.toLowerCase()));
        if (isSafe) {
          substitutions[item.ingredientName] = {
            substitute: staticSub.substitute,
            ratio: staticSub.ratio,
            notes: staticSub.notes,
            source: 'static'
          };
          continue;
        }
      }

      // 2. Fallback to Gemini
      if (process.env.GEMINI_API_KEY) {
        try {
          const prompt = `
            Suggest a single, common 1:1 substitute for "${item.ingredientName}".
            The user has the following allergies: ${allergies ? allergies.join(', ') : 'none'}.
            Do not suggest anything containing those allergens.
            Return strictly in this JSON format without markdown ticks:
            {
              "substitute": "name of substitute",
              "ratio": "e.g., 1:1 or use 0.5x",
              "notes": "one short sentence on how to use it"
            }
          `;
          const result = await this.model.generateContent(prompt);
          let text = result.response.text();
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(text);
          
          let aiSubstitute = parsed.substitute;
          
          // Strict fallback validation: Even if AI was prompted not to, ensure no allergen string is in the result
          if (allergies && allergies.length > 0) {
            const hasAllergen = allergies.some(a => aiSubstitute.toLowerCase().includes(a.toLowerCase()));
            if (hasAllergen) {
              throw new Error("AI returned an allergen substitute");
            }
          }
          
          substitutions[item.ingredientName] = {
            substitute: aiSubstitute,
            ratio: parsed.ratio,
            notes: parsed.notes,
            source: 'ai'
          };
        } catch (e) {
          console.error(`Gemini sub failed for ${item.ingredientName}`, e.message);
          substitutions[item.ingredientName] = {
            substitute: "No safe substitute found",
            ratio: "N/A",
            notes: "Consider omitting",
            source: 'fallback'
          };
        }
      }
    }

    return substitutions;
  }

  /**
   * 6.5 Multiple Substitution Options (Interactive Swap)
   */
  async getSubstituteOptions(ingredientName, allergies, originalQty, originalUnit) {
    if (!process.env.GEMINI_API_KEY) {
      return [{
        substitute: "No safe substitute found",
        replacementQty: "N/A",
        estimatedPrice: 0,
        notes: "Gemini API key missing",
        source: 'fallback'
      }];
    }

    try {
      const prompt = `
        Provide exactly 3 distinct, common substitute options for "${originalQty || 1} ${originalUnit || ''} of ${ingredientName}".
        The user has the following allergies: ${allergies ? allergies.join(', ') : 'none'}.
        Do not suggest anything containing those allergens.
        For each substitute, provide a realistic estimated price in INR (₹) for the suggested replacement quantity.
        Return strictly as a JSON array of objects without markdown ticks:
        [
          {
            "substitute": "name of option 1",
            "replacementQty": "e.g., 500g or 2 cups",
            "estimatedPrice": 120,
            "notes": "short sentence on how to use it"
          },
          ...
        ]
      `;
      const result = await this.model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      
      // Strict allergy validation on the array
      if (allergies && allergies.length > 0) {
        for (const option of parsed) {
          const hasAllergen = allergies.some(a => option.substitute.toLowerCase().includes(a.toLowerCase()));
          if (hasAllergen) {
            throw new Error("AI returned an allergen substitute");
          }
        }
      }
      
      return parsed.map(opt => ({
        substitute: opt.substitute,
        replacementQty: opt.replacementQty || opt.ratio, // fallback
        estimatedPrice: opt.estimatedPrice || 0,
        notes: opt.notes,
        source: 'ai-manual'
      }));
    } catch (e) {
      console.error(`Manual Gemini sub failed for ${ingredientName}`, e.message);
      return [{
        substitute: "No safe alternative found",
        replacementQty: "N/A",
        estimatedPrice: 0,
        notes: "Consider omitting or trying a standard substitution.",
        source: 'fallback'
      }];
    }
  }

  /**
   * 6.7 Phrase Timeline
   */
  async phraseTimeline(deterministicTimeline) {
    if (!process.env.GEMINI_API_KEY) return deterministicTimeline;

    try {
      const prompt = `
        Turn this rigid cooking schedule into a chronological, natural language timeline.
        The schedule:
        ${JSON.stringify(deterministicTimeline)}
        
        Keep the steps in the exact order provided. For each step, output a phrased string like "While the rice is cooking, start chopping vegetables."
        Return strictly in this JSON format without markdown ticks:
        {
          "phrasedSteps": [
            { "timeOffset": 0, "instruction": "string" }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);

      // Merge phrasing back into timeline
      return deterministicTimeline.map((step, idx) => ({
        ...step,
        phrasedInstruction: parsed.phrasedSteps[idx]?.instruction || step.instruction
      }));
    } catch (e) {
      console.error("Gemini timeline phrasing failed");
      return deterministicTimeline.map(step => ({ ...step, phrasedInstruction: step.instruction }));
    }
  }

  /**
   * Pantry AI Scanning
   */
  async scanPantryImage(base64Image, mimeType) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required for image scanning.");
    }

    try {
      const prompt = `
        You are an expert culinary assistant. I have provided an image of a fridge or pantry.
        Identify all the distinct food items and ingredients you can clearly see.
        Estimate the quantity of each item.
        Return strictly in this JSON format without markdown ticks:
        [
          { "name": "Ingredient Name", "qty": 1, "unit": "pcs" }
        ]
        Units should ideally be standard (e.g., pcs, kg, g, L, ml, bottle, jar, bunch).
      `;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        }
      ]);

      let text = result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("AI did not return an array.");
      }

      return parsed;
    } catch (error) {
      console.error("Gemini image scanning failed:", error);
      throw new Error("Failed to scan image for ingredients.");
    }
  }
  /**
   * 6.3 AI Pricing Engine
   * Estimates the price of a given list of ingredients in INR.
   */
  async estimatePrices(ingredientsList) {
    if (!ingredientsList || ingredientsList.length === 0) return {};

    const prompt = `
      You are an expert Indian grocery estimator.
      Given the following list of ingredients and their quantities, estimate the total cost for each line item in Indian Rupees (INR) based on current Indian market rates.
      Return the result as a strict JSON object where the keys are the exact ingredient names provided, and the values are the estimated cost (a number, in INR).
      Do not include the currency symbol in the values, just the number.
      
      CRITICAL PRICING RULES:
      1. Water used for cooking should be priced at 0 INR (it is practically free).
      2. Small quantities of basic spices (salt, pepper, etc.) should be priced very low (e.g., 0.5 to 2 INR).
      3. Be realistic with the quantities provided.
      
      Example output:
      {
        "Tomatoes": 40.5,
        "Basmati Rice": 120,
        "water": 0
      }
      
      Ingredients List:
      ${ingredientsList.map(ing => `- ${ing.name}: ${ing.qty} ${ing.unit}`).join('\n')}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      let cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Gemini pricing error:", error);
      return {}; // Fallback to empty prices
    }
  }
}

module.exports = new GeminiService();
