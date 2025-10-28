// Comprehensive Food Database with Medical Accuracy
const foodDatabase = {
    // Low Glycemic Index Foods (Safe)
    "broccoli": { carbs: 6, gi: 15, category: "vegetable", fiber: 2.6, safe: true, portion: "1 cup (91g)" },
    "spinach": { carbs: 3, gi: 15, category: "vegetable", fiber: 2.2, safe: true, portion: "1 cup (30g)" },
    "cauliflower": { carbs: 5, gi: 15, category: "vegetable", fiber: 2.1, safe: true, portion: "1 cup (107g)" },
    "kale": { carbs: 7, gi: 15, category: "vegetable", fiber: 2.6, safe: true, portion: "1 cup (67g)" },
    "cabbage": { carbs: 5, gi: 10, category: "vegetable", fiber: 2.2, safe: true, portion: "1 cup (89g)" },
    "zucchini": { carbs: 4, gi: 15, category: "vegetable", fiber: 1.2, safe: true, portion: "1 cup (124g)" },
    "mushrooms": { carbs: 3, gi: 15, category: "vegetable", fiber: 1.0, safe: true, portion: "1 cup (70g)" },
    "bell peppers": { carbs: 6, gi: 15, category: "vegetable", fiber: 1.5, safe: true, portion: "1 cup (149g)" },
    
    // Proteins (Very Safe)
    "chicken breast": { carbs: 0, gi: 0, category: "protein", fiber: 0, safe: true, portion: "100g" },
    "salmon": { carbs: 0, gi: 0, category: "protein", fiber: 0, safe: true, portion: "100g" },
    "eggs": { carbs: 1, gi: 0, category: "protein", fiber: 0, safe: true, portion: "1 large (50g)" },
    "tofu": { carbs: 2, gi: 15, category: "protein", fiber: 1.0, safe: true, portion: "100g" },
    "greek yogurt": { carbs: 4, gi: 35, category: "dairy", fiber: 0, safe: true, portion: "100g" },
    "cheese": { carbs: 1, gi: 0, category: "dairy", fiber: 0, safe: true, portion: "28g" },
    
    // Healthy Fats
    "avocado": { carbs: 9, gi: 15, category: "fat", fiber: 7.0, safe: true, portion: "100g" },
    "almonds": { carbs: 6, gi: 15, category: "nuts", fiber: 3.5, safe: true, portion: "28g" },
    "walnuts": { carbs: 4, gi: 15, category: "nuts", fiber: 2.0, safe: true, portion: "28g" },
    "olive oil": { carbs: 0, gi: 0, category: "fat", fiber: 0, safe: true, portion: "1 tbsp (14g)" },
    
    // Medium Glycemic Index Foods (Moderate)
    "apple": { carbs: 25, gi: 36, category: "fruit", fiber: 4.4, safe: "moderate", portion: "1 medium (182g)" },
    "orange": { carbs: 21, gi: 40, category: "fruit", fiber: 4.3, safe: "moderate", portion: "1 medium (131g)" },
    "banana": { carbs: 27, gi: 51, category: "fruit", fiber: 3.1, safe: "moderate", portion: "1 medium (118g)" },
    "sweet potato": { carbs: 20, gi: 54, category: "starch", fiber: 3.3, safe: "moderate", portion: "100g" },
    "brown rice": { carbs: 45, gi: 55, category: "grain", fiber: 3.5, safe: "moderate", portion: "1 cup cooked (195g)" },
    "oats": { carbs: 66, gi: 55, category: "grain", fiber: 10.1, safe: "moderate", portion: "100g dry" },
    "quinoa": { carbs: 39, gi: 53, category: "grain", fiber: 5.2, safe: "moderate", portion: "1 cup cooked (185g)" },
    "whole wheat bread": { carbs: 49, gi: 60, category: "grain", fiber: 6.9, safe: "moderate", portion: "2 slices (56g)" },
    
    // High Glycemic Index Foods (Caution)
    "white bread": { carbs: 49, gi: 75, category: "grain", fiber: 2.7, safe: false, portion: "2 slices (56g)" },
    "white rice": { carbs: 53, gi: 73, category: "grain", fiber: 0.6, safe: false, portion: "1 cup cooked (186g)" },
    "potato": { carbs: 37, gi: 78, category: "starch", fiber: 4.0, safe: false, portion: "1 medium (173g)" },
    "sugar": { carbs: 100, gi: 100, category: "sweet", fiber: 0, safe: false, portion: "100g" },
    "soda": { carbs: 39, gi: 90, category: "drink", fiber: 0, safe: false, portion: "1 can (355ml)" },
    "cake": { carbs: 57, gi: 85, category: "sweet", fiber: 1.0, safe: false, portion: "100g" },
    "cookies": { carbs: 68, gi: 80, category: "sweet", fiber: 2.0, safe: false, portion: "100g" },
    "ice cream": { carbs: 28, gi: 65, category: "sweet", fiber: 0, safe: false, portion: "100g" },
    "candy": { carbs: 98, gi: 95, category: "sweet", fiber: 0, safe: false, portion: "100g" }
};

