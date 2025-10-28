// Main Application Controller
class DiabeticTwinApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'welcome';
        this.formSections = ['personal', 'medical', 'lifestyle'];
        this.currentFormSection = 0;
        this.glucoseChart = null;
        this.realTimeInterval = null;
    }
    
    initialize() {
        this.bindEvents();
        this.loadSampleData();
        console.log('NeuroSync AI Digital Twin Initialized');
    }
    
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.getAttribute('href').substring(1));
            });
        });
        
        // Stress slider
        const stressSlider = document.getElementById('stress');
        const stressValue = document.getElementById('stressValue');
        if (stressSlider) {
            stressSlider.addEventListener('input', (e) => {
                stressValue.textContent = e.target.value;
            });
        }
    }
    
    loadSampleData() {
        // Pre-load some sample data for testing
        if (!localStorage.getItem('sampleDataLoaded')) {
            const sampleFoods = ['apple', 'banana', 'chicken', 'broccoli', 'white bread'];
            sampleFoods.forEach(food => {
                if (!localStorage.getItem(`food_${food}`)) {
                    localStorage.setItem(`food_${food}`, JSON.stringify(foodDatabase[food]));
                }
            });
            localStorage.setItem('sampleDataLoaded', 'true');
        }
    }
    
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
            document.querySelector(`[href="#${sectionName}"]`).classList.add('active');
            this.currentSection = sectionName;
        }
    }
    
    startAssessment() {
        this.showSection('assessment');
        this.updateProgressBar();
    }
    
    nextSection() {
        if (this.currentFormSection < this.formSections.length - 1) {
            // Validate current section
            if (this.validateCurrentSection()) {
                this.currentFormSection++;
                this.showFormSection(this.currentFormSection);
                this.updateProgressBar();
            }
        } else {
            // Last section - show submit button
            document.getElementById('submitBtn').style.display = 'block';
            document.querySelector('.btn-primary').style.display = 'none';
        }
    }
    
    previousSection() {
        if (this.currentFormSection > 0) {
            this.currentFormSection--;
            this.showFormSection(this.currentFormSection);
            this.updateProgressBar();
        }
    }
    
    showFormSection(sectionIndex) {
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`section-${this.formSections[sectionIndex]}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }
    
    updateProgressBar() {
        const progress = ((this.currentFormSection + 1) / this.formSections.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }
    
    validateCurrentSection() {
        const currentSection = document.getElementById(`section-${this.formSections[this.currentFormSection]}`);
        const inputs = currentSection.querySelectorAll('input[required], select[required]');
        
        for (let input of inputs) {
            if (!input.value) {
                alert(`Please fill in ${input.previousElementSibling.textContent}`);
                input.focus();
                return false;
            }
        }
        
        return true;
    }
    
    async generateDigitalTwin() {
        // Collect all form data
        const formData = this.collectFormData();
        
        if (this.validateFormData(formData)) {
            // Show loading state
            this.showLoadingState();
            
            // Process data and generate insights
            await this.processUserData(formData);
            
            // Show dashboard
            this.showDashboard();
        }
    }
    
    collectFormData() {
        return {
            // Personal information
            age: parseInt(document.getElementById('age').value),
            weight: parseFloat(document.getElementById('weight').value),
            height: parseInt(document.getElementById('height').value),
            gender: document.getElementById('gender').value,
            
            // Medical information
            diabetesType: document.getElementById('diabetesType').value,
            currentBG: parseInt(document.getElementById('currentBG').value),
            hba1c: document.getElementById('hba1c').value ? parseFloat(document.getElementById('hba1c').value) : null,
            medications: Array.from(document.getElementById('medications').selectedOptions).map(opt => opt.value),
            
            // Lifestyle information
            activity: document.getElementById('activity').value,
            sleep: parseFloat(document.getElementById('sleep').value),
            stress: parseInt(document.getElementById('stress').value),
            diet: document.getElementById('diet').value
        };
    }
    
    validateFormData(data) {
        if (data.currentBG < 20 || data.currentBG > 600) {
            alert('Please enter a valid blood glucose value (20-600 mg/dL)');
            return false;
        }
        
        if (data.weight < 20 || data.weight > 300) {
            alert('Please enter a valid weight (20-300 kg)');
            return false;
        }
        
        return true;
    }
    
    showLoadingState() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> Generating Your Digital Twin...';
        submitBtn.disabled = true;
    }
    
    async processUserData(userData) {
        // Set user profile in all systems
        this.currentUser = userData;
        foodAnalyzer.setUserProfile(userData);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate initial insights
        this.generateInitialInsights(userData);
    }
    
    generateInitialInsights(userData) {
        // Calculate insulin advice
        const insulinAdvice = medicationEngine.calculateInsulinDose(
            userData, 
            userData.currentBG, 
            0 // No planned carbs initially
        );
        
        // Generate predictions
        const predictions = aiPredictor.predictGlucose(userData, {
            currentGlucose: userData.currentBG,
            plannedCarbs: 0,
            plannedInsulin: insulinAdvice ? insulinAdvice.totalInsulin : 0,
            plannedActivity: userData.activity,
            stressLevel: userData.stress,
            sleepHours: userData.sleep
        });
        
        // Generate health alerts
        const alerts = medicationEngine.generateHealthAlerts(
            userData, 
            userData.currentBG, 
            predictions.trends
        );
        
        // Update dashboard
        this.updateDashboard(userData, insulinAdvice, predictions, alerts);
    }
    
    showDashboard() {
        this.showSection('dashboard');
        this.startRealTimeUpdates();
    }
    
    updateDashboard(userData, insulinAdvice, predictions, alerts) {
        // Update stats cards
        this.updateStatsCards(userData, insulinAdvice, predictions);
        
        // Create glucose chart
        this.createGlucoseChart(predictions);
        
        // Update medication advice
        this.updateMedicationAdvice(insulinAdvice);
        
        // Update health alerts
        this.updateHealthAlerts(alerts);
        
        // Initialize food analyzer with user profile
        foodAnalyzer.setUserProfile(userData);
    }
    
    updateStatsCards(userData, insulinAdvice, predictions) {
        // Current Glucose
        document.getElementById('currentGlucoseDisplay').textContent = `${userData.currentBG} mg/dL`;
        
        // Glucose trend
        const trendElement = document.getElementById('glucoseTrend');
        if (predictions.trends.shortTermTrend === 'rising') {
            trendElement.innerHTML = '<i class="fas fa-arrow-up"></i> Rising';
            trendElement.style.color = '#ef4444';
        } else if (predictions.trends.shortTermTrend === 'falling') {
            trendElement.innerHTML = '<i class="fas fa-arrow-down"></i> Falling';
            trendElement.style.color = '#10b981';
        } else {
            trendElement.innerHTML = '<i class="fas fa-minus"></i> Stable';
            trendElement.style.color = '#6b7280';
        }
        
        // Insulin Advice
        if (insulinAdvice) {
            document.getElementById('insulinAdvice').textContent = `${insulinAdvice.totalInsulin} units`;
        }
        
        // Prediction Status
        document.getElementById('predictionStatus').textContent = `${predictions.timeInRange}% in range`;
        
        // Diet Score
        const dietScore = Math.max(60, 100 - Math.abs(predictions.timeInRange - 85));
        document.getElementById('dietScore').textContent = `${dietScore}/100`;
    }
    
    createGlucoseChart(predictions) {
        const ctx = document.getElementById('glucoseChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.glucoseChart) {
            this.glucoseChart.destroy();
        }
        
        const hours = predictions.predictions.map(p => p.hour);
        const glucoseValues = predictions.predictions.map(p => p.glucose);
        
        this.glucoseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: hours.map(h => `${h}:00`),
                datasets: [{
                    label: 'Predicted Glucose (mg/dL)',
                    data: glucoseValues,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#cbd5e1',
                        borderColor: '#6366f1',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        min: 50,
                        max: 300,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
    }
    
    updateMedicationAdvice(insulinAdvice) {
        const container = document.getElementById('medicationAdvice');
        
        if (!insulinAdvice) {
            container.innerHTML = `
                <div class="advice-item">
                    <h4>No Insulin Required</h4>
                    <p>Your current glucose levels don't require additional insulin.</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="advice-item">
                <h4>💊 Insulin Recommendation</h4>
                <p><strong>Total Dose:</strong> ${insulinAdvice.totalInsulin} units</p>
                <p><strong>Breakdown:</strong></p>
                <ul>
                    <li>Correction Dose: ${insulinAdvice.correctionDose} units</li>
                    <li>Carb Coverage: ${insulinAdvice.carbDose} units</li>
                    <li>IOB Adjustment: -${insulinAdvice.iobAdjustment} units</li>
                </ul>
                <p><strong>Timing:</strong> ${insulinAdvice.timing}</p>
            </div>
        `;
        
        // Add warnings if any
        if (insulinAdvice.warnings && insulinAdvice.warnings.length > 0) {
            html += `<div class="advice-item">`;
            html += `<h4>⚠️ Important Notes</h4>`;
            insulinAdvice.warnings.forEach(warning => {
                html += `<p class="alert alert-${warning.level}">${warning.message}</p>`;
            });
            html += `</div>`;
        }
        
        container.innerHTML = html;
    }
    
    updateHealthAlerts(alerts) {
        const container = document.getElementById('healthAlerts');
        
        if (alerts.length === 0) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <strong>✅ All Good!</strong><br>
                    No critical alerts at this time.
                </div>
            `;
            return;
        }
        
        let html = '';
        alerts.forEach(alert => {
            html += `
                <div class="alert alert-${alert.type === 'emergency' ? 'danger' : 'warning'}">
                    <strong>${alert.title}</strong><br>
                    ${alert.message}<br>
                    <small><strong>Action:</strong> ${alert.action}</small>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    startRealTimeUpdates() {
        // Simulate real-time data updates every 30 seconds
        this.realTimeInterval = setInterval(() => {
            if (this.currentUser) {
                this.updateRealTimeData();
            }
        }, 30000);
    }
    
    updateRealTimeData() {
        if (!this.currentUser) return;
        
        // Simulate new glucose reading
        const newData = aiPredictor.simulateRealTimeData(this.currentUser);
        
        // Update current glucose display
        this.currentUser.currentBG = newData.glucose;
        document.getElementById('currentGlucoseDisplay').textContent = `${newData.glucose} mg/dL`;
        
        // Update trend
        const trendElement = document.getElementById('glucoseTrend');
        trendElement.innerHTML = `<i class="fas fa-arrow-${newData.trend === 'rising' ? 'up' : newData.trend === 'falling' ? 'down' : 'minus'}"></i> ${newData.trend.charAt(0).toUpperCase() + newData.trend.slice(1)}`;
        
        // Regenerate predictions with new data
        const insulinAdvice = medicationEngine.calculateInsulinDose(this.currentUser, newData.glucose, 0);
        const predictions = aiPredictor.predictGlucose(this.currentUser, {
            currentGlucose: newData.glucose,
            plannedCarbs: 0,
            plannedInsulin: insulinAdvice ? insulinAdvice.totalInsulin : 0,
            plannedActivity: this.currentUser.activity
        });
        
        // Update chart
        this.updateGlucoseChart(predictions);
        
        // Update alerts
        const alerts = medicationEngine.generateHealthAlerts(this.currentUser, newData.glucose, predictions.trends);
        this.updateHealthAlerts(alerts);
    }
    
    updateGlucoseChart(predictions) {
        if (this.glucoseChart) {
            const glucoseValues = predictions.predictions.map(p => p.glucose);
            this.glucoseChart.data.datasets[0].data = glucoseValues;
            this.glucoseChart.update('none');
        }
    }
    
    checkFoodSafety() {
        const foodInput = document.getElementById('foodInput');
        const quantityInput = document.getElementById('foodQuantity');
        const resultDiv = document.getElementById('foodResult');
        
        const food = foodInput.value.trim();
        const quantity = parseInt(quantityInput.value) || 100;
        
        if (!food) {
            resultDiv.innerHTML = '<div class="alert alert-warning">Please enter a food name.</div>';
            return;
        }
        
        if (!this.currentUser) {
            resultDiv.innerHTML = '<div class="alert alert-warning">Please complete your health assessment first.</div>';
            return;
        }
        
        // Show loading
        resultDiv.innerHTML = '<div class="loading-spinner"><i class="fas fa-cogs fa-spin"></i><p>Analyzing food safety...</p></div>';
        
        // Simulate analysis delay
        setTimeout(() => {
            const analysis = foodAnalyzer.analyzeFoodSafety(
                food, 
                quantity, 
                this.currentUser.currentBG
            );
            
            this.displayFoodAnalysis(analysis, resultDiv);
        }, 1500);
    }
    
    displayFoodAnalysis(analysis, container) {
        let safetyClass = 'alert-success';
        if (analysis.safety === 'danger') safetyClass = 'alert-danger';
        else if (analysis.safety === 'warning') safetyClass = 'alert-warning';
        else if (analysis.safety === 'moderate') safetyClass = 'alert-warning';
        
        let html = `
            <div class="alert ${safetyClass}">
                <h4>${analysis.food.charAt(0).toUpperCase() + analysis.food.slice(1)} Analysis</h4>
                <p><strong>Safety:</strong> ${analysis.message}</p>
                <p><strong>Net Carbs:</strong> ${analysis.netCarbs}g</p>
                <p><strong>Projected Glucose:</strong> ${analysis.projectedGlucose} mg/dL</p>
                <p><strong>Glycemic Index:</strong> ${analysis.glycemicIndex} (${this.getGICategory(analysis.glycemicIndex)})</p>
            </div>
        `;
        
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            html += `<div class="advice-item">`;
            html += `<h5>📋 Recommendations:</h5>`;
            html += `<ul>`;
            analysis.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += `</ul>`;
            html += `</div>`;
        }
        
        container.innerHTML = html;
    }
    
    getGICategory(gi) {
        if (gi <= 55) return 'Low';
        if (gi <= 69) return 'Medium';
        return 'High';
    }
    
    quickFoodCheck(food) {
        document.getElementById('foodInput').value = food;
        this.checkFoodSafety();
    }
    
    generateDietPlan() {
        const planContainer = document.getElementById('weeklyPlan');
        
        if (!this.currentUser) {
            planContainer.innerHTML = '<div class="alert alert-warning">Please complete your health assessment first.</div>';
            return;
        }
        
        // Show loading
        planContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-utensils fa-spin"></i><p>Generating your personalized diet plan...</p></div>';
        
        // Generate plan
        setTimeout(() => {
            const weeklyPlan = foodAnalyzer.generateWeeklyDietPlan(this.currentUser);
            this.displayWeeklyPlan(weeklyPlan, planContainer);
        }, 2000);
    }
    
    displayWeeklyPlan(weeklyPlan, container) {
        let html = '<div class="diet-plan">';
        
        for (const [day, meals] of Object.entries(weeklyPlan)) {
            html += `
                <div class="day-plan glass-card">
                    <h4>${day}</h4>
                    <div class="meal">
                        <strong>🍳 Breakfast:</strong><br>
                        Protein: ${meals.breakfast.protein}<br>
                        Carbs: ${meals.breakfast.carbSource}<br>
                        Veggies: ${meals.breakfast.vegetables.join(', ')}<br>
                        <em>~${meals.breakfast.estimatedCarbs}g net carbs</em>
                    </div>
                    <div class="meal">
                        <strong>🥗 Lunch:</strong><br>
                        Protein: ${meals.lunch.protein}<br>
                        Carbs: ${meals.lunch.carbSource}<br>
                        Veggies: ${meals.lunch.vegetables.join(', ')}<br>
                        <em>~${meals.lunch.estimatedCarbs}g net carbs</em>
                    </div>
                    <div class="meal">
                        <strong>🍽️ Dinner:</strong><br>
                        Protein: ${meals.dinner.protein}<br>
                        Carbs: ${meals.dinner.carbSource}<br>
                        Veggies: ${meals.dinner.vegetables.join(', ')}<br>
                        <em>~${meals.dinner.estimatedCarbs}g net carbs</em>
                    </div>
                    <div class="meal">
                        <strong>🍎 Snacks:</strong><br>
                        ${meals.snacks.items.join(', ')}<br>
                        <em>~${meals.snacks.estimatedCarbs}g net carbs</em>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    refreshPredictions() {
        if (this.currentUser) {
            const insulinAdvice = medicationEngine.calculateInsulinDose(this.currentUser, this.currentUser.currentBG, 0);
            const predictions = aiPredictor.predictGlucose(this.currentUser, {
                currentGlucose: this.currentUser.currentBG,
                plannedCarbs: 0,
                plannedInsulin: insulinAdvice ? insulinAdvice.totalInsulin : 0,
                plannedActivity: this.currentUser.activity
            });
            
            this.updateGlucoseChart(predictions);
            
            // Show refresh confirmation
            const button = event.target.closest('button');
            const originalHtml = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = originalHtml;
            }, 1000);
        }
    }
}

// Global functions for HTML event handlers
function startAssessment() {
    app.startAssessment();
}

function nextSection() {
    app.nextSection();
}

function previousSection() {
    app.previousSection();
}

function checkFoodSafety() {
    app.checkFoodSafety();
}

function quickFoodCheck(food) {
    app.quickFoodCheck(food);
}

function generateDietPlan() {
    app.generateDietPlan();
}

function refreshPredictions() {
    app.refreshPredictions();
}

// Handle form submission
document.getElementById('healthForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    app.generateDigitalTwin();
});

// Initialize application when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new DiabeticTwinApp();
    app.initialize();
});