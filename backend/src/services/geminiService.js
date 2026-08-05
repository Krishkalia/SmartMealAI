const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async enhancePlan(deterministicPlan, userPreferences) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set. Returning deterministic plan.");
      return deterministicPlan;
    }

    try {
      // In a full implementation, we'd pass the recipe details to Gemini
      // and ask it to write a personalized summary, suggest smart swaps, etc.
      // For now, we simulate this interaction.
      
      const prompt = `
        You are SmartMeal AI. The user has generated a daily meal plan with a budget of $${deterministicPlan.budget}.
        The current cost is $${deterministicPlan.totalCost.toFixed(2)}.
        User preferences: ${userPreferences.join(', ') || 'None'}.
        
        Write a short (2-3 sentences) personalized welcome message for this meal plan, highlighting how it fits their budget and preferences.
      `;

      const result = await this.model.generateContent(prompt);
      const message = result.response.text();
      
      return {
        ...deterministicPlan,
        aiMessage: message
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fallback mechanism: Return deterministic plan on AI failure
      return {
        ...deterministicPlan,
        aiMessage: "Your deterministic meal plan is ready."
      };
    }
  }
}

module.exports = new GeminiService();
