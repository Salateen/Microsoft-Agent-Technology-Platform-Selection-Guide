// Enhanced Interactive Decision Framework
document.addEventListener('DOMContentLoaded', function() {
    // Decision tree data from the provided JSON
    const decisionTree = {
        "start": {
            "question": "What's your preferred development approach?",
            "type": "choice",
            "icon": "💻",
            "options": [
                {
                    "text": "No Code (Natural language only)",
                    "value": "no-code",
                    "next": "custom-llm-simple"
                },
                {
                    "text": "Low Code (Drag & drop, minimal coding)",
                    "value": "low-code", 
                    "next": "power-platform"
                },
                {
                    "text": "Pro Code (Full programming required)",
                    "value": "pro-code",
                    "next": "custom-llm-advanced"
                }
            ]
        },
        "custom-llm-simple": {
            "question": "Do you need custom AI models or fine-tuning?",
            "type": "choice",
            "icon": "🤖",
            "options": [
                {
                    "text": "No, default models are sufficient",
                    "value": "no-custom",
                    "next": "data-sources-simple"
                },
                {
                    "text": "Yes, I need custom models",
                    "value": "yes-custom",
                    "next": "recommendation-studio"
                }
            ]
        },
        "data-sources-simple": {
            "question": "What data sources do you need?",
            "type": "choice",
            "icon": "📊",
            "options": [
                {
                    "text": "Only M365 data (SharePoint, websites)",
                    "value": "m365-only",
                    "next": "deployment-simple"
                },
                {
                    "text": "Broader data integration needed",
                    "value": "broader-data",
                    "next": "recommendation-studio"
                }
            ]
        },
        "deployment-simple": {
            "question": "Where do you need to deploy?",
            "type": "choice",
            "icon": "🚀",
            "options": [
                {
                    "text": "Only in M365 Copilot Chat",
                    "value": "m365-chat-only",
                    "next": "recommendation-chat-builder"
                },
                {
                    "text": "Multiple channels (Teams, web, mobile)",
                    "value": "multi-channel",
                    "next": "recommendation-studio"
                }
            ]
        },
        "power-platform": {
            "question": "Do you need Power Platform integration?",
            "type": "choice",
            "icon": "⚡",
            "options": [
                {
                    "text": "Yes, Power Platform integration is important",
                    "value": "yes-power",
                    "next": "custom-llm-medium"
                },
                {
                    "text": "No, standard integrations are sufficient",
                    "value": "no-power",
                    "next": "deployment-scope"
                }
            ]
        },
        "custom-llm-medium": {
            "question": "Do you need custom LLM capabilities?",
            "type": "choice",
            "icon": "🤖",
            "options": [
                {
                    "text": "Yes, custom models required",
                    "value": "yes-custom",
                    "next": "recommendation-foundry"
                },
                {
                    "text": "No, built-in models work",
                    "value": "no-custom",
                    "next": "recommendation-studio"
                }
            ]
        },
        "deployment-scope": {
            "question": "What's your deployment requirement?",
            "type": "choice",
            "icon": "🌐",
            "options": [
                {
                    "text": "Multi-channel publishing needed",
                    "value": "multi-channel",
                    "next": "recommendation-studio"
                },
                {
                    "text": "Enterprise-grade deployment",
                    "value": "enterprise",
                    "next": "recommendation-foundry"
                }
            ]
        },
        "custom-llm-advanced": {
            "question": "Do you need custom LLM models and fine-tuning?",
            "type": "choice",
            "icon": "🔬",
            "options": [
                {
                    "text": "Yes, full model customization needed",
                    "value": "yes-custom",
                    "next": "recommendation-foundry"
                },
                {
                    "text": "No, but I need development control",
                    "value": "dev-control",
                    "next": "recommendation-foundry"
                }
            ]
        }
    };

    const recommendations = {
        "chat-builder": {
            "platform": "Copilot Chat Agent Builder",
            "confidence": "High",
            "reasons": [
                "No coding required - perfect for your no-code preference",
                "M365 data sources meet your requirements", 
                "Deployment in M365 Copilot Chat aligns with your needs",
                "Quick to implement for personal/team productivity"
            ],
            "considerations": [
                "Limited customization options",
                "Cannot use custom LLM models",
                "Sharing limited to M365 users"
            ]
        },
        "studio": {
            "platform": "Copilot Studio", 
            "confidence": "High",
            "reasons": [
                "Low-code approach matches your preference",
                "Extensive Power Platform integration",
                "Multi-channel deployment capabilities",
                "Good balance of ease-of-use and functionality"
            ],
            "considerations": [
                "Limited custom LLM support",
                "Requires Power Platform licensing",
                "Some technical learning curve"
            ]
        },
        "foundry": {
            "platform": "Azure AI Foundry",
            "confidence": "High", 
            "reasons": [
                "Full programming control for complex requirements",
                "Complete custom LLM model support (1800+ models)",
                "Enterprise-grade deployment options",
                "Unlimited data source integration"
            ],
            "considerations": [
                "Requires significant development expertise",
                "Higher complexity and cost",
                "Longer development timeline"
            ]
        }
    };

    // State management
    let currentStep = 'start';
    let decisionPath = [];
    let totalSteps = 5;
    let currentStepNumber = 1;

    // DOM elements
    const decisionStart = document.getElementById('decision-start');
    const questionInterface = document.getElementById('question-interface');
    const decisionResult = document.getElementById('decision-result');
    const beginAssessmentBtn = document.getElementById('begin-assessment');
    const resetBtn = document.getElementById('reset-btn');
    const startOverBtn = document.getElementById('start-over');
    const highlightPlatformBtn = document.getElementById('highlight-platform');
    const showAlternativesBtn = document.getElementById('show-alternatives');
    
    // Progress elements
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const breadcrumb = document.getElementById('breadcrumb');
    
    // Question elements
    const questionIcon = document.getElementById('question-icon');
    const questionText = document.getElementById('question-text');
    const questionOptions = document.getElementById('question-options');
    
    // Result elements
    const recPlatformName = document.getElementById('rec-platform-name');
    const recConfidence = document.getElementById('rec-confidence');
    const recReasons = document.getElementById('rec-reasons');
    const recConsiderations = document.getElementById('rec-considerations');
    const alternativesSection = document.getElementById('alternatives-section');
    const alternativesList = document.getElementById('alternatives-list');

    // Platform cards for highlighting
    const platformCards = document.querySelectorAll('.platform-card');

    let currentRecommendation = null;

    // Initialize the application
    function init() {
        beginAssessmentBtn.addEventListener('click', startAssessment);
        resetBtn.addEventListener('click', resetAssessment);
        startOverBtn.addEventListener('click', resetAssessment);
        highlightPlatformBtn.addEventListener('click', highlightRecommendedPlatform);
        showAlternativesBtn.addEventListener('click', toggleAlternatives);
        
        // Initialize platform card interactions
        initializePlatformCards();
        
        // Ensure we start in the correct state
        showStartScreen();
    }

    function startAssessment() {
        showQuestionInterface();
        currentStep = 'start';
        currentStepNumber = 1;
        decisionPath = [];
        currentRecommendation = null;
        displayQuestion();
        
        // Scroll to the question interface
        setTimeout(() => {
            questionInterface.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }

    function resetAssessment() {
        // Reset all state
        currentStep = 'start';
        currentStepNumber = 1;
        decisionPath = [];
        currentRecommendation = null;
        
        // Clear UI elements
        clearPlatformHighlights();
        alternativesSection.classList.add('hidden');
        showAlternativesBtn.textContent = 'Show Alternatives';
        
        // Clear question interface content
        questionOptions.innerHTML = '';
        breadcrumb.innerHTML = '';
        progressFill.style.width = '20%';
        progressText.textContent = 'Step 1 of 5';
        
        // Clear result content
        recPlatformName.textContent = '';
        recConfidence.innerHTML = '';
        recReasons.innerHTML = '';
        recConsiderations.innerHTML = '';
        alternativesList.innerHTML = '';
        
        // Show start screen
        showStartScreen();
        
        // Scroll to decision framework
        setTimeout(() => {
            decisionStart.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);
        
        announce('Assessment reset. Ready to begin new assessment.');
    }

    function showStartScreen() {
        decisionStart.classList.remove('hidden');
        questionInterface.classList.add('hidden');
        decisionResult.classList.add('hidden');
    }

    function showQuestionInterface() {
        decisionStart.classList.add('hidden');
        questionInterface.classList.remove('hidden');
        decisionResult.classList.add('hidden');
    }

    function showResult() {
        decisionStart.classList.add('hidden');
        questionInterface.classList.add('hidden');
        decisionResult.classList.remove('hidden');
    }

    function displayQuestion() {
        const currentNode = decisionTree[currentStep];
        if (!currentNode) return;

        // Update progress
        updateProgress();
        updateBreadcrumb();

        // Update question display
        questionIcon.textContent = currentNode.icon || '❓';
        questionText.textContent = currentNode.question;

        // Clear and populate options
        questionOptions.innerHTML = '';
        
        currentNode.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option.text;
            button.setAttribute('data-value', option.value);
            button.setAttribute('data-next', option.next);
            
            button.addEventListener('click', (e) => handleOptionSelect(option, e));
            questionOptions.appendChild(button);
        });
    }

    function handleOptionSelect(option, event) {
        // Add to decision path
        decisionPath.push({
            question: decisionTree[currentStep].question,
            answer: option.text,
            value: option.value
        });

        // Visual feedback
        const button = event.target;
        button.classList.add('selected');

        // Delay for visual feedback then proceed
        setTimeout(() => {
            if (option.next.startsWith('recommendation-')) {
                showRecommendation(option.next);
            } else {
                currentStep = option.next;
                currentStepNumber++;
                displayQuestion();
            }
        }, 300);
    }

    function updateProgress() {
        const progressPercentage = (currentStepNumber / totalSteps) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        progressText.textContent = `Step ${currentStepNumber} of ${totalSteps}`;
    }

    function updateBreadcrumb() {
        breadcrumb.innerHTML = '';
        
        decisionPath.forEach((step, index) => {
            const item = document.createElement('span');
            item.className = 'breadcrumb-item';
            item.textContent = step.value.replace('-', ' ');
            breadcrumb.appendChild(item);
            
            if (index < decisionPath.length - 1) {
                const separator = document.createElement('span');
                separator.className = 'breadcrumb-separator';
                separator.textContent = '→';
                breadcrumb.appendChild(separator);
            }
        });
    }

    function showRecommendation(recommendationType) {
        const recType = recommendationType.replace('recommendation-', '');
        const recommendation = recommendations[recType];
        
        if (!recommendation) return;

        currentRecommendation = recType;
        
        // Populate recommendation display
        recPlatformName.textContent = recommendation.platform;
        
        recConfidence.innerHTML = `
            <span class="confidence-badge">
                ${recommendation.confidence} Confidence Match
            </span>
        `;

        // Populate reasons
        recReasons.innerHTML = '';
        recommendation.reasons.forEach(reason => {
            const li = document.createElement('li');
            li.textContent = reason;
            recReasons.appendChild(li);
        });

        // Populate considerations
        recConsiderations.innerHTML = '';
        recommendation.considerations.forEach(consideration => {
            const li = document.createElement('li');
            li.textContent = consideration;
            recConsiderations.appendChild(li);
        });

        showResult();
        
        // Auto-scroll to result
        setTimeout(() => {
            decisionResult.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }

    function highlightRecommendedPlatform() {
        if (!currentRecommendation) return;
        
        clearPlatformHighlights();
        
        const targetCard = document.querySelector(`.platform-card[data-platform="${currentRecommendation}"]`);
        if (targetCard) {
            targetCard.classList.add('highlighted');
            
            // Scroll to platform cards
            targetCard.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Remove highlight after animation
            setTimeout(() => {
                targetCard.classList.remove('highlighted');
            }, 3000);
            
            // Announce for accessibility
            announce(`${recommendations[currentRecommendation].platform} platform highlighted`);
        }
    }

    function toggleAlternatives() {
        if (alternativesSection.classList.contains('hidden')) {
            showAlternatives();
            showAlternativesBtn.textContent = 'Hide Alternatives';
        } else {
            alternativesSection.classList.add('hidden');
            showAlternativesBtn.textContent = 'Show Alternatives';
        }
    }

    function showAlternatives() {
        if (!currentRecommendation) return;
        
        alternativesList.innerHTML = '';
        
        // Get other platforms as alternatives
        Object.keys(recommendations).forEach(key => {
            if (key !== currentRecommendation) {
                const alt = recommendations[key];
                const item = document.createElement('div');
                item.className = 'alternative-item';
                
                item.innerHTML = `
                    <div>
                        <div class="alternative-name">${alt.platform}</div>
                        <div class="alternative-reason">Consider if ${getAlternativeReason(key)}</div>
                    </div>
                    <button class="btn btn--outline btn--sm" onclick="highlightAlternative('${key}')">
                        View Details
                    </button>
                `;
                
                alternativesList.appendChild(item);
            }
        });
        
        alternativesSection.classList.remove('hidden');
    }

    function getAlternativeReason(platformType) {
        const reasons = {
            'chat-builder': 'you want maximum simplicity and speed',
            'studio': 'you need more flexibility than no-code but less complexity than full development',
            'foundry': 'you need maximum control and custom AI capabilities'
        };
        return reasons[platformType] || 'it matches your specific requirements better';
    }

    // Global function for highlighting alternatives
    window.highlightAlternative = function(platformType) {
        clearPlatformHighlights();
        
        const targetCard = document.querySelector(`.platform-card[data-platform="${platformType}"]`);
        if (targetCard) {
            targetCard.classList.add('highlighted');
            targetCard.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            setTimeout(() => {
                targetCard.classList.remove('highlighted');
            }, 3000);
        }
    };

    function clearPlatformHighlights() {
        platformCards.forEach(card => {
            card.classList.remove('highlighted');
        });
    }

    function initializePlatformCards() {
        platformCards.forEach(card => {
            // Make cards focusable and add accessibility
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'article');
            
            const platformName = card.querySelector('.card-title').textContent;
            card.setAttribute('aria-label', `${platformName} platform details`);
            
            // Add click and keyboard interaction
            card.addEventListener('click', function() {
                this.focus();
            });
            
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.focus();
                }
            });
        });

        // Add keyboard navigation between cards
        platformCards.forEach((card, index) => {
            card.addEventListener('keydown', function(e) {
                let targetIndex;
                
                switch(e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        targetIndex = (index + 1) % platformCards.length;
                        platformCards[targetIndex].focus();
                        break;
                        
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        targetIndex = (index - 1 + platformCards.length) % platformCards.length;
                        platformCards[targetIndex].focus();
                        break;
                        
                    case 'Home':
                        e.preventDefault();
                        platformCards[0].focus();
                        break;
                        
                    case 'End':
                        e.preventDefault();
                        platformCards[platformCards.length - 1].focus();
                        break;
                }
            });
        });
    }

    // Add accessibility announcements
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    
    function announce(message) {
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }

    // Add escape key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearPlatformHighlights();
            announce('Platform highlights cleared');
        }
    });

    // Add smooth entrance animations
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe platform cards for entrance animations
    platformCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // Add progress indicator for page scroll
    function createScrollProgress() {
        const progress = document.createElement('div');
        progress.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #0078d4, #8b5cf6, #1e293b);
            z-index: 1000;
            transition: width 0.3s ease-out;
        `;
        document.body.appendChild(progress);
        
        function updateScrollProgress() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progress.style.width = Math.min(100, Math.max(0, scrollPercent)) + '%';
        }
        
        window.addEventListener('scroll', updateScrollProgress);
        updateScrollProgress();
    }
    
    createScrollProgress();

    // Enhanced print functionality
    const printButton = document.querySelector('.print-btn');
    if (printButton) {
        printButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            document.body.classList.add('print-mode');
            
            setTimeout(() => {
                try {
                    window.print();
                } catch (error) {
                    console.error('Print functionality not supported:', error);
                    if (window.print) {
                        window.print();
                    }
                }
                
                setTimeout(() => {
                    document.body.classList.remove('print-mode');
                }, 500);
            }, 100);
        });
        
        printButton.setAttribute('type', 'button');
        printButton.setAttribute('aria-label', 'Print this slide presentation');
    }

    // Initialize the application
    init();
    
    console.log('Enhanced Microsoft Agent Platform Selection Guide initialized');
    
    // Delayed accessibility announcement
    setTimeout(() => {
        announce('Microsoft Agent Platform Selection Guide with interactive decision framework loaded');
    }, 1000);
});