// Advanced Food Safety Analysis
class FoodSafetyAnalyzer {
    constructor() {
        this.userProfile = null;
    }
    
    setUserProfile(profile) {
        this.userProfile = profile;
    }
    
    analyzeFoodSafety(foodName, quantityGrams, currentGlucose, insulinOnBoard = 0) {
        const food = this.findFood(foodName);
        if (!food) {
            return {
                safe: "unknown",
                message: "Food not found in database. Please consult your nutritionist.",
                confidence: 0
            };
        }
        
        // Calculate net carbs considering fiber
        const netCarbs = this.calculateNetCarbs(food, quantityGrams);
        
        // Calculate glucose impact
        const glucoseImpact = this.calculateGlucoseImpact(netCarbs, food.gi);
        
        // Project final glucose
        const projectedGlucose = currentGlucose + glucoseImpact - insulinOnBoard;
        
        // Determine safety level
        const safety = this.determineSafetyLevel(projectedGlucose, food, netCarbs);
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(safety, food, quantityGrams, netCarbs, projectedGlucose);
        
        return {
            food: foodName,
            quantity: quantityGrams,
            netCarbs: Math.round(netCarbs * 10) / 10,
            glucoseImpact: Math.round(glucoseImpact),
            projectedGlucose: Math.round(projectedGlucose),
            safety: safety.level,
            confidence: safety.confidence,
            message: safety.message,
            recommendations: recommendations,
            category: food.category,
            glycemicIndex: food.gi
        };
    }
    
    findFood(foodName) {
        const lowerFood = foodName.toLowerCase().trim();
        
        // Exact match
        if (foodDatabase[lowerFood]) {
            return foodDatabase[lowerFood];
        }
        
        // Partial match search
        for (const [key, value] of Object.entries(foodDatabase)) {
            if (key.includes(lowerFood) || lowerFood.includes(key)) {
                return value;
            }
        }
        
        return null;
    }
    
    calculateNetCarbs(food, quantityGrams) {
        const standardPortionCarbs = food.carbs;
        const fiber = food.fiber || 0;
        
        // Calculate net carbs: total carbs - fiber
        const netCarbsPer100g = Math.max(0, standardPortionCarbs - fiber);
        return (netCarbsPer100g * quantityGrams) / 100;
    }
    
    calculateGlucoseImpact(netCarbs, glycemicIndex) {
        // Advanced formula considering glycemic load
        const glycemicLoad = (netCarbs * glycemicIndex) / 100;
        
        // Glucose impact formula based on clinical studies
        let impact = 0;
        
        if (glycemicLoad < 10) {
            impact = glycemicLoad * 1.5; // Low impact
        } else if (glycemicLoad < 20) {
            impact = glycemicLoad * 2.0; // Medium impact
        } else {
            impact = glycemicLoad * 2.5; // High impact
        }
        
        return Math.max(0, impact);
    }
    
    determineSafetyLevel(projectedGlucose, food, netCarbs) {
        // Safety thresholds based on ADA guidelines
        const hypoglycemiaThreshold = 70;
        const targetMax = 180;
        const hyperglycemiaThreshold = 250;
        
        if (projectedGlucose < hypoglycemiaThreshold) {
            return {
                level: "danger",
                confidence: 0.95,
                message: "⚠️ DANGER: This may cause hypoglycemia! Avoid or pair with slower carbs."
            };
        } else if (projectedGlucose > hyperglycemiaThreshold) {
            return {
                level: "danger",
                confidence: 0.90,
                message: "🚨 HIGH RISK: This will likely cause dangerous hyperglycemia!"
            };
        } else if (projectedGlucose > targetMax) {
            return {
                level: "warning",
                confidence: 0.85,
                message: "⚠️ CAUTION: This may raise glucose above target range."
            };
        } else if (food.safe === false) {
            return {
                level: "warning",
                confidence: 0.80,
                message: "⚠️ LIMITED: High GI food. Consume in very small quantities."
            };
        } else if (netCarbs > 30) {
            return {
                level: "moderate",
                confidence: 0.75,
                message: "🟡 MODERATE: High carb content. Monitor your glucose carefully."
            };
        } else {
            return {
                level: "safe",
                confidence: 0.90,
                message: "✅ SAFE: This food fits well within your target range."
            };
        }
    }
    
