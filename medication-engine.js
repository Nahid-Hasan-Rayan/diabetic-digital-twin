// Advanced Medication Calculation Engine
class MedicationEngine {
    constructor() {
        this.medicationRules = {
            insulin: {
                type1: {
                    correctionFactor: 50, // 1 unit lowers glucose by 50 mg/dL
                    carbRatio: 15,        // 1 unit covers 15g carbs
                    targetGlucose: 100
                },
                type2: {
                    correctionFactor: 30, // More conservative for type 2
                    carbRatio: 10,
                    targetGlucose: 120
                }
            },
            metformin: {
                standardDose: 500,
                maxDose: 2000
            }
        };
        
        this.insulinSensitivityFactors = {
            age: {
                '18-30': 1.0,
                '31-50': 0.9,
                '51-70': 0.8,
                '71+': 0.7
            },
            activity: {
                'sedentary': 1.0,
                'light': 0.9,
                'moderate': 0.8,
                'active': 0.7,
                'athlete': 0.6
            },
            weight: (weight) => weight / 70 // Normalized to 70kg
        };
    }
    
    calculateInsulinDose(userProfile, currentGlucose, plannedCarbs, insulinOnBoard = 0) {
        const rules = this.medicationRules.insulin[userProfile.diabetesType];
        if (!rules) return null;
        
        // Apply sensitivity factors
        const sensitivity = this.calculateSensitivityFactor(userProfile);
        const adjustedCorrectionFactor = rules.correctionFactor * sensitivity;
        const adjustedCarbRatio = rules.carbRatio * sensitivity;
        
        // Calculate correction dose
        let correctionDose = 0;
        if (currentGlucose > rules.targetGlucose) {
            correctionDose = (currentGlucose - rules.targetGlucose) / adjustedCorrectionFactor;
            correctionDose = Math.max(0, correctionDose);
        }
        
        // Calculate carb coverage dose
        const carbDose = plannedCarbs / adjustedCarbRatio;
        
        // Adjust for insulin on board
        const iobAdjustment = Math.max(0, insulinOnBoard * 0.5); // Conservative IOB adjustment
        
        // Total insulin calculation
        let totalInsulin = correctionDose + carbDose - iobAdjustment;
        totalInsulin = Math.max(0, totalInsulin);
        
        // Apply safety limits
        totalInsulin = this.applySafetyLimits(totalInsulin, userProfile);
        
        return {
            correctionDose: Math.round(correctionDose * 10) / 10,
            carbDose: Math.round(carbDose * 10) / 10,
            iobAdjustment: Math.round(iobAdjustment * 10) / 10,
            totalInsulin: Math.round(totalInsulin * 10) / 10,
            timing: this.getInsulinTiming(userProfile),
            warnings: this.generateWarnings(totalInsulin, currentGlucose, plannedCarbs),
            sensitivityFactor: Math.round(sensitivity * 100) / 100
        };
    }
    
    calculateSensitivityFactor(userProfile) {
        let sensitivity = 1.0;
        
        // Age factor
        const age = userProfile.age;
        if (age >= 18 && age <= 30) sensitivity *= this.insulinSensitivityFactors.age['18-30'];
        else if (age <= 50) sensitivity *= this.insulinSensitivityFactors.age['31-50'];
        else if (age <= 70) sensitivity *= this.insulinSensitivityFactors.age['51-70'];
        else sensitivity *= this.insulinSensitivityFactors.age['71+'];
        
        // Activity factor
        sensitivity *= this.insulinSensitivityFactors.activity[userProfile.activity];
        
        // Weight factor
        sensitivity *= this.insulinSensitivityFactors.weight(userProfile.weight);
        
        return Math.max(0.3, Math.min(2.0, sensitivity)); // Safety bounds
    }
    
    applySafetyLimits(insulinDose, userProfile) {
        // Maximum single dose safety limits
        const maxDose = userProfile.diabetesType === 'type1' ? 10 : 6;
        return Math.min(maxDose, insulinDose);
    }
    
    getInsulinTiming(userProfile) {
        const timings = {
            type1: "Take 15-20 minutes before eating",
            type2: "Take with your meal or immediately after",
            prediabetes: "Consult your doctor for timing instructions"
        };
        return timings[userProfile.diabetesType] || "Take as prescribed by your doctor";
    }
    
    generateWarnings(insulinDose, currentGlucose, plannedCarbs) {
        const warnings = [];
        
        if (currentGlucose < 80 && insulinDose > 0) {
            warnings.push({
                level: "danger",
                message: "🚨 HYPOGLYCEMIA RISK: Glucose is low. Consider reducing insulin or having carbs first."
            });
        }
        
        if (insulinDose > 8) {
            warnings.push({
                level: "warning",
                message: "⚠️ HIGH DOSE: This is a significant insulin dose. Double-check your calculations."
            });
        }
        
        if (plannedCarbs > 75) {
            warnings.push({
                level: "warning", 
                message: "⚠️ HIGH CARB MEAL: Consider spreading carbs throughout the day."
            });
        }
        
        if (currentGlucose > 300) {
            warnings.push({
                level: "danger",
                message: "🚨 EMERGENCY: Very high glucose. Contact your healthcare provider immediately."
            });
        }
        
        return warnings;
    }
    
    // Generate comprehensive health alerts
    generateHealthAlerts(userProfile, currentGlucose, trends) {
        const alerts = [];
        
        // Hypoglycemia alerts
        if (currentGlucose < 70) {
            alerts.push({
                type: "emergency",
                title: "🚨 Hypoglycemia Alert",
                message: "Your glucose is dangerously low. Consume 15g fast-acting carbs immediately.",
                action: "Take glucose tablets, juice, or regular soda. Recheck in 15 minutes.",
                priority: 1
            });
        } else if (currentGlucose < 90) {
            alerts.push({
                type: "warning",
                title: "⚠️ Low Glucose Warning", 
                message: "Your glucose is approaching low levels. Have a small snack if active.",
                action: "Monitor closely and have carbs available.",
                priority: 2
            });
        }
        
        // Hyperglycemia alerts
        if (currentGlucose > 250) {
            alerts.push({
                type: "emergency",
                title: "🚨 Hyperglycemia Alert",
                message: "Your glucose is very high. Check for ketones if type 1 diabetes.",
                action: "Drink water, take correction dose, contact doctor if persistent.",
                priority: 1
            });
        } else if (currentGlucose > 180) {
            alerts.push({
                type: "warning",
                title: "⚠️ Elevated Glucose",
                message: "Your glucose is above target range.",
                action: "Consider light activity and avoid high-carb foods.",
                priority: 2
            });
        }
        
        // Trend-based alerts
        if (trends && trends.isRisingRapidly) {
            alerts.push({
                type: "warning",
                title: "📈 Rapid Rise Detected",
                message: "Your glucose is rising quickly.",
                action: "Consider taking rapid-acting insulin if prescribed.",
                priority: 2
            });
        }
        
        if (trends && trends.isFallingRapidly) {
            alerts.push({
                type: "warning", 
                title: "📉 Rapid Drop Detected",
                message: "Your glucose is falling quickly.",
                action: "Have fast-acting carbs ready and monitor closely.",
                priority: 2
            });
        }
        
        return alerts;
    }
}

// Initialize global medication engine
const medicationEngine = new MedicationEngine();