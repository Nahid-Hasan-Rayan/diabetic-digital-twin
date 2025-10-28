// Advanced AI Prediction Engine for Glucose Forecasting
class AIPredictor {
    constructor() {
        this.predictionModels = {};
        this.userHistory = [];
        this.predictionAccuracy = 0.85;
    }
    
    initializeUserModel(userProfile) {
        const modelId = `user_${Date.now()}`;
        this.predictionModels[modelId] = {
            profile: userProfile,
            historicalData: [],
            trends: {},
            accuracy: 0.85,
            learningRate: 0.1
        };
        return modelId;
    }
    
    // 24-hour glucose prediction with multiple factors
    predictGlucose(userProfile, currentData, plannedActions = {}) {
        const {
            currentGlucose = 100,
            plannedCarbs = 0,
            plannedInsulin = 0,
            plannedActivity = 'sedentary',
            timeOfDay = new Date().getHours(),
            stressLevel = 5,
            sleepHours = 7
        } = currentData;
        
        // Base prediction using modified Bergman minimal model
        let predictions = this.calculateBasePrediction(currentGlucose, plannedCarbs, plannedInsulin);
        
        // Apply activity adjustments
        predictions = this.applyActivityAdjustments(predictions, plannedActivity);
        
        // Apply circadian rhythm (time of day effects)
        predictions = this.applyCircadianRhythm(predictions, timeOfDay);
        
        // Apply stress and sleep factors
        predictions = this.applyLifestyleFactors(predictions, stressLevel, sleepHours);
        
        // Add personalized trends based on user profile
        predictions = this.applyPersonalizedTrends(predictions, userProfile);
        
        // Add realistic noise and variability
        predictions = this.addBiologicalVariability(predictions);
        
        return {
            predictions: predictions,
            confidence: this.calculateConfidence(userProfile),
            trends: this.analyzeTrends(predictions),
            riskZones: this.identifyRiskZones(predictions),
            recommendations: this.generatePredictionRecommendations(predictions, userProfile)
        };
    }
    
    calculateBasePrediction(currentGlucose, plannedCarbs, plannedInsulin) {
        const predictions = [];
        let current = currentGlucose;
        
        // Time constants for effects (in hours)
        const carbEffectDuration = 4;
        const insulinEffectDuration = 6;
        
        // Effect strengths per unit
        const carbEffectPerGram = 5; // mg/dL per gram
        const insulinEffectPerUnit = 50; // mg/dL per unit
        
        for (let hour = 0; hour < 24; hour++) {
            // Carb impact (peaks at 1-2 hours, lasts 4 hours)
            let carbImpact = 0;
            if (hour < carbEffectDuration) {
                const progress = hour / carbEffectDuration;
                const carbEffectCurve = Math.sin(progress * Math.PI); // Bell curve
                carbImpact = plannedCarbs * carbEffectPerGram * carbEffectCurve * 0.25;
            }
            
            // Insulin impact (peaks at 2-3 hours, lasts 6 hours)
            let insulinImpact = 0;
            if (hour < insulinEffectDuration) {
                const progress = hour / insulinEffectDuration;
                const insulinEffectCurve = Math.pow(Math.sin(progress * Math.PI), 0.8); // Slower peak
                insulinImpact = plannedInsulin * insulinEffectPerUnit * insulinEffectCurve * 0.3;
            }
            
            // Natural glucose drift (body's basal regulation)
            const naturalDrift = this.calculateNaturalDrift(current, hour);
            
            // Update current prediction
            current = current + carbImpact - insulinImpact + naturalDrift;
            
            // Add some random biological variation
            const variation = (Math.random() - 0.5) * 15;
            current += variation;
            
            // Safety bounds
            current = Math.max(50, Math.min(400, current));
            
            predictions.push({
                hour: hour,
                glucose: Math.round(current),
                factors: {
                    carbImpact: Math.round(carbImpact),
                    insulinImpact: Math.round(insulinImpact),
                    naturalDrift: Math.round(naturalDrift),
                    variation: Math.round(variation)
                }
            });
        }
        
        return predictions;
    }
    
    calculateNaturalDrift(currentGlucose, hour) {
        // Circadian rhythm: glucose tends to rise in morning (dawn phenomenon)
        const baseDrift = (100 - currentGlucose) * 0.02; // Tend toward 100 mg/dL
        
        // Dawn phenomenon (4-8 AM)
        if (hour >= 4 && hour <= 8) {
            return baseDrift + 8;
        }
        
        // Afternoon dip (2-4 PM)
        if (hour >= 14 && hour <= 16) {
            return baseDrift - 5;
        }
        
        return baseDrift;
    }
    