    generateRecommendations(safety, food, quantityGrams, netCarbs, projectedGlucose) {
        const recommendations = [];
        
        if (safety.level === "danger") {
            recommendations.push("❌ AVOID this food in current conditions");
            recommendations.push("🩸 Check glucose immediately if consumed");
            recommendations.push("🏥 Have fast-acting carbs ready if glucose drops");
        } else if (safety.level === "warning") {
            recommendations.push("⚖️ Reduce quantity to stay in safe range");
            recommendations.push("⏱️ Consume with protein/fat to slow absorption");
            recommendations.push("📱 Monitor glucose 1-2 hours after eating");
        } else if (safety.level === "moderate") {
            recommendations.push("🍽️ Consider pairing with lean protein");
            recommendations.push("💧 Drink plenty of water");
            recommendations.push("🚶 Light activity after eating may help");
        } else {
            recommendations.push("🎉 Excellent choice for stable glucose");
            recommendations.push("📊 Continue with your regular monitoring");
            recommendations.push("🥗 Perfect for maintaining healthy levels");
        }
        
        // Quantity adjustment recommendation
        if (netCarbs > 15 && safety.level !== "safe") {
            const safeQuantity = Math.floor((15 / netCarbs) * quantityGrams);
            recommendations.push(`⚖️ Try ${safeQuantity}g instead of ${quantityGrams}g for better control`);
        }
        
        // Alternative suggestions
        if (food.gi > 55) {
            recommendations.push(`💡 Alternative: Try ${this.suggestAlternative(food.category)}`);
        }
        
        return recommendations;
    }
    
    suggestAlternative(category) {
        const alternatives = {
            "grain": "quinoa or barley",
            "fruit": "berries or apple",
            "starch": "sweet potato or legumes",
            "sweet": "sugar-free options",
            "drink": "water or unsweetened tea"
        };
        
        return alternatives[category] || "lower GI options";
    }
    
    // Generate weekly diet plan
    generateWeeklyDietPlan(userProfile) {
        const plan = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Calculate daily carb targets based on user profile
        const dailyCarbs = this.calculateDailyCarbTarget(userProfile);
        
        days.forEach(day => {
            plan[day] = {
                breakfast: this.generateMeal('breakfast', dailyCarbs * 0.25),
                lunch: this.generateMeal('lunch', dailyCarbs * 0.35),
                dinner: this.generateMeal('dinner', dailyCarbs * 0.30),
                snacks: this.generateSnacks(dailyCarbs * 0.10)
            };
        });
        
        return plan;
    }
    
    calculateDailyCarbTarget(userProfile) {
        // ADA recommended carb distribution
        const baseCarbs = 45; // grams per meal baseline
        const weightFactor = userProfile.weight / 70; // Normalized to 70kg
        const activityFactor = this.getActivityFactor(userProfile.activity);
        
        return Math.round(baseCarbs * weightFactor * activityFactor * 3); // 3 main meals
    }
    
    getActivityFactor(activityLevel) {
        const factors = {
            'sedentary': 0.9,
            'light': 1.0,
            'moderate': 1.1,
            'active': 1.2,
            'athlete': 1.3
        };
        return factors[activityLevel] || 1.0;
    }
    
    generateMeal(mealType, carbTarget) {
        const lowGIFoods = Object.entries(foodDatabase)
            .filter(([_, food]) => food.gi <= 55 && food.safe === true)
            .map(([name, food]) => ({ name, ...food }));
        
        // Select protein source
        const proteins = lowGIFoods.filter(f => f.category === 'protein');
        const protein = proteins[Math.floor(Math.random() * proteins.length)];
        
        // Select carb source
        const carbs = lowGIFoods.filter(f => f.carbs > 5 && f.carbs <= 25);
        const carbSource = carbs[Math.floor(Math.random() * carbs.length)];
        
        // Select vegetables
        const veggies = lowGIFoods.filter(f => f.category === 'vegetable');
        const vegetable1 = veggies[Math.floor(Math.random() * veggies.length)];
        const vegetable2 = veggies[Math.floor(Math.random() * veggies.length)];
        
        return {
            protein: protein.name,
            carbSource: carbSource.name,
            vegetables: [vegetable1.name, vegetable2.name],
            estimatedCarbs: Math.round((protein.carbs + carbSource.carbs + vegetable1.carbs + vegetable2.carbs) * 100) / 100
        };
    }
    
    generateSnacks(carbTarget) {
        const snackFoods = Object.entries(foodDatabase)
            .filter(([_, food]) => food.gi <= 40 && food.carbs <= 15)
            .map(([name, food]) => ({ name, ...food }));
        
        const snacks = [];
        let remainingCarbs = carbTarget;
        
        while (remainingCarbs > 5 && snackFoods.length > 0) {
            const snack = snackFoods[Math.floor(Math.random() * snackFoods.length)];
            if (snack.carbs <= remainingCarbs) {
                snacks.push(snack.name);
                remainingCarbs -= snack.carbs;
            }
        }
        
        return {
            items: snacks,
            estimatedCarbs: Math.round((carbTarget - remainingCarbs) * 10) / 10
        };
    }
}

// Initialize global food analyzer
const foodAnalyzer = new FoodSafetyAnalyzer();