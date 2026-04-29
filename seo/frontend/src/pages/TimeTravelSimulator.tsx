import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineWorld from '../components/TimeTravel/TimelineWorld';
import WebsiteDigitalTwin from '../components/TimeTravel/WebsiteDigitalTwin';
import DecisionPanel from '../components/TimeTravel/DecisionPanel';
import AINarration from '../components/TimeTravel/AINarration';
import WebsiteExtractor, { WebsiteStructure } from '../components/TimeTravel/WebsiteExtractor';
import { X, Maximize2, Minimize2, Globe, Play, Pause, RotateCcw } from 'lucide-react';

interface TimelineData {
  past_6m: any;
  past_3m: any;
  present: any;
  future_3m: any;
  future_6m: any;
  timestamp: string;
}

const TimeTravelSimulator = () => {
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [websiteStructure, setWebsiteStructure] = useState<WebsiteStructure | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(true);
    const [activeTimePeriod, setActiveTimePeriod] = useState<'past_6m' | 'past_3m' | 'present' | 'future_3m' | 'future_6m'>('present');
    const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
    const [narrationText, setNarrationText] = useState<string>('');
    const [showDecisionPanel, setShowDecisionPanel] = useState(false);
    const [timeSpeed, setTimeSpeed] = useState(1);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationProgress, setSimulationProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Start with a default website for demonstration
        loadDefaultWebsite();
    }, []);

    const loadDefaultWebsite = async () => {
        try {
            setLoading(true);
            const extractor = new WebsiteExtractor();
            const structure = await extractor.extractWebsiteStructure('https://example.com');
            setWebsiteStructure(structure);
            
            // Generate timeline data based on website structure
            const timeline = generateTimelineData(structure);
            setTimelineData(timeline);
            
            setNarrationText('Welcome to the AI Time-Travel Simulator. Watch how your website behaves over time.');
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const extractWebsite = async () => {
        if (!websiteUrl) return;
        
        try {
            setIsExtracting(true);
            const extractor = new WebsiteExtractor();
            const structure = await extractor.extractWebsiteStructure(websiteUrl);
            setWebsiteStructure(structure);
            
            // Generate timeline data based on website structure
            const timeline = generateTimelineData(structure);
            setTimelineData(timeline);
            
            setNarrationText(`Website extracted: ${structure.title}. Analyzing performance over time...`);
            setIsExtracting(false);
        } catch (err: any) {
            console.error('Website extraction failed:', err);
            setError(err.message);
            setIsExtracting(false);
        }
    };

    const generateTimelineData = (structure: WebsiteStructure): TimelineData => {
        const basePerformance = structure.performance;
        
        return {
            past_6m: {
                ...basePerformance,
                loadTime: basePerformance.loadTime * 2.5,
                renderTime: basePerformance.renderTime * 3,
                layoutShifts: basePerformance.layoutShifts * 4,
                bounceRate: Math.min(95, basePerformance.bounceRate + 30),
                narration: '6 months ago: Your website was struggling with slow loading times and poor user experience.'
            },
            past_3m: {
                ...basePerformance,
                loadTime: basePerformance.loadTime * 1.8,
                renderTime: basePerformance.renderTime * 2,
                layoutShifts: basePerformance.layoutShifts * 2.5,
                bounceRate: Math.min(85, basePerformance.bounceRate + 20),
                narration: '3 months ago: Some improvements were made, but performance issues still affected user engagement.'
            },
            present: {
                ...basePerformance,
                narration: 'Present: Your website is performing at current levels with moderate load times and user experience.'
            },
            future_3m: {
                ...basePerformance,
                loadTime: Math.max(50, basePerformance.loadTime * 0.6),
                renderTime: Math.max(50, basePerformance.renderTime * 0.5),
                layoutShifts: Math.max(0, basePerformance.layoutShifts * 0.3),
                bounceRate: Math.max(20, basePerformance.bounceRate - 25),
                narration: '3 months future: With improvements, your website will load faster and provide better user experience.'
            },
            future_6m: {
                ...basePerformance,
                loadTime: Math.max(30, basePerformance.loadTime * 0.4),
                renderTime: Math.max(30, basePerformance.renderTime * 0.3),
                layoutShifts: Math.max(0, basePerformance.layoutShifts * 0.1),
                bounceRate: Math.max(15, basePerformance.bounceRate - 35),
                narration: '6 months future: Your website will be highly optimized with excellent performance and user engagement.'
            },
            timestamp: new Date().toISOString()
        };
    };

    const handleDecisionSelect = async (decision: string) => {
        if (!websiteStructure || !timelineData) return;

        try {
            setSelectedDecision(decision);
            setIsSimulating(true);
            setSimulationProgress(0);
            
            // Phase 1: Analyze decision
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSimulationProgress(33);
            
            // Phase 2: Recalculate future
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSimulationProgress(66);
            
            // Phase 3: Apply improvements
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSimulationProgress(100);
            
            // Update future timeline data based on decision
            const updatedTimeline = { ...timelineData };
            
            if (decision.toLowerCase().includes('performance') || decision.toLowerCase().includes('speed')) {
                updatedTimeline.future_3m.loadTime = Math.max(30, updatedTimeline.future_3m.loadTime * 0.5);
                updatedTimeline.future_6m.loadTime = Math.max(20, updatedTimeline.future_6m.loadTime * 0.3);
                updatedTimeline.future_3m.narration = 'Performance improvements will significantly reduce load times and improve user experience.';
                updatedTimeline.future_6m.narration = 'With continued optimization, your website will achieve excellent performance metrics.';
            } else if (decision.toLowerCase().includes('content')) {
                updatedTimeline.future_3m.bounceRate = Math.max(15, updatedTimeline.future_3m.bounceRate - 20);
                updatedTimeline.future_6m.bounceRate = Math.max(10, updatedTimeline.future_6m.bounceRate - 30);
                updatedTimeline.future_3m.narration = 'Adding quality content will improve user engagement and reduce bounce rates.';
                updatedTimeline.future_6m.narration = 'Rich content strategy will establish your website as an authority in your field.';
            } else if (decision.toLowerCase().includes('ux') || decision.toLowerCase().includes('design')) {
                updatedTimeline.future_3m.renderTime = Math.max(40, updatedTimeline.future_3m.renderTime * 0.4);
                updatedTimeline.future_6m.renderTime = Math.max(30, updatedTimeline.future_6m.renderTime * 0.3);
                updatedTimeline.future_3m.narration = 'UX improvements will make your website more intuitive and user-friendly.';
                updatedTimeline.future_6m.narration = 'Advanced UX design will create exceptional user experiences and satisfaction.';
            }
            
            setTimelineData(updatedTimeline);
            setNarrationText(updatedTimeline.future_3m.narration);
            setShowDecisionPanel(false);
            
            setTimeout(() => {
                setIsSimulating(false);
                setSimulationProgress(0);
            }, 1000);

        } catch (err: any) {
            console.error('Decision simulation error:', err);
        }
    };

    const handleTimePeriodChange = (period: 'past_6m' | 'past_3m' | 'present' | 'future_3m' | 'future_6m') => {
        setActiveTimePeriod(period);
        
        if (timelineData) {
            const periodData = timelineData[period];
            if (periodData && typeof periodData === 'object' && 'narration' in periodData) {
                setNarrationText(periodData.narration);
            }
        }
        
        // Show decision panel only at present node
        setShowDecisionPanel(period === 'present');
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else if (document.fullscreenElement) {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const exitSimulator = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        window.history.back();
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Initializing AI Time-Travel Simulator...</p>
                    <p className="text-gray-400 mt-2">Extracting website structure and timeline data</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-white text-2xl mb-2">Error Loading Simulator</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={exitSimulator}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Return to Analytics
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 bg-black overflow-hidden"
        >
            {/* Control Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-white font-medium">AI Time-Travel Simulator</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                            Active Period: <span className="text-blue-400">{activeTimePeriod.replace('_', ' ')}</span>
                        </div>
                        {websiteStructure && (
                            <div className="text-gray-400 text-sm">
                                Website: <span className="text-blue-400">{websiteStructure.title}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-white hover:bg-white/10 rounded-lg transition"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button
                            onClick={exitSimulator}
                            className="p-2 text-white hover:bg-red-500/20 rounded-lg transition"
                            title="Exit Simulator"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Website URL Input */}
            {!websiteStructure && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40">
                    <div className="bg-black/80 backdrop-blur-md rounded-lg p-6 border border-cyan-500/30 w-96">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-cyan-400 font-semibold">Extract Website Structure</h3>
                        </div>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-cyan-500 focus:outline-none text-sm"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !isExtracting) {
                                        extractWebsite();
                                    }
                                }}
                            />
                            <button
                                onClick={extractWebsite}
                                disabled={isExtracting}
                                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
                            >
                                {isExtracting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Extracting
                                    </>
                                ) : (
                                    <>
                                        <Globe className="w-4 h-4" />
                                        Extract
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400">
                            Extract real website structure and simulate its behavior over time
                        </p>
                    </div>
                </div>
            )}

            {/* Time Period Selector */}
            {websiteStructure && (
                <div className="absolute top-20 left-4 z-40">
                    <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30">
                        <h3 className="text-cyan-400 font-semibold mb-3 text-sm">Time Period</h3>
                        <div className="space-y-2">
                            {(['past_6m', 'past_3m', 'present', 'future_3m', 'future_6m'] as const).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => handleTimePeriodChange(period)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                        activeTimePeriod === period
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {period.replace('_', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Time Controls */}
            {websiteStructure && (
                <div className="absolute bottom-4 left-4 z-40">
                    <div className="bg-black/60 backdrop-blur-md rounded-lg p-3 border border-cyan-500/30">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setTimeSpeed(prev => prev === 1 ? 0 : 1)}
                                className={`p-2 ${timeSpeed === 0 ? 'bg-red-600' : 'bg-green-600'} text-white rounded`}
                            >
                                {timeSpeed === 0 ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setTimeSpeed(prev => prev === 1 ? 2 : prev === 2 ? 5 : prev === 5 ? 10 : 1)}
                                className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
                            >
                                {timeSpeed}x
                            </button>
                            <button
                                onClick={() => setTimeSpeed(1)}
                                className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Website Digital Twin */}
            {websiteStructure && (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="max-w-6xl w-full">
                        <WebsiteDigitalTwin
                            websiteData={websiteStructure}
                            timePeriod={activeTimePeriod}
                            timeSpeed={timeSpeed}
                            isSimulating={isSimulating}
                            simulationProgress={simulationProgress}
                        />
                    </div>
                </div>
            )}

            {/* 3D Canvas Background */}
            <Canvas
                shadows
                camera={{ position: [0, 5, 15], fov: 60 }}
                style={{ background: '#000000' }}
            >
                {/* Ambient lighting */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={0.5} />

                {/* Stars background */}
                <Stars
                    radius={100}
                    depth={50}
                    count={5000}
                    factor={4}
                    saturation={0}
                    fade
                    speed={0.5}
                />

                {/* Timeline World */}
                {timelineData && (
                    <TimelineWorld
                        timelineData={timelineData}
                        activeNode={activeTimePeriod}
                        onNodeFocus={handleTimePeriodChange}
                        selectedDecision={selectedDecision}
                    />
                )}

                {/* Camera controls */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={10}
                    maxDistance={30}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 4}
                />
            </Canvas>

            {/* AI Narration Overlay */}
            <AnimatePresence>
                {narrationText && (
                    <AINarration text={narrationText} />
                )}
            </AnimatePresence>

            {/* Decision Panel */}
            <AnimatePresence>
                {showDecisionPanel && (
                    <DecisionPanel
                        onDecisionSelect={handleDecisionSelect}
                        selectedDecision={selectedDecision}
                    />
                )}
            </AnimatePresence>

            {/* Simulation Progress */}
            <AnimatePresence>
                {isSimulating && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
                    >
                        <div className="bg-black/80 backdrop-blur-md rounded-lg p-6 border border-cyan-500/30 text-center">
                            <h3 className="text-cyan-400 font-semibold mb-4">Simulating Future Changes</h3>
                            <div className="w-64 bg-gray-700 rounded-full h-2">
                                <motion.div
                                    className="h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 3 }}
                                />
                            </div>
                            <div className="text-white text-sm mt-2">
                                {simulationProgress < 33 ? 'Analyzing decision impact...' : 
                                 simulationProgress < 66 ? 'Recalculating timeline...' : 
                                 'Applying improvements...'}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 text-white text-sm max-w-xs">
                <h3 className="font-semibold mb-2">🎮 Controls</h3>
                <ul className="space-y-1 text-gray-300">
                    <li>• <strong>Time Periods:</strong> Click to explore different times</li>
                    <li>• <strong>Time Speed:</strong> Control website evolution</li>
                    <li>• <strong>Present:</strong> Make decisions to change future</li>
                    <li>• <strong>Watch:</strong> Website behavior changes over time</li>
                </ul>
            </div>
        </div>
    );
};

export default TimeTravelSimulator;