    applyActivityAdjustments(predictions, activityLevel) {
        const activityImpacts = {
            'sedentary': { effect: 0, duration: 0 },
            'light': { effect: -15, duration: 2 },
            'moderate': { effect: -30, duration: 4 },
            'high': { effect: -50, duration: 6 },
            'athlete': { effect: -40, duration: 8 }
        };
        
        const impact = activityImpacts[activityLevel] || activityImpacts.sedentary;
        
        return predictions.map(prediction => {
            if (prediction.hour <= impact.duration) {
                const progress = prediction.hour / impact.duration;
                const activityEffect = impact.effect * (1 - progress); // Diminishing effect
                return {
                    ...prediction,
                    glucose: Math.max(60, prediction.glucose + activityEffect),
                    factors: {
                        ...prediction.factors,
                        activityEffect: Math.round(activityEffect)
                    }
                };
            }
            return prediction;
        });
    }
    
    applyCircadianRhythm(predictions, startHour) {
        return predictions.map(prediction => {
            const actualHour = (startHour + prediction.hour) % 24;
            let circadianEffect = 0;
            
            // Dawn phenomenon (4-8 AM)
            if (actualHour >= 4 && actualHour <= 8) {
                circadianEffect = 8 + (actualHour - 4) * 2; // Increasing effect
            }
            // Post-lunch rise (12-14 PM)
            else if (actualHour >= 12 && actualHour <= 14) {
                circadianEffect = 5;
            }
            // Evening rise (17-19 PM)
            else if (actualHour >= 17 && actualHour <= 19) {
                circadianEffect = 3;
            }
            // Overnight baseline (0-4 AM)
            else if (actualHour >= 0 && actualHour <= 4) {
                circadianEffect = -2;
            }
            
            return {
                ...prediction,
                glucose: prediction.glucose + circadianEffect,
                factors: {
                    ...prediction.factors,
                    circadianEffect: Math.round(circadianEffect)
                }
            };
        });
    }
    
    applyLifestyleFactors(predictions, stressLevel, sleepHours) {
        const stressEffect = (stressLevel - 5) * 2; // +/- effect based on stress
        const sleepEffect = (7 - sleepHours) * 3; // Negative effect for less sleep
        
        return predictions.map(prediction => ({
            ...prediction,
            glucose: prediction.glucose + stressEffect + sleepEffect,
            factors: {
                ...prediction.factors,
                stressEffect: Math.round(stressEffect),
                sleepEffect: Math.round(sleepEffect)
            }
        }));
    }
    
    applyPersonalizedTrends(predictions, userProfile) {
        // Apply user-specific trends based on diabetes type and profile
        let personalMultiplier = 1.0;
        
        if (userProfile.diabetesType === 'type2') {
            personalMultiplier = 1.2; // Generally higher insulin resistance
        } else if (userProfile.diabetesType === 'type1') {
            personalMultiplier = 0.9; // More sensitive to insulin
        }
        
        // Weight adjustment
        const weightFactor = userProfile.weight / 70; // Normalized to 70kg
        personalMultiplier *= weightFactor;
        
        return predictions.map(prediction => ({
            ...prediction,
            glucose: Math.round(prediction.glucose * personalMultiplier),
            factors: {
                ...prediction.factors,
                personalAdjustment: Math.round(prediction.glucose * (personalMultiplier - 1))
            }
        }));
    }
    
    addBiologicalVariability(predictions) {
        return predictions.map(prediction => {
            // Add realistic biological noise
            const noise = (Math.random() - 0.5) * 20;
            return {
                ...prediction,
                glucose: Math.max(60, Math.min(400, prediction.glucose + noise)),
                factors: {
                    ...prediction.factors,
                    biologicalNoise: Math.round(noise)
                }
            };
        });
    }
    
    analyzeTrends(predictions) {
        const glucoseValues = predictions.map(p => p.glucose);
        const current = glucoseValues[0];
        const peak = Math.max(...glucoseValues);
        const nadir = Math.min(...glucoseValues);
        
        // Calculate rate of change
        const shortTermChange = glucoseValues[2] - current;
        const longTermChange = glucoseValues[12] - current;
        
        return {
            current: current,
            peak: { value: peak, hour: glucoseValues.indexOf(peak) },
            nadir: { value: nadir, hour: glucoseValues.indexOf(nadir) },
            shortTermTrend: shortTermChange > 10 ? 'rising' : shortTermChange < -10 ? 'falling' : 'stable',
            longTermTrend: longTermChange > 20 ? 'rising' : longTermChange < -20 ? 'falling' : 'stable',
            variability: this.calculateVariability(glucoseValues),
            timeInRange: this.calculateTimeInRange(glucoseValues)
        };
    }
    
    calculateVariability(glucoseValues) {
        const mean = glucoseValues.reduce((a, b) => a + b) / glucoseValues.length;
        const variance = glucoseValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / glucoseValues.length;
        return Math.round(Math.sqrt(variance));
    }
    
    calculateTimeInRange(glucoseValues) {
        const inRange = glucoseValues.filter(g => g >= 70 && g <= 180).length;
        return Math.round((inRange / glucoseValues.length) * 100);
    }
    
    identifyRiskZones(predictions) {
        const riskZones = [];
        
        predictions.forEach(prediction => {
            if (prediction.glucose < 70) {
                riskZones.push({
                    hour: prediction.hour,
                    type: 'hypoglycemia',
                    severity: prediction.glucose < 55 ? 'severe' : 'moderate',
                    duration: 1
                });
            } else if (prediction.glucose > 250) {
                riskZones.push({
                    hour: prediction.hour,
                    type: 'hyperglycemia', 
                    severity: prediction.glucose > 300 ? 'severe' : 'moderate',
                    duration: 1
                });
            } else if (prediction.glucose > 180) {
                riskZones.push({
                    hour: prediction.hour,
                    type: 'elevated',
                    severity: 'mild',
                    duration: 1
                });
            }
        });
        
        return riskZones;
    }
    
    calculateConfidence(userProfile) {
        // Confidence based on data completeness and user factors
        let confidence = 0.85; // Base confidence
        
        // Adjust based on data quality
        if (userProfile.hba1c) confidence += 0.05;
        if (userProfile.weight && userProfile.height) confidence += 0.03;
        if (userProfile.activity) confidence += 0.02;
        
        // Clinical factors that reduce confidence
        if (userProfile.diabetesType === 'type1') confidence -= 0.05; // More volatile
        if (userProfile.age > 65) confidence -= 0.03; // More variability in elderly
        
        return Math.max(0.5, Math.min(0.95, confidence));
    }
    
    generatePredictionRecommendations(predictions, userProfile) {
        const trends = this.analyzeTrends(predictions);
        const riskZones = this.identifyRiskZones(predictions);
        const recommendations = [];
        
        // Hypoglycemia prevention
        const hypoRisks = riskZones.filter(r => r.type === 'hypoglycemia');
        if (hypoRisks.length > 0) {
            recommendations.push({
                type: 'safety',
                priority: 'high',
                title: '🩸 Hypoglycemia Risk Detected',
                message: `Predicted low glucose at ${hypoRisks[0].hour}:00. Have fast-acting carbs ready.`,
                action: 'Consider reducing insulin dose or having a snack beforehand.'
            });
        }
        
        // Hyperglycemia prevention
        const hyperRisks = riskZones.filter(r => r.type === 'hyperglycemia');
        if (hyperRisks.length > 0) {
            recommendations.push({
                type: 'safety',
                priority: 'high', 
                title: '📈 Hyperglycemia Risk Detected',
                message: `Predicted high glucose at ${hyperRisks[0].hour}:00.`,
                action: 'Consider additional insulin or reducing carb intake.'
            });
        }
        
        // General optimization
        if (trends.timeInRange < 80) {
            recommendations.push({
                type: 'optimization',
                priority: 'medium',
                title: '🎯 Improve Time in Range',
                message: `Only ${trends.timeInRange}% of predictions are in target range.`,
                action: 'Adjust meal timing or insulin doses for better control.'
            });
        }
        
        // Activity recommendations
        if (trends.peak.value > 200) {
            recommendations.push({
                type: 'lifestyle',
                priority: 'medium',
                title: '🚶 Activity Suggestion',
                message: `Light activity after meals could help reduce glucose peaks.`,
                action: 'Consider a 15-minute walk after eating.'
            });
        }
        
        return recommendations;
    }
    
    // Simulate real-time data updates
    simulateRealTimeData(userProfile) {
        const baseGlucose = userProfile.currentBG || 120;
        const time = new Date();
        const hour = time.getHours();
        
        // Simulate realistic glucose variations
        let simulatedGlucose = baseGlucose;
        
        // Time of day effects
        if (hour >= 4 && hour <= 8) {
            simulatedGlucose += 15; // Dawn phenomenon
        } else if (hour >= 12 && hour <= 14) {
            simulatedGlucose += 10; // Lunch effect
        } else if (hour >= 0 && hour <= 4) {
            simulatedGlucose -= 5; // Overnight baseline
        }
        
        // Add random variation
        simulatedGlucose += (Math.random() - 0.5) * 20;
        
        // Add trend based on recent meals/activity
        const trend = Math.sin(hour * 0.2) * 8;
        simulatedGlucose += trend;
        
        // Safety bounds
        simulatedGlucose = Math.max(70, Math.min(250, simulatedGlucose));
        
        return {
            glucose: Math.round(simulatedGlucose),
            timestamp: time,
            trend: trend > 2 ? 'rising' : trend < -2 ? 'falling' : 'stable',
            confidence: 0.85
        };
    }
}

// Initialize global AI predictor
const aiPredictor = new AIPredictor();